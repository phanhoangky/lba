import { PageContainer } from '@ant-design/pro-layout';
// import firebase from '@/services/firebase';
import React from 'react';
import { Button, Drawer, Modal, Space, Table, Tooltip } from 'antd';
import type { DeviceModelState, Dispatch, ScenarioModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import Column from 'antd/lib/table/Column';
// import DrawerUpdateMultipleDevice from './components/DrawerUpdateMultipleDevice';
import { UpdateDeviceFormDrawer } from './components/UpdateDeviceFormDrawer';
import { DevicesTableHeaderComponent } from './components/DevicesTableHeaderComponent';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  EditFilled,
  ExclamationCircleOutlined,
  EyeFilled,
} from '@ant-design/icons';
import { ViewScreenShotModal } from './components/ViewScreenShotModal';
import { openNotification } from '@/utils/utils';
import { ViewDeviceDetailComponent } from './components/ViewDeviceDetailComponent';

type DeviceProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
};

class Device extends React.Component<DeviceProps> {
  /**
   *
   */
  state = {
    visible: false,
    confirmLoading: false,
    selectedRowKeys: [],
    selectedRow: {},
    isOpenDrawer: false,
    currentPage: 1,
    paginationConfig: {
      pageSize: 10,
      defaultCurrent: 1,
    },
    tableLoading: false,
  };

  componentDidMount = async () => {
    this.setDevicesTableLoading(true)
      .then(async () => {
        this.readJWT().catch((error) => {
          openNotification('error', 'Error', error.message);
        });
        Promise.all([
          this.callGetListScenarios({ isPaging: false }),
          this.callGetListDevices(),
        ]).then(() => {
          this.setGetDevicesParam({
            locationId: undefined,
          });
          this.setDevicesTableLoading(false);
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occurred', error);
        this.setDevicesTableLoading(false);
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

  callGetListScenarios = async (param?: any) => {
    await this.props.dispatch({
      type: `scenarios/getListScenarios`,
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  setGetDevicesParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/setGetDevicesParamReducer',
      payload: {
        ...this.props.deviceStore.getDevicesParam,
        ...param,
      },
    });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  setEditModalVisible = (isOpen: boolean) => {
    this.props.dispatch({
      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
      payload: isOpen,
    });
  };

  setMultipleUpdateMode = async (isMultipleUpdate: boolean) => {
    await this.props.dispatch({
      type: 'deviceStore/setMultipleUpdateMode',
      payload: isMultipleUpdate,
    });
  };

  onUpdateDevice = async () => {
    this.props.dispatch({
      type: 'deviceStore/updateDevice',
      payload: this.props.deviceStore.selectedDevice,
    });
    // .then(() => {
    //   this.callGetListDevices();
    // });

    // await this.props.dispatch({
    //   type: 'deviceStore/getDevices',
    //   payload: {
    //     ...this.props.deviceStore.getDevicesParam,
    //   },
    // });
  };

  onUpdateMultipleDevices = async () => {
    await this.props.dispatch({
      type: 'deviceStore/updateListDevice',
      payload: {
        updateDevicesState: this.props.deviceStore.updateDevicesState,
        listId: this.props.deviceStore.selectedDevices?.map((device) => {
          return device.id;
        }),
      },
    });

    await this.props.dispatch({
      type: 'deviceStore/clearUpdateDevicesDrawer',
    });
    this.setState({
      selectedRowKeys: [],
    });

    await this.callGetListDevices();
    // await this.props.dispatch({
    //   type: 'deviceStore/getDevices',
    //   payload: {
    //     ...this.props.deviceStore.getDevicesParam,
    //   },
    // });
  };

  setDevicesTableLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: 'deviceStore/setDevicesTableLoadingReducer',
      payload: isLoading,
    });
  };

  fetchDevicesScreenShot = async (macAddress: string) => {
    await this.props.dispatch({
      type: 'deviceStore/fetchDevicesScreenShot',
      payload: macAddress,
    });
  };

  setViewScreenshotModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/setViewScreenshotModalReducer',
      payload: {
        ...this.props.deviceStore.viewScreenshotModal,
        ...param,
      },
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

  setSelectedDevice = async (record?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/setCurrentDevice',
      payload: {
        ...this.props.deviceStore.selectedDevice,
        ...record,
      },
    });
  };

  deleteDevice = async (id: string) => {
    await this.props.dispatch({
      type: 'deviceStore/deleteDevice',
      payload: id,
    });
  };

  confirmDeleteDevice = async (device: any) => {
    Modal.confirm({
      centered: true,
      closable: false,
      title: 'Confirm ?',
      content: `Are you sure want to delete ${device.name} ?`,
      icon: <ExclamationCircleOutlined />,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      onOk: () => {
        this.setDevicesTableLoading(true).then(() => {
          this.deleteDevice(device.id)
            .then(() => {
              this.callGetListDevices().then(() => {
                openNotification('success', 'Delete Device Success', `${device?.name} was deleted`);
                this.setDevicesTableLoading(false);
              });
            })
            .catch((error) => {
              openNotification('error', 'Fail to delete device', error.message);
              this.setDevicesTableLoading(false);
            });
        });
      },
    });
  };

  setViewDeviceDetailModal = async (modal?: any) => {
    await this.props.dispatch({
      type: `deviceStore/setViewDeviceDetailModalReducer`,
      payload: {
        ...this.props.deviceStore.viewDeviceDetailModal,
        ...modal,
      },
    });
  };
  updateDeviceFormRef = React.createRef<UpdateDeviceFormDrawer>();

  render() {
    const {
      listDevices,
      getDevicesParam,
      // editMultipleDevicesDrawerVisible,
      viewScreenshotModal,
      devicesTableLoading,
      viewDeviceDetailModal,
    } = this.props.deviceStore;

    const { selectedRowKeys } = this.state;
    // console.log(selectedDevices);

    const rowSelection = {
      selectedRowKeys,
      onChange: async (selectedRowsKeys: React.Key[], selectedRows: any[]) => {
        this.setState({
          selectedRowKeys: selectedRowsKeys,
        });
        await this.props.dispatch({
          type: 'deviceStore/setSelectedDevices',
          payload: selectedRows,
        });
      },
    };

    return (
      <>
        <PageContainer
          title={false}
          header={{
            ghost: false,
            style: {
              padding: 0,
            },
          }}
        >
          <Table
            dataSource={listDevices}
            style={{}}
            scroll={{ y: 400, x: 500 }}
            loading={devicesTableLoading}
            title={() => {
              return <DevicesTableHeaderComponent {...this.props} />;
            }}
            onRow={(record) => {
              return {
                onClick: async () => {
                  await this.props.dispatch({
                    type: 'deviceStore/setCurrentDevice',
                    payload: record,
                  });
                },
              };
            }}
            rowSelection={rowSelection}
            pagination={{
              total: this.props.deviceStore.totalItem,
              pageSize: 10,
              current: getDevicesParam?.pageNumber ? getDevicesParam?.pageNumber + 1 : 1,
              onChange: async (current) => {
                this.setDevicesTableLoading(true)
                  .then(() => {
                    this.callGetListDevices({
                      pageNumber: current - 1,
                    }).then(() => {
                      this.setDevicesTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setDevicesTableLoading(false);
                  });
              },
            }}
          >
            <Column key="Name" title="Name" dataIndex="name" width="100"></Column>
            <Column key="resolution" title="Resolution" dataIndex="resolution" width="100"></Column>
            <Column key="macAddress" title="MacAddress" dataIndex="macaddress" width="100"></Column>
            <Column
              key="location"
              title="Location"
              // dataIndex={['location', 'name']}
              width="100"
              render={(record) => {
                return (
                  <>
                    <Tooltip placement="topLeft" title={record.location.name}>
                      {record.location.name}
                    </Tooltip>
                  </>
                );
              }}
            ></Column>
            <Column
              key="action"
              title="Action"
              render={(record) => {
                return (
                  <Space>
                    <Button
                      className="lba-btn"
                      onClick={() => {
                        this.setSelectedDevice(record).then(() => {
                          this.setViewDeviceDetailModal({
                            visible: true,
                          });
                        });
                      }}
                    >
                      <EyeFilled className="lba-icon" />
                    </Button>
                    <Button
                      className="lba-btn"
                      onClick={async () => {
                        this.setMultipleUpdateMode(false).then(() => {
                          this.setSelectedDevice(record).then(() => {
                            this.setEditMultipleDevicesDrawer({
                              visible: true,
                            }).then(() => {
                              this.updateDeviceFormRef.current?.componentDidMount();
                            });
                          });
                        });
                        // this.setEditModalVisible(true);
                      }}
                    >
                      <EditFilled className="lba-icon" />
                    </Button>
                    <Button
                      danger
                      onClick={async (e) => {
                        // this.setEditModalVisible(true);
                        this.confirmDeleteDevice(record);
                        e.stopPropagation();
                      }}
                    >
                      <DeleteTwoTone twoToneColor="#f93e3e" />
                    </Button>
                  </Space>
                );
              }}
              width="100"
            ></Column>
            <Column
              key="screenShot"
              title="ScreenShot"
              render={(record) => {
                return (
                  <Space>
                    <Button
                      className="lba-btn"
                      onClick={async () => {
                        this.setSelectedDevice(record).then(() => {
                          this.setViewScreenshotModal({
                            visible: true,
                          });
                        });
                      }}
                    >
                      Sreenshot
                    </Button>
                  </Space>
                );
              }}
            ></Column>
          </Table>
        </PageContainer>

        {/* {editMultipleDevicesDrawer?.visible && ( */}
        <>
          <UpdateDeviceFormDrawer ref={this.updateDeviceFormRef} {...this.props} />
        </>
        {/* )} */}
        {/* <UpdateDeviceFormDrawer {...this.props} /> */}

        {/** Screenshot Modal */}
        <Modal
          title="Screenshot"
          destroyOnClose={true}
          closable={false}
          okText={false}
          centered
          forceRender
          cancelText={false}
          onCancel={() => {
            this.setViewScreenshotModal({
              visible: false,
            });
          }}
          width={'50%'}
          visible={viewScreenshotModal?.visible}
        >
          {viewScreenshotModal?.visible && <ViewScreenShotModal {...this.props} />}
        </Modal>

        {/** End Screenshot Modal */}

        {/* View Device Detail Modal */}
        <Drawer
          title="Device Detail"
          visible={viewDeviceDetailModal?.visible}
          closable={false}
          destroyOnClose={true}
          width={'40%'}
          onClose={() => {
            this.setViewDeviceDetailModal({
              visible: false,
            });
          }}
        >
          <ViewDeviceDetailComponent {...this.props} />
        </Drawer>
        {/* End View Device Detail Modal */}
      </>
    );
  }
}

export default connect((state: any) => ({
  ...state,
}))(Device);
