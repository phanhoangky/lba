import * as React from 'react';
import type { DeviceModelState, Dispatch, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import QRCode from 'qrcode';
import { Divider, Row } from 'antd';

export type QRModalProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  profileWallet: ProfileWalletModelState;
};

export class QRModalComponent extends React.Component<QRModalProps> {
  componentDidMount = async () => {
    const { currentUser } = this.props.user;
    await this.generateQR(currentUser && currentUser.ether && currentUser.ether.wallet.address);
  };
  setQRModal = async (modal: any) => {
    await this.props.dispatch({
      type: `profileWallet/setQRModalReducer`,
      payload: {
        ...this.props.profileWallet.QRModal,
        ...modal,
      },
    });
  };
  generateQR = async (text: any) => {
    try {
      const result = await QRCode.toDataURL(text);
      console.log('====================================');
      console.log('QR >>>', result);
      console.log('====================================');
      await this.setQRModal({
        dataQrCode: result,
      });

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
  render() {
    const { currentUser } = this.props.user;

    return (
      <>
        <Row wrap align="middle" justify="space-between">
          <div
            id="qr-container"
            style={{ width: '100%', height: 'auto', display: 'flex', justifyContent: 'center' }}
          ></div>
        </Row>
        <Divider></Divider>
        <Row wrap>
          <div
            style={{
              wordBreak: 'break-word',
            }}
          >
            {currentUser && currentUser.ether && currentUser.ether.wallet.address}
          </div>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(QRModalComponent);
