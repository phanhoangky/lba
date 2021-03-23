import type {
  DeleteCampaignParam,
  UpdateCampaignParam,
} from '@/services/CampaignService/CampaignService';
import { CAMPAIGN_STATUS } from '@/services/CampaignService/CampaignService';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import {
  CaretRightOutlined,
  DeleteTwoTone,
  ExclamationCircleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, Switch, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import { isObject } from 'lodash';
import moment from 'moment';
import * as React from 'react';
import type {
  Campaign,
  CampaignModelState,
  DeviceModelState,
  Dispatch,
  LocationModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../Location';
import { AddNewCampaignModal } from './components/AddNewCampaignModalComponent/AddNewCampaignModal';
import { CampaignTableHeaderComponent } from './components/CampaignTableHeaderComponent';
import ViewCampaignDetailDrawer from './components/ViewCampaignDetailDrawer';

export type CampaignScreenProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
  location: LocationModelState;
  user: UserModelState;
};

export const CAMPAIGN = 'campaign';

export class CampaignScreen extends React.Component<CampaignScreenProps> {
  componentDidMount = () => {
    this.setCampaignTableLoading(true)
      .then(async () => {
        Promise.all([
          this.callGetListCampaigns(),
          this.callGetListDeviceTypes(),
          this.callGetListScenario(),
          this.callGetListLocations(),
          this.readJWT(),
          this.callGetFee(),
        ]).then(() => {
          this.setCampaignTableLoading(false);
        });
      })
      .catch(() => {
        this.setCampaignTableLoading(false);
      });
  };

  setListScenarios = async (list: any) => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: list,
    });
  };

  callGetFee = async () => {
    const res = await this.props.dispatch({
      type: `${CAMPAIGN}/getListFee`,
      payload: {},
    });
    await this.setAddNewCampaignModal({
      fees: res.result,
    });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  callGetListCampaigns = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/getListCampaigns`,
      payload: {
        ...this.props.campaign.getListCampaignParam,
        ...param,
      },
    });
  };

  callGetListDeviceTypes = async () => {
    await this.props.dispatch({
      type: `deviceStore/getDeviceType`,
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

  setCampaignTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCampaignTableLoadingReducer`,
      payload: loading,
    });
  };

  callGetListScenario = async (param?: any) => {
    this.props.dispatch({
      type: 'scenarios/getListScenarios',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  setAddNewCampaignModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setAddNewCampaignModalReducer`,
      payload: {
        ...this.props.campaign.addNewCampaignModal,
        ...modal,
      },
    });
  };

  deleteCampaign = async (param: DeleteCampaignParam) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/deleteCampaign`,
      payload: param,
    });
    console.log('====================================');
    console.log(param);
    console.log('====================================');
  };

  deleteCampaignConfirm = async (item: Campaign) => {
    Modal.confirm({
      title: `Do you want to delete this Campaign ?`,
      icon: <ExclamationCircleOutlined />,
      closable: false,
      centered: true,
      onOk: () => {
        this.setCampaignTableLoading(true)
          .then(async () => {
            const { currentUser } = this.props.user;

            if (currentUser) {
              const result = await currentUser.ether?.cancelCampaign(item.id);
              console.log('====================================');
              console.log(result);
              if (isObject(result)) {
                const deleteParam: DeleteCampaignParam = {
                  id: item.id,
                  hash: result.hash,
                  value: result.feeCancel,
                };
                console.log('====================================');
                console.log(result);
                console.log(deleteParam);
                console.log('====================================');
                this.deleteCampaign(deleteParam).then(() => {
                  this.callGetListCampaigns().then(() => {
                    this.setCampaignTableLoading(false);
                  });
                });
              }
            }
          })
          .catch(() => {
            this.setCampaignTableLoading(false);
          });
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };
  setSelectedCampaign = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setSelectedCampaignReducer`,
      payload: {
        ...this.props.campaign.selectedCampaign,
        ...param,
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

  setLocationAddressInMap = async (item: any) => {
    if (item.longitude !== '' && item.latitude !== '') {
      const { mapComponent } = this.props.location;

      const lat = Number.parseFloat(item.location.split('-')[0]);
      const lng = Number.parseFloat(item.location.split('-')[1]);

      const { data } = await reverseGeocoding(lat, lng);

      this.setSelectedCampaign({
        address: data.display_name,
      }).then(() => {
        if (mapComponent.map) {
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
      });
    }
  };

  setEditCampaignDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setEditCampaignReducer`,
      payload: {
        ...this.props.campaign.editCampaignDrawer,
        ...modal,
      },
    });
  };

  updateCampaign = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/updateCampaign`,
      payload: param,
    });
  };

  handleChangeStatusCampaign = async (item: any, status: number) => {
    this.setCampaignTableLoading(true)
      .then(() => {
        const updateParam: UpdateCampaignParam = {
          id: item.id,
          status,
        };
        this.updateCampaign(updateParam).then(() => {
          this.callGetListCampaigns();
          this.setCampaignTableLoading(false);
        });
      })
      .catch(() => {
        this.setCampaignTableLoading(false);
      });
  };

  addNewModalRef = React.createRef<AddNewCampaignModal>();
  render() {
    const {
      listCampaign,
      campaignsTableLoading,
      getListCampaignParam,
      totalCampaigns,
      addNewCampaignModal,
    } = this.props.campaign;
    return (
      <>
        <PageContainer>
          <Table
            dataSource={listCampaign}
            scroll={{
              x: 1000,
              y: 400,
            }}
            loading={campaignsTableLoading}
            pagination={{
              current: getListCampaignParam.pageNumber + 1,
              pageSize: getListCampaignParam.pageLimitItem,
              total: totalCampaigns,
              onChange: async (e) => {
                this.setCampaignTableLoading(true)
                  .then(() => {
                    this.callGetListCampaigns({
                      pageNumber: e - 1,
                    }).then(() => {
                      this.setCampaignTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setCampaignTableLoading(false);
                  });
              },
            }}
            title={() => <CampaignTableHeaderComponent {...this.props} />}
          >
            <Column key="description" dataIndex="description" title="Description"></Column>
            <Column
              align="center"
              key="dateRange"
              title="From-To"
              render={(text, record: Campaign) => {
                return (
                  <>
                    {moment(record.startDate).format('YYYY/MM/DD')}
                    <CaretRightOutlined />
                    {moment(record.endDate).format('YYYY/MM/DD')}
                  </>
                );
              }}
            ></Column>
            <Column key="budget" dataIndex="budget" title="Budget"></Column>
            <Column
              key="status"
              title="Status"
              render={(record) => {
                return (
                  <>
                    <Switch
                      checked={record.status === 0}
                      onChange={(e) => {
                        this.handleChangeStatusCampaign(
                          record,
                          e ? CAMPAIGN_STATUS.CREATE : CAMPAIGN_STATUS.PAUSE,
                        );
                      }}
                    ></Switch>
                  </>
                );
              }}
            ></Column>
            <Column
              key="action"
              title="Action"
              fixed="right"
              width={200}
              render={(text, record: Campaign) => {
                return (
                  <>
                    <Space align={'center'}>
                      <Button
                        onClick={() => {
                          this.setSelectedCampaign(record).then(() => {
                            this.setLocationAddressInMap(record).then(() => {
                              this.setEditCampaignDrawer({
                                visible: true,
                              });
                            });
                          });
                        }}
                      >
                        <EyeTwoTone />
                      </Button>
                      <Button
                        onClick={() => {
                          this.deleteCampaignConfirm(record);
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
          <Modal
            width="80%"
            title="Add New Campaign"
            visible={addNewCampaignModal.visible}
            centered
            destroyOnClose={true}
            confirmLoading={addNewCampaignModal.isLoading}
            closable={false}
            afterClose={() => {
              this.addNewModalRef.current?.handleAfterClose();
            }}
            onOk={() => {
              // this.okConfirm();
              this.addNewModalRef.current?.okConfirm();
            }}
            onCancel={() => {
              this.setAddNewCampaignModal({
                visible: false,
              });
            }}
          >
            {addNewCampaignModal.visible && (
              <AddNewCampaignModal {...this.props} ref={this.addNewModalRef} />
            )}
          </Modal>
          <ViewCampaignDetailDrawer {...this.props} />
        </PageContainer>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(CampaignScreen);
