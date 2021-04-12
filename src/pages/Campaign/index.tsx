import type {
  DeleteCampaignParam,
  UpdateCampaignParam,
} from '@/services/CampaignService/CampaignService';
import { CAMPAIGN_STATUS } from '@/services/CampaignService/CampaignService';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import { openNotification } from '@/utils/utils';
import {
  CaretRightOutlined,
  DeleteTwoTone,
  ExclamationCircleOutlined,
  EyeFilled,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Modal, Space, Switch, Table, Tag } from 'antd';
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
import { ViewCampaignDetailDrawer } from './components/ViewCampaignDetailDrawer';

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
        this.readJWT();
        Promise.all([
          this.callGetListCampaigns(),
          this.callGetListDeviceTypes(),
          this.callGetListScenario(),
          this.callGetListLocations(),
          this.callGetFee(),
        ]).then(async () => {
          this.setGetListCampaignParam({
            id: undefined,
          });
          this.setCampaignTableLoading(false);
        });
      })
      .catch((error) => {
        Promise.reject(error);
        this.setCampaignTableLoading(false);
      });
  };

  setListScenarios = async (list: any) => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: list,
    });
  };

  setGetListCampaignParam = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setGetListCampaignParamReducer`,
      payload: {
        ...this.props.campaign.getListCampaignParam,
        ...param,
      },
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
  };

  deleteCampaignConfirm = async (item: Campaign) => {
    Modal.confirm({
      title: `Do you want to delete ${item.name} ?`,
      icon: <ExclamationCircleOutlined />,
      closable: false,
      centered: true,
      onOk: () => {
        this.setCampaignTableLoading(true)
          .then(async () => {
            const { currentUser } = this.props.user;

            if (currentUser) {
              const result = await currentUser.ether?.cancelCampaign(item.id);
              if (isObject(result)) {
                const deleteParam: DeleteCampaignParam = {
                  id: item.id,
                  hash: result.hash,
                  value: result.feeCancel,
                };
                this.deleteCampaign(deleteParam)
                  .then(async () => {
                    openNotification(
                      'success',
                      'Delete campaign successfully',
                      `${item.name} was deleted`,
                    );
                    this.callGetListCampaigns().then(() => {
                      this.setCampaignTableLoading(false);
                    });
                  })
                  .catch((error) => {
                    Promise.reject(error);
                    openNotification('error', 'Fail to delete campaign', error);
                    this.setCampaignTableLoading(false);
                  });
              } else {
                openNotification('error', 'Fail to delete campaign', result);
                this.setCampaignTableLoading(false);
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
        if (mapComponent?.map) {
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
    this.setLoadingCampaignRecord(item, true)
      .then(() => {
        const updateParam: UpdateCampaignParam = {
          id: item.id,
          status,
          isActive: item.isActive,
          name: item.name,
        };
        this.updateCampaign(updateParam)
          .then(async () => {
            openNotification('success', 'Update Campaign Successfully', `${item.name} was updated`);
            this.callGetListCampaigns().then(() => {
              this.setLoadingCampaignRecord(item, false);
            });
          })
          .catch((error) => {
            openNotification('error', 'Fail to update campaign', error);
            this.setLoadingCampaignRecord(item, false);
            Promise.reject(error);
          });
      })
      .catch(() => {
        this.setLoadingCampaignRecord(item, false);
      });
  };

  setLoadingCampaignRecord = async (item: any, isLoading: boolean) => {
    const { listCampaign } = this.props.campaign;
    const newList = listCampaign?.map((campaign) => {
      if (campaign.id === item.id) {
        return {
          ...campaign,
          isLoading,
        };
      }
      return campaign;
    });
    this.setListCampaigns(newList);
  };

  setListCampaigns = async (list: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setListCampaignReducer`,
      payload: list,
    });
  };

  setViewCampaignDetailComponent = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setViewCampaignDetailComponentReducer`,
      payload: {
        ...this.props.campaign.viewCampaignDetailComponent,
        ...param,
      },
    });
  };
  addNewModalRef = React.createRef<AddNewCampaignModal>();

  viewCampaignDetailRef = React.createRef<ViewCampaignDetailDrawer>();
  render() {
    const {
      listCampaign,
      campaignsTableLoading,
      getListCampaignParam,
      totalCampaigns,
      addNewCampaignModal,
      createCampaignParam,
    } = this.props.campaign;

    const disabledOkButton = createCampaignParam?.scenarioId === '';
    return (
      <>
        <PageContainer
          title={false}
          header={{
            ghost: false,
            style: {
              padding: 0,
            },
          }}
        >
          <Table
            dataSource={listCampaign}
            scroll={{
              x: 1000,
              y: 400,
            }}
            loading={campaignsTableLoading}
            pagination={{
              current: getListCampaignParam?.pageNumber ? getListCampaignParam.pageNumber + 1 : 1,
              pageSize: getListCampaignParam?.pageLimitItem
                ? getListCampaignParam?.pageLimitItem
                : 5,
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
            <Column key="name" dataIndex="name" title="Name"></Column>
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
            <Column
              key="budget"
              title="Budget"
              render={(record: Campaign) => {
                return <>{record.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}</>;
              }}
            ></Column>
            <Column
              key="activity"
              title="Activity"
              render={(record: Campaign) => {
                const now = moment();
                const diffStart = now.diff(record.startDate);
                const diffEnd = now.diff(record.endDate);

                return (
                  <>
                    {diffStart > 0 && diffEnd < 0 && (
                      <Tag color={'cyan'} key={'running'}>
                        RUNNING
                      </Tag>
                    )}
                    {diffEnd > 0 && (
                      <Tag color={'red'} key={'ended'}>
                        ENDED
                      </Tag>
                    )}
                    {diffStart < 0 && (
                      <Tag color={'gold'} key={'notstart'}>
                        NOT START
                      </Tag>
                    )}
                  </>
                );
              }}
            ></Column>
            <Column
              key="status"
              title="Status"
              render={(record) => {
                return (
                  <>
                    <Switch
                      checked={record.status === 0}
                      loading={record.isLoading}
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
                        type="primary"
                        onClick={() => {
                          this.setSelectedCampaign(record).then(() => {
                            this.setLocationAddressInMap(record).then(() => {
                              this.setEditCampaignDrawer({
                                visible: true,
                              }).then(() => {
                                this.viewCampaignDetailRef.current?.componentDidMount();
                              });
                            });
                          });
                        }}
                      >
                        <EyeFilled />
                      </Button>
                      <Button
                        danger
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

          {/* Add New Campaign Modal */}
          <Modal
            width="65%"
            title="Add New Campaign"
            visible={addNewCampaignModal?.visible}
            centered
            destroyOnClose={true}
            confirmLoading={addNewCampaignModal?.isLoading}
            closable={false}
            afterClose={() => {
              this.addNewModalRef.current?.handleAfterClose();
            }}
            okButtonProps={{
              disabled: disabledOkButton,
            }}
            onOk={() => {
              // this.okConfirm();
              this.addNewModalRef.current?.finalConfirmModal();
            }}
            onCancel={() => {
              this.setAddNewCampaignModal({
                visible: false,
              });
              this.addNewModalRef.current?.handleAfterClose();
            }}
          >
            {addNewCampaignModal?.visible && (
              <AddNewCampaignModal {...this.props} ref={this.addNewModalRef} />
            )}
          </Modal>
          {/* End Add New Campaign Modal */}

          <ViewCampaignDetailDrawer ref={this.viewCampaignDetailRef} {...this.props} />
        </PageContainer>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(CampaignScreen);
