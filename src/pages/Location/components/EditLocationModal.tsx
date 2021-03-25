import AutoCompleteComponent from '@/pages/common/AutoCompleteComponent';
import type { UpdateLocationParam } from '@/services/LocationService/LocationService';
// import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import { Col, Form, Input, Modal, Row, Select } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import L from 'leaflet';
import * as React from 'react';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import type {
  BrandModelState,
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  LocationModelState,
} from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '..';
import LeafletMapComponent from './LeafletMapComponent';

export type EditLocationModalProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  brand: BrandModelState;
  campaign: CampaignModelState;
};

class EditLocationModal extends React.Component<EditLocationModalProps> {
  componentDidUpdate = () => {
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

  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
      },
    });
  };

  // reverseGeocoding = async (lat: string, lng: string) => {
  //   const res = await reverseGeocoding(Number.parseFloat(lat), Number.parseFloat(lng));
  //   return res;
  // };

  setSelectedLocation = async (item: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setSelectedLocationReducer`,
      payload: {
        ...this.props.location.selectedLocation,
        ...item,
      },
    });
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

      // await this.setSelectedLocation({
      //   longitude: lon,
      //   latitude: lat,
      //   address,
      // });
    }
  };

  clearSelectedLocation = async () => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/clearSelectedLocationReducer`,
    });
  };

  formRef = React.createRef<FormInstance<any>>();
  render() {
    const { selectedLocation, editLocationModal, mapComponent } = this.props.location;

    const { listDeviceTypes } = this.props.deviceStore;

    console.log('====================================');
    console.log('Selected Location>>>>', selectedLocation);
    console.log('====================================');
    return (
      <>
        <Modal
          title="Update Location"
          destroyOnClose={true}
          width={'80%'}
          visible={editLocationModal?.visible}
          confirmLoading={editLocationModal?.isLoading}
          afterClose={() => {
            if (mapComponent) {
              if (mapComponent.map) {
                if (mapComponent.marker) {
                  mapComponent.marker.removeFrom(mapComponent.map);
                  this.setMapComponent({
                    marker: undefined,
                  });
                }
              }
            }
            this.clearSelectedLocation();
          }}
          closable={false}
          onOk={() => {
            if (this.formRef.current) {
              this.formRef.current.validateFields().then((values) => {
                this.updateConfirm(values);
              });
            }
          }}
          onCancel={() => {
            this.setEditLocationModal({
              visible: false,
            });
          }}
        >
          <Form ref={this.formRef} layout="vertical" name="edit_location_modal_form">
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please input the name of location!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} autoSize />
            </Form.Item>

            <Form.Item
              name="typeId"
              label="Type"
              rules={[{ required: true, message: 'Please input address' }]}
            >
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

            <Form.Item
              name="address"
              label="Address"
              rules={[
                {
                  validator: (_: any, value: any) => {
                    if (value && value !== '') {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Please enter address'));
                  },
                },

                { required: true, message: 'Please enter address' },
              ]}
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
          </Form>
          {/* <Row>
            <Col span={10}>Address</Col>
            <Col span={14}>
              <AutoCompleteComponent
                {...this.props}
                // inputValue={selectedLocation?.address}
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
            </Col>
          </Row> */}
          <Row>
            <Col span={24}>
              <LeafletMapComponent {...this.props} />
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditLocationModal);
