import { openNotification } from '@/utils/utils';
import { ControlTwoTone, FilterTwoTone } from '@ant-design/icons';
import { Button, Input, Select, Space } from 'antd';
import * as React from 'react';
import type { DeviceModelState, Dispatch, UserModelState } from 'umi';
import { connect } from 'umi';

export type DevicesTableHeaderComponentProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
};

export class DevicesTableHeaderComponent extends React.Component<DevicesTableHeaderComponentProps> {
  callGetListDevices = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/getDevices',
      payload: {
        ...this.props.deviceStore.getDevicesParam,
        ...param,
      },
    });
  };

  setMultipleUpdateMode = async (isMultipleUpdate: boolean) => {
    await this.props.dispatch({
      type: 'deviceStore/setMultipleUpdateMode',
      payload: isMultipleUpdate,
    });
  };

  setEditModalVisible = (isOpen: boolean) => {
    this.props.dispatch({
      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
      payload: isOpen,
    });
  };

  setEditMultipleDevicesDrawer = async (param?: any) => {
    this.props.dispatch({
      type: 'deviceStore/setEditMultipleDevicesDrawerReducer',
      payload: {
        ...this.props.deviceStore.editMultipleDevicesDrawer,
        ...param,
      },
    });
  };

  setDevicesTableLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: 'deviceStore/setDevicesTableLoadingReducer',
      payload: isLoading,
    });
  };

  render() {
    const { selectedDevices } = this.props.deviceStore;
    return (
      <Space>
        <Input.Search
          placeholder="Input search text"
          onSearch={(value) => {
            this.setDevicesTableLoading(true)
              .then(() => {
                this.callGetListDevices({
                  name: value.trim(),
                }).then(() => {
                  this.setDevicesTableLoading(false);
                });
              })
              .catch((error) => {
                openNotification('error', 'Error', error);
                Promise.reject(error);
                this.setDevicesTableLoading(false);
              });

            // this.props.dispatch({
            //   type: 'deviceStore/getDevices',
            //   payload: {
            //     ...getDevicesParam,

            //   },
            // });
          }}
          enterButton
        />
        <ControlTwoTone style={{ fontSize: `2em` }} />
        <Select
          style={{ width: 120 }}
          // defaultValue="CreateTime"
          onChange={async (value) => {
            this.setDevicesTableLoading(true)
              .then(() => {
                this.callGetListDevices({
                  isSort: true,
                  orderBy: value,
                }).then(() => {
                  this.setDevicesTableLoading(false);
                });
              })
              .catch(() => {
                this.setDevicesTableLoading(false);
              });
          }}
        >
          <Select.Option value="CreateTime">Newest</Select.Option>
          <Select.Option value="Name">Name</Select.Option>
        </Select>
        <FilterTwoTone style={{ fontSize: `2em` }} />
        <Button
          disabled={selectedDevices && !(selectedDevices?.length > 0)}
          onClick={async () => {
            this.setMultipleUpdateMode(true);

            // await this.props.dispatch({
            //   type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
            //   payload: true,
            // });
            // this.setEditModalVisible(true);
            this.setEditMultipleDevicesDrawer({
              visible: true,
            });
          }}
        >
          Edit Multiple Devices
        </Button>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(DevicesTableHeaderComponent);
