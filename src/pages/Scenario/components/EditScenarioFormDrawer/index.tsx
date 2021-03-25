import type { UpdateScenarioParam } from '@/services/ScenarioService/ScenarioService';
import { UploadOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Space,
  Form,
  Input,
  Image,
  Divider,
  Row,
  Col,
  Checkbox,
  Table,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type {
  Area,
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioItem,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { openNotification, sortArea } from '@/utils/utils';
import { v4 as uuidv4 } from 'uuid';
import SelectPlaylistDrawer from '../SelectPlaylistDrawer';
import ReactPlayer from 'react-player';
import Column from 'antd/lib/table/Column';

export type EditScenarioFormDrawerProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class EditScenarioFormDrawer extends React.Component<EditScenarioFormDrawerProps> {
  componentDidMount() {
    const { selectedSenario } = this.props.scenarios;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedSenario?.title,
        description: selectedSenario?.description,
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

  updateScenario = async (param: any) => {
    await this.props.dispatch({
      type: 'scenarios/updateScenario',
      payload: param,
    });
  };

  handleUpdateScenario = async (updateScenarioParam: UpdateScenarioParam) => {
    // await this.setEditScenariosDrawer({
    //   visible: false,
    // });

    this.setTableLoading(true)
      .then(() => {
        this.updateScenario(updateScenarioParam)
          .then(() => {
            openNotification(
              'success',
              'Edit Scenario Successfully',
              `Edit campaign ${updateScenarioParam.title} successfully`,
            );
            this.callGetListScenario().then(() => {
              this.setTableLoading(false);
            });
          })
          .catch((error) => {
            Promise.reject(error);
            openNotification(
              'error',
              'Fail to edit scenario',
              `Fail to edit scenario ${updateScenarioParam.title}`,
            );
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

  setSelectedScenario = async (item: any) => {
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

    const selectedPlaylist = playlistsDrawer?.listPlaylists.filter((item) => item.isSelected)[0];

    const selectedScenarioItem = selectedSenario?.scenarioItems.filter(
      (item) => item?.area?.id === selectedArea?.id,
    );
    if (selectedScenarioItem) {
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
          displayOrder: 0,
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

  checkAreaIsUsed = (area: Area) => {
    const { selectedSenario } = this.props.scenarios;
    const scenarioItems = selectedSenario?.scenarioItems.filter((s) => s?.area?.id === area.id);
    if (scenarioItems && scenarioItems.length) {
      if (scenarioItems.length > 0) {
        return scenarioItems[0];
      }
    }
    return undefined;
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

    await this.setSelectedScenario({
      scenarioItems: selectedSenario?.scenarioItems.map((s) => {
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

    await this.setSelectedScenario({
      scenarioItems: selectedSenario?.scenarioItems.filter((s) => s.id !== item.id),
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

  setAudioArea = async (id: string, checked: boolean) => {
    const { selectedSenario } = this.props.scenarios;
    await this.setSelectedScenario({
      scenarioItems: selectedSenario?.scenarioItems.map((scenarioItem) => {
        if (checked) {
          if (scenarioItem.id === id) {
            return {
              ...scenarioItem,
              audioArea: true,
            };
          }

          return {
            ...scenarioItem,
            audioArea: false,
          };
        }

        if (scenarioItem.id === id) {
          return {
            ...scenarioItem,
            audioArea: false,
          };
        }
        return scenarioItem;
      }),
    });
  };

  setUrlAreasOfScenario = async (item: any, urlPreview: string, typeName: string) => {
    const { selectedSenario } = this.props.scenarios;
    const newAreas = selectedSenario?.layout.areas.map((area) => {
      if (area.id === item.id) {
        return {
          ...area,
          urlPreview,
          typeMediaName: typeName,
        };
      }

      return area;
    });
    await this.setSelectedScenario({
      layout: {
        ...selectedSenario?.layout,
        areas: newAreas,
      },
    });
  };

  setSelectedScenarioItem = async (item?: ScenarioItem) => {
    const { selectedSenario } = this.props.scenarios;
    const newScenarioItems = selectedSenario?.scenarioItems.map((scenario) => {
      if (scenario.id === item?.id) {
        return {
          ...scenario,
          isSelected: true,
        };
      }
      return {
        ...scenario,
        isSelected: false,
      };
    });

    await this.setSelectedScenario({
      scenarioItems: newScenarioItems,
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      editScenarioDrawer,
      selectedSenario,
      playlistsDrawer,
      selectedArea,
    } = this.props.scenarios;

    const selectedScenarioItem = selectedSenario?.scenarioItems?.filter((s) => s.isSelected)[0];
    return (
      <Drawer
        visible={editScenarioDrawer?.visible}
        destroyOnClose={true}
        getContainer={false}
        title="Edit Scenario"
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
                    if (selectedSenario) {
                      this.removeScenario(selectedSenario.id);
                    }
                  }}
                >
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    if (this.formRef.current) {
                      this.formRef.current.validateFields().then((values) => {
                        const updateParam: UpdateScenarioParam = {
                          description: selectedSenario?.description,
                          id: selectedSenario?.id,
                          layoutId: selectedSenario?.layoutId,
                          scenarioItems: selectedSenario?.scenarioItems.map((item) => {
                            return {
                              id: item.id,
                              areaId: item?.area?.id,
                              audioArea: item.audioArea,
                              displayOrder: item.displayOrder,
                              isActive: item.isActive,
                              playlistId: item?.playlist?.id,
                              scenarioId: selectedSenario.id,
                            };
                          }),
                          title: selectedSenario?.title,
                          ...values,
                        };

                        this.handleUpdateScenario(updateParam);
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
        <Row gutter={20}>
          <Col span={12}>
            <div
              id="areaWrapper"
              style={{
                margin: `0 auto`,
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedSenario &&
                selectedSenario.layout.areas &&
                sortArea(selectedSenario.layout.areas).map((area) => {
                  const scenarioItem = this.checkAreaIsUsed(area);
                  return (
                    <div
                      key={area.id}
                      style={{
                        flex: `${area.width * 100}%`,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: `${area.height * 100}%`,
                        textAlign: 'center',
                        border: selectedArea?.id === area.id ? `5px ridge red` : `2px solid black`,
                        transition: 'ease',
                        transitionDuration: '1s',
                      }}
                      onDoubleClick={() => {
                        this.setPlaylistDrawer({
                          visible: true,
                        });
                      }}
                      onClick={async () => {
                        this.setSelectedScenarioItem(scenarioItem).then(() => {
                          this.setSelectedArea(area);
                        });
                      }}
                    >
                      {scenarioItem ? (
                        <>
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '80%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'column',
                            }}
                          >
                            <div>{scenarioItem?.playlist?.title}</div>
                            <div>
                              {area &&
                                area.typeMediaName &&
                                area.typeMediaName.toLowerCase().includes('image') && (
                                  <Image
                                    src={area.urlPreview}
                                    width={'100%'}
                                    height={'100%'}
                                    preview={false}
                                  />
                                )}
                              {area &&
                                area.typeMediaName &&
                                area.typeMediaName.toLowerCase().includes('video') && (
                                  <video
                                    src={area.urlPreview}
                                    width={'100%'}
                                    autoPlay
                                    controls
                                  ></video>
                                )}
                            </div>
                            {/* {!area.urlPreview && (
                              <ReactPlayer
                                url={scenarioItem.playlist?.playlistItems.map((item) => {
                                  return item.mediaSrc.urlPreview;
                                })}
                                playing
                                height="100%"
                                controls={true}
                                width={'100%'}
                              />
                            )} */}
                          </div>
                          <div
                            style={{
                              position: 'relative',
                              width: '100%',
                              height: '20%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Checkbox
                              checked={scenarioItem.audioArea}
                              onChange={(e) => {
                                this.setAudioArea(scenarioItem.id, e.target.checked);
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <UploadOutlined />
                      )}
                    </div>
                  );
                })}
            </div>
          </Col>
          <Col span={12}>
            <Row gutter={20}>
              <Col span={24}>
                {selectedScenarioItem?.playlist ? (
                  <>
                    <Divider />
                    <Table
                      dataSource={selectedScenarioItem?.playlist?.playlistItems}
                      loading={editScenarioDrawer?.playlistLoading}
                      scroll={{
                        x: 400,
                        y: 400,
                      }}
                      onRow={(record) => {
                        return {
                          onClick: () => {
                            this.setUrlAreasOfScenario(
                              selectedArea,
                              record.mediaSrc.urlPreview,
                              record.mediaSrc.type.name,
                            );
                          },
                        };
                      }}
                    >
                      <Column key="title" dataIndex={['mediaSrc', 'title']} title="Title"></Column>
                      <Column key="title" dataIndex="duration" title="Duration"></Column>
                    </Table>
                  </>
                ) : (
                  ''
                )}
              </Col>
            </Row>
          </Col>
        </Row>

        {/* END AREA */}

        <Divider></Divider>

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
          visible={playlistsDrawer?.visible}
          footer={
            <>
              <div style={{ textAlign: 'right' }}>
                <Button type="primary" onClick={() => this.choosePlaylist()}>
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
export default connect((state: any) => ({ ...state }))(EditScenarioFormDrawer);
