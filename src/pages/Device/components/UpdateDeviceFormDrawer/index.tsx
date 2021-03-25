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
  Skeleton,
  Space,
  Switch,
  TimePicker,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';
import * as React from 'react';
import type { DeviceModelState, Dispatch, ScenarioModelState, UserModelState } from 'umi';
import { connect } from 'umi';
// import DrawerUpdateMultipleDevice from '../DrawerUpdateMultipleDevice';
import FilterDate from '../FilterDate';

export type UpdateDeviceFormDrawerProps = {
  dispatch: Dispatch;
  user: UserModelState;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
};

export class UpdateDeviceFormDrawer extends React.Component<UpdateDeviceFormDrawerProps> {
  componentDidMount() {
    const { selectedDevice, isUpdateMultiple } = this.props.deviceStore;
    if (!isUpdateMultiple) {
      console.log('====================================');
      console.log(selectedDevice);
      console.log('====================================');
      if (this.formRef.current) {
        this.formRef.current.setFieldsValue({
          description: selectedDevice?.description,
          startEnd: [
            moment(moment(selectedDevice?.startDate).format('YYYY/MM/DD')),
            moment(moment(selectedDevice?.endDate).format('YYYY/MM/DD')),
          ],
          scenarioId: selectedDevice?.defaultScenarioId,
        });
      }
    }
  }

  // componentDidUpdate() {
  //   const { selectedDevice } = this.props.deviceStore;
  //   if (this.formRef.current) {
  //     this.formRef.current.setFieldsValue({
  //       description: selectedDevice?.description,
  //       startEnd: [
  //         moment(moment(selectedDevice?.startDate).format('YYYY/MM/DD')),
  //         moment(moment(selectedDevice?.endDate).format('YYYY/MM/DD')),
  //       ],
  //     });
  //   }
  // }

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
        listId: this.props.deviceStore.selectedDevices?.map((device) => {
          return device.id;
        }),
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
    await this.callGetListDevices();
    // await this.props.dispatch({
    //   type: 'deviceStore/getDevices',
    //   payload: {
    //     ...this.props.deviceStore.getDevicesParam,
    //   },
    // });
  };

  handleRemoveDateFilter = (index: any) => {
    const { isUpdateMultiple, updateDevicesState, selectedDevice } = this.props.deviceStore;
    const listTimeFilter = isUpdateMultiple
      ? updateDevicesState?.timeFilter
      : selectedDevice?.timeFilter;

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

  setDevicesTableLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: 'deviceStore/setDevicesTableLoadingReducer',
      payload: isLoading,
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

  formRef = React.createRef<FormInstance<any>>();
  render() {
    const { inputVisible } = this.state;
    const {
      isUpdateMultiple,
      selectedDevice,
      updateDevicesState,
      editMultipleDevicesDrawer,
    } = this.props.deviceStore;

    const { listScenario } = this.props.scenarios;

    const timeFilter = isUpdateMultiple
      ? updateDevicesState?.timeFilter
      : selectedDevice?.timeFilter;
    const displayTimeFilter = timeFilter?.map((time, index) => {
      return (
        time === '1' && (
          <Skeleton key={Math.random() + 100} active loading={editMultipleDevicesDrawer?.isLoading}>
            <Input
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
          </Skeleton>
        )
      );
    });

    return (
      <Drawer
        title={isUpdateMultiple ? 'Update Multiple Devices' : selectedDevice?.name}
        key="updateMultipleDevies"
        visible={this.props.deviceStore.editMultipleDevicesDrawer?.visible}
        width={700}
        closable={false}
        getContainer={false}
        destroyOnClose={true}
        onClose={() => {
          // this.props.dispatch({
          //   type: 'deviceStore/setEditMultipleDevicesDrawerVisible',
          //   payload: false,
          // });
          this.setEditMultipleDevicesDrawer({
            visible: false,
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
                        this.props
                          .dispatch({
                            type: 'deviceStore/deleteDevice',
                            payload: selectedDevice?.id,
                          })
                          .then(() => {
                            this.callGetListDevices().then(() => {
                              this.setEditMultipleDevicesDrawer({
                                isLoading: false,
                                visible: false,
                              });
                            });
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
                      this.formRef.current
                        ?.validateFields()
                        .then((values) => {
                          this.onUpdateMultipleDevices(values).then(() => {
                            this.setEditMultipleDevicesDrawer({
                              isLoading: true,
                              visible: false,
                            });
                          });
                        })
                        .catch(() => {
                          this.setEditMultipleDevicesDrawer({
                            isLoading: true,
                            visible: false,
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
                            this.setEditMultipleDevicesDrawer({
                              isLoading: false,
                              visible: false,
                            });
                          });
                        })
                        .catch(() => {
                          this.setEditMultipleDevicesDrawer({
                            isLoading: false,
                            visible: false,
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
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
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
                                timeFilter: timeFilter?.map((time, index) => {
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
            {/* </Skeleton> */}
          </Row>
          <Divider></Divider>
          {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
          <FilterDate {...this.props}></FilterDate>
          {/* </Skeleton> */}
          <Divider></Divider>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input address' }]}
          >
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
            <Input />
            {/* </Skeleton> */}
          </Form.Item>
          <Form.Item
            name="startEnd"
            label="Start-End"
            rules={[{ required: true, message: 'Please enter start date and end date' }]}
          >
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
            <DatePicker.RangePicker
              format={'YYYY/MM/DD'}
              disabledDate={(current) => {
                return current < moment().endOf('day');
              }}
            />
            {/* </Skeleton> */}
          </Form.Item>
          <Divider></Divider>
          {!isUpdateMultiple && (
            <>
              <Row>
                {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
                <Col flex={2}>Publish</Col>
                <Col flex={5}>
                  <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={selectedDevice?.isPublished}
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
                {/* </Skeleton> */}
              </Row>
              <Divider></Divider>
            </>
          )}
          <Form.Item name="scenarioId" label="Scenario">
            <Select size="large">
              {listScenario &&
                listScenario.map((scenario) => {
                  return (
                    <Select.Option key={scenario.id} value={scenario.id}>
                      {scenario.title}
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
