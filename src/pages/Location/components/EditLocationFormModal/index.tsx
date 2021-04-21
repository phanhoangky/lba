import { AutoCompleteComponent } from '@/pages/common/AutoCompleteComponent';
import { Col, Divider, Form, Input, Modal, notification, Row, Select, Skeleton } from 'antd';
import type { FormInstance } from 'antd';
import L from 'leaflet';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../..';
import { LeafletMapComponent } from '../LeafletMapComponent';
import type { UpdateLocationParam } from '@/services/LocationService/LocationService';
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons';
import { forwardGeocoding } from '@/services/MapService/LocationIQService';

export type EditLocationFormModalProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  campaign: CampaignModelState;
};

export class EditLocationFormModal extends React.Component<EditLocationFormModalProps> {
  componentDidMount = async () => {
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
    await this.initialMap();
  };

  componentDidUpdate() {
    const { mapComponent } = this.props.location;

    if (mapComponent && mapComponent.map) {
      const { selectedLocation } = this.props.location;
      if (selectedLocation) {
        const lat = Number.parseFloat(selectedLocation.latitude);
        const lng = Number.parseFloat(selectedLocation.longitude);
        mapComponent.map.whenReady(() => {
          if (mapComponent.map) {
            mapComponent.map.invalidateSize(true);
            mapComponent.map.setView([lat, lng]);
            if (!mapComponent.marker) {
              if (lat && lng) {
                const marker = L.marker([lat, lng]);
                marker.addTo(mapComponent.map);
                this.setMapComponent({
                  marker,
                });
              }
            } else {
              mapComponent.marker.remove();
              mapComponent.marker.setLatLng([lat, lng]).addTo(mapComponent.map);
            }
          }
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
        if (mapComponent.marker) {
          mapComponent.marker.setLatLng([lat, lng]);
          mapComponent.marker.remove();
          // mapComponent.marker.removeFrom(mapComponent.map);
        }

        const marker = L.marker([lat, lng]);

        marker.addTo(mapComponent.map);
        this.setMapComponent({
          marker,
        });
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

  updateConfirm = async () => {
    const { selectedLocation } = this.props.location;
    if (this.formRef.current) {
      if (!selectedLocation || !selectedLocation.address || selectedLocation.address === '') {
        return;
      }
      this.formRef.current
        .validateFields()
        .then((values) => {
          this.setEditLocationModal({
            isLoading: true,
          }).then(() => {
            this.updateLocation(values)
              .then(() => {
                this.callGetListLocations().then(async () => {
                  this.openNotification('success', `Update ${values.name} successfully`);
                  this.setEditLocationModal({
                    // visible: false,
                    isLoading: false,
                  });
                });
              })
              .catch((error) => {
                this.openNotification('error', `Update ${values.name} error`, error);
                this.setEditLocationModal({
                  // visible: false,
                  isLoading: false,
                });
              });
          });
        })
        .catch((error) => {
          this.openNotification('error', `Update  error`, error);
          this.setEditLocationModal({
            // visible: false,
            isLoading: false,
          });
        });
    }
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
      centered: true,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      onOk: async () => {
        this.setLocationsTableLoading(true).then(() => {
          this.setEditLocationModal({
            isLoading: true,
          });
          this.deleteLocation(location.id)
            .then(() => {
              this.openNotification('success', `Delete ${location.name} successfully`);
              this.callGetListLocations().then(async () => {
                this.setLocationsTableLoading(false);
                this.setEditLocationModal({
                  isLoading: false,
                });
              });
            })
            .catch(async (error: any) => {
              this.openNotification('error', `Delete ${location.name} error`, error.message);
              this.setLocationsTableLoading(false);
              this.setEditLocationModal({
                isLoading: false,
              });
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
    const { selectedLocation, editLocationModal } = this.props.location;
    const { listDeviceTypes } = this.props.deviceStore;
    return (
      <>
        <Form
          ref={this.formRef}
          layout="vertical"
          style={{
            boxSizing: 'border-box',
          }}
        >
          <Row gutter={20}>
            <Col span={12}>
              <Skeleton active loading={editLocationModal?.isLoading}>
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
            </Col>
            <Col span={12}>
              <Skeleton active loading={editLocationModal?.isLoading}>
                <Form.Item
                  label="Type"
                  name="typeId"
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
            </Col>
          </Row>
          <Skeleton active loading={editLocationModal?.isLoading}>
            <Form.Item
              name="description"
              label="Description"
              style={{
                width: '100%',
              }}
              rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
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
              // rules={[{ required: true, message: 'Please enter location address' }]}
            >
              <AutoCompleteComponent
                ref={this.autoCompleteRef}
                {...this.props}
                inputValue={selectedLocation?.address}
                address={selectedLocation?.address}
                // value={{
                //   label: selectedLocation?.address,
                //   value: `${selectedLocation?.latitude}-${selectedLocation?.longitude}`,
                // }}
                onInputChange={async (e) => {
                  await this.setSelectedLocation({
                    address: e,
                  });
                }}
                onChange={async (address) => {
                  await this.onAutoCompleteSelect(address);
                }}
              />
            </Form.Item>
          </Skeleton>
          {selectedLocation?.address === '' && (
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
        <LeafletMapComponent
          onClick={(data: any) => {
            this.setSelectedLocation({
              address: data.display_name,
              longitude: data.lon,
              latitude: data.lat,
            });
          }}
          {...this.props}
        />
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditLocationFormModal);
