import { GoogleCircleFilled, LockTwoTone, MailFilled, UserOutlined } from '@ant-design/icons';
import { Button, Space, Divider, Row, Col } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { connect, FormattedMessage, history } from 'umi';
// import { getFakeCaptcha } from '@/services/login';
import type { Dispatch } from 'umi';
import type { StateType } from '@/models/login';
// import type { LoginParamsType } from '@/services/login';
import type { ConnectState } from '@/models/connect';
// import lba from '@/assets/lba.png';

import styles from './index.less';
import { Animated } from 'react-animated-css';
import { openNotification } from '@/utils/utils';
import { EmailLogin } from '@/services/login';

export type LoginProps = {
  dispatch: Dispatch;
  userLogin: StateType;
  submitting?: boolean;
};

// const LoginMessage: React.FC<{
//   content: string;
// }> = ({ content }) => (
//   <Alert
//     style={{
//       marginBottom: 24,
//     }}
//     message={content}
//     type="error"
//     showIcon
//   />
// );

const Login: React.FC<LoginProps> = (props) => {
  // const { userLogin = {}, submitting } = props;
  // const { status, type: loginType } = userLogin;
  // const [type, setType] = useState<string>('account');
  // const intl = useIntl();
  const [isLoading, setIsLoading]: [boolean, any] = useState(false);
  // const handleSubmit = (values: LoginParamsType) => {
  //   const { dispatch } = props;
  //   dispatch({
  //     type: 'login/login',
  //     payload: { ...values, type },
  //   });
  // };

  const googleLogin = async () => {
    const { dispatch } = props;
    await dispatch({
      type: 'user/googleLogin',
    });
  };

  const emailLogin = async (user: firebase.default.auth.UserCredential) => {
    const { dispatch } = props;
    await dispatch({
      type: 'user/emailLogin',
      payload: {
        ...user,
      },
    });
  };
  const redirectToHomePage = async () => {
    await props.dispatch({
      type: `user/redirectToHomePage`,
    });
  };
  const handleSubmitGoogle = async () => {
    setIsLoading(true);
    googleLogin()
      .then(() => {
        redirectToHomePage();
        setIsLoading(false);
      })
      .catch((error) => {
        openNotification('error', 'Error');
        setIsLoading(false);
      });

    // await dispatch({
    //   type: 'user/getCurrentUser',
    // });
  };

  // const getCurrentUser = async () => {
  //   await props.dispatch({
  //     type: 'user/getCurrentUser',
  //   });
  // };

  const handleEmailSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    EmailLogin(email, password)
      .then((res) => {
        console.log('====================================');
        console.log(res);
        console.log('====================================');
        if (res) {
          if (res.user?.emailVerified === false) {
            openNotification('error', 'Fail to login', 'Your email is not verified');
            setIsLoading(false);
          } else {
            emailLogin(res)
              .then(() => {
                setIsLoading(false);
              })
              .catch(() => {
                setIsLoading(false);
              });
          }
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openNotification('error', 'Fail to login', err.message);
        console.log('====================================');
        console.error({ ...err });
        console.log('====================================');
      });
  };
  return (
    <Row>
      <Col span={8}>
        <div className={styles.main}>
          <div className="form-title">Login Form</div>
          <ProForm
            initialValues={{
              autoLogin: true,
            }}
            submitter={{
              render: (propses, dom) => {
                return (
                  <div className={styles.loginEmailButton}>
                    <Button
                      className="login-email-btn"
                      loading={isLoading}
                      size="large"
                      onClick={() => {
                        propses.form?.submit();
                      }}
                    >
                      <div className="login-email-btn-overlap"></div>
                      <div className="login-email-btn-text">
                        <Space>
                          <MailFilled
                            className="google-icon"
                            style={{
                              fontSize: '1.2em',
                            }}
                          />
                          Login with Email
                        </Space>
                      </div>
                    </Button>
                    <Divider></Divider>
                    <Button className="login-email-btn" loading={isLoading} size="large">
                      <div className="login-email-btn-overlap"></div>
                      <div
                        className="login-email-btn-text"
                        onClick={() => {
                          handleSubmitGoogle();
                        }}
                      >
                        <Space>
                          <GoogleCircleFilled
                            className="google-icon"
                            style={{
                              fontSize: '1.2em',
                            }}
                          />
                          Login with Google
                        </Space>
                      </div>
                    </Button>
                  </div>
                );
              },
              submitButtonProps: {
                size: 'large',
                style: {
                  width: '100%',
                },
              },
            }}
            onFinish={(values) => {
              setIsLoading(true);
              console.log('====================================');
              console.log(values);
              console.log('====================================');
              handleEmailSubmit(values.userName, values.password).catch((error) => {
                setIsLoading(false);
                console.log('====================================');
                console.error(error);
                console.log('====================================');
                openNotification('error', 'fail to login with email', error.message);
              });
              return Promise.resolve();
            }}
            // submitter={false}
          >
            <ProFormText
              name="userName"
              fieldProps={{
                size: 'large',
                prefix: <UserOutlined className={styles.prefixIcon} />,
              }}
              // placeholder={intl.formatMessage({
              //   id: 'pages.login.username.placeholder',
              //   defaultMessage: '用户名: admin or user',
              // })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.username.required"
                      defaultMessage="请输入用户名!"
                    />
                  ),
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: <LockTwoTone className={styles.prefixIcon} />,
              }}
              // placeholder={intl.formatMessage({
              //   id: 'pages.login.password.placeholder',
              //   defaultMessage: '密码: ant.design',
              // })}
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="pages.login.password.required"
                      defaultMessage="请输入密码！"
                    />
                  ),
                },
              ]}
            />
            <a
              style={{
                float: 'right',
                color: 'white',
              }}
              className="login-link-btn"
              onClick={() => {
                history.replace('/account/forgot-password');
              }}
            >
              <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="Forgot password ?"
              />
            </a>
            <Divider></Divider>
            <div
              style={{
                marginBottom: 24,
              }}
            ></div>
          </ProForm>
          <Divider />

          <Divider />
          <div style={{ width: '100%', textAlign: 'center' }}>
            Not Registered ?{' '}
            <a
              className="login-link-btn"
              style={{
                color: 'white',
              }}
              onClick={() => {
                history.replace('/account/register');
              }}
            >
              <FormattedMessage id="pages.login.registerAccount" defaultMessage="Register" />
            </a>
          </div>
        </div>
      </Col>
      <Col span={16}>
        <>
          <div className={styles.welcomeWrapper}>
            <Animated animationIn="rollIn" animationOut="fadeOut" isVisible={true}>
              <div className="welcome-text-wrapper">
                <h1>
                  Hi, We are <span className="text-color-main">Location Based Advertising</span> <br />
                </h1>
              </div>
            </Animated>
            <div
              style={{
                width: '80%',
                height: 'auto',
                margin: '0 auto',
              }}
            ></div>
            <Divider></Divider>
            <br />
          </div>
        </>
      </Col>
    </Row>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
