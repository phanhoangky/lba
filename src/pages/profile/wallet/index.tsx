import { PageContainer } from '@ant-design/pro-layout';
import { Avatar, Button, Col, Divider, Modal, Row, Space, Table, Tooltip } from 'antd';
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
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  EditFilled,
  HighlightFilled,
  LockFilled,
} from '@ant-design/icons';
import { UpdateProfileModal } from './components/UpdateProfileModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import styles from './index.less';
import { openNotification } from '@/utils/utils';

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
        this.readJWT().catch((error) => {
          openNotification('error', 'Error', error.message);
        });
        Promise.all([this.getListTransactions()]).then(() => {
          this.setTransTableLoading(false);
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occured', error);
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

  openInNewTab = (url: string) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
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
      <PageContainer
        title={false}
        header={{
          ghost: false,
          style: {
            padding: 0,
          },
        }}
      >
        <Row justify="space-between" gutter={20}>
          <Col span={15} offset={1}>
            <Row>
              <WalletHeaderComponent {...this.props} />
            </Row>
            <Divider orientation="left" className="lba-label">
              View Transaction
            </Divider>
            <Row>
              <Col span={24}>
                <Table
                  dataSource={listTransactions?.map((item) => {
                    return {
                      ...item,
                      key: uuidv4(),
                    };
                  })}
                  rowClassName={(record) => {
                    // const { type } = record;
                    const sender = record.senderNavigation?.email;
                    // const receiver = record.receiverNavigation?.email;
                    const isSender = sender ? sender === currentUser?.email : null;
                    return isSender ? styles.sender : styles.receiver;
                  }}
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

                      onClick: () => {
                        this.openInNewTab(
                          `https://scan.testnet.tomochain.com/txs/${record.txHash}`,
                        );
                      },
                    };
                  }}
                >
                  <Column
                    key="sender"
                    title="Sender"
                    // dataIndex={['senderNavigation', 'email']}
                    ellipsis={true}
                    render={(record) => {
                      return (
                        <>
                          <Tooltip placement="top" title={record.senderNavigation?.email}>
                            {record.senderNavigation?.email}
                          </Tooltip>
                        </>
                      );
                    }}
                  ></Column>
                  <Column
                    key="receiver"
                    title="Receiver"
                    ellipsis={true}
                    // dataIndex={['receiverNavigation', 'email']}
                    render={(record) => {
                      return (
                        <>
                          <Tooltip placement="top" title={record.receiverNavigation?.email}>
                            {record.receiverNavigation?.email}
                          </Tooltip>
                        </>
                      );
                    }}
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
                      const sender = record.senderNavigation?.email;
                      // const receiver = record.receiverNavigation?.email;
                      const type = TYPE_TRANSACTIONS[record.type];
                      const isSender = sender ? sender === currentUser?.email : null;
                      if (type === 'Sign Media') {
                        return (
                          <Space>
                            <HighlightFilled className="sign-media-icon" />
                            {record.value} VND
                          </Space>
                        );
                      }
                      if (isSender) {
                        return (
                          <Space>
                            <CaretDownOutlined className="minus-trans-icon" />
                            {record.value} VND
                          </Space>
                        );
                      }
                      return (
                        <Space>
                          <CaretUpOutlined className="plus-trans-icon" />
                          {record.value} VND
                        </Space>
                      );
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
              {/* <Form layout="horizontal">
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
              </Form> */}
              <Divider></Divider>
              <Row>
                <Col span={6} className="lba-label">
                  Username
                </Col>
                <Col span={18}>{currentUser && currentUser.name}</Col>
              </Row>
              <Row>
                <Col span={6} className="lba-label">
                  Email
                </Col>
                <Col span={18}>{currentUser && currentUser.email}</Col>
              </Row>
              <Row>
                <Col span={6} className="lba-label">
                  Balance
                </Col>
                <Col span={18}>
                  {currentUser &&
                    currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                  VND
                </Col>
              </Row>
              <Divider orientation="center" className="lba-label">
                Setting
              </Divider>
              <Button
                className="lba-special-btn"
                block
                size="large"
                onClick={() => {
                  this.setUpdateProfileModal({
                    visible: true,
                  });
                }}
              >
                <div className="lba-btn-overlap"></div>
                <div className="lba-special-btn-text">
                  <Space>
                    <EditFilled className="lba-special-btn-icon" />
                    Update Profile
                  </Space>
                </div>
              </Button>
              {currentUser?.firebase?.sign_in_provider === 'password' && (
                <Button
                  className="lba-special-btn"
                  block
                  size="large"
                  onClick={() => {
                    this.setChangePasswordModal({
                      visible: true,
                    });
                  }}
                >
                  <div className="lba-btn-overlap"></div>
                  <div className="lba-special-btn-text">
                    <Space>
                      <LockFilled className="lba-special-btn-icon" /> Change Password
                    </Space>
                  </div>
                </Button>
              )}

              {/* <div>
                <Button
                  className={styles.lbaButtonStyle}
                  block
                  size="large"
                  onClick={() => {
                    this.setUpdateProfileModal({
                      visible: true,
                    });
                  }}
                >
                  <div className="lba-btn-overlay"></div>
                  <div className="lba-btn-text">
                    <EditFilled /> Update Profile
                  </div>
                </Button>
                <Button
                  block
                  size="large"
                  onClick={() => {
                    this.setChangePasswordModal({
                      visible: true,
                    });
                  }}
                >
                  <LockFilled /> Change Password
                </Button>
              </div> */}
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
            // this.setUpdateProfileParam({
            //   file: undefined,
            //   name: undefined,
            // });
          }}
          cancelButtonProps={{
            icon: <CloseCircleFilled className="lba-close-icon" />,
            danger: true,
          }}
          okButtonProps={{
            className: 'lba-btn',
            icon: <CheckCircleFilled className="lba-icon" />,
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
          width={'50%'}
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
