import { Button, Result } from 'antd';
import * as React from 'react';
import { connect } from 'umi';

type CreateDoneComponentProps = {
  title: string;
  subTitle?: string;
  finish: () => void;
};

export class CreateDoneComponent extends React.Component<CreateDoneComponentProps> {
  constructor(props: CreateDoneComponentProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <Result
          status="success"
          title={this.props.title}
          subTitle={this.props.subTitle}
          extra={
            <Button
              className="lba-btn"
              onClick={() => {
                this.props.finish();
              }}
            >
              Done
            </Button>
          }
        />
        ,
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(CreateDoneComponent);
