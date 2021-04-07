import { openNotification } from '@/utils/utils';
import { Button, Form, Input, Steps } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, ProfileWalletModelState, UserModelState } from 'umi';
import { connect, history } from 'umi';
import styles from './index.less';
import { LockOutlined, SolutionOutlined } from '@ant-design/icons';

export type ChangePasswordModalProps = {
  dispatch: Dispatch;
  profileWallet: ProfileWalletModelState;
  user: UserModelState;
};
const steps = [
  {
    title: 'Confirm Password',
    icon: <SolutionOutlined />,
  },
  {
    title: 'New Password',
    icon: <LockOutlined />,
  },
];
export class ChangePasswordModal extends React.Component<ChangePasswordModalProps> {
  setChangePasswordModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/setChangePasswordModalReducer',
      payload: {
        ...this.props.user.changePasswordModal,
        ...param,
      },
    });
  };

  next = async () => {
    const { changePasswordModal, currentUser } = this.props.user;
    if (changePasswordModal?.currentStep === 0) {
      this.confirmStepRef.current?.validateFields().then((values) => {
        const { confirmPassword } = values;
        if (currentUser && currentUser.password && currentUser.password === confirmPassword) {
          const nextStep = changePasswordModal ? changePasswordModal.currentStep + 1 : 1;
          this.setChangePasswordModal({
            currentStep: nextStep,
          });
        } else {
          openNotification('error', 'Not match', 'Your password is not correct');
        }
      });
    } else if (changePasswordModal?.currentStep === 1) {
      this.newPasswordForm.current?.validateFields().then(() => {
        const nextStep = changePasswordModal ? changePasswordModal.currentStep + 1 : 1;
        this.setChangePasswordModal({
          currentStep: nextStep,
        });
      });
    } else {
      const nextStep = changePasswordModal ? changePasswordModal.currentStep + 1 : 1;
      this.setChangePasswordModal({
        currentStep: nextStep,
      });
    }
  };

  prev = async () => {
    const { changePasswordModal } = this.props.user;

    const nextStep = changePasswordModal ? changePasswordModal.currentStep - 1 : 1;
    await this.setChangePasswordModal({
      currentStep: nextStep,
    });
  };

  changePassword = async (value: string) => {
    await this.props.dispatch({
      type: 'user/changePassword',
      payload: value,
    });
  };

  handleChangePassword = async () => {
    this.newPasswordForm.current?.validateFields().then((values) => {
      this.setChangePasswordModal({
        isLoading: true,
      })
        .then(() => {
          this.changePassword(values.newPassword).then(() => {
            openNotification('success', 'Change password successfully');
            history.replace('/account/login');
          });
        })
        .catch((error) => {
          openNotification('error', 'Error', error);
        });
    });
  };

  confirmStepRef = React.createRef<FormInstance<any>>();
  newPasswordForm = React.createRef<FormInstance<any>>();
  render() {
    const { changePasswordModal } = this.props.user;
    const currentStep = changePasswordModal?.currentStep ? changePasswordModal?.currentStep : 0;

    return (
      <>
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} icon={item.icon} />
          ))}
          {/* <Steps.Step key="confirmPassword" title="Confirm current password" />
          <Steps.Step key="newPassword" title="Enter new password" /> */}
        </Steps>
        <div
          className={styles.stepsContent}
          style={{
            minHeight: 100,
            marginTop: 24,
            padding: 50,
            backgroundColor: `#fafafa`,
            border: `1px dashed #e9e9e9`,
            display: 'flex',
            justifyContent: 'center',
            justifyItems: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}
        >
          {currentStep === 0 && (
            <Form name="confirm_password" layout="horizontal" ref={this.confirmStepRef}>
              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[{ required: true, message: 'Please confirm your current password' }]}
              >
                <Input.Password />
              </Form.Item>
            </Form>
          )}
          {currentStep === 1 && (
            <>
              <Form name="new_password_form" layout="horizontal" ref={this.newPasswordForm}>
                <Form.Item
                  name="newPassword"
                  label="Enter your new password"
                  rules={[{ required: true, message: 'Please enter your new password' }]}
                >
                  <Input.Password />
                </Form.Item>
              </Form>
            </>
          )}
        </div>
        <div className={styles.stepsAction}>
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => this.next()}
              loading={changePasswordModal?.isLoading}
            >
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              loading={changePasswordModal?.isLoading}
              onClick={() => {
                this.handleChangePassword();
              }}
            >
              Done
            </Button>
          )}
          {currentStep > 0 && (
            <Button
              style={{ margin: '0 8px' }}
              onClick={() => this.prev()}
              loading={changePasswordModal?.isLoading}
            >
              Previous
            </Button>
          )}
        </div>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ChangePasswordModal);
