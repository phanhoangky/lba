import { Col, Divider, Form, InputNumber, Row, Skeleton } from 'antd';
import * as React from 'react';
import type { Dispatch, MomoModelState, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import QRCode from 'qrcode';
import styles from './index.less';

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
          const qr = canvas;
          qr.style.width = '100%';
          container.appendChild(qr);
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
    const { linkDepositParam } = this.props.momo;
    const { depositModal } = this.props.profileWallet;
    const equivalent =
      linkDepositParam &&
      currentUser &&
      currentUser.balance &&
      linkDepositParam?.amount + Number.parseFloat(currentUser.balance.toString());
    return (
      <>
        <Row gutter={20}>
          <Col span={12}>
            {/* <Row>
              <Col span={6}>Total Balance</Col>
              <Col span={18}></Col>
            </Row> */}
            <Divider></Divider>
            <Form name="deposit_modal_form" layout="horizontal">
              <Form.Item name="amount" label="Total Balance">
                {currentUser &&
                  currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              </Form.Item>
              <Form.Item
                name="amount"
                label="Deposit Amount (VND)"
                rules={[{ required: true, message: 'Please enter amount to deposit' }]}
              >
                <InputNumber
                  min={100000}
                  style={{
                    width: '100%',
                  }}
                />
              </Form.Item>
              <Form.Item name="amount" label="Equivalent Balance">
                {equivalent}
              </Form.Item>
            </Form>
            <Divider></Divider>
          </Col>
          <Col span={12} className={styles.QRConstainer}>
            <Skeleton active loading={depositModal?.isLoading}>
              <div id="qr-container"></div>
            </Skeleton>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(DepositModal);
