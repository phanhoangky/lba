import React from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import type { ConnectProps, Dispatch, UserTestModelState } from 'umi';
import { Redirect, connect } from 'umi';
import { stringify } from 'querystring';
// import type { ConnectState } from '@/models/connect';
import type { CurrentUser } from '@/models/user';

type SecurityLayoutProps = {
  dispatch: Dispatch;
  loading?: boolean;
  currentUser?: CurrentUser;
  userTest: UserTestModelState;
} & ConnectProps;

type SecurityLayoutState = {
  isReady: boolean;
};

class SecurityLayout extends React.Component<SecurityLayoutProps, SecurityLayoutState> {
  state: SecurityLayoutState = {
    isReady: false,
  };

  componentDidMount() {
    this.setState({
      isReady: true,
    });

    const { dispatch } = this.props;
    this.readJWT();
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
    }
  }

  readJWT = async () => {
    await this.props.dispatch({
      type: 'userTest/readJWT',
      payload: '',
    });
  };

  render() {
    const { isReady } = this.state;
    const { children, loading } = this.props;
    const { currentUser } = this.props.userTest;
    // You can replace it to your authentication rule (such as check token exists)
    const isLogin = currentUser && currentUser.id;
    const queryString = stringify({
      redirect: window.location.href,
    });
    console.log('====================================');
    console.log('Security Layout >>>>', currentUser);
    console.log('====================================');
    if ((!isLogin && loading) || !isReady) {
      return <PageLoading />;
    }
    if (!isLogin && window.location.pathname !== '/account/login') {
      return <Redirect to={`/acount/login?${queryString}`} />;
    }
    return children;
  }
}

export default connect((state: any) => ({
  ...state,
}))(SecurityLayout);
