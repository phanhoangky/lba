import { DeleteTwoTone, EditFilled } from '@ant-design/icons';
import { Button, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';

export type EditLocationModalFooterProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  onUpdate: () => any;
  onRemove: () => any;
};

export class EditLocationModalFooter extends React.Component<EditLocationModalFooterProps> {
  render() {
    return (
      <Space>
        <Button
          danger
          onClick={() => {
            this.props.onRemove();
          }}
        >
          <DeleteTwoTone twoToneColor="#f93e3e" /> Remove Location
        </Button>
        <Button
          type="primary"
          onClick={() => {
            this.props.onUpdate();
          }}
        >
          <EditFilled /> Update Location
        </Button>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditLocationModalFooter);
