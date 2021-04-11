import { Col, Row, Image, Space, Typography, Modal, Spin } from 'antd';
import * as React from 'react';
import type {
  DeviceModelState,
  Dispatch,
  MomoModelState,
  ProfileWalletModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { LoadingOutlined } from '@ant-design/icons';
import Copy from '@/assets/Copy.svg';
import QR from '@/assets/QR.svg';
import BuyIcon from '@/assets/Buy.svg';
import SendIcon from '@/assets/Send.svg';
import Exchange from '@/assets/Exchange.svg';
import styles from '../index.less';
import QRModalComponent from './QRModalComponent';
import { DepositModal } from './DepositModal';
import { SendModal } from './SendModal';
// import { TRANSACTION_STORE } from '..';
import RandomIcon from '../../../../configs/RandomIcon';
import WalletSVG from '@/assets/wallet.svg';
// import { bold } from 'chalk';
import { message } from 'antd';
import QRCode from 'qrcode';
import { openNotification } from '@/utils/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const success = () => {
  message.success('Copied', 3);
};

export type WalletHeaderComponentProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  momo: MomoModelState;
  profileWallet: ProfileWalletModelState;
};

export class WalletHeaderComponent extends React.Component<WalletHeaderComponentProps> {
  setQRModal = async (modal: any) => {
    await this.props.dispatch({
      type: `profileWallet/setQRModalReducer`,
      payload: {
        ...this.props.profileWallet.QRModal,
        ...modal,
      },
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

  setDepositModal = async (modal?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setDepositModalReducer',
      payload: {
        ...this.props.profileWallet.depositModal,
        ...modal,
      },
    });
  };

  setSendModal = async (modal?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setSendModalReducer',
      payload: {
        ...this.props.profileWallet.sendModal,
        ...modal,
      },
    });
  };

  generateQR = async (text: any) => {
    try {
      // const result = await QRCode.toDataURL(text);

      QRCode.toCanvas(text, { errorCorrectionLevel: 'H' }, (err, canvas) => {
        if (err) {
          throw err;
        }

        const container = document.getElementById('qr-container');
        if (container) {
          container.appendChild(canvas);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  depositMoney = async (param?: any) => {
    if (this.props.dispatch) {
      await this.props.dispatch({
        type: 'momo/getLinkDeposit',
        payload: {
          ...this.props.momo.linkDepositParam,
          ...param,
        },
      });
    }
  };

  handleDepositMoney = async (param?: any) => {
    this.depositMoney(param).then(() => {
      const { linkDepositMoney } = this.props.momo;
      this.generateQR(linkDepositMoney);
    });
  };

  sendMoney = async (param?: any) => {
    await this.props.dispatch({
      type: 'momo/getLinkSendMoney',
      payload: {
        ...this.props.momo.linkSendMoneyParam,
        ...param,
      },
    });
  };
  setRefreshBalanceLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: `profileWallet/setRefreshBalanceLoadingReducer`,
      payload: isLoading,
    });
  };

  onRefreshBalance = async () => {
    this.setRefreshBalanceLoading(true)
      .then(() => {
        this.props.user.currentUser?.ether?.getBalance().then((res) => {
          this.setCurrentUser({
            balance: res.toString(),
          }).then(() => {
            this.setRefreshBalanceLoading(false);
          });
        });
      })
      .catch(() => {
        this.setRefreshBalanceLoading(false);
      });
  };
  depositModalRef = React.createRef<DepositModal>();
  sendMoneyModalRef = React.createRef<SendModal>();
  render() {
    const { currentUser } = this.props.user;
    const { QRModal, depositModal, sendModal, refreshBalanceLoading } = this.props.profileWallet;
    const generator = new RandomIcon();
    const date = new Date();
    generator.generate(currentUser?.ether?.wallet.address + date.getDate().toString());
    return (
      <>
        <div
          style={{
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Row gutter={24} justify="space-between">
            <Col span={12} className={styles.addressCard}>
              <Row gutter={24} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <Image
                      preview={false}
                      src={generator.toDataURL()}
                      style={{
                        border: '4px solid #fff',
                        borderRadius: '50%',
                        height: '60px',
                        marginRight: '10px',
                        width: '60px',
                      }}
                    />
                  </div>
                </Col>
                <Col span={18}>
                  <div
                    style={{
                      position: 'relative',
                      height: '100%',
                    }}
                  >
                    <div
                      style={{
                        marginBottom: '20px',
                      }}
                    >
                      <h2 className="address-text">Address</h2>
                      <p className="address-value">
                        {currentUser && currentUser.ether && currentUser.ether.wallet.address}
                      </p>
                    </div>
                    <div className="action-wrapper">
                      <button
                        className="qr-button"
                        onClick={() => {
                          this.setQRModal({
                            visible: true,
                          });
                        }}
                      >
                        <img
                          alt=""
                          src={QR}
                          style={{
                            height: '25px',
                            verticalAlign: 'middle',
                          }}
                        />
                      </button>

                      <CopyToClipboard
                        text={currentUser?.ether?.wallet.address}
                        onCopy={() => success}
                      >
                        <button className="copy-button" onClick={success}>
                          <img
                            alt=""
                            src={Copy}
                            style={{
                              height: '25px',
                              verticalAlign: 'middle',
                            }}
                          />
                        </button>
                      </CopyToClipboard>
                    </div>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={11} className={styles.balanceCard}>
              <Row gutter={20} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <img src={WalletSVG} />
                  </div>
                </Col>
                <Col span={18}>
                  <div
                    style={{
                      width: '100%',
                      wordBreak: 'break-word',
                    }}
                  >
                    <Space wrap direction="vertical">
                      <Row wrap>
                        <Typography>
                          <Typography.Title level={4} style={{ color: 'white' }}>
                            Balance
                          </Typography.Title>
                        </Typography>
                      </Row>
                      <Row wrap>
                        <Col span={24}>
                          {currentUser &&
                            currentUser.balance &&
                            currentUser.balance
                              .toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                          VND
                        </Col>
                      </Row>
                      <Row>
                        <Space wrap size="large">
                          <Image
                            preview={false}
                            src={BuyIcon}
                            width={'25px'}
                            height={'25px'}
                            onClick={() => {
                              this.setDepositModal({
                                visible: true,
                              });
                            }}
                          />
                          <Image
                            preview={false}
                            src={SendIcon}
                            width={'22px'}
                            height={'22px'}
                            onClick={() => {
                              this.setSendModal({
                                visible: true,
                              });
                            }}
                          />
                          {refreshBalanceLoading && (
                            <Spin
                              spinning={true}
                              size="default"
                              indicator={
                                <LoadingOutlined style={{ fontSize: 25, color: '#fff' }} />
                              }
                            />
                          )}
                          {!refreshBalanceLoading && (
                            <Image
                              preview={false}
                              src={Exchange}
                              width={'25px'}
                              height={'25px'}
                              onClick={() => {
                                this.onRefreshBalance();
                              }}
                            />
                          )}
                        </Space>
                      </Row>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/** QR Modal */}
        <Modal
          centered
          closable={false}
          width={'20%'}
          visible={QRModal?.visible}
          destroyOnClose={true}
          onCancel={() => {
            this.setQRModal({
              visible: false,
            });
          }}
          onOk={() => {}}
        >
          {QRModal?.visible && <QRModalComponent {...this.props} />}
        </Modal>
        {/** End QR Modal */}

        {/** Deposit Modal */}
        <Modal
          centered
          title="Deposit Money"
          closable={false}
          width={'60%'}
          visible={depositModal?.visible}
          confirmLoading={depositModal?.isLoading}
          destroyOnClose={true}
          onCancel={() => {
            this.setDepositModal({
              visible: false,
            });
          }}
          onOk={() => {
            // this.depositMoney();
            this.setDepositModal({
              isLoading: true,
            }).then(() => {
              this.depositModalRef.current
                ?.handleDepositMoney()
                .then(() => {
                  this.setDepositModal({
                    isLoading: false,
                  });
                })
                .catch((error) => {
                  Promise.reject(error);
                  openNotification('error', 'Fail to perform deposit action', error);
                  this.setDepositModal({
                    isLoading: false,
                  });
                });
            });
          }}
        >
          {depositModal?.visible && <DepositModal ref={this.depositModalRef} {...this.props} />}
        </Modal>

        {/* Send Money Modal */}
        <Modal
          title="Send Money"
          centered
          closable={false}
          width={'40%'}
          confirmLoading={sendModal?.isLoading}
          visible={sendModal?.visible}
          destroyOnClose={true}
          onCancel={() => {
            this.setSendModal({
              visible: false,
            });
          }}
          onOk={() => {
            this.sendMoneyModalRef.current?.handleSendMoney();
          }}
        >
          {sendModal?.visible && <SendModal ref={this.sendMoneyModalRef} {...this.props} />}
        </Modal>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(WalletHeaderComponent);
