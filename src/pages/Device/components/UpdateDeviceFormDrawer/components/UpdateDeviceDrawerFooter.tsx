import { openNotification } from '@/utils/utils';
import { CloseSquareTwoTone, EditOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import * as React from 'react';
import type { DeviceModelState, Dispatch, ScenarioModelState, UserModelState } from 'umi';
import { connect } from 'umi';

export type UpdateDeviceDrawerFooterProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
  onUpdateMultipleDevices: () => Promise<any>;
  onUpdateDevice: () => Promise<any>;
};

export class UpdateDeviceDrawerFooter extends React.Component<UpdateDeviceDrawerFooterProps> {
  setEditMultipleDevicesDrawer = async (param?: any) => {
    this.props.dispatch({
      type: 'deviceStore/setEditMultipleDevicesDrawerReducer',
      payload: {
        ...this.props.deviceStore.editMultipleDevicesDrawer,
        ...param,
      },
    });
  };

  callGetListDevices = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/getDevices',
      payload: {
        ...this.props.deviceStore.getDevicesParam,
        ...param,
      },
    });
  };

  deleteDevice = async () => {
    const { selectedDevice } = this.props.deviceStore;
    await this.props.dispatch({
      type: 'deviceStore/deleteDevice',
      payload: selectedDevice?.id,
    });
  };
  render() {
    const { isUpdateMultiple, selectedDevice } = this.props.deviceStore;
    return (
      <div
        style={{
          textAlign: 'right',
        }}
      >
        <Space>
          <Button
            icon={<CloseSquareTwoTone />}
            onClick={async () => {
              // await this.props.dispatch({
              //   type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
              //   payload: false,
              // });
              this.setEditMultipleDevicesDrawer({
                visible: false,
              });
            }}
          >
            Close Drawer
          </Button>
          {!isUpdateMultiple && (
            <Button
              icon={<CloseSquareTwoTone />}
              onClick={async () => {
                this.setEditMultipleDevicesDrawer({
                  isLoading: true,
                })
                  .then(() => {
                    this.deleteDevice()
                      .then(() => {
                        this.callGetListDevices().then(() => {
                          openNotification(
                            'success',
                            'Devices delete successfuly',
                            `${selectedDevice?.name} was deleted`,
                          );
                          this.setEditMultipleDevicesDrawer({
                            isLoading: false,
                            visible: false,
                          });
                        });
                      })
                      .catch((error) => {
                        openNotification('error', 'Fail to delete device', error.message);
                      });
                  })
                  .catch(() => {
                    this.setEditMultipleDevicesDrawer({
                      isLoading: false,
                      visible: false,
                    });
                  });
              }}
            >
              Delete Device
            </Button>
          )}
          <Button
            icon={<EditOutlined />}
            onClick={async () => {
              this.setEditMultipleDevicesDrawer({
                isLoading: true,
              }).then(() => {
                if (isUpdateMultiple) {
                  console.log('====================================');
                  console.log('Multiple >>>', isUpdateMultiple);
                  console.log('====================================');
                  this.props
                    .onUpdateMultipleDevices()
                    .then(() => {
                      const { selectedDevices } = this.props.deviceStore;
                      openNotification(
                        'success',
                        'Devices updated successfully',
                        selectedDevices &&
                          selectedDevices
                            .map((d) => `${d.name} was update sucessfully \n`)
                            .join(''),
                      );
                      this.setEditMultipleDevicesDrawer({
                        isLoading: false,
                        // visible: false,
                      });
                    })

                    .catch(() => {
                      const { selectedDevices } = this.props.deviceStore;
                      openNotification(
                        'error',
                        'Devices updated fail',
                        selectedDevices?.map((d) => `${d.name} was fail to updated  \n`).toString(),
                      );
                      this.setEditMultipleDevicesDrawer({
                        isLoading: false,
                        // visible: false,
                      });
                    });
                } else {
                  this.props
                    .onUpdateDevice()
                    .then(async () => {
                      openNotification(
                        'success',
                        'Devices updated successfully',
                        `${selectedDevice?.name} was updated`,
                      );
                      this.setEditMultipleDevicesDrawer({
                        isLoading: false,
                        visible: false,
                      });
                    })

                    .catch((error) => {
                      Promise.reject(error);
                      openNotification(
                        'error',
                        'Devices updated fail',
                        `${selectedDevice?.name} was fail to update`,
                      );
                      this.setEditMultipleDevicesDrawer({
                        isLoading: false,
                        // visible: false,
                      });
                    });
                }
              });
            }}
          >
            {isUpdateMultiple ? 'Update Multiple Devices' : 'Update Device'}
          </Button>
        </Space>
      </div>
    );
  }
}

export default connect((state: any) => ({ ...state }))(UpdateDeviceDrawerFooter);
