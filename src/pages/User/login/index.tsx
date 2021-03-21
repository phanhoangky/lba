import {
  AlipayCircleOutlined,
  LockOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { Alert, Button, Space, Tabs } from 'antd';
import React, { useState } from 'react';
import ProForm, { ProFormCheckbox, ProFormText } from '@ant-design/pro-form';
import { useIntl, connect, FormattedMessage } from 'umi';
// import { getFakeCaptcha } from '@/services/login';
import type { Dispatch } from 'umi';
import type { StateType } from '@/models/login';
// import type { LoginParamsType } from '@/services/login';
import type { ConnectState } from '@/models/connect';

import styles from './index.less';

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
  const setToken = async () => {
    await props.dispatch({
      type: `user/setToken`,
    });
  };
  const handleSubmitGoogle = async () => {
    googleLogin().then(() => {
      setToken();
    });

    // await dispatch({
    //   type: 'user/getCurrentUser',
    // });
  };
  return (
    <div className={styles.main}>
      <ProForm
        initialValues={{
          autoLogin: true,
        }}
        // submitter={{
        //   render: (_, dom) => dom.pop(),
        //   submitButtonProps: {
        //     loading: submitting,
        //     size: 'large',
        //     style: {
        //       width: '100%',
        //     },
        //   },
        // }}
        submitter={false}
      >
        <Button
          style={{
            width: '100%',
            marginBottom: 24,
            height: 'auto',
            padding: '1em',
          }}
          type="primary"
          block
          onClick={() => {
            handleSubmitGoogle();
          }}
        >
          Login with Google
        </Button>
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" />
          </a>
        </div>
      </ProForm>
      <Space className={styles.other}>
        <FormattedMessage id="pages.login.loginWith" defaultMessage="其他登录方式" />
        <AlipayCircleOutlined className={styles.icon} />
        <TaobaoCircleOutlined className={styles.icon} />
        <WeiboCircleOutlined className={styles.icon} />
      </Space>
    </div>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
