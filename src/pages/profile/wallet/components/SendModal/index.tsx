import { Button, Col, Divider, Input, InputNumber, Row } from 'antd';
import * as React from 'react';
import type { Dispatch, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';

export type SendModalProps = {
  dispatch: Dispatch;
  user: UserModelState;
  profileWallet: ProfileWalletModelState;
};



export class SendModal extends React.Component<SendModalProps> {
  setSendModal = async (modal?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setSendModalReducer',
      payload: {
        ...this.props.profileWallet.sendModal,
        ...modal,
      },
    });
    };
  render() {
    const { currentUser } = this.props.user;
    return (
      <>
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
          <Col span={12}>Amount</Col>
          <Col
            span={12}
            style={{
              textAlign: 'right',
            }}
          ></Col>
        </Row>
        <Row>
          <Col>
            <Input
              width={'100%'}
            />
          </Col>
        </Row>
        <Divider></Divider>
        <Row>
          <Col>
            <InputNumber
              min={1000}
              width={'100%'}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Button
              onClick={() => {
                currentUser?.ether?.tranfer("0x62968E23DAc1a041405534d321dCd1AbC3D3e547", 100000);
              }}
            >Transfer</Button>
          </Col>
        </Row>

      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SendModal);
