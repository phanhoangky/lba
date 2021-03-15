import {
  CheckOutlined,
  ClockCircleTwoTone,
  CloseOutlined,
  CloseSquareTwoTone,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  Switch,
  TimePicker,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import * as React from 'react';
import type { DeviceModelState, Dispatch, UserModelState } from 'umi';
import { connect } from 'umi';
// import DrawerUpdateMultipleDevice from '../DrawerUpdateMultipleDevice';
import FilterDate from '../FilterDate';

export type UpdateDeviceFormDrawerProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
};

class UpdateDeviceFormDrawer extends React.Component<UpdateDeviceFormDrawerProps> {
  componentDidMount() {
    const { selectedDevice, isUpdateMultiple } = this.props.deviceStore;
    if (!isUpdateMultiple) {
      if (this.formRef.current) {
        this.formRef.current.setFieldsValue({
          description: selectedDevice.description,
          startEnd: [
            moment(moment(selectedDevice.startDate).format('YYYY/MM/DD')),
            moment(moment(selectedDevice.endDate).format('YYYY/MM/DD')),
          ],
          typeId: selectedDevice.type?.id,
        });
      }
    }
  }

  state = {
    inputVisible: false,
  };

  onUpdateMultipleDevices = async (values: any) => {
    console.log('====================================');
    console.log(values);
    console.log('====================================');
    await this.props.dispatch({
      type: 'deviceStore/updateListDevice',
      payload: {
        updateDevicesState: {
          ...this.props.deviceStore.updateDevicesState,
          ...values,
          startDate: values.startEnd[0],
          endDate: values.startEnd[1],
        },
        listId: this.props.deviceStore.selectedDevices.map((device) => {
          return device.id;
        }),
      },
    });
  };

  onUpdateDevice = async (values: any) => {
    console.log('====================================');
    console.log(values);
    console.log('====================================');
    await this.props.dispatch({
      type: 'deviceStore/updateDevice',
      payload: {
        ...this.props.deviceStore.selectedDevice,
        ...values,
        startDate: values.startEnd[0],
        endDate: values.startEnd[1],
      },
    });

    await this.props.dispatch({
      type: 'deviceStore/getDevices',
      payload: {
        ...this.props.deviceStore.getDevicesParam,
      },
    });
  };

  handleRemoveDateFilter = (index: any) => {
    const { isUpdateMultiple, updateDevicesState, selectedDevice } = this.props.deviceStore;
    const listTimeFilter = isUpdateMultiple
      ? updateDevicesState.timeFilter
      : selectedDevice.timeFilter;

    if (isUpdateMultiple) {
      this.props.dispatch({
        type: 'deviceStore/setUpdateDevicesState',
        payload: {
          ...updateDevicesState,
          timeFilter: listTimeFilter?.map((time, i) => {
            if (i.toString() === index) {
              return '0';
            }
            return time;
          }),
        },
      });
    } else {
      this.props.dispatch({
        type: 'deviceStore/setCurrentDevice',
        payload: {
          ...selectedDevice,
          timeFilter: listTimeFilter?.map((time, i) => {
            if (i.toString() === index) {
              return 0;
            }
            return time;
          }),
        },
      });
    }
  };
  onTimeFilterBlur = () => {
    this.setState({ inputVisible: false });
  };
  formRef = React.createRef<FormInstance<any>>();
  render() {
    const { inputVisible } = this.state;
    const {
      isUpdateMultiple,
      selectedDevice,
      getDevicesParam,
      updateDevicesState,
      listDeviceTypes,
    } = this.props.deviceStore;

    const timeFilter = isUpdateMultiple ? updateDevicesState.timeFilter : selectedDevice.timeFilter;
    const displayTimeFilter = timeFilter.map((time, index) => {
      return (
        time === '1' && (
          <Input
            key={Math.random() + 100}
            prefix={<ClockCircleTwoTone className="site-form-item-icon" />}
            readOnly
            style={{
              fontWeight: 'bolder',
              width: 200,
            }}
            size={'small'}
            suffix={
              <Button
                onClick={() => {
                  this.handleRemoveDateFilter(index.toString());
                }}
              >
                <CloseOutlined />
              </Button>
            }
            value={`${index} h - ${index + 1} h`}
          />
        )
      );
    });
    return (
      <Drawer
        title={isUpdateMultiple ? 'Update Multiple Devices' : selectedDevice.name}
        key="updateMultipleDevies"
        visible={this.props.deviceStore.editMultipleDevicesDrawerVisible}
        width={700}
        closable={false}
        getContainer={false}
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
              {!isUpdateMultiple && (
                <Button
                  icon={<CloseSquareTwoTone />}
                  onClick={async () => {
                    await this.props.dispatch({
                      type: 'deviceStore/deleteDevice',
                      payload: selectedDevice.id,
                    });

                    await this.props.dispatch({
                      type: 'deviceStore/getDevices',
                      payload: getDevicesParam,
                    });
                    await this.props.dispatch({
                      type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                      payload: false,
                    });
                  }}
                >
                  Delete Device
                </Button>
              )}
              <Button
                icon={<EditOutlined />}
                onClick={async () => {
                  this.setState({
                    tableLoading: true,
                  });
                  if (isUpdateMultiple) {
                    this.formRef.current
                      ?.validateFields()
                      .then((values) => {
                        this.onUpdateMultipleDevices(values).then(() => {
                          this.setState({
                            tableLoading: false,
                          });
                          this.props.dispatch({
                            type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                            payload: false,
                          });
                        });
                      })
                      .catch((info) => {
                        console.log('====================================');
                        console.error(info);
                        console.log('====================================');
                        this.setState({
                          tableLoading: false,
                        });
                      });
                  }

                  if (this.formRef.current) {
                    this.formRef.current
                      .validateFields()
                      .then((values) => {
                        console.log('====================================');
                        console.log(values);
                        console.log('====================================');
                        this.onUpdateDevice(values).then(() => {
                          this.setState({
                            tableLoading: false,
                          });
                          this.props.dispatch({
                            type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
                            payload: false,
                          });
                        });
                      })
                      .catch(() => {
                        this.setState({
                          tableLoading: false,
                        });
                      });
                  }
                }}
              >
                {isUpdateMultiple ? 'Update Multiple Devices' : 'Update Device'}
              </Button>
            </Space>
          </div>
        }
      >
        {/* <DrawerUpdateMultipleDevice {...this.props}></DrawerUpdateMultipleDevice> */}
        <Form ref={this.formRef} layout="vertical" name="Update_Device_Form">
          <Row>
            <Col>
              <Space wrap={true}>{displayTimeFilter}</Space>
            </Col>
          </Row>
          <Divider></Divider>
          <Row>
            <Col>
              {inputVisible && (
                <TimePicker.RangePicker
                  onChange={(e) => {
                    if (e) {
                      if (e[0] && e[1]) {
                        const startDate = e[0].hour();
                        const endDate = e[1]?.hour();
                        if (startDate >= 0 && endDate >= 0) {
                          if (isUpdateMultiple) {
                            this.props.dispatch({
                              type: 'deviceStore/setUpdateDevicesState',
                              payload: {
                                ...updateDevicesState,
                                timeFilter: timeFilter.map((time, index) => {
                                  if (index >= startDate && index < endDate) {
                                    return '1';
                                  }
                                  return time;
                                }),
                              },
                            });
                          } else {
                            this.props.dispatch({
                              type: 'deviceStore/setCurrentDevice',
                              payload: {
                                ...selectedDevice,
                                timeFilter: timeFilter?.map((time, index) => {
                                  if (index >= startDate && index < endDate) {
                                    return '1';
                                  }
                                  return time;
                                }),
                              },
                            });
                          }
                        }
                      }
                    }

                    this.onTimeFilterBlur();
                  }}
                  format="HH"
                  // onOk={(date) => {
                  //   console.log(date?.[0]?.hour);
                  // }}
                  onBlur={this.onTimeFilterBlur}
                />
              )}
              {!inputVisible && (
                <Button
                  onClick={() => {
                    this.setState({ inputVisible: true });
                  }}
                >
                  <PlusOutlined /> New Time
                </Button>
              )}
            </Col>
          </Row>
          <Divider></Divider>
          <FilterDate {...this.props}></FilterDate>
          <Divider></Divider>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input address' }]}
          >
            <Input />
          </Form.Item>
          {!isUpdateMultiple && (
            <></>
            // <Row>
            //   <Col flex={3}>Discription</Col>
            //   <Col flex={5}>
            //     <Input
            //       value={selectedDevice.description}
            //       onChange={(e) => {
            //         this.props.dispatch({
            //           type: 'deviceStore/setCurrentDevice',
            //           payload: {
            //             ...selectedDevice,
            //             description: e.target.value,
            //           },
            //         });
            //       }}
            //     ></Input>
            //   </Col>
            // </Row>
          )}
          <Form.Item
            name="startEnd"
            label="Start-End"
            rules={[{ required: true, message: 'Please input address' }]}
          >
            <DatePicker.RangePicker
              format={'YYYY/MM/DD'}
              disabledDate={(current) => {
                return current < moment().endOf('day');
              }}
              // onChange={(e) => {
              //   if (e) {
              //     if (e[0] && e[1]) {
              //       const startDate = e[0].format('YYYY-MM-DD');
              //       const endDate = e[1].format('YYYY-MM-DD');
              //       if (isUpdateMultiple) {
              //         this.props.dispatch({
              //           type: 'deviceStore/setUpdateDevicesState',
              //           payload: {
              //             ...updateDevicesState,
              //             startDate,
              //             endDate,
              //           },
              //         });
              //       } else {
              //         this.props.dispatch({
              //           type: 'deviceStore/setCurrentDevice',
              //           payload: {
              //             ...selectedDevice,
              //             startDate,
              //             endDate,
              //           },
              //         });
              //       }
              //     }
              //   }
              // }}
              // value={
              //   isUpdateMultiple
              //     ? [
              //         moment(moment(updateDevicesState.startDate).format('YYYY/MM/DD')),
              //         moment(moment(updateDevicesState.endDate).format('YYYY/MM/DD')),
              //       ]
              //     : [
              //         moment(moment(selectedDevice.startDate).format('YYYY/MM/DD')),
              //         moment(moment(selectedDevice.endDate).format('YYYY/MM/DD')),
              //       ]
              // }
            />
          </Form.Item>
          <Divider></Divider>
          {!isUpdateMultiple && (
            <>
              <Row>
                <Col flex={2}>Publish</Col>
                <Col flex={5}>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={selectedDevice.isPublished}
                    onChange={(value) => {
                      this.props.dispatch({
                        type: 'deviceStore/setCurrentDevice',
                        payload: {
                          ...selectedDevice,
                          isPublished: value,
                        },
                      });
                    }}
                  />
                </Col>
              </Row>
              <Divider></Divider>
            </>
          )}

          <Form.Item
            name="typeId"
            label="Type"
            rules={[{ required: true, message: 'Please input type' }]}
          >
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select a type"
              // defaultValue={listDeviceTypes[0].typeName}
              // optionFilterProp="children"
              // onChange={(value) => {
              //   const { typeName } = listDeviceTypes.filter((t) => t.id === value)[0];
              //   if (isUpdateMultiple) {
              //     this.props.dispatch({
              //       type: 'deviceStore/setUpdateDevicesState',
              //       payload: {
              //         ...updateDevicesState,
              //         currentType: typeName,
              //         typeId: value,
              //       },
              //     });
              //   } else {
              //     this.props.dispatch({
              //       type: 'deviceStore/setCurrentDevice',
              //       payload: {
              //         ...selectedDevice,
              //         type: {
              //           id: value,
              //           typeName,
              //         },
              //       },
              //     });
              //   }
              // }}
              // value={
              //   isUpdateMultiple ? updateDevicesState.currentType : selectedDevice.type.typeName
              // }
            >
              {listDeviceTypes.map((type) => {
                return (
                  <Select.Option key={`${type.id}`} value={type.id}>
                    {type.typeName}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(UpdateDeviceFormDrawer);
