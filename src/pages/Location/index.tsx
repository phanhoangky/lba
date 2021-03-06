// import { Location } from '@/models/Location';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  EditFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Drawer, Modal, Row, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch, LocationModelState } from 'umi';
import { connect, history } from 'umi';
import { LocationTableHeaderComponent } from './components/LocationTableHeaderComponent';
import type { Location } from '@/models/Location';
import { ViewLocationDetailComponent } from './components/ViewLocationDetailComponent';
import { cloneDeep } from 'lodash';
import { EditLocationFormModal } from './components/EditLocationFormModal';
import { EditLocationModalFooter } from './components/EditLocationFormModal/EditLocationModalFooter';
import { AddNewLocationModal } from './components/AddNewLocationModal';
import { openNotification } from '@/utils/utils';

export type LocationScreenProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  deviceStore: DeviceModelState;
  campaign: CampaignModelState;
};
export const LOCATION_DISPATCHER = 'location';
class LocationScreen extends React.Component<LocationScreenProps> {
  componentDidMount = async () => {
    this.setLocationsTableLoading(true)
      .then(async () => {
        this.readJWT().catch((error) => {
          openNotification('error', 'error', error.message);
        });
        Promise.all([this.callGetListLocations(), this.callGetListDeviceTypes()]).then(async () => {
          this.setLocationsTableLoading(false).then(async () => {
            this.resetMap();
            // const { listLocations } = this.props.location;
            // if (listLocations && listLocations.length > 0) {
            //   const location = listLocations[0];
            //   const { data } = await this.reverseGeocoding(location.latitude, location.longitude);
            //   const clone = cloneDeep(location);
            //   await this.setSelectedLocation({
            //     ...clone,
            //     address: data.display_name,
            //   });
            //   this.setSelectedLocation(
            //     listLocations && listLocations.length > 0 && listLocations[0],
            //   );
            //   this.viewLocationRef.current?.componentDidMount();
            // }
          });
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occured', error);
        this.setLocationsTableLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  callGetListDeviceTypes = async () => {
    await this.props.dispatch({
      type: 'deviceStore/getDeviceType',
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
    const { listLocations } = this.props.location;
    const newList = listLocations?.map((location) => {
      if (location.id === item.id) {
        return {
          ...location,
          isSelected: true,
        };
      }
      return {
        ...location,
        isSelected: false,
      };
    });
    await this.setListLocations(newList);
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
      centered: true,
      closable: false,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      onCancel: () => {},
      onOk: async () => {
        this.setLocationsTableLoading(true).then(() => {
          this.setEditLocationModal({
            isLoading: true,
          });
          this.deleteLocation(location.id)
            .then(() => {
              openNotification(
                'success',
                `Delete ${location.name} successfully`,
                `${location.name} was deleted`,
              );
              this.callGetListLocations().then(async () => {
                this.setLocationsTableLoading(false);
                this.setEditLocationModal({
                  isLoading: false,
                });
              });
            })
            .catch((error: any) => {
              openNotification('error', `Delete ${location.name} error`, error.message);
              this.setLocationsTableLoading(false);
              this.setEditLocationModal({
                isLoading: false,
              });
            });
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
      history.push('/devices');
    });
  };

  setListLocations = async (list: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setListLocationsReducer`,
      payload: list,
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
        circle: undefined,
        marker: undefined,
      });
    }
  };

  viewLocationRef = React.createRef<ViewLocationDetailComponent>();

  editLocationFormRef = React.createRef<EditLocationFormModal>();

  addNewLocationModalRef = React.createRef<AddNewLocationModal>();

  render() {
    const {
      getListLocationParam,
      listLocations,
      totalItem,
      locationTableLoading,
      editLocationModal,
      viewLocationDetailComponent,
      addNewLocationModal,
    } = this.props.location;
    return (
      <PageContainer
        title={false}
        header={{
          ghost: false,
          style: {
            padding: 0,
          },
        }}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Table
              loading={locationTableLoading}
              dataSource={listLocations}
              rowClassName={(record) => {
                return record.isSelected ? 'selected-row' : '';
              }}
              scroll={{
                x: 400,
                y: 530,
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
                  onDoubleClick: () => {
                    this.redirectToListDevicesByLocation(record);
                  },

                  onClick: async (e) => {
                    const { data } = await this.reverseGeocoding(record.latitude, record.longitude);
                    const clone = cloneDeep(record);
                    this.setSelectedLocation({
                      ...clone,
                      address: data.display_name,
                    }).then(() => {
                      this.resetMap().then(() => {
                        this.setViewLocationDetailComponent({
                          visible: true,
                        }).then(() => {
                          this.viewLocationRef.current?.componentDidMount();
                        });
                      });
                    });
                    e.stopPropagation();
                  },
                };
              }}
            >
              <Column key="name" dataIndex="name" title="Name"></Column>
              <Column key="typeName" dataIndex="typeName" title="Type Name"></Column>
              <Column key="totalDevices" dataIndex="totalDevices" title="Total Devices"></Column>
              <Column key="createTime" dataIndex="createTime" title="Create Time"></Column>
              <Column
                key="action"
                title="Action"
                render={(record) => {
                  return (
                    <Space>
                      <Button
                        onClick={(e) => {
                          this.setViewLocationDetailComponent({
                            visible: false,
                          }).then(async () => {
                            const { data } = await this.reverseGeocoding(
                              record.latitude,
                              record.longitude,
                            );
                            const clone = cloneDeep(record);
                            this.setSelectedLocation({
                              ...clone,
                              address: data.display_name,
                            }).then(() => {
                              this.resetMap().then(() => {
                                this.setEditLocationModal({
                                  visible: true,
                                }).then(() => {
                                  this.editLocationFormRef.current?.componentDidMount();
                                });
                              });
                            });
                          });
                          e.stopPropagation();
                        }}
                        className="lba-btn"
                      >
                        <EditFilled className="lba-icon" />
                      </Button>
                      <Button
                        danger
                        onClick={(e) => {
                          this.deleteConfirm(record);
                          e.stopPropagation();
                        }}
                      >
                        <DeleteTwoTone twoToneColor="#f93e3e" />
                      </Button>
                    </Space>
                  );
                }}
              ></Column>
            </Table>
          </Col>
          {/* <Col span={12}>
            {viewLocationDetailComponent?.visible && (
              <Typography.Title level={4} className="lba-text">
                Location Detail
              </Typography.Title>
            )}
            {viewLocationDetailComponent?.visible && (
              <ViewLocationDetailComponent ref={this.viewLocationRef} {...this.props} />
            )}
          </Col> */}
        </Row>
        <Drawer
          destroyOnClose={true}
          closable={false}
          onClose={() => {
            this.setViewLocationDetailComponent({
              visible: false,
            }).then(() => {
              this.viewLocationRef.current?.resetMap();
            });
          }}
          title="Location Detail"
          width={'40%'}
          visible={viewLocationDetailComponent?.visible}
        >
          <ViewLocationDetailComponent ref={this.viewLocationRef} {...this.props} />
          {/* {viewLocationDetailComponent?.visible && (
            
          )} */}
        </Drawer>
        {/* Add New Location Modal */}
        {/* <AddNewLocationModal {...this.props} /> */}
        <Modal
          title="Add New Location"
          visible={addNewLocationModal?.visible}
          centered
          confirmLoading={addNewLocationModal?.isLoading}
          width={'50%'}
          afterClose={() => {
            this.resetMap().then(async () => {
              // const { selectedLocation } = this.props.location;
              // const old = listLocations?.filter((l) => l.id === selectedLocation?.id)[0];
              // if (old) {
              //   const { data } = await this.reverseGeocoding(old.latitude, old.longitude);
              //   this.setSelectedLocation({ ...old, address: data.display_name }).then(() => {
              //     this.setViewLocationDetailComponent({
              //       visible: true,
              //     }).then(() => {
              //       this.viewLocationRef.current?.componentDidMount();
              //     });
              //   });
              // }
            });
          }}
          destroyOnClose={true}
          maskClosable={false}
          closable={false}
          onOk={() => {
            this.addNewLocationModalRef.current?.handleCreateNewLocation();
          }}
          onCancel={async () => {
            this.setAddNewLocationModal({
              visible: false,
            });
            this.clearCreateLocationParam();
          }}
          okButtonProps={{
            className: 'lba-btn',
            icon: <CheckCircleFilled className="lba-icon" />,
          }}
          cancelButtonProps={{
            icon: <CloseCircleFilled className="lba-close-icon" />,
            danger: true,
          }}
        >
          {addNewLocationModal?.visible && (
            <AddNewLocationModal ref={this.addNewLocationModalRef} {...this.props} />
          )}
        </Modal>
        {/* End Add New Location Modal */}

        {/* {editLocationModal?.visible && <EditLocationModal {...this.props} />} */}

        {/* Edit Location Modal */}
        <Modal
          title={'Edit Location'}
          visible={editLocationModal?.visible}
          closable={false}
          maskClosable={false}
          destroyOnClose={true}
          centered
          onCancel={() => {
            this.setEditLocationModal({
              visible: false,
            });
            this.resetMap();
          }}
          width={'50%'}
          confirmLoading={editLocationModal?.isLoading}
          footer={
            <>
              <EditLocationModalFooter
                onRemove={() => {
                  const { selectedLocation } = this.props.location;
                  this.editLocationFormRef.current?.deleteConfirm(selectedLocation);
                }}
                onUpdate={() => {
                  this.editLocationFormRef.current?.updateConfirm();
                }}
                {...this.props}
              />
            </>
          }
        >
          {editLocationModal?.visible && (
            <EditLocationFormModal ref={this.editLocationFormRef} {...this.props} />
          )}
        </Modal>
        {/* End Edit Location Modal */}
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(LocationScreen);
