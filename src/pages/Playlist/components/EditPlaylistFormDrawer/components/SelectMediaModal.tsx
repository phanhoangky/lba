import {
  FolderOpenTwoTone,
  HomeTwoTone,
  PlaySquareTwoTone,
  PlusSquareTwoTone,
} from '@ant-design/icons';
import { Breadcrumb, Button, Divider, List, Skeleton, Col, Row, Table, Space } from 'antd';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import type {
  Dispatch,
  FolderType,
  MediaSourceModelState,
  PlayListModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import styles from '../index.less';
import { SelectMediaHeaderComponent } from './SelectMediaHeaderComponent';
import { v4 as uuidv4 } from 'uuid';
import { openNotification } from '@/utils/utils';
import Column from 'antd/lib/table/Column';

export type SelectMediaModalProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export class SelectMediaModal extends React.Component<SelectMediaModalProps> {
  componentDidMount = () => {
    this.setListLoading(true)
      .then(() => {
        this.getCurrentUser().then(async () => {
          Promise.all([
            this.callGetListFolders(),
            this.callGetListMedia({
              isSigned: 2,
            }),
            this.addBreadscrumbHome(),
          ]).then(() => {
            this.setListLoading(false);
          });
        });
      })
      .catch(() => {
        this.setListLoading(false);
      });
  };

  getCurrentUser = async () => {
    const res = await this.props.dispatch({
      type: 'user/getCurrentUser',
    });
    Promise.all([
      this.setGetListFilesParam({
        folder: res.rootFolderId,
      }),
      this.setGetListFolderParam({
        parent_id: res.rootFolderId,
      }),
    ]);
  };

  setGetListFilesParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setGetListFileParamReducer',
      payload: {
        ...this.props.media.getListFileParam,
        ...param,
      },
    });
  };

  setGetListFolderParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setGetListFolderParamReducer',
      payload: {
        ...this.props.media.getListFolderParam,
        ...param,
      },
    });
  };

  addBreadscrumbHome = async () => {
    const { user } = this.props;
    await this.setBreadScrumb([
      {
        id: user.currentUser?.rootFolderId,
        name: 'Home',
        path: '',
        parent_id: '',
        created_at: '',
        updated_at: '',
      },
    ]);
  };

  callSearchListMedia = async (payload?: any) => {
    await this.props.dispatch({
      type: 'media/searchListMedia',
      payload: {
        ...this.props.media.searchListMediaParam,
        ...payload,
      },
    });
  };

  callGetListFolders = async (payload?: any) => {
    await this.props.dispatch({
      type: 'media/getListFolder',
      payload: {
        ...this.props.media.getListFolderParam,
        ...payload,
      },
    });
  };

  callGetListMedia = async (payload?: any) => {
    const { dispatch, media } = this.props;
    await dispatch({
      type: 'media/getListMediaFromFileId',
      payload: {
        ...media.getListFileParam,
        ...payload,
      },
    });
  };

  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
    });
  };

  setBreadScrumb = async (list: any) => {
    await this.props.dispatch({
      type: 'media/setBreadScrumbReducer',
      payload: list,
    });
  };

  breadScrumbNavigate = (index: number) => {
    const { breadScrumb, getListFileParam } = this.props.media;
    if (breadScrumb) {
      const newBreadScrumb = breadScrumb.slice(0, index + 1);

      this.setListLoading(true)
        .then(() => {
          this.setBreadScrumb(newBreadScrumb).then(() => {
            this.callGetListFolders({
              parent_id: breadScrumb[index].id,
            }).then(() => {
              this.callGetListMedia({
                ...getListFileParam,
                folder: breadScrumb[index].id,
                isSigned: 2,
              }).then(() => {
                this.setListLoading(false);
              });
            });
          });
        })
        .catch(() => {
          this.setListLoading(false);
        });
    }
  };

  setSelectedFolder = async (folder: any) => {
    const { listFolder } = this.props.media;
    await this.props.dispatch({
      type: 'media/setListFolderReducer',
      payload: listFolder?.map((f: any) => {
        if (f.id === folder.id) {
          return {
            ...f,
            isSelected: true,
          };
        }

        return {
          ...f,
          isSelected: false,
        };
      }),
    });
  };

  toNextFolder = async (item: any) => {
    const { getListFolderParam, getListFileParam, breadScrumb } = this.props.media;
    this.setListLoading(true).then(() => {
      Promise.all([
        this.callGetListFolders({
          ...getListFolderParam,
          parent_id: item.id,
        }),
        this.callGetListMedia({
          ...getListFileParam,
          folder: item.id,
        }),
      ])
        .then(() => {
          const newItem: FolderType = {
            id: item.id,
            name: item.name,
            created_at: '',
            updated_at: '',
            parent_id: '',
            path: '',
          };
          const newList = cloneDeep(breadScrumb);
          newList?.push(newItem);
          this.setBreadScrumb(newList).then(() => {
            this.setListLoading(false);
          });
        })
        .catch(() => {
          this.setListLoading(false);
        });
    });
  };

  setSelectedFile = async (item: any) => {
    this.props.dispatch({
      type: 'media/setSelectedFileReducer',
      payload: {
        ...this.props.media.selectedFile,
        ...item,
      },
    });
  };

  calculateTotalDuration = async () => {
    const { selectedPlaylist } = this.props.playlists;

    let total: number = 0;
    selectedPlaylist?.playlistItems.forEach((item) => {
      total += item.duration;
    });

    await this.setTotalDuration(total);
  };

  setTotalDuration = async (total: number) => {
    await this.props.dispatch({
      type: 'playlists/setTotalDurationReducer',
      payload: total,
    });
  };

  addNewPlaylistItem = async (media?: any) => {
    await this.addNewItemToSelectedItems(media)
      .then(() => {
        this.calculateTotalDuration();
      })
      .catch((error) => {
        // this.setAddNewPlaylistItemsDrawer({
        //   visible: false,
        // });
        openNotification('error', 'Fail to  add new playlist items', error.message);
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

  addNewItemToSelectedItems = async (media?: any) => {
    const {
      selectedPlaylist,
      // currentNewItemDuration,
    } = this.props.playlists;

    if (selectedPlaylist) {
      const newList = cloneDeep(selectedPlaylist.playlistItems);

      newList.push({
        id: uuidv4(),
        index: selectedPlaylist.playlistItems.length,
        displayOrder: selectedPlaylist.playlistItems.length,
        duration: 10,
        isActive: true,
        key: `${uuidv4()}`,
        mediaSrcId: media.id,
        mediaSrc: media,
        playlistId: selectedPlaylist.id,
        title: media.title,
        typeName: media.type.name,
        url: media.urlPreview,
      });
      await this.setSelectedPlaylist({
        playlistItems: newList,
      });
    }
    // await this.props.dispatch({
    //   type: 'playlists/setSelectedPlaylistItemsReducer',
    //   payload: newList,
    // });
  };

  setListMedias = async (list?: any) => {
    await this.props.dispatch({
      type: 'media/setListMediaReducer',
      payload: list,
    });
  };

  setSelectedRecord = async (item: any) => {
    const { listMedia } = this.props.media;
    const newList = listMedia?.map((media) => {
      if (item.id === media.id) {
        return {
          ...media,
          isSelected: true,
        };
      }
      return {
        ...media,
        isSelected: false,
      };
    });

    await this.setListMedias(newList);
  };

  setEditPlaylistDrawer = async (drawer: any) => {
    const { editPlaylistDrawer } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/setEditPlaylistDrawerReducer',
      payload: {
        ...editPlaylistDrawer,
        ...drawer,
      },
    });
  };

  render() {
    const {
      totalItem,
      getListFileParam,
      listMedia,
      listLoading,
      listFolder,
      breadScrumb,
      searchListMediaParam,
    } = this.props.media;

    const { selectedPlaylist } = this.props.playlists;

    // const maxD = maxDuration || 240;
    // const minD = minDuration || 10;
    // const totalD = totalDuration || 0;
    // const availableDuration = maxD - totalD;
    // const disalbedCondition = availableDuration < minD;

    const listMedias = listMedia
      ?.filter((media) => selectedPlaylist?.playlistItems.every((p) => p.mediaSrcId !== media.id))
      .map((media) => {
        return {
          ...media,
          key: media.id,
        };
      });
    return (
      <>
        <Skeleton active loading={listLoading}>
          <Breadcrumb className={styles.breadscrumb}>
            {breadScrumb &&
              breadScrumb.map((item: FolderType, index: number) => {
                return (
                  <Breadcrumb.Item
                    className="breadcrumb-item"
                    key={item.id}
                    onClick={() => {
                      this.breadScrumbNavigate(index);
                    }}
                  >
                    {item.name === 'Home' ? <HomeTwoTone twoToneColor="#00cdac" style={{
                      fontSize: '1.2em'
                    }} /> : item.name}
                  </Breadcrumb.Item>
                );
              })}
          </Breadcrumb>
        </Skeleton>
        <Divider></Divider>
        {/* ========================================================================================================================== */}

        <SelectMediaHeaderComponent {...this.props} />
        <Divider orientation="left" className="lba-text">
          Folders
        </Divider>
        {/* ========================================================================================================================== */}

        {/* ========================================================================================================================== */}
        {/** List Folders */}
        <List
          grid={{
            gutter: 20,
          }}
          dataSource={listFolder}
          loading={listLoading}
          className={styles.listFolderStyle}
          renderItem={(item) => {
            return (
              <>
                {listFolder && listFolder.length > 0 && (
                  <Skeleton active loading={listLoading}>
                    <List.Item style={{ height: 50 }}>
                      <Button
                        size="large"
                        // type={item.isSelected ? 'primary' : 'default'}
                        className={item.isSelected ? 'selected-folder' : ''}
                        style={{
                          width: 200,
                          height: 50,
                          borderRadius: '5px',
                          textAlign: 'left',
                        }}
                        icon={<FolderOpenTwoTone twoToneColor="#ffbb55" />}
                        onClick={() => {
                          this.setSelectedFolder(item);
                        }}
                        onDoubleClick={() => {
                          this.toNextFolder(item);
                        }}
                      >
                        {item.name}
                      </Button>
                    </List.Item>
                  </Skeleton>
                )}
              </>
            );
          }}
        ></List>

        <Divider orientation="left" className="lba-text">
          Medias
        </Divider>
        {/* ========================================================================================================================== */}

        {/* ========================================================================================================================== */}

        {/** List Media */}

        <Row gutter={20}>
          <Col span={24}>
            {/* <List
              grid={{
                gutter: 20,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              className={styles.listMedias}
              style={{ alignItems: 'center', alignContent: 'center' }}
              dataSource={listMedia}
              loading={listLoading}
              pagination={{
                current: getListFileParam?.pageNumber ? getListFileParam.pageNumber + 1 : 1,
                total: totalItem,
                pageSize: getListFileParam?.limit ? getListFileParam?.limit : 9,
                onChange: async (e) => {
                  if (searchListMediaParam?.title === '') {
                    if (getListFileParam && getListFileParam.limit) {
                      this.setListLoading(true)
                        .then(() => {
                          this.callGetListMedia({
                            offset: getListFileParam.limit ? (e - 1) * getListFileParam.limit : 0,
                            pageNumber: e - 1,
                          }).then(() => {
                            this.setListLoading(false);
                          });
                        })
                        .catch(() => {
                          this.setListLoading(false);
                        });
                    }
                  } else {
                    this.setListLoading(true)
                      .then(() => {
                        this.callSearchListMedia({
                          pageNumber: e - 1,
                        }).then(() => {
                          this.setListLoading(false);
                        });
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  }
                },
              }}
              header={false}
              renderItem={(item) => {
                return (
                  <>
                    {listMedia && listMedia.length > 0 && (
                      <Skeleton active avatar loading={listLoading}>
                        <List.Item>
                          <Card
                            bordered
                            hoverable
                            className={
                              item.isSelected ? 'selected-media media-record' : 'media-record'
                            }
                            onClick={async () => {
                              this.setSelectedFile(item);
                              this.setSelectedRecord(item);
                            }}
                            onDoubleClick={() => {
                              if (disalbedCondition) {
                                openNotification('error', 'One playlist have maximum 240s');
                              } else {
                                this.addNewPlaylistItem(item);
                              }
                            }}
                            style={{ width: '100%', height: '100%' }}
                            cover={
                              (item.type.name.toLowerCase().includes('image') && (
                                <Image
                                  src={item.urlPreview}
                                  alt="image"
                                  height={200}
                                  preview={false}
                                />
                              )) ||
                              (item.type.name.toLowerCase().includes('video') && (
                                <HoverVideoPlayer
                                  style={{ height: '200px' }}
                                  videoSrc={item.urlPreview}
                                  restartOnPaused
                                />
                              ))
                            }
                            // title={item.title}
                          >
                            <Card.Meta title={item.title} />
                          </Card>
                        </List.Item>
                      </Skeleton>
                    )}
                  </>
                );
              }}
            ></List> */}
            <Table
              dataSource={listMedias}
              loading={listLoading}
              // className={styles.customTable}
              scroll={{
                y: 400,
              }}
              pagination={{
                current: getListFileParam?.pageNumber ? getListFileParam.pageNumber + 1 : 1,
                total: totalItem,
                pageSize: getListFileParam?.limit ? getListFileParam?.limit : 9,
                onChange: async (e) => {
                  if (searchListMediaParam?.title === '') {
                    if (getListFileParam && getListFileParam.limit) {
                      this.setListLoading(true)
                        .then(() => {
                          this.callGetListMedia({
                            offset: getListFileParam.limit ? (e - 1) * getListFileParam.limit : 0,
                            pageNumber: e - 1,
                          }).then(() => {
                            this.setListLoading(false);
                          });
                        })
                        .catch(() => {
                          this.setListLoading(false);
                        });
                    }
                  } else {
                    this.setListLoading(true)
                      .then(() => {
                        this.callSearchListMedia({
                          pageNumber: e - 1,
                        }).then(() => {
                          this.setListLoading(false);
                        });
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  }
                },
              }}
            >
              <Column key="title" title="Title" dataIndex="title"></Column>
              <Column
                key="title"
                title="Action"
                render={(record) => {
                  return (
                    <Space>
                      <Button
                        onClick={() => {
                          this.setEditPlaylistDrawer({
                            playingUrl: record.urlPreview,
                            playlingMediaType: record.type.name,
                          });
                        }}
                      >
                        <PlaySquareTwoTone />
                      </Button>
                      <Button
                        onClick={() => {
                          this.addNewPlaylistItem(record);
                        }}
                      >
                        <PlusSquareTwoTone />
                      </Button>
                    </Space>
                  );
                }}
              ></Column>
            </Table>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectMediaModal);
