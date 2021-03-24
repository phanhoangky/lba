import { Col, Divider, InputNumber, Row } from 'antd';
import * as React from 'react';
import type { Dispatch, MomoModelState, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';

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

  setLinkTransferParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'momo/setLinkTransferParamReducer',
      payload: {
        ...this.props.momo.linkTransferParam,
        ...param,
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
          <Col span={12}>Equivalent Balance</Col>
          <Col
            span={12}
            style={{
              textAlign: 'right',
            }}
          ></Col>
        </Row>
        <Divider></Divider>
        <Row>
          <Col>
            <InputNumber
              width={'100%'}
              onChange={(e) => {
                this.setLinkTransferParam({
                  amount: e,
                });
              }}
            />
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(DepositModal);
