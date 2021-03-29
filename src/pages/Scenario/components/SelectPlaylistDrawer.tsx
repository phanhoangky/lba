import { Skeleton, Image, Row, Col, Divider, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
import ReactPlayer from 'react-player';
import type { Dispatch, PlayListModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
// import styles from '../index.less';

export type SelectPlaylistDrawerProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  playlists: PlayListModelState;
};

class SelectPlaylistDrawer extends React.Component<SelectPlaylistDrawerProps> {
  componentDidMount = async () => {
    this.setPlaylistDrawer({
      isLoading: true,
    })
      .then(() => {
        this.callGetPlaylist().then(() => {
          this.setPlaylistDrawer({
            isLoading: false,
          });
        });
      })
      .catch(() => {
        this.setPlaylistDrawer({
          isLoading: false,
        });
      });
  };

  callGetPlaylist = async (payload?: any) => {
    await this.props.dispatch({
      type: 'scenarios/getListPlaylist',
      payload: {
        ...this.props.scenarios.getListPlaylistParam,
        ...payload,
      },
    });
  };

  setGetPlaylistParam = async (payload: any) => {
    await this.props.dispatch({
      type: 'scenarios/setGetListPlaylistParamReducer',
      payload: {
        ...this.props.scenarios.getListPlaylistParam,
        ...payload,
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

  setSelectedScenarios = async (item: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedScenarioReducer',
      payload: {
        ...this.props.scenarios.selectedSenario,
        ...item,
      },
    });
  };

  setSelectedPlaylist = async (item: any) => {
    const { playlistsDrawer } = this.props.scenarios;
    await this.props.dispatch({
      type: 'scenarios/setPlaylistsDrawerReducer',
      payload: {
        ...playlistsDrawer,
        listPlaylists: playlistsDrawer?.listPlaylists.map((playlist) => {
          if (item.id === playlist.id) {
            return {
              ...playlist,
              isSelected: true,
            };
          }

          return {
            ...playlist,
            isSelected: false,
          };
        }),
      },
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

  getSelectedPlaylistItem = () => {
    const { playlistsDrawer } = this.props.scenarios;

    if (playlistsDrawer && playlistsDrawer.listPlaylists?.length > 0) {
      const playlist = playlistsDrawer?.listPlaylists.filter((item: any) => item.isSelected);

      if (playlist.length > 0) {
        const selectedPlaylistItem = playlist[0].playlistItems.filter((p) => p.isSelected);
        return selectedPlaylistItem[0];
      }
    }

    return null;
  };

  renderPreviewMedia = () => {
    // const selectedPlaylistItem = this.getSelectedPlaylistItem();
    const { playlistsDrawer } = this.props.scenarios;
    if (playlistsDrawer) {
      if (playlistsDrawer.mediaType === 'Image') {
        return (
          <>
            <Image src={playlistsDrawer.urlPreview} loading="lazy" />
          </>
        );
      }

      if (playlistsDrawer.mediaType === 'Video') {
        return (
          <>
            <ReactPlayer url={playlistsDrawer.urlPreview} controls={true} width={'100%'} />
          </>
        );
      }
    }
    return null;
  };

  setSelectedPlaylistItems = async (modal: any) => {
    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistItemsReducer',
      payload: modal,
    });
  };
  render() {
    const { playlistsDrawer } = this.props.scenarios;
    // const { listPlaylists } = playlistsDrawer ? playlistsDrawer : undefined;

    const selectedPlaylist = playlistsDrawer?.listPlaylists.filter(
      (playlist) => playlist.isSelected,
    )?.[0];
    return (
      <>
        <Row>
          <Col span={12}>
            <Skeleton active loading={playlistsDrawer?.isLoading}>
              {this.renderPreviewMedia()}
            </Skeleton>
          </Col>
          <Col span={12}>
            <Row>
              <Table
                dataSource={playlistsDrawer?.listPlaylists}
                pagination={false}
                onRow={(record) => {
                  return {
                    onClick: () => {
                      this.setPlaylistDrawer({
                        isLoading: true,
                      })
                        .then(() => {
                          this.setSelectedPlaylist(record).then(() => {
                            this.setPlaylistDrawer({
                              isLoading: false,
                            });
                          });
                          // this.callGetItemsByPlaylistId({
                          //   id: record.id,
                          // }).then(() => {

                          // });
                        })
                        .catch(() => {
                          this.setPlaylistDrawer({
                            isLoading: false,
                          });
                        });
                    },
                  };
                }}
              >
                <Column key="title" dataIndex="title" title="Title"></Column>
              </Table>
              {/* <List
                itemLayout="vertical"
                bordered
                size="large"
                pagination={{
                  current: getListPlaylistParam?.pageNumber
                    ? getListPlaylistParam.pageNumber + 1
                    : 1,
                  onChange: (e) => {
                    this.setGetPlaylistParam({
                      pageNumber: e - 1,
                    });
                  },
                }}
                style={{ transition: `1s ease`, width: '100%' }}
                dataSource={playlistsDrawer?.listPlaylists}
                renderItem={(item) => (
                  <Skeleton active loading={playlistsDrawer?.isLoading}>
                    <List.Item
                      key={item.id}
                      onClick={async () => {
                        this.setPlaylistDrawer({
                          isLoading: true,
                        })
                          .then(() => {
                            this.callGetItemsByPlaylistId({
                              id: item.id,
                            }).then(() => {
                              this.setSelectedPlaylist(item).then(() => {
                                this.setPlaylistDrawer({
                                  isLoading: false,
                                });
                              });
                            });
                          })
                          .catch(() => {
                            this.setPlaylistDrawer({
                              isLoading: false,
                            });
                          });
                      }}
                      style={item.isSelected ? styles.selectedPlaylist : {}}
                    >
                      <List.Item.Meta title={item.title}></List.Item.Meta>
                    </List.Item>
                  </Skeleton>
                )}
              ></List> */}
            </Row>

            <Divider />

            <Row>
              <Skeleton active loading={playlistsDrawer?.isLoading}>
                <Table
                  dataSource={selectedPlaylist?.playlistItems}
                  pagination={false}
                  onRow={(record) => {
                    return {
                      onClick: () => {
                        this.setPlaylistDrawer({
                          urlPreview: record.mediaSrc.urlPreview,
                          mediaType: record.mediaSrc.type.name,
                        });
                        // this.setSelectedPlaylistItems(
                        //   selectedPlaylistItems.map((p) => {
                        //     if (p.id === record.id) {
                        //       return {
                        //         ...p,
                        //         isSelected: true,
                        //       };
                        //     }
                        //     return {
                        //       ...p,
                        //       isSelected: false,
                        //     };
                        //   }),
                        // );
                      },
                    };
                  }}
                >
                  <Column key="title" dataIndex={['mediaSrc', 'title']} title="Title"></Column>
                  <Column
                    key="description"
                    dataIndex={['mediaSrc', 'description']}
                    title="Description"
                  ></Column>
                  <Column key="duration" dataIndex="duration" title="Duration"></Column>
                </Table>
                {/* <List
                  style={{ width: '100%' }}
                  itemLayout="vertical"
                  dataSource={selectedPlaylistItems}
                  renderItem={(item) => {
                    return (
                      <>
                        <Skeleton active loading={playlistsDrawer?.isLoading}>
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
                        </Skeleton>
                      </>
                    );
                  }}
                ></List> */}
              </Skeleton>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectPlaylistDrawer);
