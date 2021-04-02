import { GoogleCircleFilled, MailTwoTone } from '@ant-design/icons';
import { Button, Space, Image, Divider } from 'antd';
import React from 'react';
import ProForm from '@ant-design/pro-form';
import { connect } from 'umi';
// import { getFakeCaptcha } from '@/services/login';
import type { Dispatch } from 'umi';
import type { StateType } from '@/models/login';
// import type { LoginParamsType } from '@/services/login';
import type { ConnectState } from '@/models/connect';
import lba from '@/assets/lba.png';

import styles from './index.less';
import { Animated } from 'react-animated-css';

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

  const emailLogin = async () => {
    const { dispatch } = props;
    await dispatch({
      type: 'user/emailLogin',
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

  const getCurrentUser = async () => {
    await props.dispatch({
      type: 'user/getCurrentUser',
    });
  };

  const handleEmailSubmit = async () => {
    emailLogin().then(() => {
      setToken();
    });
  };
  return (
    // <div className={styles.main}>
    //   <ProForm
    //     initialValues={{
    //       autoLogin: true,
    //     }}
    //     // submitter={{
    //     //   render: (_, dom) => dom.pop(),
    //     //   submitButtonProps: {
    //     //     loading: submitting,
    //     //     size: 'large',
    //     //     style: {
    //     //       width: '100%',
    //     //     },
    //     //   },
    //     // }}
    //     submitter={false}
    //   >
    //     <div
    //       style={{
    //         width: '80%',
    //         height: 'auto',
    //         margin: '0 auto',
    //       }}
    //     >
    //       <Image src={lba} preview={false} width={'100%'} />
    //     </div>
    //     <Divider></Divider>
    //     <Button
    //       style={{
    //         width: '100%',
    //         marginBottom: 24,
    //         height: 'auto',
    //         padding: '1em',
    //       }}
    //       type="primary"
    //       block
    //       onClick={() => {
    //         handleSubmitGoogle();
    //       }}
    //     >
    //       <Space wrap direction="horizontal">
    //         <GoogleCircleFilled
    //           style={{
    //             fontSize: '1.2em',
    //           }}
    //         />
    //         Login with Google
    //       </Space>
    //     </Button>
    //     <Divider />
    //     <Button
    //       style={{
    //         width: '100%',
    //         marginBottom: 24,
    //         height: 'auto',
    //         padding: '1em',
    //       }}
    //       type="primary"
    //       block
    //       onClick={() => {
    //         handleEmailSubmit();
    //       }}
    //     >
    //       <Space wrap direction="horizontal">
    //         <MailTwoTone
    //           style={{
    //             fontSize: '1.2em',
    //           }}
    //         />
    //         Login with Email
    //       </Space>
    //     </Button>
    //     <div
    //       style={{
    //         marginBottom: 24,
    //       }}
    //     ></div>
    //   </ProForm>

    // </div>
    <>
      <div className={styles.welcomeWrapper}>
        <Animated animationIn="rollIn" animationOut="fadeOut" isVisible={true}>
          <div className="welcome-text-wrapper">
            <h1>
              Hi, my name is <span className="text-color-main">Your Name</span> <br /> I'm the
              Unknown Developer.
            </h1>
          </div>
        </Animated>
        <div
          style={{
            width: '80%',
            height: 'auto',
            margin: '0 auto',
          }}
        >
          {/* <Image src={lba} preview={false} width={'100%'} /> */}
        </div>
        <Divider></Divider>
        {/* <Button
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
          <Space wrap direction="horizontal">
            <GoogleCircleFilled
              style={{
                fontSize: '1.2em',
              }}
            />
            Login with Google
          </Space>
        </Button> */}
        <br />
        <Button className="signin-btn">
          <div className="sign-in-btn-overlap"></div>
          <div
            className="sign-in-btn-text"
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
    </>
  );
};

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
