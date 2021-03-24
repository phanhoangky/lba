import AutoCompleteComponent from '@/pages/common/AutoCompleteComponent';
import { Button, Col, Divider, Form, Input, Modal, Row, Select, Skeleton, Space } from 'antd';
import type { FormInstance } from 'antd';
import L from 'leaflet';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../..';
import { LeafletMapComponent } from '../LeafletMapComponent';
import type { UpdateLocationParam } from '@/services/LocationService/LocationService';
import { DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';

export type ViewLocationDetailComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  campaign: CampaignModelState;
};

export class ViewLocationDetailComponent extends React.Component<ViewLocationDetailComponentProps> {
  componentDidMount = () => {
    if (this.formRef.current) {
      const { selectedLocation } = this.props.location;
      if (selectedLocation) {
        this.formRef.current.setFieldsValue({
          name: selectedLocation.name,
          description: selectedLocation.description,
          typeId: selectedLocation.typeId,
          address: selectedLocation.address,
        });
      }
    }
  };

  componentDidUpdate() {
    this.initialMap();
    if (this.formRef.current) {
      const { selectedLocation } = this.props.location;
      if (selectedLocation) {
        this.formRef.current.setFieldsValue({
          name: selectedLocation.name,
          description: selectedLocation.description,
          typeId: selectedLocation.typeId,
          address: selectedLocation.address,
        });
      }
    }
  }
  initialMap = () => {
    const { mapComponent, selectedLocation } = this.props.location;
    if (mapComponent) {
      if (mapComponent.map && selectedLocation) {
        const lat = Number.parseFloat(selectedLocation.latitude);
        const lng = Number.parseFloat(selectedLocation.longitude);
        mapComponent.map.setView([lat, lng]);
        if (!mapComponent.marker) {
          if (selectedLocation.longitude !== '' && selectedLocation?.latitude !== '') {
            const marker = L.marker([lat, lng]);
            marker.addTo(mapComponent.map);

            this.setMapComponent({
              marker,
            });
          }
        } else {
          mapComponent.marker.setLatLng([lat, lng]);
        }
      }
    }
  };

  setSelectedLocation = async (item: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setSelectedLocationReducer`,
      payload: {
        ...this.props.location.selectedLocation,
        ...item,
      },
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

  handleAutoCompleteSearch = async (address: string) => {
    const { mapComponent } = this.props.location;
    if (address !== '') {
      const coordination = address.split('-');
      const lat = Number.parseFloat(coordination[0]);
      const lon = Number.parseFloat(coordination[1]);
      console.log('====================================');
      console.log(coordination, lat.toString(), lon.toString());
      console.log('====================================');
      if (mapComponent) {
        if (mapComponent.map) {
          mapComponent.map.setView([lat, lon]);

          if (mapComponent.marker) {
            mapComponent.marker.setLatLng([lat, lon]);
          } else {
            const marker = L.marker([lat, lon]).addTo(mapComponent.map);
            // marker.setPopupContent('Marker');
            this.setMapComponent({
              marker,
            });
          }
        }
      }

      // console.log('====================================');
      // console.log(coordination, lat.toString(), lon.toString());
      // console.log('====================================');

      await this.setSelectedLocation({
        longitude: lon,
        latitude: lat,
        address,
      });
    }
  };

  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
      },
    });
  };

  updateLocation = async (values: any) => {
    const { selectedLocation } = this.props.location;
    console.log('====================================');
    console.log('Update Location', selectedLocation);
    console.log('====================================');

    if (selectedLocation) {
      const updateParam: UpdateLocationParam = {
        id: selectedLocation.id,
        description: selectedLocation.description,
        isActive: selectedLocation.isActive,
        isApprove: selectedLocation.isApprove,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        name: selectedLocation.name,
        typeId: selectedLocation.typeId,
        ...values,
      };
      console.log('====================================');
      console.log(selectedLocation, values);
      console.log('====================================');
      await this.props.dispatch({
        type: `${LOCATION_DISPATCHER}/updateLocation`,
        payload: updateParam,
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

  updateConfirm = async (values: any) => {
    this.setEditLocationModal({
      isLoading: true,
    })
      .then(() => {
        this.updateLocation(values).then(() => {
          this.callGetListLocations().then(() => {
            this.setEditLocationModal({
              visible: false,
              isLoading: false,
            });
          });
        });
      })
      .catch(() => {
        this.setEditLocationModal({
          visible: false,
          isLoading: false,
        });
      });
  };

  deleteLocation = async (id: string) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/deleteLocation`,
      payload: id,
    });
  };

  setLocationsTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setLocationTableLoadingReducer`,
      payload: loading,
    });
  };

  deleteConfirm = (location: any) => {
    Modal.confirm({
      title: `Are you sure want to delete ${location.name}?`,
      icon: <ExclamationCircleOutlined />,
      closable: false,
      onOk: async () => {
        this.setLocationsTableLoading(true)
          .then(() => {
            this.setEditLocationModal({
              isLoading: true,
            });
            this.deleteLocation(location.id).then(() => {
              this.callGetListLocations().then(() => {
                this.setLocationsTableLoading(false);
                this.setEditLocationModal({
                  isLoading: false,
                });
              });
            });
          })
          .catch(() => {
            this.setLocationsTableLoading(false);
            this.setEditLocationModal({
              isLoading: false,
            });
          });
      },
    });
  };

  formRef = React.createRef<FormInstance<any>>();
  render() {
    const { selectedLocation, editLocationModal } = this.props.location;
    const { listDeviceTypes } = this.props.deviceStore;
    return (
      <>
        {selectedLocation && (
          <>
            <Form
              ref={this.formRef}
              layout="inline"
              style={{
                boxSizing: 'border-box',
              }}
            >
              <Skeleton active loading={editLocationModal?.isLoading}>
                <Form.Item label="Name" name="name">
                  <Input placeholder="input placeholder" />
                </Form.Item>
              </Skeleton>

              <Skeleton active loading={editLocationModal?.isLoading}>
                <Form.Item label="Type" name="typeId" style={{ width: '50%' }}>
                  <Select
                    style={{ width: '100%' }}
                    onChange={() => {
                      // console.log('====================================');
                      // console.log(e);
                      // console.log('====================================');
                      // this.setCreateLocationParam({
                      //   typeId: e,
                      // });
                    }}
                  >
                    {listDeviceTypes?.map((type: any) => {
                      return (
                        <Select.Option key={type.id} value={type.id}>
                          {type.typeName}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Skeleton>

              <Divider></Divider>
              <Skeleton active loading={editLocationModal?.isLoading}>
                <Form.Item
                  name="description"
                  label="Description"
                  style={{
                    width: '100%',
                  }}
                >
                  <Input.TextArea
                    rows={4}
                    style={{
                      width: '100%',
                    }}
                    placeholder="input placeholder"
                  />
                </Form.Item>
              </Skeleton>
              <Skeleton active loading={editLocationModal?.isLoading}>
                <Form.Item
                  label="Address"
                  name="address"
                  style={{
                    width: '100%',
                  }}
                >
                  <AutoCompleteComponent
                    {...this.props}
                    inputValue={selectedLocation?.address}
                    value={{
                      label: selectedLocation?.address,
                      value: `${selectedLocation?.latitude}-${selectedLocation?.longitude}`,
                    }}
                    // onInputChange={(e: any) => {
                    //   this.setSelectedLocation({
                    //     address: e,
                    //   });
                    // }}
                    onChange={async (e: any, address: any) => {
                      await this.handleAutoCompleteSearch(e);
                      const coordination = e.split('-');
                      const lat = coordination[0];
                      const lon = coordination[1];
                      this.setSelectedLocation({
                        longitude: lon,
                        latitude: lat,
                        address,
                      });
                    }}
                  />
                </Form.Item>
              </Skeleton>
              <Divider></Divider>
            </Form>
            <LeafletMapComponent {...this.props} />
            <Divider></Divider>
            <Row>
              <Col>
                <Space>
                  <Button
                    onClick={() => {
                      if (this.formRef.current) {
                        this.formRef.current.validateFields().then((values) => {
                          this.updateConfirm(values);
                        });
                      }
                    }}
                  >
                    <EditTwoTone />
                    Update
                  </Button>
                  <Button
                    danger
                    onClick={() => {
                      this.deleteConfirm(selectedLocation);
                    }}
                  >
                    <DeleteTwoTone twoToneColor="#f93e3e" />
                    Remove
                  </Button>
                </Space>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewLocationDetailComponent);
