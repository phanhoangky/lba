import { PageContainer } from '@ant-design/pro-layout';
// import firebase from '@/services/firebase';
import React from 'react';
import { Button, Modal, Space, Table } from 'antd';
import type { DeviceModelState, Dispatch, UserModelState } from 'umi';
import { connect } from 'umi';
import Column from 'antd/lib/table/Column';
// import DrawerUpdateMultipleDevice from './components/DrawerUpdateMultipleDevice';
import UpdateDeviceFormDrawer from './components/UpdateDeviceFormDrawer';
import { DevicesTableHeaderComponent } from './components/DevicesTableHeaderComponent';
import { EyeTwoTone } from '@ant-design/icons';
import { ViewScreenShotModal } from './components/ViewScreenShotModal';

type DeviceProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
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
      .then(() => {
        this.callGetListDevices().then(() => {
          this.setGetDevicesParam({
            locationId: undefined,
          });
          this.setDevicesTableLoading(false);
        });
      })
      .catch(() => {
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
    this.props
      .dispatch({
        type: 'deviceStore/updateDevice',
        payload: this.props.deviceStore.selectedDevice,
      })
      .then(() => {
        this.callGetListDevices();
      });

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
  render() {
    const {
      selectedDevices,
      listDevices,
      getDevicesParam,
      editMultipleDevicesDrawerVisible,
      viewScreenshotModal,
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
        <PageContainer>
          <Table
            dataSource={listDevices}
            style={{}}
            scroll={{ y: 400, x: 500 }}
            loading={this.state.tableLoading}
            title={() => {
              return (
                <>
                  <DevicesTableHeaderComponent {...this.props} />
                </>
              );
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
            bordered
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

                // this.props
                //   .dispatch({
                //     type: 'deviceStore/getDevices',
                //     payload: {
                //       ...getDevicesParam,
                //       pageNumber: current - 1,
                //     },
                //   })
                //   .then(() => {

                //   })

                // this.setState({ currentPage: current });
              },
            }}
          >
            <Column key="Name" title="Name" dataIndex="name" width="100"></Column>
            <Column key="resolution" title="Resolution" dataIndex="resolution" width="100"></Column>
            <Column key="macAddress" title="MacAddress" dataIndex="macaddress" width="100"></Column>
            {/* <Column
              key="description"
              title="Description"
              dataIndex="description"
              width="100"
              ellipsis={{ showTitle: true }}
              render={(description) => {
                return (
                  <>
                    <Tooltip placement="topLeft" title={description}>
                      {description}
                    </Tooltip>
                  </>
                );
              }}
            ></Column> */}
            {/* <Column key="type" title="Type" dataIndex="typeName" width="100"></Column> */}

            <Column
              key="location"
              title="Location"
              dataIndex={['location', 'name']}
              width="100"
            ></Column>
            <Column
              key="action"
              title="Action"
              render={(record) => {
                return (
                  <Space>
                    <Button
                      onClick={async () => {
                        this.setMultipleUpdateMode(false);

                        await this.props.dispatch({
                          type: 'deviceStore/setCurrentDevice',
                          payload: record,
                        });
                        this.setEditModalVisible(true);
                      }}
                    >
                      <EyeTwoTone />
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
                      onClick={async () => {
                        await this.props.dispatch({
                          type: 'deviceStore/setCurrentDevice',
                          payload: record,
                        });
                        await this.setViewScreenshotModal({
                          visible: true,
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
        {/* <Drawer
          title={isUpdateMultiple ? 'Update Multiple Devices' : selectedDevice.name}
          key="updateMultipleDevies"
          visible={this.props.deviceStore.editMultipleDevicesDrawerVisible}
          width={700}
          closable={false}
          onClose={() => {
            this.props.dispatch({
              type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
              payload: false,
            });
          }}
          footer={
            <div
              style={{
                textAlign: 'right',
              }}
            >
              <Space>
                <Button
                  icon={<CloseSquareTwoTone />}
                  onClick={async () => {
                    await this.props.dispatch({
                      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                      payload: false,
                    });
                  }}
                >
                  Close Drawer
                </Button>
                <Button
                  icon={<CloseSquareTwoTone />}
                  onClick={async () => {
                    if (isUpdateMultiple) {
                      await this.onUpdateMultipleDevices();
                    } else {
                      await this.props.dispatch({
                        type: 'deviceStore/deleteDevice',
                        payload: selectedDevice.id,
                      });

                      this.props.dispatch({
                        type: 'deviceStore/getDevices',
                        payload: getDevicesParam,
                      });
                    }

                    await this.props.dispatch({
                      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                      payload: false,
                    });
                  }}
                >
                  {isUpdateMultiple ? 'Delete Multiple Devices' : 'Delete Device'}
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={async () => {
                    this.setState({
                      tableLoading: true,
                    });
                    if (isUpdateMultiple) {
                      this.onUpdateMultipleDevices()
                        .then(() => {
                          this.setState({
                            tableLoading: false,
                          });
                        })
                        .catch(() => {
                          this.setState({
                            tableLoading: false,
                          });
                        });
                    } else {
                      await this.onUpdateDevice()
                        .then(() => {
                          this.setState({
                            tableLoading: false,
                          });
                        })
                        .catch(() => {
                          this.setState({
                            tableLoading: false,
                          });
                        });
                    }

                    this.props.dispatch({
                      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                      payload: false,
                    });
                  }}
                >
                  {isUpdateMultiple ? 'Update Multiple Devices' : 'Update Device'}
                </Button>
              </Space>
            </div>
          }
        >
          <DrawerUpdateMultipleDevice {...this.props}></DrawerUpdateMultipleDevice>
        </Drawer> */}

        {editMultipleDevicesDrawerVisible && <UpdateDeviceFormDrawer {...this.props} />}
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
      </>
    );
  }
}

export default connect((state: any) => ({
  ...state,
}))(Device);
