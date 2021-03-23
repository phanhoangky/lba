import { PageContainer } from '@ant-design/pro-layout';
// import firebase from '@/services/firebase';
import React from 'react';
import { Button, Input, Select, Space, Table, Tooltip } from 'antd';
import type { DeviceModelState, Dispatch, UserModelState } from 'umi';
import { connect } from 'umi';
import Column from 'antd/lib/table/Column';
import { ControlTwoTone, FilterTwoTone } from '@ant-design/icons';
// import DrawerUpdateMultipleDevice from './components/DrawerUpdateMultipleDevice';
import UpdateDeviceFormDrawer from './components/UpdateDeviceFormDrawer';

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

  async componentDidMount() {
    this.setState({
      tableLoading: true,
    });
    this.callGetListDevices()
      .then(() => {
        this.readJWT();
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

  callGetListDevices = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/getDevices',
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

  render() {
    const {
      selectedDevices,
      listDevices,
      getDevicesParam,
      editMultipleDevicesDrawerVisible,
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
          <div>Device List</div>
          <Table
            dataSource={listDevices}
            style={{}}
            scroll={{ y: 'max-content' }}
            loading={this.state.tableLoading}
            title={() => {
              return (
                <>
                  <Space>
                    <Input.Search
                      placeholder="Input search text"
                      onSearch={(value) => {
                        this.callGetListDevices({
                          name: value.trim(),
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
                        this.setState({
                          tableLoading: true,
                        });
                        this.callGetListDevices({
                          orderBy: value,
                        })
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
                        // await this.props.dispatch({
                        //   type: 'deviceStore/getDevices',
                        //   payload:
                        //     value === 'CreateTime'
                        //       ? {
                        //           ...getDevicesParam,
                        //           isSort: true,
                        //           isDescending: true,
                        //           orderBy: value,
                        //         }
                        //       : {
                        //           ...getDevicesParam,
                        //           isSort: true,
                        //           isDescending: false,
                        //           orderBy: value,
                        //         },
                        // });
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
                        this.setEditModalVisible(true);
                      }}
                    >
                      Edit Multiple Devices
                    </Button>
                  </Space>
                </>
              );
            }}
            onRow={(record) => {
              return {
                onClick: async () => {
                  this.setMultipleUpdateMode(false);

                  await this.props.dispatch({
                    type: 'deviceStore/setCurrentDevice',
                    payload: record,
                  });
                  this.setEditModalVisible(true);
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
                this.setState({
                  tableLoading: true,
                });
                this.callGetListDevices({
                  pageNumber: current - 1,
                })
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
            <Column
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
            ></Column>
            {/* <Column key="type" title="Type" dataIndex="typeName" width="100"></Column> */}
            <Column
              key="createTime"
              title="Create Time"
              dataIndex="createTime"
              width="100"
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
      </>
    );
  }
}

export default connect((state: any) => ({
  ...state,
}))(Device);
