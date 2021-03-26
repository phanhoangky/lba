import { Col, Divider, InputNumber, Row } from 'antd';
import * as React from 'react';
import type { Dispatch, MomoModelState, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import QRCode from 'qrcode';

export type DepositModalProps = {
  dispatch: Dispatch;
  user: UserModelState;
  profileWallet: ProfileWalletModelState;
  momo: MomoModelState;
};

export class DepositModal extends React.Component<DepositModalProps> {
  setDepositModal = async (modal?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setDepositModalReducer',
      payload: {
        ...this.props.profileWallet.depositModal,
        ...modal,
      },
    });
  };

  setLinkDepositParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'momo/setLinkDepositParamReducer',
      payload: {
        ...this.props.momo.linkDepositParam,
        ...param,
      },
    });
  };

  generateQR = async (text: any) => {
    try {
      const result = await QRCode.toDataURL(text);
      console.log('====================================');
      console.log('QR >>>', result);
      console.log('====================================');

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

  render() {
    const { currentUser } = this.props.user;
    return (
      <>
        <Row gutter={20}>
          <Col span={12}>
            <Row>
              <Col span={12}>Total Balance</Col>
              <Col
                span={12}
                style={{
                  textAlign: 'right',
                }}
              >
                {currentUser && currentUser.balance?.toString()}
              </Col>
            </Row>
            <Divider></Divider>
            <Row>
              <Col span={12}>Equivalent Balance</Col>
              <Col
                span={12}
                style={{
                  textAlign: 'left',
                }}
              ></Col>
            </Row>
            <Divider></Divider>
            <Row>
              <Col>
                <InputNumber
                  width={200}
                  min={100000}
                  onChange={(e) => {
                    this.setLinkDepositParam({
                      amount: e,
                    });
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <div id="qr-container"></div>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(DepositModal);
