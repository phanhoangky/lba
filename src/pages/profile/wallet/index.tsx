import { PageContainer } from '@ant-design/pro-layout';
import { Avatar, Col, Descriptions, Divider, Row, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type {
  DeviceModelState,
  Dispatch,
  MomoModelState,
  ProfileWalletModelState,
  TransactionModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { WalletHeaderComponent } from './components/WalletHeaderComponent';
import styles from './index.less';

type WalletProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  momo: MomoModelState;
  transaction: TransactionModelState;
  profileWallet: ProfileWalletModelState;
};

export const TRANSACTION_STORE = 'transaction';
class WalletScreen extends React.Component<WalletProps> {
  state = {
    balance: 0,
    currentPage: 1,
    tableLoading: false,
  };

  componentDidMount = async () => {
    this.setTransTableLoading(true)
      .then(() => {
        this.readJWT()
          .then(() => {
            this.getListTransactions();
          })
          .then(() => {
            this.setTransTableLoading(false);
          });
      })
      .catch(() => {
        this.setTransTableLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
      payload: '',
    });
  };

  getListTransactions = async (param?: any) => {
    const { getListTransactionsParam } = this.props.transaction;
    // const payload = {
    //   holder: this.props.user.currentUser?.ether?.wallet.address,
    //   token: this.props.user.currentUser?.ether?.evn.SUPPORT_ADDRESS,
    //   limit: getTransactionsParam?.limit ? getTransactionsParam.limit : 10,
    //   page: getTransactionsParam?.page ? getTransactionsParam.page : 1,
    //   ...param,
    // };
    await this.props.dispatch({
      type: `${TRANSACTION_STORE}/getListTransactions`,
      payload: {
        ...getListTransactionsParam,
        ...param,
      },
    });
  };

  setTransTableLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: `${TRANSACTION_STORE}/setTransTableLoadingReducer`,
      payload: isLoading,
    });
  };
  render() {
    const { currentUser } = this.props.user;
    const {
      getListTransactionsParam,
      listTransactions,
      transTableLoading,
      totalItem,
    } = this.props.transaction;
    return (
      <PageContainer>
        <WalletHeaderComponent {...this.props} />
        <Divider orientation="left">Send Transaction</Divider>
        <Row gutter={20}>
          <Col span={16}>
            <Table
              dataSource={listTransactions}
              loading={transTableLoading}
              scroll={{
                x: 500,
                y: 400,
              }}
              pagination={{
                current: getListTransactionsParam?.pageNumber
                  ? getListTransactionsParam?.pageNumber + 1
                  : 1,
                pageSize: getListTransactionsParam?.pageLimitItem
                  ? getListTransactionsParam?.pageLimitItem
                  : 10,
                total: totalItem,
                onChange: (e) => {
                  this.setTransTableLoading(true)
                    .then(() => {
                      this.getListTransactions({
                        pageNumber: e - 1,
                      }).then(() => {
                        this.setTransTableLoading(false);
                      });
                    })
                    .catch(() => {
                      this.setTransTableLoading(false);
                    });
                },
              }}
            >
              <Column key="email" title="Email" dataIndex={['senderNavigation', 'email']}></Column>
              <Column key="time" title="Time" dataIndex="time"></Column>
              <Column key="age" title="Age" dataIndex="age"></Column>
            </Table>
          </Col>
          <Col span={8}>
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
            <Space direction="vertical" wrap>
              <Descriptions
                title="User Info"
                layout="vertical"
                bordered
                className={styles.descriptionStyle}
                contentStyle={styles.contentProfileStyle}
              >
                <Descriptions.Item label="UserName">
                  {currentUser && currentUser.name}
                </Descriptions.Item>
                <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
                <Descriptions.Item label="Email">
                  {currentUser && currentUser.email}
                </Descriptions.Item>
                <Descriptions.Item label="Your Balance">
                  {currentUser && currentUser.balance?.toString()}
                </Descriptions.Item>
              </Descriptions>
            </Space>
          </Col>
        </Row>
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({
  ...state,
}))(WalletScreen);
