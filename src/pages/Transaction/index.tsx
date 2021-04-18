import { PageContainer } from '@ant-design/pro-layout';
import * as React from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';

export type TransactionScreenProps = {
  dispatch: Dispatch;
};

export class TransactionScreen extends React.Component<TransactionScreenProps> {
  render() {
    return (
      <PageContainer
        title={false}
        header={{
          ghost: false,
          style: {
            padding: 0,
          },
        }}
      ></PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(TransactionScreen);
