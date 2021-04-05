import { openNotification } from '@/utils/utils';
import {
  PlusSquareTwoTone,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Col, Dropdown, Input, Menu, Row, Select, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '..';

export type LocationTableHeaderComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
};

export class LocationTableHeaderComponent extends React.Component<LocationTableHeaderComponentProps> {
  setMapComponent = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setMapComponentReducer`,
      payload: {
        ...this.props.location.mapComponent,
        ...payload,
      },
    });
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

  setLocationsTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setLocationTableLoadingReducer`,
      payload: loading,
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

  setEditLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setEditLocationModalReduder`,
      payload: {
        ...this.props.location.editLocationModal,
        ...modal,
      },
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

  render() {
    const { getListLocationParam } = this.props.location;
    return (
      <Row>
        <Col span={24}>
          <Space>
            <Input.Search
              // width={'30%'}
              // value={getListLocationParam?.searchValue}
              enterButton
              onSearch={(e) => {
                this.setLocationsTableLoading(true)
                  .then(() => {
                    this.callGetListLocations({
                      searchValue: e,
                      pageNumber: 0,
                    })
                      .then(() => {
                        this.setLocationsTableLoading(false);
                      })
                      .catch((error) => {
                        console.log('====================================');
                        console.log(error);
                        console.log('====================================');
                        openNotification('error', 'Fail to get list location');
                      });
                  })
                  .catch(() => {
                    this.setLocationsTableLoading(false);
                  });
              }}
            />

            <Dropdown
              overlay={
                <Menu
                  onClick={(e) => {
                    this.setLocationsTableLoading(true)
                      .then(() => {
                        this.callGetListLocations({
                          isDescending: e.key === 'desc',
                          isSort: true,
                        }).then(() => {
                          this.setLocationsTableLoading(false);
                        });
                      })
                      .catch(() => {
                        this.setLocationsTableLoading(false);
                      });
                  }}
                >
                  <Menu.Item key="asc" icon={<SortAscendingOutlined />}>
                    Ascending
                  </Menu.Item>
                  <Menu.Item key="desc" icon={<SortDescendingOutlined />}>
                    Descending
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                {getListLocationParam?.isDescending && <SortDescendingOutlined />}
                {!getListLocationParam?.isDescending && <SortAscendingOutlined />}
              </Button>
            </Dropdown>
            <Select
              style={{
                width: '150px',
              }}
              defaultValue="CreateTime"
              value={getListLocationParam?.orderBy}
              onChange={(e) => {
                this.setLocationsTableLoading(true)
                  .then(() => {
                    this.callGetListLocations({
                      orderBy: e !== '' ? e : undefined,
                      isSort: e !== '',
                    }).then(() => {
                      this.setLocationsTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setLocationsTableLoading(false);
                  });
              }}
            >
              <Select.Option value="CreateTime">Create Time</Select.Option>
              <Select.Option value="Name">Name</Select.Option>
            </Select>

            <Button
              onClick={async () => {
                this.clearCreateLocationParam().then(() => {
                  this.resetMap().then(() => {});
                  this.setViewLocationDetailComponent({
                    visible: false,
                  }).then(() => {});
                  this.setAddNewLocationModal({
                    visible: true,
                  });
                });
              }}
              icon={<PlusSquareTwoTone />}
            >
              Add New Location
            </Button>
          </Space>
        </Col>
        {/* <Col span={12}></Col> */}
      </Row>
    );
  }
}
export default connect((state: any) => ({ ...state }))(LocationTableHeaderComponent);
