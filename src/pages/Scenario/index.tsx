import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Empty, Row, Space, Table, Typography } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  Scenario,
  ScenarioItem,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
// import AddNewScenarioModal from './components/AddNewScenarioModal';
// import EditScenarioDrawer from './components/EditScenarioDrawer';
// import SelectPlaylistDrawer from './components/SelectPlaylistDrawer';
import { v4 as uuidv4 } from 'uuid';
import type { UpdateScenarioParam } from '@/services/ScenarioService/ScenarioService';
import { cloneDeep } from 'lodash';
import AddNewScenarioFormModal from './components/AddNewScenarioFormModal';
// import EditScenarioFormDrawer from './components/EditScenarioFormDrawer';
import { ScenarioTableHeaderComponent } from './components/ScenarioTableHeaderComponent';
import { ViewScenarioDetailComponent } from './components/ViewScenarioDetailComponent';
import moment from 'moment';
import { EditScenarioFormDrawer } from './components/EditScenarioFormDrawer';
import { DeleteTwoTone, EditFilled } from '@ant-design/icons';

type ScenarioProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

export const SCENARIO_STORE = 'scenarios';
class ScenarioScreen extends React.Component<ScenarioProps> {
  componentDidMount = async () => {
    this.setViewScenarioDetailComponent({
      isLoading: true,
    });
    this.setTableLoading(true)
      .then(async () => {
        // this.readJWT();
        Promise.all([this.callGetListScenario(), this.callGetListLayout()]).then(() => {
          const { listScenario } = this.props.scenarios;
          const first = listScenario && listScenario.length > 0 ? listScenario[0] : null;
          if (first) {
            this.setSelectedScenario(first).then(() => {
              this.viewScenarioDetailComponentRef.current?.componentDidMount();
            });
          }
          this.setTableLoading(false);
          this.setViewScenarioDetailComponent({
            isLoading: false,
          });
        });
      })
      .catch(() => {
        this.setTableLoading(false);
        this.setViewScenarioDetailComponent({
          isLoading: false,
        });
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  callGetListScenario = async (param?: any) => {
    await this.props.dispatch({
      type: 'scenarios/getListScenarios',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  callGetListLayout = async (param?: any) => {
    this.props.dispatch({
      type: 'layouts/getLayouts',
      payload: {
        ...this.props.layouts.getListLayoutParam,
        ...param,
      },
    });
  };

  setGetListScenarioParam = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setGetListScenarioParamReducer',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...modal,
      },
    });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'scenarios/setTableLoadingReducer',
      payload: loading,
    });
  };

  setAddNewScenarioModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setAddNewScenarioModalReducer',
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  createNewScenario = async () => {
    await this.props.dispatch({
      type: 'scenarios/createScenario',
      payload: {
        ...this.props.scenarios.createScenarioParam,
      },
    });
  };

  setSelectedScenario = async (item: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedScenarioReducer',
      payload: {
        ...this.props.scenarios.selectedSenario,
        ...item,
      },
    });
  };

  setEditScenariosDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setEditScenarioDrawerReducer',
      payload: {
        ...this.props.scenarios.editScenarioDrawer,
        ...modal,
      },
    });
  };

  setPlaylistDrawer = async (payload: any) => {
    await this.props.dispatch({
      type: 'scenarios/setPlaylistsDrawerReducer',
      payload: {
        ...this.props.scenarios.playlistsDrawer,
        ...payload,
      },
    });
  };

  choosePlaylist = () => {
    const { selectedSenario, selectedArea, playlistsDrawer } = this.props.scenarios;

    const selectedPlaylist = playlistsDrawer?.listPlaylists.filter((item) => item.isSelected)[0];

    const selectedScenarioItem = selectedSenario?.scenarioItems.filter(
      (item) => item?.area?.id === selectedArea?.id,
    );
    if (selectedScenarioItem && selectedScenarioItem.length) {
      if (selectedScenarioItem.length > 0) {
        this.setSelectedScenario({
          scenarioItems: selectedSenario?.scenarioItems.map((item) => {
            if (selectedScenarioItem[0].id === item.id) {
              return {
                ...item,
                playlist: selectedPlaylist,
                scenario: selectedSenario,
              };
            }

            return item;
          }),
        });
      } else {
        const newScenarioItem: ScenarioItem = {
          area: selectedArea,
          audioArea: false,
          displayOrder: 1,
          id: uuidv4(),
          isActive: true,
          playlist: selectedPlaylist,
          scenario: selectedSenario,
        };

        selectedSenario?.scenarioItems.push(newScenarioItem);
        this.setSelectedScenario({
          scenarioItems: selectedSenario?.scenarioItems,
        });
      }
    }
    this.setPlaylistDrawer({
      visible: false,
    });
  };

  updateScenario = async (updateScenarioParam: UpdateScenarioParam) => {
    await this.setEditScenariosDrawer({
      visible: false,
    });

    await this.setTableLoading(true);
    this.props
      .dispatch({
        type: 'scenarios/updateScenario',
        payload: updateScenarioParam,
      })
      .then(() => {
        this.callGetListScenario().then(() => {
          this.setTableLoading(false);
        });
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  removeScenario = async (id: string) => {
    await this.setEditScenariosDrawer({
      visible: false,
    });

    await this.setTableLoading(true);
    this.props
      .dispatch({
        type: 'scenarios/removeScenario',
        payload: id,
      })
      .then(() => {
        this.callGetListScenario().then(() => {
          this.setTableLoading(false);
        });
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  setSelectedPlaylistItems = async (modal: any) => {
    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistItemsReducer',
      payload: modal,
    });
  };

  clearSelectedPlaylistItems = async () => {
    await this.setSelectedPlaylistItems([]);
  };

  clearAreas = async () => {
    const { selectedSenario } = this.props.scenarios;
    const newAreas = selectedSenario?.layout.areas.map((area) => {
      return {
        ...area,
        typeMediaName: undefined,
        urlPreview: undefined,
      };
    });
    await this.setSelectedScenario({
      layout: {
        ...selectedSenario?.layout,
        areas: newAreas,
      },
    });
  };

  setViewScenarioDetailComponent = async (param?: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setViewScenarioDetailComponentReducer`,
      payload: {
        ...this.props.scenarios.viewScenarioDetailComponent,
        ...param,
      },
    });
  };

  viewScenarioDetailComponentRef = React.createRef<ViewScenarioDetailComponent>();

  editScenarioModalRef = React.createRef<EditScenarioFormDrawer>();
  render() {
    const {
      getListScenarioParam,
      totalItem,
      listScenario,
      tableLoading,
      viewScenarioDetailComponent,
    } = this.props.scenarios;

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
          <Col span={10}>
            <Table
              dataSource={listScenario}
              loading={tableLoading}
              pagination={{
                current: getListScenarioParam?.pageNumber
                  ? getListScenarioParam?.pageNumber + 1
                  : 1,
                total: totalItem,
                onChange: async (e) => {
                  this.setGetListScenarioParam({
                    pageNumber: e - 1,
                  }).then(() => {
                    this.callGetListScenario();
                  });
                },
              }}
              title={() => {
                return (
                  <>
                    <ScenarioTableHeaderComponent {...this.props} />
                  </>
                );
              }}
              onRow={(item) => {
                return {
                  onClick: async () => {
                    this.setViewScenarioDetailComponent({
                      isLoading: true,
                    })
                      .then(() => {
                        const clone = cloneDeep(item);
                        this.setSelectedScenario(clone).then(async () => {
                          this.clearAreas();
                          this.clearSelectedPlaylistItems();

                          this.setViewScenarioDetailComponent({
                            visible: true,
                            isLoading: false,
                          }).then(() => {
                            this.viewScenarioDetailComponentRef.current?.componentDidMount();
                          });
                        });
                      })
                      .catch(() => {
                        this.setViewScenarioDetailComponent({
                          isLoading: false,
                        });
                      });
                  },
                };
              }}
            >
              <Column dataIndex="title" title="Title" key="title"></Column>
              <Column
                title="Create Time"
                key="createTime"
                render={(record: Scenario) => {
                  return <>{moment(record.createTime).format('YYYY-MM-DD')}</>;
                }}
              ></Column>
              <Column
                title="Action"
                key="action"
                render={(record) => {
                  return (
                    <Space>
                      <Button
                        onClick={(e) => {
                          const clone = cloneDeep(record);
                          this.setSelectedScenario(clone).then(() => {
                            this.setViewScenarioDetailComponent({
                              visible: false,
                            }).then(() => {
                              this.setEditScenariosDrawer({
                                visible: true,
                              }).then(async () => {
                                this.clearAreas();
                                this.editScenarioModalRef.current?.componentDidMount();
                                this.clearSelectedPlaylistItems();
                              });
                            });
                          });
                          e.stopPropagation();
                        }}
                        type="primary"
                      >
                        <EditFilled />
                      </Button>
                      <Button
                        danger
                        onClick={() => {
                          this.setTableLoading(true)
                            .then(() => {
                              this.editScenarioModalRef.current
                                ?.handleRemoveScenario(record)
                                .then(() => {
                                  this.setTableLoading(false);
                                });
                            })
                            .catch(() => {
                              this.setTableLoading(false);
                            });
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
          <Col span={14}>
            {viewScenarioDetailComponent?.visible && (
              <Typography.Title level={4} className="lba-text">
                Scenario Detail
              </Typography.Title>
            )}
            {viewScenarioDetailComponent?.visible && (
              <ViewScenarioDetailComponent
                ref={this.viewScenarioDetailComponentRef}
                {...this.props}
              />
            )}

            {!viewScenarioDetailComponent?.visible && (
              <Empty description={<>Preview Scenario Detail</>} />
            )}
          </Col>
        </Row>

        {/* Add New Scenario Modal */}

        <AddNewScenarioFormModal {...this.props} />

        {/* Edit Scenario Drawer */}

        {/* {editScenarioDrawer?.visible && <EditScenarioFormDrawer {...this.props} />} */}
        <EditScenarioFormDrawer ref={this.editScenarioModalRef} {...this.props} />
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ScenarioScreen);
