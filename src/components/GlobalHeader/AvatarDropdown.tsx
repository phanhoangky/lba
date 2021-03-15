import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Menu, Spin } from 'antd';
import React from 'react';
import type { ConnectProps } from 'umi';
import { history, connect } from 'umi';
import type { ConnectState } from '@/models/connect';
import type { CurrentUser } from '@/models/user';
import HeaderDropdown from '../HeaderDropdown';
import styles from './index.less';
import type { UserTestModelState } from '@/models/testUser';

export type GlobalHeaderRightProps = {
  currentUser?: CurrentUser;
  menu?: boolean;
  userTest: UserTestModelState;
} & Partial<ConnectProps>;

class AvatarDropdown extends React.Component<GlobalHeaderRightProps> {
  onMenuClick = (event: {
    key: React.Key;
    keyPath: React.Key[];
    item: React.ReactInstance;
    domEvent: React.MouseEvent<HTMLElement>;
  }) => {
    const { key } = event;

    if (key === 'logout') {
      const { dispatch } = this.props;

      if (dispatch) {
        dispatch({
          type: 'login/logout',
        });
      }

      return;
    }

    history.push(`/account/${key}`);
  };

  render(): React.ReactNode {
    const {
      // currentUser = {
      //   avatar: '',
      //   name: '',
      // },
      menu,
    } = this.props;

    const { currentUser } = this.props.userTest;
    const menuHeaderDropdown = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        {menu && (
          <Menu.Item key="basic">
            <UserOutlined />
            Profile
          </Menu.Item>
        )}
        {menu && (
          <Menu.Item key="wallet">
            <SettingOutlined />
            Wallet
          </Menu.Item>
        )}
        {menu && <Menu.Divider />}

        <Menu.Item key="logout">
          <LogoutOutlined />
          Logout
        </Menu.Item>
      </Menu>
    );
    return currentUser && currentUser.name ? (
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
          <span className={`${styles.name} anticon`}>{currentUser.name}</span>
        </span>
      </HeaderDropdown>
    ) : (
      <Button
        onClick={() => {
          history.replace('/account');
        }}
      >
        Login
      </Button>
    );
  }
}

export default connect(({ user, userTest }: ConnectState) => ({
  currentUser: user.currentUser,
  userTest,
}))(AvatarDropdown);
