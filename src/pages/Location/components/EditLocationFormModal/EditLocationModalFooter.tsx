import { CloseCircleFilled, DeleteTwoTone, EditFilled } from '@ant-design/icons';
import { Button, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../..';

export type EditLocationModalFooterProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  onUpdate: () => any;
  onRemove: () => any;
};

export class EditLocationModalFooter extends React.Component<EditLocationModalFooterProps> {
  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
      },
    });
  };

  render() {
    const { editLocationModal } = this.props.location;
    return (
      <Space>
        <Button
          loading={editLocationModal?.isLoading}
          onClick={() => {
            this.setEditLocationModal({
              visible: false,
              isLoading: false,
            });
          }}
        >
          <CloseCircleFilled className="lba-close-icon" /> Close
        </Button>
        <Button
          danger
          loading={editLocationModal?.isLoading}
          onClick={() => {
            this.props.onRemove();
          }}
        >
          <DeleteTwoTone twoToneColor="#f93e3e" /> Remove Location
        </Button>
        <Button
          loading={editLocationModal?.isLoading}
          className="lba-btn"
          onClick={() => {
            this.props.onUpdate();
          }}
        >
          <EditFilled className="lba-icon" /> Update Location
        </Button>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditLocationModalFooter);
