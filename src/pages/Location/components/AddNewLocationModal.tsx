import { geocoding } from '@/services/MapService/RapidAPI';
import { Col, Input, Modal, Row, Select, Form, notification } from 'antd';
import * as React from 'react';
import type {
  BrandModelState,
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  LocationModelState,
} from 'umi';
import { connect } from 'umi';
// import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import { LOCATION_DISPATCHER } from '..';
import LeafletMapComponent from './LeafletMapComponent';
import L from 'leaflet';
import AutoCompleteComponent from '@/pages/common/AutoCompleteComponent';
import type { FormInstance } from 'antd/lib/form';

export type AddNewLocationModalProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  brand: BrandModelState;
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
        this.createNewLocation(values).then(() => {
          this.callGetListLocations().then(() => {
            this.clearCreateLocationParam().then(() => {
              this.openNotification(undefined, 'Success', 'Create New Location Success');
              this.setAddNewLocationModal({
                isLoading: false,
                visible: false,
              });
            });
          });
        });
      })
      .catch(() => {
        this.openNotification('error', 'Error', 'Create New Location Error');
        this.setAddNewLocationModal({
          isLoading: false,
          visible: false,
        });
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
  render() {
    const { addNewLocationModal, createLocationParam, mapComponent } = this.props.location;

    const { listDeviceTypes } = this.props.deviceStore;

    return (
      <>
        <Modal
          title="Add New Location"
          visible={addNewLocationModal?.visible}
          centered
          confirmLoading={addNewLocationModal?.isLoading}
          width={'50%'}
          afterClose={() => {
            if (mapComponent) {
              console.log('====================================');
              console.log('Add New Location >>>', mapComponent);
              console.log('====================================');
              if (mapComponent.map) {
                // this.setMapComponent({
                //   map: undefined,
                // });
                if (mapComponent.marker) {
                  mapComponent.marker.remove();
                  this.setMapComponent({
                    marker: undefined,
                  });
                }
              }
            }
            this.setEditLocationModal({
              visible: true,
            });
            this.clearCreateLocationParam();
          }}
          destroyOnClose={true}
          closable={false}
          onOk={() => {
            if (this.formRef.current) {
              this.formRef.current
                .validateFields()
                .then((values) => {
                  this.onCreateNewLocation(values).then(() => {
                    this.formRef.current?.resetFields();
                  });
                })
                .catch(() => {});
            }
          }}
          onCancel={() => {
            this.setAddNewLocationModal({
              visible: false,
            });
          }}
        >
          <Form ref={this.formRef} layout="vertical" name="add_location_modal_form">
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
            {/* <Form.Item
              name="brandId"
              label="Brand"
              rules={[{ required: true, message: 'Please input address' }]}
            >
              <Select
                style={{ width: '100%' }}
                onChange={() => {
                  // this.setCreateLocationParam({
                  //   brandId: e,
                  // });
                }}
              >
                {listBrand.map((brand) => {
                  return (
                    <Select.Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Select.Option>
                  );
                })}
              </Select>
            </Form.Item> */}

            {/* <Form.Item
              name="address"
              label="Address"
              rules={[{ required: true, message: 'Please input address' }]}
            ></Form.Item> */}
          </Form>
          <Row>
            <Col flex="2">Address</Col>
            <Col flex="6">
              <AutoCompleteComponent
                {...this.props}
                inputValue={createLocationParam?.address}
                value={{
                  label: createLocationParam?.address,
                  value: `${createLocationParam?.longitude}-${createLocationParam?.latitude}`,
                }}
                onInputChange={(e: any) => {
                  this.setCreateLocationParam({
                    address: e,
                  });
                }}
                onChange={(e: any, address: any) => {
                  this.handleAutoCompleteSearch(e, address);
                }}
              />
            </Col>
          </Row>
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

export default connect((state: any) => ({ ...state }))(AddNewLocationModal);
