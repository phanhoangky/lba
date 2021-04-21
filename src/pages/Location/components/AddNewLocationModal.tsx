import { geocoding } from '@/services/MapService/RapidAPI';
import { Col, Input, Row, Select, Form, notification } from 'antd';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { LOCATION_DISPATCHER } from '..';
import LeafletMapComponent from './LeafletMapComponent';
import L from 'leaflet';
import { AutoCompleteComponent } from '@/pages/common/AutoCompleteComponent';
import type { FormInstance } from 'antd/lib/form';
import { forwardGeocoding } from '@/services/MapService/LocationIQService';
import { openNotification } from '@/utils/utils';
import type { ViewLocationDetailComponent } from './ViewLocationDetailComponent';

export type AddNewLocationModalProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  campaign: CampaignModelState;
};

export class AddNewLocationModal extends React.Component<AddNewLocationModalProps> {
  formRef = React.createRef<FormInstance<any>>();

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

  setAddNewLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setAddNewLocationModalReducer`,
      payload: {
        ...this.props.location.addNewLocationModal,
        ...modal,
      },
    });
  };

  setCreateLocationParam = async (param: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setCreateLocationParamReducer`,
      payload: {
        ...this.props.location.createLocationParam,
        ...param,
      },
    });
  };

  createNewLocation = async (param: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/createLocation`,
      payload: {
        ...this.props.location.createLocationParam,
        ...param,
      },
    });
  };

  onCreateNewLocation = async (values: any) => {
    this.setAddNewLocationModal({
      isLoading: true,
    })
      .then(() => {
        this.createNewLocation(values)
          .then(() => {
            this.callGetListLocations().then(() => {
              this.clearCreateLocationParam().then(() => {
                openNotification(
                  'success',
                  'Create New Location Success',
                  `Location ${values.name} was created`,
                );
                this.setAddNewLocationModal({
                  isLoading: false,
                  visible: false,
                });
              });
            });
          })
          .catch((error) => {
            this.setAddNewLocationModal({
              isLoading: false,
              visible: false,
            });
            openNotification('error', 'Error', error.message);
          });
      })
      .catch(() => {
        openNotification('error', 'Error', 'Create New Location Error');
        this.setAddNewLocationModal({
          isLoading: false,
          visible: false,
        });
      });
  };

  handleCreateNewLocation = async () => {
    const { createLocationParam } = this.props.location;
    if (this.formRef.current) {
      this.formRef.current.validateFields().then((values) => {
        if (!createLocationParam || createLocationParam?.address === '') {
          return;
        }
        this.onCreateNewLocation(values).then(() => {
          this.formRef.current?.resetFields();
        });
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

  clearCreateLocationParam = async () => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/clearCreateLocationParamReducer`,
    });
  };

  setAddressSearchList = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setAddressSearchListReducer`,
      payload,
    });
  };

  convertAddress = async (address: string) => {
    const res = await geocoding(address);

    return res;
  };

  handleAutoCompleteSearch = async (location: string, address: string) => {
    const { mapComponent } = this.props.location;
    if (address !== '') {
      // const { data } = await this.convertAddress(address);

      // const addressList = data.results[0];
      // const { lat, lng } = addressList.geometry.location;
      const coordination = location.split('-');
      const lat = Number.parseFloat(coordination[0]);
      const lon = Number.parseFloat(coordination[1]);
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
        }
      }

      await this.setCreateLocationParam({
        longitude: lon,
        latitude: lat,
        address,
      });
    }
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

  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
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
          }
        }

        await this.setCreateLocationParam({
          longitude: lon,
          latitude: lat,
          address,
        });
      }
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

  resetMap = async () => {
    const { mapComponent } = this.props.location;
    if (mapComponent) {
      if (mapComponent.map) {
        if (mapComponent.marker) {
          mapComponent.marker.remove();
        }

        if (mapComponent.circle) {
          mapComponent.circle.remove();
        }
        await this.setMapComponent({
          circle: undefined,
          map: undefined,
          marker: undefined,
        });
      }
    }
  };

  autoCompleteRef = React.createRef<AutoCompleteComponent>();

  viewLocationDetailComponentRef = React.createRef<ViewLocationDetailComponent>();
  render() {
    const { createLocationParam } = this.props.location;

    const { listDeviceTypes } = this.props.deviceStore;

    return (
      <>
        <Form ref={this.formRef} layout="vertical" name="add_location_modal_form">
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please input the name of location!' },
              { max: 50, message: 'Name cannot exceed 50 characters!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="typeId"
            label="Type"
            rules={[{ required: true, message: 'Please input type of location' }]}
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

          <Form.Item
            label="Address"
            name="address"
            // rules={[{ required: true, message: 'Please enter address' }]}
          >
            <AutoCompleteComponent
              ref={this.autoCompleteRef}
              {...this.props}
              inputValue={createLocationParam?.address}
              address={createLocationParam?.address}
              // value={{
              //   label: selectedLocation?.address,
              //   value: `${selectedLocation?.latitude}-${selectedLocation?.longitude}`,
              // }}
              onInputChange={async (e) => {
                await this.setCreateLocationParam({
                  address: e,
                });
              }}
              onChange={async (address) => {
                await this.onAutoCompleteSelect(address);
              }}
            />
          </Form.Item>
          {createLocationParam?.address === '' && (
            <p
              style={{
                color: 'red',
                transition: 'ease 0.5s',
              }}
            >
              Please enter location address
            </p>
          )}
        </Form>
        <Row>
          <Col span={24}>
            <LeafletMapComponent
              onClick={async (data: any) => {
                await this.setCreateLocationParam({
                  address: data.display_name,
                  longitude: data.lon,
                  latitude: data.lat,
                });
              }}
              {...this.props}
            />
          </Col>
        </Row>
        {/* </Modal> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewLocationModal);
