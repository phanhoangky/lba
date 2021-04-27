import { openNotification } from '@/utils/utils';
import { CheckCircleFilled, CloseCircleFilled, DeleteFilled, EditFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space } from 'antd';
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

export type UpdateDeviceDrawerFooterStates = {
  deletePopconfirmVisible: boolean;
};
export class UpdateDeviceDrawerFooter extends React.Component<
  UpdateDeviceDrawerFooterProps,
  UpdateDeviceDrawerFooterStates
> {
  constructor(props: UpdateDeviceDrawerFooterProps) {
    super(props);
    this.state = {
      deletePopconfirmVisible: false,
    };
  }

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

  confirmDeleteDevice = async () => {
    const { selectedDevice } = this.props.deviceStore;
    this.setEditMultipleDevicesDrawer({
      isLoading: true,
    }).then(() => {
      this.deleteDevice()
        .then(() => {
          this.callGetListDevices()
            .then(() => {
              openNotification(
                'success',
                'Delete Device Success',
                `${selectedDevice?.name} was deleted`,
              );
            })
            .then(() => {
              this.setEditMultipleDevicesDrawer({
                isLoading: false,
                visible: false,
              });
            });
        })
        .catch(() => {
          this.setEditMultipleDevicesDrawer({
            isLoading: false,
          });
        });
    });
  };
  render() {
    const { isUpdateMultiple, selectedDevice, editMultipleDevicesDrawer } = this.props.deviceStore;
    return (
      <div
        style={{
          textAlign: 'right',
        }}
      >
        <Space>
          <Button
            icon={<CloseCircleFilled className="lba-close-icon" />}
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
            // <Button
            //   danger
            //   icon={<DeleteFilled className="lba-close-icon" />}
            //   onClick={async () => {
            //     this.setEditMultipleDevicesDrawer({
            //       isLoading: true,
            //     })
            //       .then(() => {
            //         this.deleteDevice()
            //           .then(() => {
            //             this.callGetListDevices().then(() => {
            //               openNotification(
            //                 'success',
            //                 'Devices delete successfuly',
            //                 `${selectedDevice?.name} was deleted`,
            //               );
            //               this.setEditMultipleDevicesDrawer({
            //                 isLoading: false,
            //                 visible: false,
            //               });
            //             });
            //           })
            //           .catch((error) => {
            //             openNotification('error', 'Fail to delete device', error.message);
            //           });
            //       })
            //       .catch(() => {
            //         this.setEditMultipleDevicesDrawer({
            //           isLoading: false,
            //           visible: false,
            //         });
            //       });
            //   }}
            // >
            //   Delete Device
            // </Button>
            <Popconfirm
              title={`Are you sure want to delete ${selectedDevice?.name} ?`}
              visible={this.state.deletePopconfirmVisible}
              onConfirm={this.confirmDeleteDevice}
              okButtonProps={{
                loading: editMultipleDevicesDrawer?.isLoading,
                className: 'lba-btn',
                icon: <CheckCircleFilled className="lba-icon" />,
              }}
              cancelButtonProps={{
                icon: <CloseCircleFilled className="lba-close-icon" />,
                danger: true,
              }}
              onCancel={() => {
                this.setState({
                  deletePopconfirmVisible: false,
                });
              }}
            >
              <Button
                danger
                icon={<DeleteFilled className="lba-close-icon" />}
                onClick={() => {
                  this.setState({
                    deletePopconfirmVisible: true,
                  });
                }}
              >
                Delete Device
              </Button>
            </Popconfirm>
          )}
          <Button
            className="lba-btn"
            icon={<EditFilled className="lba-icon" />}
            onClick={async () => {
              this.setEditMultipleDevicesDrawer({
                isLoading: true,
              }).then(() => {
                if (isUpdateMultiple) {
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
                      });
                    })

                    .catch((error) => {
                      // Promise.reject(error);
                      openNotification('error', 'Devices updated fail', error.message);
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
