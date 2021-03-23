import {
  PlusSquareTwoTone,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Select, Space } from 'antd';
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

  render() {
    const { mapComponent, getListLocationParam } = this.props.location;
    return (
      <Space>
        <Input.Search
          width={'40%'}
          value={getListLocationParam.searchValue}
          enterButton
          onSearch={(e) => {
            this.setLocationsTableLoading(true)
              .then(() => {
                this.callGetListLocations({
                  searchValue: e,
                  pageNumber: 0,
                }).then(() => {
                  this.setLocationsTableLoading(false);
                });
              })
              .catch(() => {
                this.setLocationsTableLoading(false);
              });
          }}
        />
        <Button
          onClick={async () => {
            this.clearCreateLocationParam().then(() => {
              if (mapComponent.map) {
                if (mapComponent.marker) {
                  mapComponent.marker.removeFrom(mapComponent.map);
                  this.setMapComponent({
                    marker: undefined,
                  });
                }
              }
              this.setAddNewLocationModal({
                visible: true,
              });
            });
          }}
          icon={<PlusSquareTwoTone />}
        >
          Add New Location
        </Button>

        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                this.setLocationsTableLoading(true)
                  .then(() => {
                    this.callGetListLocations({
                      isDescending: e.key === 'desc',
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
            {getListLocationParam.isDescending && <SortDescendingOutlined />}
            {!getListLocationParam.isDescending && <SortAscendingOutlined />}
          </Button>
        </Dropdown>
        <Select
          defaultValue=""
          value={getListLocationParam.orderBy}
          onChange={(e) => {
            this.setLocationsTableLoading(true)
              .then(() => {
                this.callGetListLocations({
                  orderBy: e,
                }).then(() => {
                  this.setLocationsTableLoading(false);
                });
              })
              .catch(() => {
                this.setLocationsTableLoading(false);
              });
          }}
        >
          <Select.Option value="">Default</Select.Option>
          <Select.Option value="createDate">Create Date</Select.Option>
        </Select>
      </Space>
    );
  }
}
export default connect((state: any) => ({ ...state }))(LocationTableHeaderComponent);
