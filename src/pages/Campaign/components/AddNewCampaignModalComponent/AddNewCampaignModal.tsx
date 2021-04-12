import { AutoCompleteComponent } from '@/pages/common/AutoCompleteComponent';
import { LOCATION_DISPATCHER } from '@/pages/Location';
import LeafletMapComponent from '@/pages/Location/components/LeafletMapComponent';
import {
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import L from 'leaflet';
import moment from 'moment';
import * as React from 'react';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import type {
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  LocationModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '../..';
import SelectScenarioPart from './SelectScenarioPart';
import FilterDate from '../FilterDate';
import TimeFilterComponent from '../TimeFilterComponent';
import { v4 as uuidv4 } from 'uuid';
import { openNotification } from '@/utils/utils';
import { forwardGeocoding } from '@/services/MapService/LocationIQService';
import { ExclamationCircleOutlined } from '@ant-design/icons';

export type AddNewCampaignModalProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
  location: LocationModelState;
  user: UserModelState;
};

export class AddNewCampaignModal extends React.Component<AddNewCampaignModalProps> {
  /**
   *
   */

  setAddNewCampaignModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setAddNewCampaignModalReducer`,
      payload: {
        ...this.props.campaign.addNewCampaignModal,
        ...modal,
      },
    });
  };

  setCreateNewCampaignParam = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCreateCampaignParamReducer`,
      payload: {
        ...this.props.campaign.createCampaignParam,
        ...param,
      },
    });
  };

  clearCreateNewCampaignParam = async () => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/clearCreateCampaignParamReducer`,
    });
    await this.clearSelectScenario();
    this.formRef.current?.resetFields();
  };

  // callGetListScenario = async (param?: any) => {
  //   this.props.dispatch({
  //     type: 'scenarios/getListScenarios',
  //     payload: {
  //       ...this.props.scenarios.getListScenarioParam,
  //       ...param,
  //     },
  //   });
  // };

  selectScenario = async (id?: string) => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: this.props.scenarios.listScenario?.map((scenario) => {
        if (scenario.id === id) {
          return {
            ...scenario,
            isSelected: true,
          };
        }

        return {
          ...scenario,
          isSelected: false,
        };
      }),
    });
  };

  clearSelectScenario = async () => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: this.props.scenarios.listScenario?.map((scenario) => {
        return {
          ...scenario,
          isSelected: false,
        };
      }),
    });
  };

  setListLocations = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setListLocationsReducer`,
      payload,
    });
  };

  setMapComponent = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setMapComponentReducer`,
      payload: {
        ...this.props.location.mapComponent,
        ...payload,
      },
    });
  };

  createNewCampaign = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/createCampaign`,
      payload: {
        ...this.props.campaign.createCampaignParam,
        ...param,
      },
    });
  };

  callGetListCampaigns = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/getListCampaigns`,
      payload: {
        ...this.props.campaign.getListCampaignParam,
        ...param,
      },
    });
  };

  finalConfirmModal = async () => {
    const { addNewCampaignModal, createCampaignParam } = this.props.campaign;
    if (this.formRef.current) {
      this.formRef.current.validateFields().then((values) => {
        if (
          (createCampaignParam && !createCampaignParam.address) ||
          createCampaignParam?.address === ''
        ) {
          return;
        }
        Modal.confirm({
          centered: true,
          closable: false,
          icon: <ExclamationCircleOutlined />,
          title: 'Confirm to create a new campaign ?',
          content: (
            <>
              <Typography.Title level={4}>Detail transaction</Typography.Title>
              <Divider orientation="left">Total Fee</Divider>
              <Input
                readOnly
                value={
                  addNewCampaignModal &&
                  addNewCampaignModal.fees &&
                  addNewCampaignModal.fees.totalFee
                }
              />
              {/* <Divider orientation="left">Remain Fee</Divider>
              <Input
                readOnly
                value={
                  addNewCampaignModal &&
                  addNewCampaignModal.fees &&
                  addNewCampaignModal.fees.remainFee
                }
              /> */}
              <Divider orientation="left">Cancel Fee</Divider>
              <Input
                readOnly
                value={
                  addNewCampaignModal &&
                  addNewCampaignModal.fees &&
                  addNewCampaignModal.fees.cancelFee
                }
              />
            </>
          ),
          onOk: () => {
            this.okConfirm(values);
          },
        });
      });
    }
  };

  okConfirm = async (values: any) => {
    const { addNewCampaignModal } = this.props.campaign;
    const { currentUser } = this.props.user;

    this.setAddNewCampaignModal({
      isLoading: true,
    })
      .then(async () => {
        const campaignId = uuidv4();
        if (currentUser && addNewCampaignModal) {
          const hash = await currentUser.ether?.createCampaign(
            campaignId,
            addNewCampaignModal.fees.totalFee,
            values.budget,
            addNewCampaignModal.fees.remainFee,
            addNewCampaignModal.fees.cancelFee,
          );
          // throw new Error('sdsd');
          this.createNewCampaign({
            campaignId,
            hash,
            ...values,
          })
            .then(() => {
              openNotification(
                'success',
                'Create New Campaign Successfully',
                `Created ${values.name} campaign`,
              );
              this.callGetListCampaigns().then(() => {
                this.clearCreateNewCampaignParam();
                this.setAddNewCampaignModal({
                  visible: false,
                  isLoading: false,
                });
              });
            })
            .catch((error) => {
              openNotification(
                'error',
                'Fail to create new campaign',
                `Fail to created ${values.title} campaign`,
              );
              this.setAddNewCampaignModal({
                visible: false,
                isLoading: false,
              });
              return Promise.reject(error);
            });
        }
      })
      .catch((error) => {
        console.log('====================================');
        console.log(error);
        console.log('====================================');
        openNotification('error', 'Fail to create new campaign', `${error.message}`);
        this.clearCreateNewCampaignParam();
        this.setAddNewCampaignModal({
          visible: false,
          isLoading: false,
        });
      });
    // if (this.formRef.current) {
    //   this.formRef.current
    //     .validateFields()
    //     .then(async (values) => {

    //     })
    //     .catch((error) => {
    //       console.log('====================================');
    //       console.error(error);
    //       console.log('====================================');
    //       openNotification('error', 'Fail to create new campaign', 'fail');
    //     });
    // }
  };

  callGetListLocations = async (param?: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/getListLocation`,
      payload: {
        ...this.props.location.getListLocationParam,
        ...param,
      },
    });
  };

  setRadiusOfLocation = (radius: number) => {
    const { mapComponent } = this.props.location;
    this.setCreateNewCampaignParam({ radius });
    if (mapComponent) {
      if (mapComponent.map) {
        if (mapComponent.circle) {
          // mapComponent.circle.remove();
          mapComponent.circle.setRadius(radius);
        } else if (mapComponent.marker) {
          const { marker } = mapComponent;
          const circle = L.circle(marker.getLatLng(), { radius }).addTo(mapComponent.map);
          this.setMapComponent({
            circle,
          });
        } else if (!mapComponent.marker) {
          const circle = L.circle(mapComponent.map.getCenter(), { radius });
          this.setMapComponent({
            circle,
          });
        }
      }
    }
  };

  resetMap = async () => {
    const { mapComponent } = this.props.location;
    if (mapComponent) {
      if (mapComponent.map) {
        mapComponent.map.remove();
      }
      if (mapComponent.marker) {
        mapComponent.marker.remove();
      }
      if (mapComponent.circle) {
        mapComponent.circle.remove();
      }
      await this.setMapComponent({
        map: undefined,
        marker: undefined,
        circle: undefined,
      });
    }
  };

  hanldeOnChangeBudget = async (e: any) => {
    const { fees } = this.props.campaign;
    if (fees) {
      const totalFee = e * fees.Advertiser + e;
      const remainFee = e - e * fees.Supplier;
      const cancelFee = e * fees.CancelCampagin;

      const newFes = {
        remainFee,
        totalFee,
        cancelFee,
      };

      await this.setAddNewCampaignModal({
        fees: {
          ...fees,
          ...newFes,
        },
      });
    }
  };

  handleAfterClose = async () => {
    this.clearCreateNewCampaignParam().then(() => {
      this.selectScenario(undefined).then(() => {
        console.log('====================================');
        console.log('Reset map >>');
        console.log('====================================');
        this.resetMap();
      });
    });
  };

  onAutoCompleteSelect = async (address: string) => {
    const { mapComponent } = this.props.location;
    if (address !== '') {
      const listLocations = await forwardGeocoding(address);

      if (listLocations.length > 0) {
        const location = listLocations[0];
        const lat = Number.parseFloat(location.lat);
        const lon = Number.parseFloat(location.lon);

        if (mapComponent) {
          if (mapComponent.map) {
            mapComponent.map.setView([lat, lon]);

            if (mapComponent.marker) {
              mapComponent.marker.remove();
              // mapComponent.marker.setLatLng([lat, lon]);
              const marker = L.marker([lat, lon]).addTo(mapComponent.map);
              // marker.setPopupContent('Marker');
              this.setMapComponent({
                marker,
              });
            } else {
              const marker = L.marker([lat, lon]).addTo(mapComponent.map);
              // marker.setPopupContent('Marker');
              this.setMapComponent({
                marker,
              });
            }
            if (mapComponent.circle) {
              mapComponent.circle.remove();
              const circle = L.circle([lat, lon], {
                radius: mapComponent.circle.getRadius(),
              }).addTo(mapComponent.map);
              this.setMapComponent({
                circle,
              });
            }
          }
        }

        await this.setCreateNewCampaignParam({ location: `${lat}-${lon}`, address });
      }
    }
  };

  formRef = React.createRef<FormInstance<any>>();
  datePickerRef = React.createRef<any>();
  autoCompleteRef = React.createRef<AutoCompleteComponent>();
  render() {
    const { addNewCampaignModal, createCampaignParam } = this.props.campaign;

    const { listDeviceTypes } = this.props.deviceStore;
    const { currentUser } = this.props.user;
    const maxBudget = currentUser?.balance ? Number.parseFloat(currentUser.balance.toString()) : 0;
    // const { listScenario, getListScenarioParam, totalItem } = this.props.scenarios;
    return (
      <>
        {addNewCampaignModal?.visible && (
          <Form layout="vertical" name="create_brand_modal_form" ref={this.formRef}>
            <Row gutter={20}>
              {/* Start Column */}
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Name"
                  rules={[
                    { required: true, message: 'Please input the name of campaign!' },
                    { max: 50, message: 'Name cannot exceed 50 characters' },
                  ]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="budget"
                  label="Budget"
                  rules={[
                    { required: true, message: 'Please input budget of this campaign' },
                    {
                      type: 'number',
                      min: 100000,
                      validator: (rule, value, error) => {
                        if (value > maxBudget) {
                          return Promise.reject(new Error('Budget is over your balance'));
                        }

                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  {/* <InputNumber
                    style={{ width: '100%' }}
                    min={100000}
                    max={maxBudget}
                    onChange={(e) => {
                      this.hanldeOnChangeBudget(e);
                    }}
                  /> */}
                  <InputNumber
                    style={{ width: '100%' }}
                    onChange={(e) => {
                      this.hanldeOnChangeBudget(e);
                    }}
                  />
                </Form.Item>
                {/* <Row>Total Fee {addNewCampaignModal.fees && addNewCampaignModal.fees.totalFee}</Row>
            <Row>Remain Fee{addNewCampaignModal.fees && addNewCampaignModal.fees.remainFee}</Row>
            <Row>Cancel Fee{addNewCampaignModal.fees && addNewCampaignModal.fees.cancelFee}</Row> */}
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Divider></Divider>
                <Form.Item
                  name="startEnd"
                  label="Start-End"
                  rules={[
                    {
                      type: 'array' as const,
                      required: true,
                      message: 'Please select start date and end date!',
                    },
                  ]}
                >
                  <DatePicker.RangePicker
                    ref={this.datePickerRef}
                    format={'YYYY/MM/DD'}
                    disabledDate={(current) => {
                      return current < moment().endOf('day');
                    }}
                    onChange={(e) => {
                      if (e) {
                        if (e[0] && e[1]) {
                          const startDate = e[0].format('YYYY-MM-DD');
                          const endDate = e[1].format('YYYY-MM-DD');
                          this.setCreateNewCampaignParam({
                            startDate,
                            endDate,
                          });
                          if (this.datePickerRef) {
                            this.datePickerRef.current.blur();
                          }
                        }
                      }
                    }}
                  ></DatePicker.RangePicker>
                </Form.Item>
                <Form.Item
                  name="typeIds"
                  label="Type"
                  rules={[{ required: true, message: 'Please select type' }]}
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    // onChange={(e) => {
                    //   this.setCreateNewCampaignParam({
                    //     typeIds: e,
                    //   });
                    // }}
                    autoClearSearchValue={false}
                    // defaultValue={listDeviceTypes[0]?.id}
                    showSearch
                    // value={createCampaignParam.typeIds}
                  >
                    {listDeviceTypes?.map((type) => {
                      return (
                        <Select.Option key={type.id} value={type.id}>
                          {type.typeName}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="radius"
                  label="Radius (km)"
                  rules={[{ required: true, message: 'Please input radius' }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: '100%' }}
                    // value={createCampaignParam.radius}
                    onChange={async (e) => {
                      if (e) {
                        this.setCreateNewCampaignParam({
                          radius: e,
                        }).then(() => {
                          this.setRadiusOfLocation(Number.parseFloat(e) * 1000);
                        });
                      }
                    }}
                  />
                </Form.Item>
                <Form.Item
                  label="Address"
                  name="address"
                  // rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <AutoCompleteComponent
                    ref={this.autoCompleteRef}
                    {...this.props}
                    inputValue={createCampaignParam?.address}
                    address={createCampaignParam?.address}
                    onInputChange={async (e) => {
                      await this.setCreateNewCampaignParam({
                        address: e,
                      });
                    }}
                    onChange={async (address) => {
                      await this.onAutoCompleteSelect(address);
                    }}
                  />
                </Form.Item>
                {createCampaignParam?.address === '' && (
                  <p
                    style={{
                      color: 'red',
                      transition: 'ease 0.5s',
                    }}
                  >
                    Please enter campaign address
                  </p>
                )}
                <Row>
                  <Col span={24}>
                    <LeafletMapComponent {...this.props} />
                  </Col>
                </Row>
              </Col>
              {/* End Column */}

              {/* Start Column */}
              <Col span={12}>
                <Row>
                  <Col span={10}>
                    <Typography.Title level={4} className="lba-text">
                      Time Filter
                    </Typography.Title>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <TimeFilterComponent {...this.props} />
                  </Col>
                </Row>
                <Divider></Divider>
                <Row>
                  <Col span={10}>
                    <Typography.Title level={4} className="lba-text">
                      Date Filter
                    </Typography.Title>
                  </Col>
                </Row>
                <Space>
                  <FilterDate {...this.props} />
                </Space>
                <Divider></Divider>
                <Row style={{ textAlign: 'center' }}>
                  <Col span={24}>
                    <Typography.Title level={4} className="lba-text">
                      Choose Scenario
                    </Typography.Title>
                  </Col>
                </Row>

                <SelectScenarioPart {...this.props} />
              </Col>
              {/* End Column */}
            </Row>
          </Form>
        )}
        {/* </Modal> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewCampaignModal);
