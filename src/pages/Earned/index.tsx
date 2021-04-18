import { PageContainer } from '@ant-design/pro-layout';
import * as React from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';

export type EarnedScreenProps = {
  dispatch: Dispatch;
};

export class EarnedScreen extends React.Component<EarnedScreenProps> {
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

export default connect((state: any) => ({ ...state }))(EarnedScreen);
