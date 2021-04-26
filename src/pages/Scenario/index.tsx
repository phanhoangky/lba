import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Drawer, Modal, Row, Space, Table, Tooltip } from 'antd';
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
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import { AddNewScenarioFormModal } from './components/AddNewScenarioFormModal';
import { ScenarioTableHeaderComponent } from './components/ScenarioTableHeaderComponent';
import { ViewScenarioDetailComponent } from './components/ViewScenarioDetailComponent';
import moment from 'moment';
import { EditScenarioFormDrawer } from './components/EditScenarioFormDrawer';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  EditFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { openNotification } from '@/utils/utils';
import styles from './index.less';

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
    // this.setViewScenarioDetailComponent({
    //   isLoading: true,
    // });
    this.setTableLoading(true)
      .then(async () => {
        // this.readJWT().catch((error) => {
        //   openNotification('error', 'Error', error.message);
        // });
        Promise.all([this.callGetListScenario(), this.callGetListLayout()]).then(() => {
          // const { listScenario } = this.props.scenarios;
          // const first = listScenario && listScenario.length > 0 ? listScenario[0] : null;
          // if (first) {
          //   this.setSelectedScenario(first).then(() => {
          //     this.viewScenarioDetailComponentRef.current?.componentDidMount();
          //   });
          // }
          this.setTableLoading(false);
          // this.setViewScenarioDetailComponent({
          //   isLoading: false,
          // });
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occured', error);
        this.setTableLoading(false);
        // this.setViewScenarioDetailComponent({
        //   isLoading: false,
        // });
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

  // updateScenario = async (updateScenarioParam: UpdateScenarioParam) => {
  //   await this.setEditScenariosDrawer({
  //     visible: false,
  //   });

  //   await this.setTableLoading(true);
  //   this.props
  //     .dispatch({
  //       type: 'scenarios/updateScenario',
  //       payload: updateScenarioParam,
  //     })
  //     .then(() => {
  //       this.callGetListScenario().then(() => {
  //         this.setTableLoading(false);
  //       });
  //     })
  //     .catch(() => {
  //       this.setTableLoading(false);
  //     });
  // };

  removeScenario = async (id: string) => {
    await this.props.dispatch({
      type: 'scenarios/removeScenario',
      payload: id,
    });

    // .then(() => {
    //   this.callGetListScenario().then(() => {
    //     this.setTableLoading(false);
    //   });
    // })
    // .catch(() => {
    //   this.setTableLoading(false);
    // });
  };
  handleRemoveScenario = async (record: any) => {
    Modal.confirm({
      centered: true,
      closable: false,
      icon: <ExclamationCircleOutlined />,
      title: `Are you sure you want to remove playlist ${record.title}`,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      onOk: () => {
        this.setTableLoading(true).then(() => {
          this.removeScenario(record.id)
            .then(() => {
              this.callGetListScenario().then(() => {
                openNotification('success', 'Remove Scenario Successful', record.title);
                this.setTableLoading(false);
              });
            })
            .catch((error) => {
              openNotification('error', 'Fail to remove scenario', error.message);
            });
        });
      },
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
  addNewScenarioFormRef = React.createRef<AddNewScenarioFormModal>();
  editScenarioModalRef = React.createRef<EditScenarioFormDrawer>();
  render() {
    const {
      getListScenarioParam,
      totalItem,
      listScenario,
      tableLoading,
      viewScenarioDetailComponent,
      addNewScenarioModal,
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
          <Col span={24}>
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
                      visible: true,
                    })
                      .then(() => {
                        const clone = cloneDeep(item);
                        this.setSelectedScenario(clone).then(async () => {
                          this.clearAreas();
                          this.clearSelectedPlaylistItems();

                          this.setViewScenarioDetailComponent({
                            isLoading: false,
                          }).then(() => {
                            this.viewScenarioDetailComponentRef.current?.componentDidMount();
                          });
                        });
                      })
                      .catch(() => {
                        this.setViewScenarioDetailComponent({
                          isLoading: false,
                          visible: false,
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
                title="Modify Time"
                key="modifyTime"
                render={(record: Scenario) => {
                  if (record.modifyTime) {
                    return <>{moment(record.modifyTime).format('YYYY-MM-DD')}</>;
                  }
                  return <>Not modify yet</>;
                }}
              ></Column>
              <Column
                title="Layout"
                key="layout"
                ellipsis={true}
                render={(record: Scenario) => {
                  return (
                    <>
                      <Tooltip placement="top" title={record.layout.title}>
                        {record.layout.title}
                      </Tooltip>
                    </>
                  );
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
                            this.setEditScenariosDrawer({
                              visible: true,
                            }).then(async () => {
                              this.clearAreas();
                              this.editScenarioModalRef.current?.componentDidMount();
                              this.clearSelectedPlaylistItems();
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
                          this.handleRemoveScenario(record);
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
        </Row>
        <Drawer
          title="Scenario Detail"
          closable={false}
          destroyOnClose={true}
          visible={viewScenarioDetailComponent?.visible}
          width={'40%'}
          onClose={() => {
            this.setViewScenarioDetailComponent({
              visible: false,
            });
          }}
        >
          <ViewScenarioDetailComponent ref={this.viewScenarioDetailComponentRef} {...this.props} />
        </Drawer>
        {/* Add New Scenario Modal */}
        <Modal
          title="Create New Scenario Layout"
          visible={addNewScenarioModal?.visible}
          confirmLoading={addNewScenarioModal?.isLoading}
          closable={false}
          width={'50%'}
          centered
          className={styles.addNewScenarioModal}
          destroyOnClose={true}
          onCancel={() => {
            this.setAddNewScenarioModal({
              visible: false,
              isLoading: false,
              currentStep: 0,
            }).then(() => {
              this.addNewScenarioFormRef.current?.clearListScenarioLayouts();
            });
          }}
          footer={false}
          // okButtonProps={{
          //   disabled: listLayouts?.every((layouts) => !layouts.isSelected),
          //   className: 'lba-btn',
          //   icon: <CheckCircleFilled className="lba-icon" />,
          // }}
          // cancelButtonProps={{
          //   icon: <CloseCircleFilled className="lba-close-icon" />,
          //   danger: true,
          // }}
          // onOk={async () => {
          //   if (addNewScenarioModal?.currentStep === 0) {
          //     this.formRef.current?.validateFields().then((values) => {
          //       this.onCreateScenarios(values).catch((error) => {
          //         openNotification('error', 'Fail to Create Scenario', error.message);
          //       });
          //       // this.setAddNewScenarioModal({
          //       //   currentStep: 1,
          //       // });
          //     });
          //   }
          // }}
        >
          <AddNewScenarioFormModal ref={this.addNewScenarioFormRef} {...this.props} />
        </Modal>

        {/* Edit Scenario Drawer */}
        <EditScenarioFormDrawer ref={this.editScenarioModalRef} {...this.props} />
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ScenarioScreen);
