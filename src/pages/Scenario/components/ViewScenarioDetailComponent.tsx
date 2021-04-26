import { openNotification, sortArea } from '@/utils/utils';
import { UploadOutlined } from '@ant-design/icons';
import { Col, Form, Row, Image, Divider, Table, Modal, Skeleton, Empty, Tag } from 'antd';
import type { FormInstance } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type { Area, Dispatch, PlayListModelState, ScenarioItem, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import type { UpdateScenarioParam } from '@/services/ScenarioService/ScenarioService';
import styles from '../index.less';
import { TAG_COLOR } from '@/services/constantUrls';

export type ViewScenarioDetailProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  playlists: PlayListModelState;
};

export class ViewScenarioDetailComponent extends React.Component<ViewScenarioDetailProps> {
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

  callGetListScenario = async (param?: any) => {
    await this.props.dispatch({
      type: 'scenarios/getListScenarios',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

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

  setSelectedArea = async (payload: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedAreaReducer',
      payload: {
        ...this.props.scenarios.selectedArea,
        ...payload,
      },
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

  setSelectedPlaylistItems = async (modal: any) => {
    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistItemsReducer',
      payload: modal,
    });
  };

  clearSelectedPlaylistItems = async () => {
    await this.setSelectedPlaylistItems([]);
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

  setEditScenariosDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setEditScenarioDrawerReducer',
      payload: {
        ...this.props.scenarios.editScenarioDrawer,
        ...modal,
      },
    });
  };

  saveChange = async (values: any) => {
    const { selectedSenario } = this.props.scenarios;
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
    await this.updateScenario(updateParam);
  };

  updateScenario = async (updateScenarioParam: UpdateScenarioParam) => {
    await this.props.dispatch({
      type: 'scenarios/updateScenario',
      payload: updateScenarioParam,
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
      onOk: async () => {
        this.setEditScenariosDrawer({
          isLoading: true,
        })
          .then(() => {
            this.removeScenario(record.id)
              .then(async () => {
                openNotification(
                  'success',
                  'Remove Scenario Successfully',
                  `${record.title} was removed`,
                );
                this.callGetListScenario().then(() => {
                  this.setEditScenariosDrawer({
                    isLoading: false,
                  });
                });
              })
              .catch((error) => {
                Promise.reject(error);
                openNotification('error', 'Fail to remove scenario ', error);
              });
          })
          .catch((error) => {
            Promise.reject(error);
            openNotification('error', 'Fail to remove scenario ', error);
            this.setEditScenariosDrawer({
              isLoading: false,
            });
          });
      },
    });
  };

  removeScenarioItems = async (item: any) => {
    const { selectedSenario } = this.props.scenarios;
    const newScenarioItem = selectedSenario?.scenarioItems.filter((s) => s.id !== item.id);
    await this.setSelectedScenario({
      scenarioItems: newScenarioItem,
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { selectedSenario, viewScenarioDetailComponent, selectedArea } = this.props.scenarios;

    const selectedScenarioItem = selectedSenario?.scenarioItems?.filter((s) => s.isSelected)[0];
    return (
      <>
        {/* {viewScenarioDetailComponent?.isLoading && <Spin size="large" />} */}

        <>
          <Form name="view_scenario_detail" layout="vertical" ref={this.formRef}>
            <Skeleton active loading={viewScenarioDetailComponent?.isLoading}>
              <Form.Item name="title" label="Title">
                {/* <Input readOnly /> */}
                <Tag color={TAG_COLOR}>{selectedSenario?.title}</Tag>
              </Form.Item>
            </Skeleton>

            <Skeleton active loading={viewScenarioDetailComponent?.isLoading}>
              <Form.Item name="description" label="Description">
                {/* <Input.TextArea readOnly rows={4} /> */}
                <span
                  style={{
                    color: TAG_COLOR,
                  }}
                >
                  {selectedSenario?.description}
                </span>
              </Form.Item>
            </Skeleton>
          </Form>
          {/* AREA */}
          <Row gutter={20}>
            <Col span={12}>
              <Skeleton active loading={viewScenarioDetailComponent?.isLoading}>
                <div id="areaWrapper" className={styles.areaWrapper}>
                  {selectedSenario &&
                    selectedSenario.layout.areas &&
                    sortArea(selectedSenario.layout.areas).map((area) => {
                      const scenarioItem = this.checkAreaIsUsed(area);
                      return (
                        <div
                          className={
                            selectedArea?.id === area.id
                              ? 'selected-area custom-area'
                              : 'custom-area'
                          }
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
                            transition: 'ease',
                            transitionDuration: '1s',
                          }}
                          onClick={async () => {
                            this.setSelectedScenarioItem(scenarioItem);
                            this.setSelectedArea(area);
                          }}
                        >
                          <div className="area-overlap"></div>
                          {scenarioItem ? (
                            <>
                              <div className="media-wrapper">
                                <div>{scenarioItem?.playlist?.title}</div>
                                <div
                                  className="media-container"
                                  // style={{
                                  //   position: 'absolute',
                                  //   width: '100%',
                                  //   height: '100%',
                                  //   left: 0,
                                  //   top: 0,
                                  // }}
                                >
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
                              {/* <div className="audio-checkbox">
                                <Checkbox
                                  checked={scenarioItem.audioArea}
                                  onChange={(e) => {
                                    this.setAudioArea(scenarioItem.id, e.target.checked);
                                  }}
                                />
                              </div> */}
                            </>
                          ) : (
                            <UploadOutlined />
                          )}
                        </div>
                      );
                    })}
                </div>
              </Skeleton>
            </Col>
            <Col span={12}>
              <Divider orientation="left" className="lba-text">
                List Media
              </Divider>
              <Skeleton active loading={viewScenarioDetailComponent?.isLoading}>
                <Row gutter={20}>
                  <Col span={24}>
                    {selectedScenarioItem?.playlist ? (
                      <>
                        <Table
                          pagination={false}
                          dataSource={selectedScenarioItem?.playlist?.playlistItems.map((item) => {
                            return {
                              ...item,
                              key: item.id,
                            };
                          })}
                          loading={viewScenarioDetailComponent?.playlistLoading}
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
                          <Column key="title" dataIndex="duration" title="Duration (s)"></Column>
                        </Table>
                      </>
                    ) : (
                      <Empty description={<>Preview Media</>} />
                    )}
                  </Col>
                </Row>
              </Skeleton>
            </Col>
          </Row>

          {/* END AREA */}

          <Divider></Divider>
        </>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewScenarioDetailComponent);
