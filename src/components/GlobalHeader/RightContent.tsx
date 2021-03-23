import { Button, Input, InputNumber, Tag } from 'antd';
import type { Settings as ProSettings } from '@ant-design/pro-layout';
// import { QuestionCircleOutlined } from '@ant-design/icons';
import React from 'react';
import type { ConnectProps, MomoModelState } from 'umi';
import { connect, SelectLang } from 'umi';
import type { ConnectState } from '@/models/connect';
import Avatar from './AvatarDropdown';
// import HeaderSearch from '../HeaderSearch';
import styles from './index.less';
// import NoticeIconView from './NoticeIconView';
import type { CurrentUser } from '@/models/user';
import { WalletTwoTone } from '@ant-design/icons';

export type GlobalHeaderRightProps = {
  theme?: ProSettings['navTheme'] | 'realDark';
  currentUser?: CurrentUser;
  momo?: MomoModelState;
} & Partial<ConnectProps> &
  Partial<ProSettings>;
const ENVTagColor = {
  dev: 'orange',
  test: 'green',
  pre: '#87d068',
};

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = (props) => {
  const { theme, layout } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'top') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const setMomoAmount = async (e) => {
    if (props.dispatch) {
      await props.dispatch({
        type: 'momo/setAmountReducer',
        payload: e,
      });
    }
  };

  const getLinkTransfer = async () => {
    if (props.dispatch) {
      await props.dispatch({
        type: 'momo/getLinkTransfer',
        payload: {
          amount: props.momo?.amount?.toString(),
          orderInfo: '',
        },
      });
    }
  };
  console.log('====================================');
  console.log(props.momo);
  console.log('====================================');
  return (
    <div className={className}>
      <Button className={styles.action} icon={<WalletTwoTone />}>
        {props.currentUser &&
          props.currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        VND
      </Button>
      {/* <InputNumber
        className={styles.action}
        value={props.momo?.amount}
        onChange={(e) => {
          setMomoAmount(e);
        }}
      ></InputNumber> */}
      {/* <Button
        className={styles.action}
        icon={<WalletTwoTone />}
        onClick={async () => {
          const res = await getLinkTransfer();
          console.log('====================================');
          console.log(res);
          console.log('====================================');
        }}
      >
        Deposit Money
      </Button> */}
      <Avatar menu={true} currentUser={props.currentUser} />
      {REACT_APP_ENV && (
        <span>
          <Tag color={ENVTagColor[REACT_APP_ENV]}>{REACT_APP_ENV}</Tag>
        </span>
      )}
    </div>
  );
};

export default connect(({ settings, user }: ConnectState) => ({
  currentUser: user.currentUser,
  theme: settings.navTheme,
  layout: settings.layout,
}))(GlobalHeaderRight);
