import { SCENARIO_STORE } from '@/pages/Scenario';
import type { ScenarioItemPost } from '@/services/ScenarioService/ScenarioService';
import { openNotification } from '@/utils/utils';
import { PlusSquareFilled } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import type { Dispatch, Playlist, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { v4 as uuidv4 } from 'uuid';

type ChoosePlaylistComponentProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
};

export class ChoosePlaylistComponent extends React.Component<ChoosePlaylistComponentProps> {
  constructor(props: ChoosePlaylistComponentProps) {
    super(props);
    this.state = {};
  }

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
      type: `${SCENARIO_STORE}/setAddNewScenarioModalReducer`,
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  setCreateScenarioParam = async (param: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setCreateScenarioParamReducer`,
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...param,
      },
    });
  };

  choosePlaylist = (record: Playlist) => {
    const { selectedArea, createScenarioParam } = this.props.scenarios;

    // const selectedPlaylist = addNewScenarioModal?.listPlaylist.filter((item) => item.isSelected)[0];

    const selectedScenarioItem = createScenarioParam?.scenarioItems?.filter(
      (item) => item?.areaId === selectedArea?.id,
    );
    if (selectedScenarioItem && selectedArea && createScenarioParam) {
      if (selectedScenarioItem.length > 0) {
        this.setCreateScenarioParam({
          scenarioItems: createScenarioParam?.scenarioItems?.map((item) => {
            if (selectedScenarioItem[0].id === item.id) {
              return {
                ...item,
                playlist: record,
                scenario: createScenarioParam,
              };
            }
            return item;
          }),
        });
      } else {
        const newScenarioItem: ScenarioItemPost = {
          audioArea: false,
          displayOrder: 0,
          id: uuidv4(),
          isActive: true,
          areaId: selectedArea?.id,
          playlist: record,
          playlistId: record.id,
          scenarioId: createScenarioParam.id,
        };
        createScenarioParam?.scenarioItems?.push(newScenarioItem);
        this.setCreateScenarioParam({
          scenarioItems: createScenarioParam?.scenarioItems,
        });
      }
    }
    // this.setPlaylistDrawer({
    //   visible: false,
    // });
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
    const { addNewScenarioModal, getListPlaylistParam } = this.props.scenarios;
    return (
      <>
        <Table
          dataSource={addNewScenarioModal?.listPlaylist.filter((s) => s.playlistItems.length > 0)}
          loading={addNewScenarioModal?.isLoading}
          scroll={{
            y: 250,
          }}
          pagination={{
            current: getListPlaylistParam?.pageNumber ? getListPlaylistParam.pageNumber + 1 : 1,
            total: addNewScenarioModal?.totalItem ? addNewScenarioModal.totalItem : 10,
            onChange: (e) => {
              this.setAddNewScenarioModal({
                isLoading: true,
              }).then(() => {
                this.callGetPlaylist({
                  pageNumber: e - 1,
                })
                  .then(() => {
                    this.setAddNewScenarioModal({
                      isLoading: false,
                    });
                  })
                  .catch((error) => {
                    openNotification('error', 'Error', error.message);
                  });
              });
            },
          }}
        >
          <Column key="title" dataIndex="title" title="Title"></Column>
          <Column
            key="action"
            render={(record: Playlist) => (
              <Space>
                {/* <Button className="lba-btn" onClick={() => {
                  this.setUrlAreasOfScenario(
                    selectedArea,
                    record.mediaSrc.urlPreview,
                    record.mediaSrc.type.name,
                  );
                }}>
                  <PlaySquareFilled className="lba-icon" />
                </Button> */}
                <Button
                  className="lba-btn"
                  onClick={() => {
                    this.choosePlaylist(record);
                  }}
                >
                  <PlusSquareFilled className="lba-icon" />
                </Button>
              </Space>
            )}
          ></Column>
        </Table>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ChoosePlaylistComponent);
