import { openNotification } from '@/utils/utils';
import {
  FolderOpenTwoTone,
  HomeTwoTone,
  PlaySquareFilled,
  PlusSquareFilled,
} from '@ant-design/icons';
import { Breadcrumb, Button, Col, Divider, List, Row, Skeleton, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
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
import { v4 as uuidv4 } from 'uuid';
import { PLAYLIST_STORE } from '..';
import { SelectMediaHeaderComponent } from '../../EditPlaylistFormDrawer/components/SelectMediaHeaderComponent';
import styles from '../index.less';

export type SelectMediaComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export type SelectMediaComponentState = {};

export class SelectMediaComponent extends React.Component<
  SelectMediaComponentProps,
  SelectMediaComponentState
> {
  constructor(props: SelectMediaComponentProps) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.setListLoading(true)
      .then(() => {
        // });
        Promise.all([
          this.callGetListFolders(),
          this.callGetListMedia({
            isSigned: 2,
          }),
          this.addBreadscrumbHome(),
        ]).then(() => {
          this.setListLoading(false);
        });
      })
      .catch(() => {
        this.setListLoading(false);
      });
  };

  // getCurrentUser = async () => {
  //   const res = await this.props.dispatch({
  //     type: 'user/getCurrentUser',
  //   });
  //   console.log('====================================');
  //   console.log(res);
  //   console.log('====================================');
  //   await Promise.all([
  //     this.setGetListFilesParam({
  //       folder: res.rootFolderId,
  //     }),
  //     this.setGetListFolderParam({
  //       parent_id: res.rootFolderId,
  //     }),
  //   ]);
  // };

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
          offset: 0,
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
    const { addNewPlaylistParam } = this.props.playlists;

    let total: number = 0;
    addNewPlaylistParam?.playlistItems.forEach((item) => {
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
      addNewPlaylistParam,
      // currentNewItemDuration,
    } = this.props.playlists;

    if (addNewPlaylistParam) {
      const newList = cloneDeep(addNewPlaylistParam.playlistItems);

      newList.push({
        id: uuidv4(),
        index: addNewPlaylistParam.playlistItems.length,
        displayOrder: addNewPlaylistParam.playlistItems.length,
        duration: 10,
        isActive: true,
        key: `${uuidv4()}`,
        mediaSrcId: media.id,
        mediaSrc: media,
        playlistId: uuidv4(),
        title: media.title,
        typeName: media.type.name,
        url: media.urlPreview,
      });
      await this.setAddNewPlaylistParam({
        playlistItems: newList,
      });
    }
  };
  setAddNewPlaylistParam = async (param?: any) => {
    await this.props.dispatch({
      type: `${PLAYLIST_STORE}/setAddNewPlaylistParamReducer`,
      payload: {
        ...this.props.playlists.addNewPlaylistParam,
        ...param,
      },
    });
  };
  setAddNewPlaylistModal = async (param?: any) => {
    await this.props.dispatch({
      type: `${PLAYLIST_STORE}/setAddNewPlaylistModalReducer`,
      payload: {
        ...this.props.playlists.addNewPlaylistModal,
        ...param,
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

    const { addNewPlaylistParam, minDuration, maxDuration, totalDuration } = this.props.playlists;

    const maxD = maxDuration || 240;
    const minD = minDuration || 10;
    const totalD = totalDuration || 0;
    const availableDuration = maxD - totalD;
    const disalbedCondition = availableDuration < minD;

    const listMedias = listMedia
      ?.filter((media) =>
        addNewPlaylistParam?.playlistItems.every((p) => p.mediaSrcId !== media.id),
      )
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
                    {item.name === 'Home' ? (
                      <HomeTwoTone
                        twoToneColor="#fda502"
                        style={{
                          fontSize: '1.2em',
                        }}
                      />
                    ) : (
                      item.name
                    )}
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

        <Divider orientation="left" className="lba-label">
          Medias
        </Divider>
        {/* ========================================================================================================================== */}

        {/* ========================================================================================================================== */}

        {/** List Media */}

        <Row gutter={20}>
          <Col span={24}>
            <Table
              dataSource={listMedias}
              loading={listLoading}
              // className={styles.customTable}
              scroll={{
                y: 300,
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
                        className="lba-btn"
                        onClick={(e) => {
                          this.setAddNewPlaylistModal({
                            playingUrl: record.urlPreview,
                            playlingMediaType: record.type.name,
                          });
                          e.stopPropagation();
                        }}
                      >
                        <PlaySquareFilled className="lba-icon" />
                      </Button>
                      <Button
                        disabled={disalbedCondition}
                        className="lba-btn"
                        onClick={(e) => {
                          this.addNewPlaylistItem(record);
                          e.stopPropagation();
                        }}
                      >
                        <PlusSquareFilled className="lba-icon" />
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

export default connect((state: any) => ({ ...state }))(SelectMediaComponent);
