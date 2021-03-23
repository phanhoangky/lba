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
import {
  CreditCardFilled,
  FileWordFilled,
  PayCircleOutlined,
  WalletFilled,
} from '@ant-design/icons';
import Copy from '@/assets/Copy.svg';
import QR from '@/assets/QR.svg';
import ThreeDot from '@/assets/ThreeDot.svg';
import Exchange from '@/assets/Exchange.svg';
import styles from '../index.less';
import QRModalComponent from './QRModalComponent';
import { DepositModal } from './DepositModal';
import { TRANSACTION_STORE } from '..';

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
    const { QRModal, depositModal, refreshBalanceLoading } = this.props.profileWallet;
    return (
      <>
        <div
          style={{
            width: '100%',
            margin: '0 auto',
          }}
        >
          <Row gutter={16} justify="space-between">
            <Col span={7} className={styles.addressCard}>
              <Row gutter={20} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <CreditCardFilled
                      style={{
                        fontSize: '3em',
                      }}
                    />
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
                            Address
                          </Typography.Title>
                        </Typography>
                      </Row>
                      <Row wrap>
                        <Col span={24}>
                          {currentUser && currentUser.ether && currentUser.ether.wallet.address}
                        </Col>
                      </Row>
                      <Row>
                        <Space wrap size="large">
                          <Image
                            preview={false}
                            src={QR}
                            width={'25px'}
                            height={'25px'}
                            onClick={() => {
                              this.setQRModal({
                                visible: true,
                              });
                            }}
                          />
                          <Image
                            preview={false}
                            src={Copy}
                            width={'25px'}
                            height={'25px'}
                            onClick={() => {
                              this.setRefreshBalanceLoading(true)
                                .then(() => {
                                  this.props.user.currentUser?.ether?.getBalance();
                                })
                                .then(() => {
                                  this.setRefreshBalanceLoading(false);
                                })
                                .catch(() => {
                                  this.setRefreshBalanceLoading(false);
                                });
                            }}
                          />
                        </Space>
                      </Row>
                    </Space>
                  </div>
                </Col>
              </Row>
            </Col>
            <Col span={7} className={styles.balanceCard}>
              <Row gutter={20} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <WalletFilled
                      style={{
                        fontSize: '3em',
                      }}
                    />
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
                          {currentUser && currentUser.balance && currentUser.balance.toString()} VND
                        </Col>
                      </Row>
                      <Row>
                        <Space wrap size="large">
                          <Image
                            preview={false}
                            src={ThreeDot}
                            width={'25px'}
                            height={'25px'}
                            onClick={() => {
                              this.setDepositModal({
                                visible: true,
                              });
                            }}
                          />
                          {refreshBalanceLoading && (
                            <Spin
                              spinning={true}
                              size="default"
                              indicator={<PayCircleOutlined />}
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
            <Col span={7}>
              {/* <Row gutter={20} wrap>
                <Col span={6}>
                  <div className={styles.avatarWrapper}>
                    <FileWordFilled
                      style={{
                        fontSize: '3em',
                      }}
                    />
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
                            Network
                          </Typography.Title>
                        </Typography>
                      </Row>
                      <Row wrap>
                        <Col span={24}>
                          {currentUser && currentUser.ether && currentUser.ether.wallet.address}
                        </Col>
                      </Row>
                      <Row>
                        <Space wrap size="large">
                          <Image preview={false} src={QR} width={'25px'} height={'25px'} />
                          <Image preview={false} src={Copy} width={'25px'} height={'25px'} />
                          <Image preview={false} src={Exchange} width={'25px'} height={'25px'} />
                        </Space>
                      </Row>
                    </Space>
                  </div>
                </Col>
              </Row> */}
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
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(WalletHeaderComponent);
