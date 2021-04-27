import { Form, Input, InputNumber } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, ProfileWalletModelState, TransactionModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import { openNotification } from '@/utils/utils';
import type { CreateTransactionParam } from '@/services/TransactionService';

export type SendModalProps = {
  dispatch: Dispatch;
  user: UserModelState;
  profileWallet: ProfileWalletModelState;
  transaction: TransactionModelState;
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

  createTransaction = async (param?: any) => {
    await this.props.dispatch({
      type: 'transaction/createTransaction',
      payload: param,
    });
  };

  handleSendMoney = async () => {
    this.formRef.current?.validateFields().then(async (res) => {
      const { currentUser } = this.props.user;
      if (currentUser && currentUser.ether) {
        const hash = await currentUser.ether.transfer(res.destinationAddress, res.transferAmount);
        if (hash.includes('Fail')) {
          openNotification('error', 'Fail to send money', hash);
        } else {
          const createTransParam: CreateTransactionParam = {
            receiverAddress: res.destinationAddress,
            txHash: hash,
            type: 0,
            value: res.transferAmount,
          };
          this.createTransaction(createTransParam).then(() => {
            openNotification('success', 'Money transfer successfully');
            this.setSendModal({
              visible: false,
            });
          });
        }
      }
    });
  };

  formRef = React.createRef<FormInstance>();
  render() {
    const { currentUser } = this.props.user;
    const maxAmount = currentUser?.balance ? currentUser.balance : 0;
    return (
      <>
        <Form name="send_money_form" layout="vertical" ref={this.formRef}>
          <Form.Item name="balance" label="Your Balance">
            {currentUser && currentUser.balance?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
            VND
          </Form.Item>
          <Form.Item name="destinationAddress" label="Wallet Address Destination">
            <Input />
          </Form.Item>
          <Form.Item
            name="transferAmount"
            label="Trasnfer Amount"
            rules={[
              { required: true, message: 'Please input amount of money' },
              { type: 'number', min: 1000, message: 'Trasnfer amount must larger than 1000' },
              {
                type: 'number',
                min: 1000,
                validator: (rule, value) => {
                  if (Number.isNaN(Number(value))) {
                    return Promise.reject(new Error('Budget must be a number'));
                  }

                  if (value > maxAmount) {
                    return Promise.reject(new Error('Budget is over your balance'));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={1000}
              style={{
                width: '100%',
              }}
            />
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SendModal);
