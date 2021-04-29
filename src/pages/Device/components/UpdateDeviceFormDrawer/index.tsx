import { openNotification } from '@/utils/utils';
import {
  CheckOutlined,
  ClockCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  PlusSquareFilled,
} from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
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
import { Animated } from 'react-animated-css';
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

export type UpdateDeviceformDrawerStates = {
  isPublished: boolean;
  inputVisible: boolean;
};
export class UpdateDeviceFormDrawer extends React.Component<
  UpdateDeviceFormDrawerProps,
  UpdateDeviceformDrawerStates
> {
  constructor(props: UpdateDeviceFormDrawerProps) {
    super(props);
    const { isUpdateMultiple, selectedDevice } = this.props.deviceStore;
    const deviceIsPublished = selectedDevice?.isPublished ? selectedDevice.isPublished : false;
    this.state = {
      inputVisible: false,
      isPublished: isUpdateMultiple ? false : deviceIsPublished,
    };
  }

  componentDidMount() {
    const { selectedDevice, isUpdateMultiple } = this.props.deviceStore;
    if (!isUpdateMultiple) {
      if (this.formRef.current) {
        this.formRef.current.setFieldsValue({
          description: selectedDevice?.description,
          startEnd: [
            moment(moment(selectedDevice?.startDate).format('YYYY/MM/DD')),
            moment(moment(selectedDevice?.endDate).format('YYYY/MM/DD')),
          ],
          scenarioId: selectedDevice?.defaultScenarioId,
          isPublished: selectedDevice?.isPublished,
          minBid: selectedDevice?.minBid,
          slot: selectedDevice?.slot,
        });
      }
      this.setState({
        isPublished: selectedDevice?.isPublished ? selectedDevice.isPublished : false,
      });
    }
  }

  updateMultitpleDevices = async (values: any) => {
    const { updateDevicesState } = this.props.deviceStore;
    await this.props.dispatch({
      type: 'deviceStore/updateListDevice',
      payload: {
        updateDevicesState: {
          ...this.props.deviceStore.updateDevicesState,
          startDate: values.isPublished ? values.startEnd[0] : updateDevicesState?.startDate,
          endDate: values.isPublished ? values.startEnd[0] : updateDevicesState?.endDate,
          ...values,
        },
        listId: this.props.deviceStore.selectedDevices?.map((device) => {
          return device.id;
        }),
      },
    });
  };

  onUpdateMultipleDevices = async () => {
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        this.setEditMultipleDevicesDrawer({
          isLoading: true,
        }).then(() => {
          this.updateMultitpleDevices(values)
            .then(() => {
              this.callGetListDevices().then(() => {
                const { selectedDevices } = this.props.deviceStore;
                openNotification(
                  'success',
                  'Devices updated successfully',
                  selectedDevices &&
                    selectedDevices.map((d) => `${d.name} was update sucessfully \n`).join(''),
                );
                this.setEditMultipleDevicesDrawer({
                  isLoading: false,
                  // visible: false,
                });
                // openNotification('success', 'Update Multiple Devices Success');
              });
            })
            .catch((err) => {
              this.setEditMultipleDevicesDrawer({
                isLoading: false,
              });
              openNotification('error', 'Fail to update devices', err.message);
            });
        });
      })
      .catch(() => {
        this.setEditMultipleDevicesDrawer({
          isLoading: false,
        });
        // openNotification('error', 'Fail to update devices', err.message);
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

  updateDevice = async (values: any) => {
    const { selectedDevice } = this.props.deviceStore;
    const param = {
      ...this.props.deviceStore.selectedDevice,
      ...values,
      startDate: values.isPublished ? values.startEnd[0] : selectedDevice?.startDate,
      endDate: values.isPublished ? values.startEnd[0] : selectedDevice?.endDate,
    };

    console.log('====================================');
    console.log(param, values);
    console.log('====================================');
    await this.props.dispatch({
      type: 'deviceStore/updateDevice',
      payload: param,
    });
  };

  onUpdateDevice = async () => {
    this.formRef.current
      ?.validateFields()
      .then((values) => {
        this.setEditMultipleDevicesDrawer({
          isLoading: true,
        }).then(() => {
          console.log('====================================');
          console.log(values);
          console.log('====================================');
          this.updateDevice(values)
            .then(() => {
              openNotification('success', 'Update device successfully');
              this.callGetListDevices().then(() => {
                this.setEditMultipleDevicesDrawer({
                  isLoading: false,
                });
              });
            })
            .catch((error) => {
              this.setEditMultipleDevicesDrawer({
                isLoading: false,
              });
              openNotification('error', 'Fail to update device', error.message);
            });
        });
      })
      .catch(() => {
        this.setEditMultipleDevicesDrawer({
          isLoading: false,
        });
        // openNotification('error', 'Fail to update device', error.message);
      });
  };

  handleRemoveDateFilter = (index: any) => {
    const { isUpdateMultiple, updateDevicesState, selectedDevice } = this.props.deviceStore;
    const listTimeFilter = isUpdateMultiple
      ? updateDevicesState?.timeFilter
      : selectedDevice?.timeFilter;

    if (isUpdateMultiple) {
      this.setUpdateMultipleDevicesState({
        timeFilter: listTimeFilter?.map((time, i) => {
          if (i.toString() === index) {
            return '0';
          }
          return time;
        }),
      });
      // this.props.dispatch({
      //   type: 'deviceStore/setUpdateDevicesState',
      //   payload: {
      //     ...updateDevicesState,
      //     timeFilter: listTimeFilter?.map((time, i) => {
      //       if (i.toString() === index) {
      //         return '0';
      //       }
      //       return time;
      //     }),
      //   },
      // });
    } else {
      this.setSelectedDevice({
        timeFilter: listTimeFilter?.map((time, i) => {
          if (i.toString() === index) {
            return 0;
          }
          return time;
        }),
      });
      // this.props.dispatch({
      //   type: 'deviceStore/setCurrentDevice',
      //   payload: {
      //     ...selectedDevice,
      //     timeFilter: listTimeFilter?.map((time, i) => {
      //       if (i.toString() === index) {
      //         return 0;
      //       }
      //       return time;
      //     }),
      //   },
      // });
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

  setSelectedDevice = async (param?: any) => {
    const { selectedDevice } = this.props.deviceStore;
    this.props.dispatch({
      type: 'deviceStore/setCurrentDevice',
      payload: {
        ...selectedDevice,
        ...param,
      },
    });
  };

  setUpdateMultipleDevicesState = async (param?: any) => {
    await this.props.dispatch({
      type: 'deviceStore/setUpdateDevicesState',
      payload: {
        ...this.props.deviceStore.updateDevicesState,
        ...param,
      },
    });
  };

  setTimeFilter = async (startTime: number, endTime: number) => {
    const { isUpdateMultiple, selectedDevice, updateDevicesState } = this.props.deviceStore;
    const timeFilter = isUpdateMultiple
      ? updateDevicesState?.timeFilter
      : selectedDevice?.timeFilter;
    if (isUpdateMultiple) {
      this.setUpdateMultipleDevicesState({
        timeFilter: timeFilter?.map((time, index) => {
          if (index >= startTime && index < endTime) {
            return '1';
          }
          return time;
        }),
      });
    } else {
      this.setSelectedDevice({
        timeFilter: timeFilter?.map((time, index) => {
          if (index >= startTime && index < endTime) {
            return '1';
          }
          return time;
        }),
      });
    }
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
      const start = index;
      const end = index + 1 === 24 ? 0 : index + 1;
      return (
        time === '1' && (
          <Skeleton key={Math.random() + 100} active loading={editMultipleDevicesDrawer?.isLoading}>
            <Input
              prefix={<ClockCircleFilled className="lba-icon" />}
              style={{
                fontWeight: 'bolder',
                width: '180px',
              }}
              size={'small'}
              suffix={
                <Button
                  danger
                  onClick={() => {
                    this.handleRemoveDateFilter(index.toString());
                  }}
                >
                  <CloseCircleFilled className="lba-close-icon" />
                </Button>
              }
              value={`${start} h - ${end} h`}
            />
          </Skeleton>
        )
      );
    });
    return (
      <Form ref={this.formRef} layout="vertical" name="Update_Device_Form">
        <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
          <Form.Item name="isPublished" label="Publish" valuePropName="checked">
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
              onChange={(value) => {
                this.setState({ isPublished: value });
              }}
            ></Switch>
          </Form.Item>
        </Skeleton>
        <Animated
          animationIn="fadeInDownBig"
          animationOut="fadeOutUpBig"
          isVisible={this.state.isPublished}
        >
          {this.state.isPublished && (
            <>
              <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
                <Form.Item label="Times in day">
                  <Space wrap={true}>{displayTimeFilter}</Space>
                </Form.Item>
              </Skeleton>
              {/* <Row>
              <Col></Col>
            </Row> */}
              <Divider></Divider>
              <Row>
                <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
                  <Col>
                    <Space>
                      {inputVisible && (
                        <TimePicker.RangePicker
                          onChange={(e) => {
                            if (e) {
                              if (e[0] && e[1]) {
                                const start = e[0].hour();
                                const end = e[1]?.hour();
                                this.setTimeFilter(start, end);
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
                          className="lba-btn"
                          onClick={() => {
                            this.setState({ inputVisible: true });
                          }}
                        >
                          <PlusSquareFilled className="lba-icon" /> New Time
                        </Button>
                      )}
                      <Button
                        className="lba-btn"
                        icon={<PlusSquareFilled className="lba-icon" />}
                        onClick={() => {
                          if (isUpdateMultiple) {
                            this.setUpdateMultipleDevicesState({
                              timeFilter: '111111000000000000000000'.split(''),
                            });
                          } else {
                            this.setSelectedDevice({
                              timeFilter: '111111000000000000000000'.split(''),
                            });
                          }
                        }}
                      >
                        0h - 6h
                      </Button>
                      <Button
                        className="lba-btn"
                        icon={<PlusSquareFilled className="lba-icon" />}
                        onClick={() => {
                          if (isUpdateMultiple) {
                            this.setUpdateMultipleDevicesState({
                              timeFilter: '000000111111000000000000'.split(''),
                            });
                          } else {
                            this.setSelectedDevice({
                              timeFilter: '000000111111000000000000'.split(''),
                            });
                          }
                        }}
                      >
                        6h - 12h
                      </Button>
                      <Button
                        className="lba-btn"
                        icon={<PlusSquareFilled className="lba-icon" />}
                        onClick={() => {
                          if (isUpdateMultiple) {
                            this.setUpdateMultipleDevicesState({
                              timeFilter: '000000000000111111000000'.split(''),
                            });
                          } else {
                            this.setSelectedDevice({
                              timeFilter: '000000000000111111000000'.split(''),
                            });
                          }
                        }}
                      >
                        12h - 18h
                      </Button>
                      <Button
                        className="lba-btn"
                        icon={<PlusSquareFilled className="lba-icon" />}
                        onClick={() => {
                          if (isUpdateMultiple) {
                            this.setUpdateMultipleDevicesState({
                              timeFilter: '000000000000000000111111'.split(''),
                            });
                          } else {
                            this.setSelectedDevice({
                              timeFilter: '000000000000000000111111'.split(''),
                            });
                          }
                        }}
                      >
                        18h - 0h
                      </Button>
                    </Space>
                  </Col>
                </Skeleton>
              </Row>
              <Divider></Divider>
              {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
              <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
                <Form.Item label="Days in week">
                  <FilterDate {...this.props}></FilterDate>
                </Form.Item>
              </Skeleton>
              {/* </Skeleton> */}
              <Divider></Divider>

              {!isUpdateMultiple && (
                <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
                  <Form.Item
                    name="description"
                    label="Description"
                    rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </Skeleton>
              )}
              {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
              <Form.Item
                name="startEnd"
                label="Start-End"
                rules={[{ required: true, message: 'Please enter start date and end date' }]}
              >
                <DatePicker.RangePicker
                  format={'YYYY/MM/DD'}
                  disabledDate={(current) => {
                    return current < moment().endOf('day');
                  }}
                />
              </Form.Item>
              {/* </Skeleton> */}
              <Divider></Divider>
              <Row gutter={20}>
                {/* <Col span={12}>
              <Form.Item
                name="slot"
                label="Slot"
                rules={[
                  { required: true, message: 'Please input slot of device' },
                  {
                    type: 'number',
                    min: 1,
                    max: 10,
                    message: 'Slot must is a number between 1 and 10',
                  },
                ]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col> */}
                <Col span={12}>
                  {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
                  <Form.Item
                    name="minBid"
                    label="Mininum Bid"
                    rules={[
                      { required: true, message: 'Please input minimum bid money of device' },
                      {
                        type: 'number',
                        min: 1,
                        message: 'Min bid must is a money larger than 1 VND',
                      },
                    ]}
                  >
                    <InputNumber style={{ width: '100%' }} />
                  </Form.Item>
                  {/* </Skeleton> */}
                </Col>
              </Row>
            </>
          )}
        </Animated>

        {/* {!isUpdateMultiple && (
            <>
              <Row>
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
              </Row>
              <Form.Item valuePropName="checked" label="Publish" name="isPublished"></Form.Item>
              <Form.Item name="isPublished" label="Publish">
                <Switch
                  checkedChildren={<CheckOutlined />}
                  unCheckedChildren={<CloseOutlined />}
                ></Switch>
              </Form.Item>
              <Divider></Divider>
            </>
          )}
          {isUpdateMultiple && (
            
          )} */}

        <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}>
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
        </Skeleton>
      </Form>
      // </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(UpdateDeviceFormDrawer);
