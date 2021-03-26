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
import { TRANSACTION_STORE } from '..';
import RandomIcon from '../../../../configs/RandomIcon'
import WalletSVG from '../../../../../public/icons/wallet.svg';
import { bold } from 'chalk';
import { message } from 'antd';
import sendModal from './SendModal';

let success = () => {
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

  getLinkTransfer = async (param?: any) => {
    if (this.props.dispatch) {
      await this.props.dispatch({
        type: 'momo/getLinkTransfer',
        payload: {
          ...this.props.momo.linkTransferParam,
          ...param,
        },
      });
    }
  };

  setRefreshBalanceLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: `profileWallet/setRefreshBalanceLoadingReducer`,
      payload: isLoading,
    });
  };
  
  render() {
    
    const { currentUser } = this.props.user;
    const { QRModal, depositModal, sendModal, refreshBalanceLoading } = this.props.profileWallet;
    let generator = new RandomIcon();
    let date = new Date();  
    generator.generate(currentUser?.ether?.wallet.address+date.getDate().toString());
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
                    <Image src={generator.toDataURL()} style={{ 
                      border: '4px solid #fff',
                      borderRadius:'50%',
                      height:'60px',
                      marginRight:'10px',
                      width: '60px',
                    }}/>
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
                      <h2
                        style={{
                          fontSize: '22px',
                          fontWeight: '500',
                          lineHeight: 'normal',
                          margin: '0',
                          marginBottom: '3px',
                          whiteSpace: 'nowrap',
                          color: '#fff',
                        }}
                      >Address</h2>
                      <p
                        style={{
                          color: '#fff',
                          fontWeight: '300',
                          wordBreak: 'break-all',
                          backgroundColor: '#7070e3',
                          lineHeight: '21px',
                          marginBottom: '0!important',
                          fontDisplay: 'block',
                          margin: '0',
                          padding: '0',
                      }}
                      >{currentUser && currentUser.ether && currentUser.ether.wallet.address}</p>
	                </div>
                    <div
                      style={{
                        borderRadius: '5px',
                        color: '#fff',
                        display: 'flex',
                        height: '100%',
                        position: 'relative',
                        alignItems: 'flex-start',
                      }}
                    >
                      <button
                        style={{
                          marginRight: '15px',
                          background: 'none',
                          border: '0',
                          padding: '0',
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'inline-block',
                          fontWeight: '400',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          userSelect: 'none',
                          fontSize: '1rem',
                          lineHeight: '1.5',
                          borderRadius: '.25rem',
                          transition: 'color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-box-shadow .15s ease-in-out',
                        }}
                        onClick={() => {
                          this.setQRModal({
                            visible: true,
                          });
                        }}
                      >
                        <img alt="" src={QR}
                          style={{
                            height: '25px',
                            verticalAlign: 'middle',
                          }}
                        />
			              </button>
                      <button
                        style={{
                          marginRight: '15px',
                          background: 'none',
                          border: '0',
                          padding: '0',
                          cursor: 'pointer',
                          color: '#fff',
                          display: 'inline-block',
                          fontWeight: '400',
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          userSelect: 'none',
                          fontSize: '1rem',
                          lineHeight: '1.5',
                          borderRadius: '.25rem',
                          transition: 'color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out,-webkit-box-shadow .15s ease-in-out',
                        
                        }}
                        onClick={success}
                      >
                        <img alt="" src={Copy}
                          style={{
                            height: '25px',
                            verticalAlign: 'middle',
                          }}
                        />
					          </button>
					        </div>
				        
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={11} className={styles.balanceCard}>
              <Row gutter={20} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <img src={WalletSVG}/>
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
                              indicator={<LoadingOutlined style={{ fontSize: 25 , color:'#fff'}}/>}
                            />
                          )}
                          {!refreshBalanceLoading && (
                            <Image
                              preview={false}
                              src={Exchange}
                              width={'25px'}
                              height={'25px'}
                              onClick={() => {
                                this.setRefreshBalanceLoading(true)
                                  .then(() => {
                                    this.props.user.currentUser?.ether?.getBalance().then(() => {
                                      this.setRefreshBalanceLoading(false);
                                    });
                                  })
                                  .catch(() => {
                                    this.setRefreshBalanceLoading(false);
                                  });
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
        >
          {QRModal?.visible && <QRModalComponent {...this.props} />}
        </Modal>
        {/** End QR Modal */}

        {/** Deposit Modal */}
        <Modal
          centered
          closable={false}
          width={'60%'}
          visible={depositModal?.visible}
          destroyOnClose={true}
          onCancel={() => {
            this.setDepositModal({
              visible: false,
            });
          }}
          onOk={() => {
            this.getLinkTransfer();
          }}
        >
          {depositModal?.visible && <DepositModal {...this.props} />}
        </Modal>
        
        <Modal
          centered
          closable={false}
          width={'40%'}
          visible={sendModal?.visible}
          destroyOnClose={true}
          onCancel={() => {
            this.setSendModal({
              visible: false,
            });
          }}
        >
          
          {sendModal?.visible && <SendModal {...this.props} />}
        </Modal>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(WalletHeaderComponent);
