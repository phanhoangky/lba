import AutoCompleteComponent from '@/pages/common/AutoCompleteComponent';
import { LOCATION_DISPATCHER } from '@/pages/Location';
import LeafletMapComponent from '@/pages/Location/components/LeafletMapComponent';
import { Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Space } from 'antd';
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
  };

  callGetListScenario = async (param?: any) => {
    this.props.dispatch({
      type: 'scenarios/getListScenarios',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'scenarios/setTableLoadingReducer',
      payload: loading,
    });
  };

  setGetListScenarioParam = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setGetListScenarioParamReducer',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...modal,
      },
    });
  };

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

  setListLocations = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setListLocationsReducer`,
      payload,
    });
  };

  selectLocation = async (id: string) => {
    const { listLocations } = this.props.location;

    const newList = listLocations?.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isSelected: true,
        };
      }

      return {
        ...item,
        isSelected: false,
      };
    });
    await this.setListLocations(newList);
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

  callGetFee = async () => {
    const res = await this.props.dispatch({
      type: `${CAMPAIGN}/getListFee`,
    });

    await this.setAddNewCampaignModal({
      fees: res.result.data,
    });
  };

  okConfirm = async () => {
    const { addNewCampaignModal } = this.props.campaign;
    const { currentUser } = this.props.user;
    if (this.formRef.current) {
      this.formRef.current
        .validateFields()
        .then(async (values) => {
          this.setAddNewCampaignModal({
            isLoading: true,
          })
            .then(async () => {
              const campaignId = uuidv4();
              if (currentUser) {
                const hash = await currentUser.ether?.createCampaign(
                  campaignId,
                  addNewCampaignModal.fees.totalFee,
                  values.budget,
                  addNewCampaignModal.fees.remainFee,
                  addNewCampaignModal.fees.cancelFee,
                );
                await this.createNewCampaign({
                  campaignId,
                  hash,
                  ...values,
                }).then(() => {
                  this.callGetListCampaigns().then(() => {
                    this.setAddNewCampaignModal({
                      visible: false,
                      isLoading: false,
                    });
                  });
                });
              }
            })
            .catch(() => {
              this.setAddNewCampaignModal({
                visible: false,
                isLoading: false,
              });
            });
        })
        .catch((info) => {
          console.log('====================================');
          console.log('Info >>>', info);
          console.log('====================================');
        });
    }
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

    if (mapComponent) {
      if (mapComponent.map) {
        if (mapComponent.circle) {
          // mapComponent.circle.remove();
          mapComponent.circle.setRadius(radius).redraw();
        } else if (mapComponent.marker) {
          const { marker } = mapComponent;
          const circle = L.circle(marker.getLatLng(), { radius }).addTo(mapComponent.map);
          this.setMapComponent({
            circle,
          });
        }
      }
    }
  };

  handleAutoCompleteSearch = async (coordination: string, address: string) => {
    if (address !== '') {
      const { createCampaignParam } = this.props.campaign;
      const { mapComponent } = this.props.location;
      const lat = Number.parseFloat(coordination.split('-')[0]);
      const lon = Number.parseFloat(coordination.split('-')[1]);

      if (mapComponent) {
        if (mapComponent.map) {
          mapComponent.map.setView([lat, lon]);

          if (mapComponent.marker) {
            mapComponent.marker.setLatLng([lat, lon]);
            L.popup().setLatLng([lat, lon]).setContent(address).openOn(mapComponent.map);
          } else {
            const marker = L.marker([lat, lon]).addTo(mapComponent.map);
            L.popup().setLatLng([lat, lon]).setContent(address).openOn(mapComponent.map);
            await this.setMapComponent({
              marker,
            });
          }

          if (mapComponent.circle) {
            mapComponent.circle.setLatLng([lat, lon]).redraw();

            if (createCampaignParam.radius && createCampaignParam.radius !== 0) {
              mapComponent.circle.setRadius(createCampaignParam.radius * 1000);
            }
          } else if (createCampaignParam.radius && createCampaignParam.radius !== 0) {
            const circle = L.circle([lat, lon]).setRadius(createCampaignParam.radius);
            circle.addTo(mapComponent.map);
            await this.setMapComponent({
              circle,
            });
          }
        }
      }

      await this.setCreateNewCampaignParam({ location: coordination, address });
    }
  };

  resetMap = async () => {
    const { mapComponent } = this.props.location;
    if (mapComponent) {
      if (mapComponent.map) {
        this.setMapComponent({
          map: undefined,
        });
        if (mapComponent.marker) {
          mapComponent.marker.remove();
          this.setMapComponent({
            marker: undefined,
          });
        }

        if (mapComponent.circle) {
          mapComponent.circle.remove();
          this.setMapComponent({
            circle: undefined,
          });
        }
      }
    }
  };

  hanldeOnChangeBudget = async (e: any) => {
    const { addNewCampaignModal } = this.props.campaign;
    if (addNewCampaignModal.fees) {
      const totalFee = e * addNewCampaignModal.fees.Advertiser + e;
      const remainFee = e - e * addNewCampaignModal.fees.Supplier;
      const cancelFee = e * addNewCampaignModal.fees.CancelCampagin;
      const newFes = {
        remainFee,
        totalFee,
        cancelFee,
      };
      this.setAddNewCampaignModal({
        fees: {
          ...addNewCampaignModal.fees,
          ...newFes,
        },
      });
      // console.log('====================================');
      // console.log(addNewCampaignModal.fees, newFes);
      // console.log('====================================');
    }
  };

  handleAfterClose = async () => {
    this.clearCreateNewCampaignParam().then(() => {
      this.selectScenario(undefined).then(() => {
        this.resetMap();
      });
    });
  };
  formRef = React.createRef<FormInstance<any>>();
  datePickerRef = React.createRef<any>();
  render() {
    const { addNewCampaignModal, createCampaignParam } = this.props.campaign;

    const { listDeviceTypes } = this.props.deviceStore;

    // const { listScenario, getListScenarioParam, totalItem } = this.props.scenarios;

    const { mapComponent } = this.props.location;

    console.log('====================================');
    console.log(mapComponent);
    console.log('====================================');
    return (
      <>
        {/* <Modal
          width="80%"
          title="Add New Campaign"
          visible={addNewCampaignModal.visible}
          centered
          destroyOnClose={true}
          confirmLoading={addNewCampaignModal.isLoading}
          closable={false}
          afterClose={() => {
            this.clearCreateNewCampaignParam().then(() => {
              this.selectScenario(undefined).then(() => {
                this.resetMap();
              });
            });
          }}
          onOk={() => {
            this.okConfirm();
          }}
          onCancel={() => {
            this.setAddNewCampaignModal({
              visible: false,
            });
          }}
        > */}
        {addNewCampaignModal.visible && (
          <Form layout="vertical" name="create_brand_modal_form" ref={this.formRef}>
            <Form.Item
              name="budget"
              label="Budget"
              rules={[
                { required: true, message: 'Please input the name of collection!' },
                // { min: 100000, message: 'Budeget must larger than 100.000' },
              ]}
            >
              <InputNumber
                style={{ width: 200 }}
                min={100000}
                onChange={(e) => {
                  this.hanldeOnChangeBudget(e);
                }}
              />
            </Form.Item>
            <Row>{addNewCampaignModal.fees && addNewCampaignModal.fees.totalFee}</Row>
            <Row>{addNewCampaignModal.fees && addNewCampaignModal.fees.remainFee}</Row>
            <Row>{addNewCampaignModal.fees && addNewCampaignModal.fees.cancelFee}</Row>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
            <Row>
              <Col span={10}>Time Filter</Col>
            </Row>
            <Row>
              <Col span={24}>
                <TimeFilterComponent {...this.props} />
              </Col>
            </Row>
            <Divider></Divider>
            <Row>
              <Col span={10}>Date Filter</Col>
              <Col span={14}></Col>
            </Row>
            <Space>
              <FilterDate {...this.props} />
            </Space>
            <Divider></Divider>
            <Form.Item
              name="startEnd"
              label="Start-End"
              rules={[{ type: 'array' as const, required: true, message: 'Please select time!' }]}
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
              label="Radius"
              rules={[{ required: true, message: 'Please input address' }]}
            >
              <InputNumber
                min={0}
                width="200px"
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

            <Row style={{ textAlign: 'center' }}>
              <Col span={24}>Choose Scenario</Col>
            </Row>

            <SelectScenarioPart {...this.props} />

            <Row style={{ textAlign: 'center' }}>
              <Col span={24}>Choose Location</Col>
            </Row>
            <Row>
              <Col span={10}>Address</Col>
              <Col span={14}>
                <AutoCompleteComponent
                  {...this.props}
                  di
                  inputValue={createCampaignParam.address}
                  value={{
                    label: createCampaignParam.address,
                    value: createCampaignParam.location,
                  }}
                  // onInputChange={(e: any) => {
                  //   // this.setCreateNewCampaignParam({
                  //   //   address: e,
                  //   // });
                  // }}
                  onChange={(value: any, address: any) => {
                    this.handleAutoCompleteSearch(value, address);
                  }}
                />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <LeafletMapComponent {...this.props} />
              </Col>
            </Row>
          </Form>
        )}
        {/* </Modal> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewCampaignModal);