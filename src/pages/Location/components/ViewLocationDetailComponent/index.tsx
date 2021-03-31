import { AutoCompleteComponent } from '@/pages/common/AutoCompleteComponent';
import { Divider, Form, Input, Modal, notification, Select, Skeleton } from 'antd';
import type { FormInstance } from 'antd';
import L from 'leaflet';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../..';
import { LeafletMapComponent } from '../LeafletMapComponent';
import type { UpdateLocationParam } from '@/services/LocationService/LocationService';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { forwardGeocoding } from '@/services/MapService/LocationIQService';

export type ViewLocationDetailComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  campaign: CampaignModelState;
};

export class ViewLocationDetailComponent extends React.Component<ViewLocationDetailComponentProps> {
  componentDidMount = () => {
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
  };

  initialMap = async () => {
    const { mapComponent, selectedLocation } = this.props.location;
    if (mapComponent) {
      if (mapComponent.map && selectedLocation) {
        const lat = Number.parseFloat(selectedLocation.latitude);
        const lng = Number.parseFloat(selectedLocation.longitude);
        mapComponent.map.setView([lat, lng]);
        console.log('====================================');
        console.log(mapComponent, lat, lng);
        console.log('====================================');
        if (!mapComponent.marker) {
          if (selectedLocation.longitude !== '' && selectedLocation?.latitude !== '') {
            const marker = L.marker([lat, lng]);
            marker.addTo(mapComponent.map);

            await this.setMapComponent({
              marker,
            });
            console.log('====================================');
            console.log('VIew Location >>', mapComponent, marker);
            console.log('====================================');
          }
        } else {
          mapComponent.marker.remove();
          mapComponent.marker.removeFrom(mapComponent.map);
          const marker = L.marker([lat, lng]);
          console.log('====================================');
          console.log('Remove Marker >>>>', marker);
          console.log('====================================');
          marker.addTo(mapComponent.map);

          await this.setMapComponent({
            marker,
          });
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

      await this.setSelectedLocation({
        longitude: lon,
        latitude: lat,
        address,
      });
    }
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

        await this.setSelectedLocation({
          longitude: lon,
          latitude: lat,
          address,
        });
      }
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
    this.setViewLocationDetailComponent({
      isLoading: true,
    })
      .then(() => {
        this.updateLocation(values).then(() => {
          this.callGetListLocations().then(() => {
            this.openNotification('success', `Update ${values.name} successfully`);
            this.setViewLocationDetailComponent({
              // visible: false,
              isLoading: false,
            });
          });
        });
      })
      .catch(() => {
        this.openNotification('error', `Update ${values.name} error`);
        this.setViewLocationDetailComponent({
          // visible: false,
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
            this.setViewLocationDetailComponent({
              isLoading: true,
            });
            this.deleteLocation(location.id).then(() => {
              this.openNotification('success', `Delete ${location.name} successfully`);
              this.callGetListLocations().then(async () => {
                this.setLocationsTableLoading(false);
                this.setViewLocationDetailComponent({
                  isLoading: false,
                });
              });
            });
          })
          .catch(async (error: any) => {
            Promise.reject(error);
            this.openNotification('error', `Delete ${location.name} error`);
            this.setLocationsTableLoading(false);
            this.setViewLocationDetailComponent({
              isLoading: false,
            });
          });
      },
    });
  };

  openNotification = (type?: string, message?: string, description?: string) => {
    if (type) {
      notification[type]({
        message: `${message}`,
        description,
      });
    } else {
      notification.open({
        message: `${message}`,
        description,
        style: {
          borderColor: 'green',
        },
      });
    }
  };

  setViewLocationDetailComponent = async (modal?: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setViewLocationDetailComponentReducer`,
      payload: {
        ...this.props.location.viewLocationDetailComponent,
        ...modal,
      },
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  autoCompleteRef = React.createRef<AutoCompleteComponent>();
  render() {
    const { selectedLocation, viewLocationDetailComponent } = this.props.location;
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
              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  label="Name"
                  name="name"
                  rules={[
                    { required: true, message: 'Please enter location name' },
                    { max: 50, message: 'Name have maximum 50 characters' },
                  ]}
                >
                  <Input placeholder="input placeholder" />
                </Form.Item>
              </Skeleton>

              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  label="Type"
                  name="typeId"
                  style={{ width: '50%' }}
                  rules={[{ required: true, message: 'Please select location type' }]}
                >
                  <Select
                    style={{ width: '100%' }}
                    onChange={() => {
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
              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
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
              <Divider></Divider>
              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  label="Address"
                  name="address"
                  style={{
                    width: '100%',
                  }}
                >
                  <Input />
                </Form.Item>
              </Skeleton>
              {selectedLocation.address === '' && (
                <p
                  style={{
                    color: 'red',
                    transition: 'ease 0.5s',
                  }}
                >
                  Please enter location address
                </p>
              )}
              <Divider></Divider>
            </Form>
            <LeafletMapComponent disabled={true} {...this.props} />
            <Divider></Divider>
            {/* <Row>
              <Col>
                <Space>
                  <Button
                    disabled={!(selectedLocation && selectedLocation.id !== '')}
                    danger
                    onClick={() => {
                      this.deleteConfirm(selectedLocation);
                    }}
                  >
                    <DeleteTwoTone twoToneColor="#f93e3e" />
                    Remove
                  </Button>
                  <Button
                    disabled={!selectedLocation || selectedLocation.id === ''}
                    type="primary"
                    onClick={() => {
                      if (this.formRef.current) {
                        if (!selectedLocation.address || selectedLocation.address === '') {
                          return;
                        }
                        this.formRef.current.validateFields().then((values) => {
                          this.updateConfirm(values);
                        });
                      }
                    }}
                  >
                    <EditFilled />
                    Update
                  </Button>
                </Space>
              </Col>
            </Row> */}
          </>
        )}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewLocationDetailComponent);
