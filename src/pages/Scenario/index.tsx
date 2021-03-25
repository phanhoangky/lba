import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
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
import { EditScenarioComponent } from './components/EditScenarioComponent';

type ScenarioProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class Scenario extends React.Component<ScenarioProps> {
  componentDidMount = async () => {
    this.setTableLoading(true)
      .then(() => {
        Promise.all([this.callGetListScenario(), this.callGetListLayout()]).then(async () => {
          this.readJWT();
          this.setTableLoading(false);
        });
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
      payload: '',
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

  editScenarioComponentRef = React.createRef<EditScenarioComponent>();
  render() {
    const { getListScenarioParam, totalItem, listScenario, tableLoading } = this.props.scenarios;

    return (
      <PageContainer>
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
                    this.setEditScenariosDrawer({
                      isLoading: true,
                    })
                      .then(() => {
                        const clone = cloneDeep(item);
                        this.setSelectedScenario(clone).then(async () => {
                          this.clearAreas();
                          this.setEditScenariosDrawer({
                            visible: true,
                            isLoading: false,
                          });
                          this.editScenarioComponentRef.current?.componentDidMount();
                          this.clearSelectedPlaylistItems();
                        });
                      })
                      .catch(() => {
                        this.setEditScenariosDrawer({
                          isLoading: false,
                        });
                      });
                  },
                };
              }}
            >
              <Column dataIndex="title" title="Title" key="title"></Column>
              <Column dataIndex="createTime" title="Create Time" key="createTime"></Column>
            </Table>
          </Col>
          <Col span={14}>
            <EditScenarioComponent ref={this.editScenarioComponentRef} {...this.props} />
          </Col>
        </Row>

        {/* Add New Scenario Modal */}

        <AddNewScenarioFormModal {...this.props} />

        {/* Edit Scenario Drawer */}

        {/* {editScenarioDrawer?.visible && <EditScenarioFormDrawer {...this.props} />} */}
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(Scenario);
