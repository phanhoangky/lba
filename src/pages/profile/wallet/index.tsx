import { PageContainer } from '@ant-design/pro-layout';
import { Avatar, Button, Col, Divider, Form, Modal, Row, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type {
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  MediaSourceModelState,
  MomoModelState,
  ProfileWalletModelState,
  TransactionModelState,
  UserModelState,
} from 'umi';
import { connect, history } from 'umi';
import { WalletHeaderComponent } from './components/WalletHeaderComponent';
// import styles from './index.less';
import { v4 as uuidv4 } from 'uuid';
import { TYPE_TRANSACTIONS } from '@/services/constantUrls';
import type { TransactionType } from '@/models/transaction';
import { CAMPAIGN } from '@/pages/Campaign';
import { EditTwoTone, LockFilled } from '@ant-design/icons';
import { UpdateProfileModal } from './components/UpdateProfileModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';

type WalletProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  momo: MomoModelState;
  transaction: TransactionModelState;
  profileWallet: ProfileWalletModelState;
  campaign: CampaignModelState;
  media: MediaSourceModelState;
};

export const TRANSACTION_STORE = 'transaction';
class WalletScreen extends React.Component<WalletProps> {
  state = {
    balance: 0,
    currentPage: 1,
    tableLoading: false,
  };

  componentDidMount = () => {
    this.setTransTableLoading(true)
      .then(async () => {
        this.readJWT();
        Promise.all([this.getListTransactions()]).then(() => {
          this.setTransTableLoading(false);
        });
      })
      .catch(() => {
        this.setTransTableLoading(false);
      });
  };

  setCurrentUser = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/saveCurrentUser',
      payload: {
        ...this.props.user.currentUser,
        ...param,
      },
    });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  getListTransactions = async (param?: any) => {
    const { getListTransactionsParam } = this.props.transaction;

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

  setGetListCampaignParam = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setGetListCampaignParamReducer`,
      payload: {
        ...this.props.campaign.getListCampaignParam,
        ...param,
      },
    });
  };

  setGetListFileParam = async (param?: any) => {
    await this.props.dispatch({
      type: `media/setGetListFileParamReducer`,
      payload: {
        ...this.props.media.getListFileParam,
        ...param,
      },
    });
  };

  setUpdateProfileModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setUpdateProfileModalReducer',
      payload: {
        ...this.props.profileWallet.updateProfileModal,
        ...param,
      },
    });
  };

  redirectByTypeTransaction = async (record: TransactionType) => {
    if (record.type === 1) {
      this.setGetListCampaignParam({
        id: record.campaignId,
      }).then(() => {
        history.push('/campaign');
      });
    }

    if (record.type === 3) {
      this.setGetListFileParam({
        id: record.mediaSrcId,
      }).then(() => {
        history.push('/medias');
      });

      // history.push('/medias');
    }
  };

  setUpdateProfileParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/setUpdateProfileParamReducer',
      payload: {
        ...this.props.user.updateProfileParam,
        ...param,
      },
    });
  };

  setChangePasswordModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/setChangePasswordModalReducer',
      payload: {
        ...this.props.user.changePasswordModal,
        ...param,
      },
    });
  };

  updateProfileModalRef = React.createRef<UpdateProfileModal>();
  changePasswordModalRef = React.createRef<ChangePasswordModal>();
  render() {
    const { currentUser, changePasswordModal } = this.props.user;
    const {
      getListTransactionsParam,
      listTransactions,
      transTableLoading,
      totalItem,
    } = this.props.transaction;

    const { updateProfileModal } = this.props.profileWallet;
    return (
      <PageContainer>
        <Row justify="space-between" gutter={20}>
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
                  onRow={(record) => {
                    return {
                      onDoubleClick: () => {
                        this.redirectByTypeTransaction(record);
                      },
                    };
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
                style={{
                  border: '4px solid #fff',
                  borderRadius: '50%',
                  height: '100px',
                  marginRight: '10px',
                  width: '100px',
                }}
              />
            </div>
            <Space
              direction="vertical"
              wrap
              style={{
                width: '100%',
              }}
            >
              <Form layout="horizontal">
                <Divider />
                <Form.Item label="Username">{currentUser && currentUser.name}</Form.Item>
                <Divider />
                <Form.Item label="Email">{currentUser && currentUser.email}</Form.Item>
                <Divider />
                <Form.Item label="Your Balance">
                  {currentUser &&
                    currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                </Form.Item>
                <Divider />
              </Form>
              <Button
                type="primary"
                block
                onClick={() => {
                  this.setUpdateProfileModal({
                    visible: true,
                  });
                }}
              >
                <EditTwoTone /> Update Profile
              </Button>
              <Button
                type="primary"
                block
                onClick={() => {
                  this.setChangePasswordModal({
                    visible: true,
                  });
                }}
              >
                <LockFilled /> Change Password
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Update Profile Modal */}
        <Modal
          title="Update Profile"
          visible={updateProfileModal?.visible}
          closable={false}
          width={'40%'}
          destroyOnClose={true}
          centered
          confirmLoading={updateProfileModal?.isLoading}
          onOk={() => {
            this.updateProfileModalRef.current?.handleUpdateProfile();
          }}
          afterClose={() => {
            this.setUpdateProfileParam({
              file: undefined,
              name: undefined,
            });
          }}
          onCancel={() => {
            this.setUpdateProfileModal({
              visible: false,
            });

            this.setUpdateProfileParam({
              file: undefined,
              name: undefined,
            });
          }}
        >
          {updateProfileModal?.visible && (
            <UpdateProfileModal ref={this.updateProfileModalRef} {...this.props} />
          )}
        </Modal>
        {/* End Update Profile Modal */}

        {/* Change Password Modal */}
        <Modal
          title="Change Password"
          visible={changePasswordModal?.visible}
          confirmLoading={changePasswordModal?.isLoading}
          destroyOnClose={true}
          closable={false}
          footer={false}
          centered
          width={'40%'}
          onOk={() => {
            this.changePasswordModalRef.current?.handleChangePassword().then(() => {
              this.setChangePasswordModal({
                visible: false,
                isLoading: false,
              });
            });
          }}
          onCancel={() => {
            this.setChangePasswordModal({
              visible: false,
            });
          }}
        >
          {changePasswordModal?.visible && (
            <ChangePasswordModal ref={this.changePasswordModalRef} {...this.props} />
          )}
        </Modal>
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({
  ...state,
}))(WalletScreen);
