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
import { v4 as uuidv4 } from 'uuid';
import { TYPE_TRANSACTIONS } from '@/services/constantUrls';

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
        <Row justify="space-between">
          <Col span={15} offset={1}>
            <Row>
              <WalletHeaderComponent {...this.props} />
            </Row>
            <Divider orientation="left">View Transaction</Divider>
            <Row>
            <Col span={24}>
            <Table
              dataSource={listTransactions?.map((item) => {
                return {
                  ...item,
                  key: uuidv4(),
                };
              })}
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
              <Column
                key="sender"
                title="Sender"
                dataIndex={['senderNavigation', 'email']}
              ></Column>
              <Column
                key="receiver"
                title="Receiver"
                dataIndex={['receiverNavigation', 'email']}
              ></Column>
              <Column
                key="type"
                title="Type"
                render={(record) => {
                  return TYPE_TRANSACTIONS[record.type];
                }}
              ></Column>
              <Column
                key="value"
                title="Value"
                render={(record) => {
                  return <>{record.value} VND</>;
                }}
              ></Column>
              {/* <Column key="time" title="Time" dataIndex="time"></Column> */}
              <Column key="age" title="Age" dataIndex="age"></Column>
            </Table>
          </Col>
        
            </Row>
          </Col>
          <Col span={7}>
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
                style={{
                  border: '4px solid #fff',
                  borderRadius: '50%',
                  height: '100px',
                  marginRight: '10px',
                  width: '100px'
                }}
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
                  {currentUser &&
                    currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                  VND
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
