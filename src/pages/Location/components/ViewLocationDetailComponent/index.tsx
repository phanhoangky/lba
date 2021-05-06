import { Divider, Form, Skeleton } from 'antd';
import type { FormInstance } from 'antd';
import L from 'leaflet';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../..';
import { LeafletMapComponent } from '../LeafletMapComponent';
// import { TAG_COLOR } from '@/services/constantUrls';

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

  componentDidUpdate = () => {
    // this.initialMap();
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
  };

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

  setLocationsTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setLocationTableLoadingReducer`,
      payload: loading,
    });
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { selectedLocation, viewLocationDetailComponent } = this.props.location;
    // const { listDeviceTypes } = this.props.deviceStore;

    return (
      <>
        {selectedLocation && (
          <>
            <Form
              ref={this.formRef}
              layout="horizontal"
              style={{
                boxSizing: 'border-box',
              }}
              labelCol={{
                span: 5,
              }}
              wrapperCol={{
                span: 24,
              }}
            >
              <Form.Item label="Name">
                {/* <Input value={selectedLocation.name} readOnly /> */}
                {/* <Tag color={TAG_COLOR}>{selectedLocation.name}</Tag> */}
                {selectedLocation.name}
              </Form.Item>
              <Form.Item name="typeId" label="Type">
                {/* <Select
                        disabled
                        style={{ width: '100%' }}
                        value={selectedLocation.typeId}
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
                      </Select> */}
                {/* <Tag color={TAG_COLOR}>{selectedLocation.type?.typeName}</Tag> */}
                {selectedLocation.type?.typeName}
              </Form.Item>
              {/* <Row gutter={20}>
                <Col span={12}>
                  <Skeleton active loading={viewLocationDetailComponent?.isLoading}></Skeleton>
                </Col>
                <Col span={12}>
                  <Skeleton active loading={viewLocationDetailComponent?.isLoading}></Skeleton>
                </Col>
              </Row> */}

              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  name="description"
                  label="Description"
                  style={{
                    width: '100%',
                  }}
                >
                  {/* <Tag color={TAG_COLOR}>{selectedLocation.description}</Tag> */}
                  {selectedLocation.description}
                </Form.Item>
              </Skeleton>

              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  name="matchingCode"
                  label="Maching Code"
                  style={{
                    width: '100%',
                  }}
                >
                  {/* <Tag color={TAG_COLOR}>{selectedLocation.matchingCode}</Tag> */}
                  {selectedLocation.matchingCode}
                </Form.Item>
              </Skeleton>
              <Skeleton active loading={viewLocationDetailComponent?.isLoading}>
                <Form.Item
                  label="Address"
                  style={{
                    width: '100%',
                  }}
                >
                  {/* <Input.TextArea readOnly value={selectedLocation.address} /> */}
                  {/* <Tag color={TAG_COLOR}>{selectedLocation.address}</Tag> */}
                  {selectedLocation.address}
                </Form.Item>
              </Skeleton>
              <Divider></Divider>
            </Form>
            <LeafletMapComponent disabledClick={true} {...this.props} />
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
