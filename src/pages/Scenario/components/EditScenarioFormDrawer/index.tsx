import type { UpdateScenarioParam } from '@/services/ScenarioService/ScenarioService';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  SettingFilled,
  UploadOutlined,
} from '@ant-design/icons';
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
  Modal,
  Skeleton,
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
import { SCENARIO_STORE } from '../..';
import styles from '../../index.less';

export type EditScenarioFormDrawerProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

export class EditScenarioFormDrawer extends React.Component<EditScenarioFormDrawerProps> {
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
    await this.props.dispatch({
      type: 'scenarios/removeScenario',
      payload: id,
    });
  };

  handleRemoveScenario = async (record: any) => {
    Modal.confirm({
      title: `Are you sure you want to delete ${record.title}`,
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
      onOk: async () => {
        this.setEditScenariosDrawer({
          isLoading: true,
        }).then(() => {
          this.removeScenario(record.id)
            .then(async () => {
              this.callGetListScenario().then(() => {
                openNotification(
                  'success',
                  'Remove Scenario Successfully',
                  `${record.title} was removed`,
                );
                this.setEditScenariosDrawer({
                  isLoading: false,
                  visible: false,
                });
              });
            })
            .catch((error) => {
              this.setEditScenariosDrawer({
                isLoading: false,
                visible: false,
              });
              openNotification('error', 'Fail to remove scenario ', error.message);
            });
        });
      },
    });
  };

  updateScenario = async (param: any) => {
    await this.props.dispatch({
      type: 'scenarios/updateScenario',
      payload: param,
    });
  };

  handleUpdateScenario = async (updateScenarioParam: UpdateScenarioParam) => {
    this.setEditScenariosDrawer({
      isLoading: true,
    }).then(() => {
      this.updateScenario(updateScenarioParam)
        .then(() => {
          this.callGetListScenario().then(async () => {
            openNotification(
              'success',
              'Update Scenario Successfully',
              `Update Scenario ${updateScenarioParam.title} successfully`,
            );
            this.setEditScenariosDrawer({
              isLoading: false,
            });
            // this.setTableLoading(false);
          });
        })
        .catch((error) => {
          this.setEditScenariosDrawer({
            isLoading: false,
          });
          this.setTableLoading(false);
          openNotification('error', 'Fail to edit scenario', error.message);
        });
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
      payload: payload
        ? {
            ...this.props.scenarios.selectedArea,
            ...payload,
          }
        : undefined,
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

    const result = selectedPlaylistItems?.filter((p) => p.isSelected);
    if (result && result.length > 0) {
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

  handleSaveChange = async () => {
    const { selectedSenario } = this.props.scenarios;
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

  clearSelectedScenarioItem = async () => {
    const { selectedSenario } = this.props.scenarios;
    const newScenarioItems = selectedSenario?.scenarioItems.map((scenario) => {
      return {
        ...scenario,
        isSelected: false,
      };
    });

    await this.setSelectedScenario({
      scenarioItems: newScenarioItems,
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      editScenarioDrawer,
      selectedSenario,
      playlistsDrawer,
      selectedArea,
    } = this.props.scenarios;

    const selectedScenarioItem = selectedSenario?.scenarioItems?.filter((s) => s.isSelected)[0];

    const disableChoosePlaylists = !playlistsDrawer?.listPlaylists.some((s) => s.isSelected);
    return (
      <Modal
        visible={editScenarioDrawer?.visible}
        destroyOnClose={true}
        confirmLoading={editScenarioDrawer?.isLoading}
        centered
        title="Edit Scenario"
        afterClose={() => {
          this.clearSelectedPlaylistItems();
          this.clearSelectedScenarioItem();
        }}
        maskClosable={false}
        closable={false}
        footer={
          <>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  loading={editScenarioDrawer?.isLoading}
                  onClick={() => {
                    this.setEditScenariosDrawer({
                      visible: false,
                    }).then(() => {
                      this.setSelectedArea(undefined);
                    });
                  }}
                >
                  <CloseCircleFilled className="lba-close-icon" /> Close
                </Button>
                <Button
                  loading={editScenarioDrawer?.isLoading}
                  danger
                  onClick={() => {
                    if (selectedSenario) {
                      this.handleRemoveScenario(selectedSenario);
                    }
                  }}
                >
                  <DeleteTwoTone twoToneColor="#f93e3e" />
                  Remove
                </Button>
                <Button
                  loading={editScenarioDrawer?.isLoading}
                  onClick={() => {
                    this.handleSaveChange();
                  }}
                  className="lba-btn"
                >
                  <SettingFilled className="lba-icon" /> Save Change
                </Button>
              </Space>
            </div>
          </>
        }
        onCancel={() => {
          this.setEditScenariosDrawer({
            visible: false,
          }).then(() => {
            this.setSelectedArea(undefined);
            // this.setViewScenarioDetailComponent({
            //   visible: true,
            // });
          });
        }}
        width={'50%'}
      >
        {/* <EditScenarioDrawer {...this.props} /> */}
        <Form name="edit_scenario_form" layout="vertical" ref={this.formRef}>
          <Skeleton active loading={editScenarioDrawer?.isLoading}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, message: 'Please input title' },
                { max: 50, message: 'Title cannot exceed 50 characters' },
              ]}
            >
              <Input />
            </Form.Item>
          </Skeleton>

          <Skeleton active loading={editScenarioDrawer?.isLoading}>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </Skeleton>
        </Form>
        {/* AREA */}
        <Row gutter={20}>
          <Col span={12}>
            <Skeleton active loading={editScenarioDrawer?.isLoading}>
              <div
                id="areaWrapper"
                // style={{
                //   margin: `0 auto`,
                //   display: 'flex',
                //   width: '100%',
                //   boxSizing: 'border-box',
                //   justifyContent: 'center',
                //   alignItems: 'center',
                // }}
                className={styles.areaWrapper}
              >
                {selectedSenario &&
                  selectedSenario.layout.areas &&
                  sortArea(selectedSenario.layout.areas).map((area) => {
                    const scenarioItem = this.checkAreaIsUsed(area);
                    return (
                      <div
                        key={area.id}
                        className={selectedArea?.id === area.id ? 'selected-area' : 'custom-area'}
                        style={{
                          flex: `${area.width * 100}%`,
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: `${area.height * 100}%`,
                          textAlign: 'center',
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
                        <div className="area-overlap"></div>

                        {scenarioItem ? (
                          <>
                            <div className="media-wrapper">
                              <div
                                className="remove-btn"
                                onClick={(e) => {
                                  this.removeScenarioItems(scenarioItem);
                                  e.stopPropagation();
                                }}
                              >
                                <DeleteTwoTone twoToneColor="#f93e3e" />
                              </div>
                              <div className="media-bound">
                                <div>{scenarioItem?.playlist?.title}</div>
                                <div className="media-container">
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
                              </div>
                            </div>
                            <div className="audio-checkbox">
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
              <div>Check the square if you want the area to have an audio</div>
            </Skeleton>
          </Col>
          <Col span={12}>
            <Skeleton active loading={editScenarioDrawer?.isLoading}>
              <Row gutter={20}>
                <Col span={24}>
                  {selectedScenarioItem?.playlist ? (
                    <>
                      <Divider />
                      <Table
                        dataSource={selectedScenarioItem?.playlist?.playlistItems.map((item) => {
                          return {
                            ...item,
                            key: item.id,
                          };
                        })}
                        loading={editScenarioDrawer?.playlistLoading}
                        scroll={{
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
                        <Column
                          key="title"
                          dataIndex={['mediaSrc', 'title']}
                          title="Title"
                        ></Column>
                        <Column key="duration" dataIndex="duration" title="Duration (s)"></Column>
                      </Table>
                    </>
                  ) : (
                    ''
                  )}
                </Col>
              </Row>
            </Skeleton>
          </Col>
        </Row>

        {/* END AREA */}

        <Divider></Divider>

        {/** Select Playlist Drawer */}

        <Drawer
          title="Choose playlist"
          width={`50%`}
          closable={false}
          destroyOnClose={true}
          afterVisibleChange={() => {
            this.clearSelectedPlaylistItems();
          }}
          onClose={() => {
            this.setPlaylistDrawer({
              visible: false,
              urlPreview: undefined,
              mediaType: undefined,
            });
          }}
          visible={playlistsDrawer?.visible}
          footer={
            <>
              <div style={{ textAlign: 'right' }}>
                <Button
                  disabled={disableChoosePlaylists}
                  onClick={() => this.choosePlaylist()}
                  className="lba-btn"
                  icon={<CheckCircleFilled className="lba-icon" />}
                >
                  Choose Playlist
                </Button>
              </div>
            </>
          }
        >
          <SelectPlaylistDrawer {...this.props} />
        </Drawer>
      </Modal>
    );
  }
}
export default connect((state: any) => ({ ...state }))(EditScenarioFormDrawer);
