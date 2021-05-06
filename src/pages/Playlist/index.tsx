import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Drawer, Modal, Row, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import React from 'react';
import type {
  Dispatch,
  MediaSourceModelState,
  Playlist,
  PlayListModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { EditPlaylistFormDrawer } from './components/EditPlaylistFormDrawer';
import { PlaylistTableHeaderComponent } from './components/PlaylistTableHeaderComponent';
import { ViewEditPlaylistComponent } from './components/ViewEditPlaylistComponent';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  EditFilled,
  LeftCircleFilled,
  RightCircleFilled,
  SettingFilled,
} from '@ant-design/icons';
import { openNotification } from '@/utils/utils';
// import {
//   PLAYLIST_STORE,
//   steps,
//   AddNewPlaylistFormModal,
// } from './components/AddNewPlaylistFormModal';
import styles from './index.less';
import {
  AddNewPlaylistFormModal,
  PLAYLIST_STORE,
  steps,
} from './components/AddNewPlaylistFormModal';

type PlaylistProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

class PlaylistScreen extends React.Component<PlaylistProps> {
  state = {};

  componentDidMount = () => {
    this.setTableLoading(true)
      .then(() => {
        // this.readJWT().catch((error) => {
        //   openNotification('error', 'Error occured', error.message);
        // });
        this.getCurrentUser().then(() => {
          Promise.all([this.callGetListPlaylist()]).then(async () => {
            const { listPlaylist } = this.props.playlists;
            const first = listPlaylist && listPlaylist.length > 0 ? listPlaylist[0] : null;
            if (first) {
              this.setSelectedPlaylist(first);
            }
            this.setTableLoading(false);
          });
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occured', error.message);
        // this.setViewPlaylistDetailComponent({
        //   isLoading: false,
        // });
        this.setTableLoading(false);
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
  // readJWT = async () => {
  //   await this.props.dispatch({
  //     type: 'user/readJWT',
  //   });
  // };

  callGetListPlaylist = async (param?: any) => {
    const { getPlaylistParam } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/getListPlaylist',
      payload: {
        ...getPlaylistParam,
        ...param,
      },
    });
  };

  // setAddNewPlaylistModal = async (modal: any) => {
  //   const { addNewPlaylistModal } = this.props.playlists;
  //   await this.props.dispatch({
  //     type: 'playlists/setAddNewPlaylistModalReducer',
  //     payload: {
  //       ...addNewPlaylistModal,
  //       ...modal,
  //     },
  //   });
  // };

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

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'playlists/setTableLoadingReducer',
      payload: loading,
    });
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

  // setTotalDuration = async (total: number) => {
  //   await this.props.dispatch({
  //     type: 'playlists/setTotalDurationReducer',
  //     payload: total,
  //   });
  // };

  // calculateTotalDuration = async () => {
  //   const { selectedPlaylist } = this.props.playlists;

  //   let total: number = 0;
  //   selectedPlaylist?.playlistItems?.forEach((item) => {
  //     total += item.duration;
  //   });
  //   await this.setTotalDuration(total);
  // };

  // clearDuration = async () => {
  //   await this.props.dispatch({
  //     type: 'playlists/setCurrentDurationReducer',
  //     payload: 10,
  //   });
  // };

  setViewPlaylistDetailComponent = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/setViewPlaylistDetailComponentReducer',
      payload: {
        ...this.props.playlists.viewPlaylistDetailComponent,
        ...param,
      },
    });
  };

  removePlaylist = async (record: Playlist) => {
    await this.props.dispatch({
      type: 'playlists/removePlaylist',
      payload: record.id,
    });
  };

  handleRemovePlaylist = async (record: Playlist) => {
    // const { selectedPlaylist } = this.props.playlists;
    Modal.confirm({
      title: `Are you sure you want to remove ${record?.title}`,
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
        this.setTableLoading(true)
          .then(() => {
            this.removePlaylist(record)
              .then(() => {
                openNotification(
                  'success',
                  'Remove playlist successfully',
                  `Playlist ${record?.title} was removed`,
                );
                this.callGetListPlaylist().then(() => {
                  this.setTableLoading(false);
                });
              })
              .catch((error) => {
                openNotification('error', 'Fail to remove playlist', error.message);
                this.setTableLoading(false);
              });
          })
          .catch(() => {
            this.setTableLoading(false);
          });
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

  viewPlaylistComponentRef = React.createRef<ViewEditPlaylistComponent>();
  addNewPlaylistModalRef = React.createRef<AddNewPlaylistFormModal>();
  editPlaylistModalRef = React.createRef<EditPlaylistFormDrawer>();

  render() {
    const {
      listPlaylist,
      getPlaylistParam,
      totalItem,
      tableLoading,
      viewPlaylistDetailComponent,
      addNewPlaylistModal,
      editPlaylistDrawer,
    } = this.props.playlists;

    const currentStep = addNewPlaylistModal?.currentStep ? addNewPlaylistModal.currentStep : 0;
    return (
      <PageContainer
        title={false}
        header={{
          ghost: false,
          style: {
            padding: 0,
          },
        }}
      >
        <Row gutter={20}>
          <Col span={24}>
            <Table
              dataSource={listPlaylist}
              loading={tableLoading}
              pagination={{
                current: getPlaylistParam?.pageNumber ? getPlaylistParam.pageNumber + 1 : 1,
                total: totalItem,
                pageSize: getPlaylistParam?.pageLimitItem ? getPlaylistParam?.pageLimitItem : 10,
                onChange: (e) => {
                  this.callGetListPlaylist({
                    pageNumber: e - 1,
                  });
                },
              }}
              onRow={(record) => {
                return {
                  onClick: async () => {
                    this.setViewPlaylistDetailComponent({
                      visible: true,
                      isLoading: true,
                    })
                      .then(() => {
                        this.setSelectedPlaylist(record).then(() => {
                          this.viewPlaylistComponentRef.current?.componentDidMount();
                          this.setViewPlaylistDetailComponent({
                            isLoading: false,
                          });
                        });
                      })
                      .catch(() => {
                        this.setViewPlaylistDetailComponent({
                          isLoading: false,
                        });
                      });
                  },
                };
              }}
              title={() => {
                return <PlaylistTableHeaderComponent {...this.props} />;
              }}
            >
              <Column key="title" title="Title" dataIndex="title"></Column>
              <Column key="createTime" title="Create Time" dataIndex="createTime"></Column>
              <Column key="modifyTime" title="Modify Time" dataIndex="modifyTime"></Column>
              <Column
                key="totalDuration"
                title="Duration (s)"
                render={(record: Playlist) => {
                  let total: number = 0;
                  record?.playlistItems.forEach((item) => {
                    total += item.duration;
                  });
                  return `${total} s`;
                }}
              ></Column>
              <Column
                key="action"
                title="Action"
                render={(record) => {
                  return (
                    <Space>
                      <Button
                        onClick={(e) => {
                          this.setSelectedPlaylist(record).then(() => {
                            this.setEditPlaylistDrawer({
                              visible: true,
                            });
                          });
                          // this.setEditPlaylistDrawer({
                          //   visible: true,
                          //   isLoading: true,
                          // }).then(() => {
                          //   this.setSelectedPlaylist(record);
                          //   //   .then(() => {
                          //   //   this.editPlaylistModalRef.current?.componentDidMount();
                          //   // });
                          // });
                          e.stopPropagation();
                        }}
                        className="lba-btn"
                      >
                        <EditFilled className="lba-icon" />
                      </Button>
                      <Button
                        onClick={(e) => {
                          this.setTableLoading(true)
                            .then(() => {
                              this.handleRemovePlaylist(record).then(() => {
                                this.setTableLoading(false);
                              });
                            })
                            .catch(() => {
                              this.setTableLoading(false);
                            });
                          e.stopPropagation();
                        }}
                        danger
                      >
                        <DeleteTwoTone twoToneColor="#f93e3e" />
                      </Button>
                    </Space>
                  );
                }}
              ></Column>
            </Table>
          </Col>
        </Row>
        <Drawer
          visible={viewPlaylistDetailComponent?.visible}
          width={'40%'}
          title="Playlist Detail"
          destroyOnClose={true}
          closable={false}
          onClose={() => {
            this.setViewPlaylistDetailComponent({
              visible: false,
            });
          }}
        >
          <ViewEditPlaylistComponent ref={this.viewPlaylistComponentRef} {...this.props} />
        </Drawer>

        <Modal
          title="Add New Playlist"
          visible={addNewPlaylistModal?.visible}
          destroyOnClose={true}
          centered
          closable={false}
          maskClosable={false}
          footer={
            <Space>
              <Button
                style={{ margin: '0 8px' }}
                onClick={() => {
                  this.setAddNewPlaylistModal({
                    visible: false,
                    playingUrl: undefined,
                    playlingMediaType: undefined,
                    currentStep: 0,
                    isLoading: false,
                  });
                }}
                loading={addNewPlaylistModal?.isLoading}
              >
                <CloseCircleFilled className="lba-close-icon" /> Close
              </Button>
              {currentStep > 0 && currentStep < steps.length - 1 && (
                <Button
                  loading={addNewPlaylistModal?.isLoading}
                  className="lba-btn"
                  style={{ margin: '0 8px' }}
                  onClick={() => {
                    this.addNewPlaylistModalRef.current?.onPrevious();
                  }}
                >
                  <LeftCircleFilled className="lba-icon" /> Previous
                </Button>
              )}
              {currentStep < steps.length - 2 && (
                <Button
                  loading={addNewPlaylistModal?.isLoading}
                  className="lba-btn"
                  onClick={() => {
                    this.addNewPlaylistModalRef.current?.onNext();
                    // .then(() => {})
                    // .catch((error) => {
                    //   openNotification('error', 'Error', error);
                    // });
                  }}
                >
                  Next <RightCircleFilled className="lba-icon" />
                </Button>
              )}
              {currentStep === steps.length - 2 && (
                <Button
                  loading={addNewPlaylistModal?.isLoading}
                  className="lba-btn"
                  onClick={() => {
                    this.addNewPlaylistModalRef.current?.onCreatePlaylist();
                  }}
                >
                  Done <CheckCircleFilled className="lba-icon" />
                </Button>
              )}
            </Space>
          }
          confirmLoading={addNewPlaylistModal?.isLoading}
          className={styles.addNewPlaylistModal}
          onCancel={async () => {
            await this.setAddNewPlaylistModal({
              visible: false,
              playingUrl: undefined,
              playlingMediaType: undefined,
              currentStep: 0,
            });
          }}
          width={'60%'}
          afterClose={async () => {
            await this.props.dispatch({
              type: 'playlists/clearAddNewPlaylistParamReducer',
            });
          }}
        >
          <AddNewPlaylistFormModal ref={this.addNewPlaylistModalRef} {...this.props} />
        </Modal>

        {/* Edit Playlist Modal */}
        <Modal
          closable={false}
          maskClosable={false}
          destroyOnClose={true}
          centered
          className={styles.editPlaylistModal}
          visible={editPlaylistDrawer?.visible}
          afterClose={() => {
            // this.editPlaylistModalRef.current?.setSelectedPlaylistItems([]);
            this.editPlaylistModalRef.current?.clearSelectedPlaylist();
          }}
          title="Edit Playlist"
          width={'55%'}
          onCancel={() => {
            this.setEditPlaylistDrawer({
              visible: false,
            });
          }}
          footer={
            <>
              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button
                    loading={editPlaylistDrawer?.isLoading}
                    onClick={async () => {
                      await this.setEditPlaylistDrawer({
                        visible: false,
                      });
                    }}
                    icon={<CloseCircleFilled className="lba-close-icon" />}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={editPlaylistDrawer?.isLoading}
                    danger
                    onClick={async () => {
                      this.editPlaylistModalRef.current?.handleRemovePlaylist();
                    }}
                    icon={<DeleteTwoTone twoToneColor="#f93e3e" />}
                  >
                    Delete
                  </Button>
                  <Button
                    loading={editPlaylistDrawer?.isLoading}
                    onClick={() => {
                      this.editPlaylistModalRef.current?.handleUpdatePlaylist();
                    }}
                    className="lba-btn"
                    icon={<SettingFilled className="lba-icon" />}
                  >
                    Save Change
                  </Button>
                </Space>
              </div>
            </>
          }
        >
          {editPlaylistDrawer?.visible && (
            <EditPlaylistFormDrawer ref={this.editPlaylistModalRef} {...this.props} />
          )}
        </Modal>
        {/* End Edit Playlist Modal */}
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(PlaylistScreen);
