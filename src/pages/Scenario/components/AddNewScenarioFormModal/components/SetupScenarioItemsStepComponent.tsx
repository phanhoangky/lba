import { SCENARIO_STORE } from '@/pages/Scenario';
import { sortArea } from '@/utils/utils';
import { DeleteTwoTone, UploadOutlined } from '@ant-design/icons';
import { Checkbox, Col, Divider, Row, Skeleton, Table, Image } from 'antd';
import Column from 'antd/lib/table/Column';
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
import styles from '../../../index.less';
import { ChoosePlaylistComponent } from './ChoosePlaylistComponent';

type SetupScenarioItemsStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

export class SetupScenarioItemsStepComponent extends React.Component<SetupScenarioItemsStepProps> {
  componentDidMount = async () => {
    this.setAddNewScenarioModal({
      isLoading: true,
    })
      .then(() => {
        this.callGetPlaylist().then(() => {
          this.setAddNewScenarioModal({
            isLoading: false,
          });
        });
      })
      .catch(() => {
        this.setAddNewScenarioModal({
          isLoading: false,
        });
      });
  };

  callGetPlaylist = async (payload?: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/getListPlaylist`,
      payload: {
        ...this.props.scenarios.getListPlaylistParam,
        ...payload,
      },
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

  checkAreaIsUsed = (area: Area) => {
    const { createScenarioParam } = this.props.scenarios;
    if (createScenarioParam && createScenarioParam.scenarioItems) {
      const scenarioItems = createScenarioParam?.scenarioItems.filter((s) => s?.areaId === area.id);
      if (scenarioItems && scenarioItems.length) {
        if (scenarioItems.length > 0) {
          return scenarioItems[0];
        }
      }
    }
    return undefined;
  };

  setSelectedArea = async (payload: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setSelectedAreaReducer`,
      payload: {
        ...this.props.scenarios.selectedArea,
        ...payload,
      },
    });
  };

  setCreateScenarioParam = async (param?: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setCreateScenarioParamReducer`,
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...param,
      },
    });
  };

  setSelectedScenarioItem = async (item?: ScenarioItem) => {
    const { createScenarioParam } = this.props.scenarios;
    if (createScenarioParam && createScenarioParam.scenarioItems) {
      const newScenarioItems = createScenarioParam?.scenarioItems.map((scenario) => {
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
      await this.setCreateScenarioParam({
        scenarioItems: newScenarioItems,
      });
    }
  };

  removeScenarioItems = async (item: ScenarioItem) => {
    const { selectedSenario } = this.props.scenarios;

    await this.setCreateScenarioParam({
      scenarioItems: selectedSenario?.scenarioItems.filter((s) => s.id !== item.id),
    });
  };

  setAudioArea = async (id: string, checked: boolean) => {
    const { createScenarioParam } = this.props.scenarios;
    if (createScenarioParam && createScenarioParam.scenarioItems) {
      await this.setCreateScenarioParam({
        scenarioItems: createScenarioParam.scenarioItems.map((scenarioItem) => {
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
    }
  };

  setUrlAreasOfScenario = async (item: any, urlPreview: string, typeName: string) => {
    const { createScenarioParam } = this.props.scenarios;
    if (createScenarioParam && createScenarioParam.layout) {
      const newAreas = createScenarioParam?.layout.areas.map((area) => {
        if (area.id === item.id) {
          return {
            ...area,
            urlPreview,
            typeMediaName: typeName,
          };
        }

        return area;
      });
      await this.setCreateScenarioParam({
        layout: {
          ...createScenarioParam?.layout,
          areas: newAreas,
        },
      });
    }
  };

  render() {
    const { addNewScenarioModal, createScenarioParam, selectedArea } = this.props.scenarios;

    const selectedScenarioItem = createScenarioParam?.scenarioItems?.filter((s) => s.isSelected)[0];

    return (
      <>
        <Row gutter={20}>
          <Col span={12}>
            <Skeleton active loading={addNewScenarioModal?.isLoading}>
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
                {createScenarioParam &&
                  createScenarioParam.layout &&
                  createScenarioParam.layout.areas &&
                  sortArea(createScenarioParam.layout.areas).map((area) => {
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
                        // onDoubleClick={() => {
                        //   this.setPlaylistDrawer({
                        //     visible: true,
                        //   });
                        // }}
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
            <Skeleton active loading={addNewScenarioModal?.isLoading}>
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
                        loading={addNewScenarioModal?.isLoading}
                        scroll={{
                          y: 300,
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
        <Divider></Divider>
        <ChoosePlaylistComponent {...this.props} />
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SetupScenarioItemsStepComponent);
