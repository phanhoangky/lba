import { Skeleton, Image, Row, Col, Divider, Table, Empty, Tooltip } from 'antd';
import Column from 'antd/lib/table/Column';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import ReactPlayer from 'react-player';
import type { Dispatch, Playlist, PlayListModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import styles from '../index.less';

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

  setSelectedPlaylistItem = async (item: any) => {
    const { playlistsDrawer } = this.props.scenarios;
    if (playlistsDrawer) {
      const { listPlaylists } = playlistsDrawer;
      const clone = cloneDeep(listPlaylists);
      const newList = clone.map((playlist) => {
        if (playlist.isSelected) {
          return {
            ...playlist,
            playlistItems: playlist.playlistItems.map((playlistItem) => {
              if (playlistItem.id === item.id) {
                return {
                  ...playlistItem,
                  isSelected: true,
                };
              }
              return {
                ...playlistItem,
                isSelected: false,
              };
            }),
          };
        }

        return playlist;
      });
      // const newList = clone.forEach((playlist) => {
      //   const selectedPlaylist = listPlaylists.filter((p) => p.isSelected)[0];
      //   if (selectedPlaylist.id === playlist.id) {
      //     // const { playlistItems } = playlist;
      //     playlist.playlistItems.forEach((playlistItem) => {
      //       if (playlistItem.id === item.id) {
      //         return {
      //           ...playlistItem,
      //           isSelected: true,
      //         };
      //       }
      //       return {
      //         ...playlistItem,
      //         isSelected: false,
      //       };
      //     });
      //     console.log('====================================');
      //     console.log(selectedPlaylist, playlist);
      //     console.log('====================================');
      //   }
      //   return playlist;
      // });
      // console.log('====================================');
      // console.log(clone, listPlaylists);
      // console.log('====================================');
      await this.setPlaylistDrawer({
        listPlaylists: newList,
      });
    }
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

  renderPreviewMedia = () => {
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
  render() {
    const { playlistsDrawer } = this.props.scenarios;
    const listPlaylists = playlistsDrawer ? playlistsDrawer.listPlaylists : undefined;

    const selectedPlaylist = listPlaylists?.filter((playlist) => playlist.isSelected)?.[0];

    const items = selectedPlaylist?.playlistItems;
    return (
      <>
        <Row gutter={20}>
          <Col span={12}>
            <Skeleton active loading={playlistsDrawer?.isLoading}>
              {/* <Card
                cover={() => {
                  const preview = this.renderPreviewMedia();
                  if (preview) {
                    return preview;
                  }

                  return <Empty description={<>Preview Media</>} />;
                }}
              ></Card> */}
              {this.renderPreviewMedia() !== null ? (
                this.renderPreviewMedia()
              ) : (
                <Empty description={<>Preview Media</>} />
              )}
            </Skeleton>
          </Col>
          <Col span={12}>
            <Row wrap gutter={20}>
              <Divider orientation="left" className="lba-text">
                Select Playlist
              </Divider>
              <Table
                scroll={{
                  y: 400,
                }}
                style={{ width: '100%' }}
                className={styles.selectPlaylistTable}
                dataSource={playlistsDrawer?.listPlaylists.filter(
                  (s) => s.playlistItems.length > 0,
                )}
                pagination={false}
                rowClassName={(record) => {
                  return record.isSelected ? 'selected-playlist' : '';
                }}
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
                <Column
                  key="totalDuration"
                  title="Total Duration"
                  render={(record: Playlist) => {
                    let duration = 0;
                    record.playlistItems.forEach((item) => {
                      duration += item.duration;
                    });
                    return <>{`${duration} s`}</>;
                  }}
                ></Column>
              </Table>
            </Row>

            <Divider orientation="left" className="lba-text">
              Preview Media Detail
            </Divider>

            <Row>
              <Skeleton active loading={playlistsDrawer?.isLoading}>
                {/* Media Table */}
                <Table
                  style={{ width: '100%' }}
                  scroll={{
                    y: 400,
                  }}
                  dataSource={items}
                  rowClassName={(record) => {
                    return record.isSelected ? 'selected-media' : '';
                  }}
                  pagination={false}
                  onRow={(record) => {
                    return {
                      onClick: () => {
                        this.setSelectedPlaylistItem(record);
                        this.setPlaylistDrawer({
                          urlPreview: record.mediaSrc.urlPreview,
                          mediaType: record.mediaSrc.type.name,
                        });
                        this.forceUpdate();
                      },
                    };
                  }}
                >
                  <Column key="title" dataIndex={['mediaSrc', 'title']} title="Title"></Column>
                  <Column
                    key="description"
                    dataIndex={['mediaSrc', 'description']}
                    title="Description"
                    ellipsis={{ showTitle: false }}
                    render={(record) => {
                      return (
                        <Tooltip placement="topLeft" title={record}>
                          {record}
                        </Tooltip>
                      );
                    }}
                  ></Column>
                  <Column key="duration" dataIndex="duration" title="Duration"></Column>
                </Table>
              </Skeleton>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectPlaylistDrawer);
