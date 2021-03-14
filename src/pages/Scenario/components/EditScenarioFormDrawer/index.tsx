import type { UpdateScenarioParam } from '@/services/ScenarioService/ScenarioService';
import { DeleteTwoTone, EyeTwoTone, UploadOutlined } from '@ant-design/icons';
import { Button, Drawer, Space, Form, Input, Image, Divider, Row, Col, List } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type {
  Area,
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioItem,
  ScenarioModelState,
  UserTestModelState,
} from 'umi';
import { connect } from 'umi';
import { sortArea } from '@/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import SelectPlaylistDrawer from '../SelectPlaylistDrawer';
import ReactPlayer from 'react-player';

export type EditScenarioFormDrawerProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  userTest: UserTestModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class EditScenarioFormDrawer extends React.Component<EditScenarioFormDrawerProps> {
  componentDidMount() {
    const { selectedSenario } = this.props.scenarios;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedSenario.title,
        description: selectedSenario.description,
      });
    }
    this.ratioCalculation();
  }

  componentDidUpdate() {
    this.ratioCalculation();
  }

  ratioCalculation = () => {
    const element = document.getElementById('areaWrapper');
    if (element) {
      const width = element?.clientWidth;

      const height = (width * 9) / 16;
      element.style.height = `${height}px`;
      // console.log('====================================');
      // console.log('Calculated >>>', height, element);
      // console.log('====================================');
    }
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

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'scenarios/setTableLoadingReducer',
      payload: loading,
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

  setEditScenariosDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setEditScenarioDrawerReducer',
      payload: {
        ...this.props.scenarios.editScenarioDrawer,
        ...modal,
      },
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

  setPlaylistDrawer = async (payload: any) => {
    await this.props.dispatch({
      type: 'scenarios/setPlaylistsDrawerReducer',
      payload: {
        ...this.props.scenarios.playlistsDrawer,
        ...payload,
      },
    });
  };

  setSelectedScenarios = async (item: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedScenarioReducer',
      payload: {
        ...this.props.scenarios.selectedSenario,
        ...item,
      },
    });
  };

  choosePlaylist = () => {
    const { selectedSenario, selectedArea, playlistsDrawer } = this.props.scenarios;

    const selectedPlaylist = playlistsDrawer.listPlaylists.filter((item) => item.isSelected)[0];

    const selectedScenarioItem = selectedSenario.scenarioItems.filter(
      (item) => item.area.id === selectedArea.id,
    );
    if (selectedScenarioItem.length > 0) {
      this.setSelectedScenarios({
        scenarioItems: selectedSenario.scenarioItems.map((item) => {
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

      selectedSenario.scenarioItems.push(newScenarioItem);
      this.setSelectedScenarios({
        scenarioItems: selectedSenario.scenarioItems,
      });
    }
    this.setPlaylistDrawer({
      visible: false,
    });
  };

  checkAreaIsUsed = (area: Area) => {
    const { selectedSenario } = this.props.scenarios;
    const scenarioItems = selectedSenario.scenarioItems.filter((s) => s.area.id === area.id);
    if (scenarioItems.length > 0) {
      return scenarioItems[0];
    }
    return null;
  };

  setSelectedArea = async (payload: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedAreaReducer',
      payload: {
        ...this.props.scenarios.selectedArea,
        ...payload,
      },
    });
  };

  setHoverScenarioItem = async (item: ScenarioItem, hover: boolean) => {
    const { selectedSenario } = this.props.scenarios;

    await this.setSelectedScenarios({
      scenarioItems: selectedSenario.scenarioItems.map((s) => {
        if (s.id === item.id) {
          return {
            ...s,
            isHover: hover,
          };
        }
        return s;
      }),
    });
  };

  removeScenarioItems = async (item: ScenarioItem) => {
    const { selectedSenario } = this.props.scenarios;

    await this.setSelectedScenarios({
      scenarioItems: selectedSenario.scenarioItems.filter((s) => s.id !== item.id),
    });
  };

  callGetItemsByPlaylistId = async (params: any) => {
    await this.props.dispatch({
      type: 'playlists/getItemsByPlaylist',
      payload: {
        ...this.props.playlists.getItemsByPlaylistIdParam,
        ...params,
      },
    });
  };

  setSelectedPlaylist = async (modal: any) => {
    const { selectedPlaylist } = this.props.playlists;

    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistReducer',
      payload: {
        ...selectedPlaylist,
        ...modal,
      },
    });
  };

  getSelectedPlaylistItem = () => {
    const { selectedPlaylistItems } = this.props.playlists;

    const result = selectedPlaylistItems.filter((p) => p.isSelected);
    if (result.length > 0) {
      return result[0];
    }

    return null;
  };

  renderPreviewMedia = () => {
    const selectedPlaylistItem = this.getSelectedPlaylistItem();
    if (selectedPlaylistItem) {
      if (selectedPlaylistItem.typeName === 'Image') {
        return (
          <>
            <Image src={selectedPlaylistItem.url} loading="lazy" />
          </>
        );
      }

      if (selectedPlaylistItem.typeName === 'Video') {
        return (
          <>
            <ReactPlayer url={selectedPlaylistItem.url} controls={true} width={'100%'} />
          </>
        );
      }
    }
    return null;
  };

  formRef = React.createRef<FormInstance<any>>();
  render() {
    const { editScenarioDrawer, selectedSenario, playlistsDrawer } = this.props.scenarios;
    const { selectedPlaylistItems, selectedPlaylist } = this.props.playlists;
    return (
      <Drawer
        visible={editScenarioDrawer.visible}
        destroyOnClose={true}
        getContainer={false}
        afterVisibleChange={() => {
          this.clearSelectedPlaylistItems();
        }}
        closable={false}
        footer={
          <>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  danger
                  onClick={() => {
                    this.removeScenario(selectedSenario.id);
                  }}
                >
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    if (this.formRef.current) {
                      this.formRef.current.validateFields().then((values) => {
                        const updateParam: UpdateScenarioParam = {
                          description: selectedSenario.description,
                          id: selectedSenario.id,
                          layoutId: selectedSenario.layoutId,
                          scenarioItems: selectedSenario.scenarioItems.map((item) => {
                            return {
                              id: item.id,
                              areaId: item.area.id,
                              audioArea: item.audioArea,
                              displayOrder: item.displayOrder,
                              isActive: item.isActive,
                              playlistId: item.playlist.id,
                              scenarioId: selectedSenario.id,
                            };
                          }),
                          title: selectedSenario.title,
                          ...values,
                        };

                        this.updateScenario(updateParam);
                      });
                    }
                  }}
                >
                  Save Change
                </Button>
              </Space>
            </div>
          </>
        }
        onClose={() => {
          this.setEditScenariosDrawer({
            visible: false,
          });
        }}
        width={'80%'}
      >
        {/* <EditScenarioDrawer {...this.props} /> */}
        <Form name="edit_scenario_form" layout="vertical" ref={this.formRef}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
        {/* AREA */}
        <div
          id="areaWrapper"
          style={{
            display: 'flex',
            width: '50%',
            boxSizing: 'border-box',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {sortArea(selectedSenario.layout.areas).map((area) => {
            const scenarioItem = this.checkAreaIsUsed(area);
            return (
              <div
                key={area.id}
                style={{
                  flex: `${area.width * 100}%`,
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: `${area.height * 100}%`,
                  textAlign: 'center',
                  border: `1px solid black`,
                  transition: 'ease',
                  transitionDuration: '1s',
                }}
                onDoubleClick={async () => {
                  this.setSelectedArea(area).then(() => {
                    this.setPlaylistDrawer({
                      visible: true,
                    });
                  });
                }}
              >
                {scenarioItem ? (
                  <div
                    onMouseOver={() => {
                      const item = scenarioItem;
                      if (item) {
                        this.setHoverScenarioItem(item, true);
                      }
                    }}
                    onMouseLeave={() => {
                      const item = scenarioItem;
                      if (item) {
                        this.setHoverScenarioItem(item, false);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {scenarioItem.playlist.title}
                    {scenarioItem.isHover ? (
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          top: 0,
                          left: 0,
                          backgroundColor: `rgba(30, 30, 30, 0.5)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Space>
                          <DeleteTwoTone
                            style={{
                              fontSize: '2em',
                            }}
                            twoToneColor="#f93e3e"
                            onClick={() => {
                              this.removeScenarioItems(scenarioItem);
                            }}
                          />

                          <EyeTwoTone
                            style={{
                              fontSize: '2em',
                            }}
                            onClick={() => {
                              this.setEditScenariosDrawer({
                                playlistLoading: true,
                              })
                                .then(() => {
                                  this.callGetItemsByPlaylistId({
                                    id: scenarioItem.playlist.id,
                                  }).then(() => {
                                    this.setSelectedPlaylist(scenarioItem.playlist).then(() => {
                                      this.setEditScenariosDrawer({
                                        playlistLoading: false,
                                      });
                                    });
                                  });
                                })
                                .catch(() => {
                                  this.setEditScenariosDrawer({
                                    playlistLoading: false,
                                  });
                                });
                            }}
                          />
                        </Space>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                ) : (
                  <UploadOutlined />
                )}
              </div>
            );
          })}
        </div>
        {/* END AREA */}

        <Divider></Divider>
        <Row gutter={20}>
          <Col span={12}> {this.renderPreviewMedia()} </Col>
          <Col span={12}>
            {selectedPlaylist ? (
              <>
                <Row>
                  <Col span={10}>Title</Col>
                  <Col span={14}>{selectedPlaylist.title}</Col>
                </Row>
                <Row>
                  <Col span={10}>Description</Col>
                  <Col span={14}>{selectedPlaylist.description}</Col>
                </Row>
                <Divider />
                <List
                  dataSource={selectedPlaylistItems}
                  loading={editScenarioDrawer.playlistLoading}
                  renderItem={(item) => {
                    return (
                      <>
                        <List.Item
                          key={item.id}
                          style={item.isSelected ? { backgroundColor: '#424ef5' } : {}}
                          onClick={() => {
                            this.setSelectedPlaylistItems(
                              selectedPlaylistItems.map((p) => {
                                if (p.id === item.id) {
                                  return {
                                    ...p,
                                    isSelected: true,
                                  };
                                }
                                return {
                                  ...p,
                                  isSelected: false,
                                };
                              }),
                            );
                          }}
                        >
                          <List.Item.Meta title={item.title} description={item.typeName} />
                        </List.Item>
                      </>
                    );
                  }}
                ></List>
              </>
            ) : (
              ''
            )}
          </Col>
        </Row>

        {/** Select Playlist Drawer */}

        <Drawer
          title="Playlist"
          width={`80%`}
          closable={false}
          destroyOnClose={true}
          afterVisibleChange={() => {
            this.clearSelectedPlaylistItems();
          }}
          onClose={() => {
            this.setPlaylistDrawer({
              visible: false,
            });
          }}
          visible={playlistsDrawer.visible}
          footer={
            <>
              <div style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={async () => this.choosePlaylist()}>
                  Choose Playlist
                </Button>
              </div>
            </>
          }
        >
          <SelectPlaylistDrawer {...this.props} />
        </Drawer>
      </Drawer>
    );
  }
}
export default connect((state) => ({ ...state }))(EditScenarioFormDrawer);
