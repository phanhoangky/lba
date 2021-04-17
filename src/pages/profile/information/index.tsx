import { openNotification } from '@/utils/utils';
import { PageContainer } from '@ant-design/pro-layout';
import { Avatar, Descriptions } from 'antd';
import * as React from 'react';
import type { Dispatch, UserModelState } from 'umi';
import { connect } from 'umi';
import styles from './index.less';

export type ProfileInformationProps = {
  dispatch: Dispatch;
  user: UserModelState;
};

class ProfileInformation extends React.Component<ProfileInformationProps> {
  componentDidMount() {
    this.readJWT().catch((error) => {
      openNotification('error', 'Error occured', error);
    });
  }
  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };
  render() {
    const { currentUser } = this.props.user;
    return (
      <PageContainer>
        <div
          style={{
            width: 100,
            height: 100,
            margin: `0 auto`,
          }}
        >
          <Avatar
            size={{ xs: 24, sm: 32, md: 40, lg: 64, xl: 80, xxl: 100 }}
            src={currentUser && currentUser.avatar}
          />
        </div>
        <Descriptions
          title="User Info"
          layout="vertical"
          bordered
          className={styles.descriptionStyle}
          contentStyle={styles.contentProfileStyle}
        >
          <Descriptions.Item label="UserName">{currentUser && currentUser.name}</Descriptions.Item>
          <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
          <Descriptions.Item label="Email">{currentUser && currentUser.email}</Descriptions.Item>
          <Descriptions.Item label="Your Balance">
            {currentUser && currentUser.balance?.toString()}
          </Descriptions.Item>
        </Descriptions>
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ProfileInformation);
