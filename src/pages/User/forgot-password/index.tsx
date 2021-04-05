import { Button, Col, Divider, Form, Input, Row, Typography } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch } from 'umi';
import { connect, history } from 'umi';
import { LeftSquareFilled, MailFilled } from '@ant-design/icons';
import { openNotification } from '@/utils/utils';
import styles from './index.less';

export type ForgotPasswordPageProps = {
  dispatch: Dispatch;
};

export class ForgotPasswordPage extends React.Component<ForgotPasswordPageProps> {
  sendEmailResetPassword = async (email: string) => {
    await this.props.dispatch({
      type: 'user/sendResetPassword',
      payload: email,
    });
  };

  handleSendEmailResetPassword = async () => {
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        this.sendEmailResetPassword(values.email)
          .then(() => {
            openNotification(
              'success',
              'reset passsword request has been sent',
              `Request has been seent to ${values.email}`,
            );
            history.replace('/account/login');
          })
          .catch((error) => {
            openNotification('error', 'fail to send reset password', error);
          });
      })
      .catch((error) => {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        const { errorFields } = error;
        if (errorFields) {
          let errorList = '';
          errorFields.forEach((field: any) => {
            field.errors.forEach((e: any) => {
              errorList = errorList.concat(`${e} \n`);
            });
          });
          openNotification('error', 'fail to send reset password', errorList);
        }
      });
  };

  formRef = React.createRef<FormInstance<any>>();
  render() {
    return (
      <div className={styles.forgotForm}>
        <Row justify="center">
          <Col>
            <Typography.Title level={2}>Reset Password</Typography.Title>
          </Col>
        </Row>
        <div className="reset-form-wrapper">
          <div className="return-btn">
            <Button
              className="left-arrow-btn"
              onClick={() => {
                history.replace('/account/login');
              }}
            >
              <div className="btn-overlap"></div>
              <LeftSquareFilled className="return-arrow-icon lba-icon" />
            </Button>
          </div>
          <Row justify="center">
            <Col>
              <Typography.Title level={3} style={{ color: 'white' }}>
                Forgot your password ?
              </Typography.Title>
            </Col>
          </Row>
          <Divider />
          <Row justify="center">
            <Col>
              Don't worry! Reseting your password is easy. Just type in the email you register to
              LBA
            </Col>
          </Row>
          <Divider />
          <Form name="reset_password_form" layout="vertical" ref={this.formRef}>
            <Form.Item
              style={{
                color: 'white',
              }}
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input size="large" placeholder="Enter your email" />
            </Form.Item>
            <Divider />
            <Button
              className="reset-password-btn"
              block
              size="large"
              onClick={() => {
                this.handleSendEmailResetPassword();
              }}
            >
              <div className="btn-overlap"></div>
              <div className="btn-text">
                <MailFilled className="lba-icon" /> SEND
              </div>
            </Button>
          </Form>
        </div>
      </div>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ForgotPasswordPage);
