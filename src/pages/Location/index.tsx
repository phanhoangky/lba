// import { Location } from '@/models/Location';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import { DeleteTwoTone, EditTwoTone, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import {
  BrandModelState,
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  history,
  LocationModelState,
} from 'umi';
import { connect } from 'umi';
import AddNewLocationModal from './components/AddNewLocationModal';
import EditLocationModal from './components/EditLocationModal';
import { LocationTableHeaderComponent } from './components/LocationTableHeaderComponent';
import type { Location } from '@/models/Location';

export type LocationScreenProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  brand: BrandModelState;
  campaign: CampaignModelState;
};
export const LOCATION_DISPATCHER = 'location';
class LocationScreen extends React.Component<LocationScreenProps> {
  componentDidMount = async () => {
    this.setLocationsTableLoading(true)
      .then(() => {
        this.callGetListLocations().then(() => {
          this.props
            .dispatch({
              type: 'deviceStore/getDeviceType',
            })
            .then(() => {
              this.callGetListBrands({
                isDescending: false,
                isPaging: false,
                isSort: false,
                orderBy: '',
                pageLimitItem: 10,
                pageNumber: 0,
                seachValue: '',
              }).then(() => {
                this.setLocationsTableLoading(false);
              });
              this.readJWT();
            });
        });
      })
      .catch(() => {
        this.setLocationsTableLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
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

  callGetListBrands = async (param?: any) => {
    await this.props.dispatch({
      type: 'brand/getListBrands',
      payload: {
        ...this.props.brand.getListBrandParam,
        ...param,
      },
    });
  };

  setLocationsTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setLocationTableLoadingReducer`,
      payload: loading,
    });
  };

  reverseGeocoding = async (lat: string, lng: string) => {
    const res = await reverseGeocoding(Number.parseFloat(lat), Number.parseFloat(lng));
    return res;
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

  setLocationAddressInMap = async (item: any) => {
    if (item.longitude !== '' && item.latitude !== '') {
      const { mapComponent } = this.props.location;
      const { data } = await this.reverseGeocoding(item.latitude, item.longitude);

      this.setSelectedLocation({
        address: data.display_name,
      }).then(() => {
        if (mapComponent) {
          if (mapComponent.map) {
            if (mapComponent.marker) {
              mapComponent.marker.remove();
              this.setMapComponent({
                marker: undefined,
              });
            }
          }
        }
      });
    }
  };

  clearCreateLocationParam = async () => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/clearCreateLocationParamReducer`,
    });
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

  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
      },
    });
  };

  deleteLocation = async (id: string) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/deleteLocation`,
      payload: id,
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
            this.deleteLocation(location.id).then(() => {
              this.callGetListLocations().then(() => {
                this.setLocationsTableLoading(false);
              });
            });
          })
          .catch(() => {
            this.setLocationsTableLoading(false);
          });
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

  setGetDevicesParam = async (param: any) => {
    await this.props.dispatch({
      type: 'deviceStore/setGetDevicesParamReducer',
      payload: {
        ...this.props.deviceStore.getDevicesParam,
        ...param,
      },
    });
  };

  redirectToListDevicesByLocation = async (record: Location) => {
    this.setGetDevicesParam({
      locationId: record.id,
    }).then(() => {
      history.push('/devies');
    });
  };

  render() {
    const {
      getListLocationParam,
      listLocations,
      totalItem,
      locationTableLoading,
      mapComponent,
      addNewLocationModal,
      editLocationModal,
    } = this.props.location;
    return (
      <>
        <PageContainer>
          <div
            style={{
              boxSizing: 'border-box',
              width: '80%',
              height: 'auto',
              margin: '0 auto',
            }}
          >
            <Table
              loading={locationTableLoading}
              dataSource={listLocations}
              scroll={{
                x: 400,
                y: 1000,
              }}
              pagination={{
                current: getListLocationParam?.pageNumber
                  ? getListLocationParam?.pageNumber + 1
                  : 1,
                total: totalItem,
                pageSize: getListLocationParam?.pageLimitItem
                  ? getListLocationParam?.pageLimitItem
                  : 10,
                onChange: async (e) => {
                  this.setLocationsTableLoading(true)
                    .then(() => {
                      this.callGetListLocations({
                        pageNumber: e - 1,
                      }).then(() => {
                        this.setLocationsTableLoading(false);
                      });
                    })
                    .catch(() => {
                      this.setLocationsTableLoading(false);
                    });
                },
              }}
              title={() => (
                <>
                  <LocationTableHeaderComponent {...this.props} />
                </>
              )}
              onRow={(record) => {
                return {
                  onDoubleClick: () => {},
                };
              }}
            >
              <Column key="matchingCode" dataIndex="matchingCode" title="Matching Code"></Column>
              <Column key="name" dataIndex="name" title="Name"></Column>
              <Column key="typeName" dataIndex="typeName" title="Type Name"></Column>

              {/* <Column
              key="isApprove"
              render={(text, record: any) => {
                return (
                  <Alert
                    style={{ textAlign: 'center' }}
                    message={
                      <>
                        <Space align="center" style={{ textAlign: 'center' }}>
                          {record.isApprove ? <CheckCircleTwoTone /> : <ClockCircleTwoTone />}
                        </Space>
                      </>
                    }
                    type={record.isApprove ? 'success' : 'warning'}
                  />
                );
              }}
            ></Column> */}
              <Column
                key="action"
                width={150}
                title="Action"
                render={(text, record: any) => {
                  return (
                    <>
                      <Space>
                        <Button
                          onClick={async () => {
                            this.setSelectedLocation(record).then(() => {
                              this.setLocationAddressInMap(record).then(() => {
                                this.setEditLocationModal({
                                  visible: true,
                                });
                              });
                            });
                          }}
                        >
                          <EditTwoTone />
                        </Button>
                        <Button
                          onClick={() => {
                            this.deleteConfirm(record);
                          }}
                        >
                          <DeleteTwoTone twoToneColor="#f93e3e" />
                        </Button>
                      </Space>
                    </>
                  );
                }}
              ></Column>
            </Table>
          </div>
          {addNewLocationModal?.visible && <AddNewLocationModal {...this.props} />}
          {editLocationModal?.visible && <EditLocationModal {...this.props} />}
        </PageContainer>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(LocationScreen);
