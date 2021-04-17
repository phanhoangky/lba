import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import type { ConnectProps, Dispatch } from 'umi';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
// import type { ConnectState } from '@/models/connect';
import type { CurrentUser } from '@/models/user';
import type { ConnectState } from '@/models/connect';
import { openNotification } from '@/utils/utils';

type SecurityLayoutProps = {
  dispatch: Dispatch;
  loading?: boolean;
  currentUser?: CurrentUser;
} & ConnectProps;

type SecurityLayoutState = {
  isReady: boolean;
};

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount = async () => {
    await this.readJWT().catch((error) => {
      console.log('====================================');
      console.log(error);
      console.log('====================================');
      openNotification('error', 'Error when read JWT', error.message);
    });

    this.setState({
      isReady: true,
    });
    // await dispatch({
    //   type: 'user/getCurrentUser',
    // });
  };
  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  render() {
    const { isReady } = this.state;
    const { children, loading, currentUser } = this.props;
    // You can replace it to your authentication rule (such as check token exists)
    const isLogin = currentUser && currentUser.id;
    const queryString = stringify({
      redirect: window.location.href,
    });
    console.log('====================================');
    console.log('Security Layout >>>>', currentUser);
    console.log('Is Ready >>>>', isReady);
    console.log('Is Login >>>>', isLogin);
    console.log('Loading >>>>', loading);
    console.log('path >>>>', window.location.pathname);
    console.log('====================================');
    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }
    if (!isLogin && window.location.pathname !== '/account/login') {
      return <Redirect to={`/account/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect(({ user, loading }: ConnectState) => ({
  currentUser: user.currentUser,
  loading: loading.models.user,
}))(SecurityLayout);
