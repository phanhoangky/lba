import { PageContainer } from '@ant-design/pro-layout';
import { Button, Col, Modal, Row, Space, Table } from 'antd';
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
// import AddNewPlaylistItemDrawer from './components/AddNewPlaylistItemDrawer';
// import AddNewPlaylistModal from './components/AddNewPlaylistModal';
// import EditPlaylistDrawer from './components/EditPlaylistDrawer';
import { EditPlaylistFormDrawer } from './components/EditPlaylistFormDrawer';
import AddNewPlaylistFormModal from './components/AddNewPlaylistFormModal';
import { PlaylistTableHeaderComponent } from './components/PlaylistTableHeaderComponent';
import { ViewEditPlaylistComponent } from './components/ViewEditPlaylistComponent';
import { DeleteTwoTone, EditFilled } from '@ant-design/icons';
import { openNotification } from '@/utils/utils';

type PlaylistProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

class PlaylistScreen extends React.Component<PlaylistProps> {
  state = {};

  componentDidMount = async () => {
    this.setTableLoading(true)
      .then(() => {
        Promise.all([this.callGetListPlaylist()]).then(() => {
          this.readJWT();
          this.setTableLoading(false);
        });
      })
      .catch((error) => {
        Promise.reject(error);
        this.setTableLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
      payload: '',
    });
  };

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

  callGetItemsByPlaylistId = async (param?: any) => {
    const { getItemsByPlaylistIdParam } = this.props.playlists;

    await this.props.dispatch({
      type: 'playlists/getItemsByPlaylist',
      payload: {
        ...getItemsByPlaylistIdParam,
        ...param,
      },
    });
  };

  setGetItemsByPlaylistIdParam = async (modal: any) => {
    const { getItemsByPlaylistIdParam } = this.props.playlists;
    this.props.dispatch({
      type: 'playlists/setGetItemsByPlaylistIdParamReducer',
      payload: {
        ...getItemsByPlaylistIdParam,
        ...modal,
      },
    });
  };

  setAddNewPlaylistItemsDrawer = async (modal: any) => {
    const { addNewPlaylistItemsDrawer } = this.props.playlists;

    await this.props.dispatch({
      type: 'playlists/setAddNewPlaylistItemsDrawerReducer',
      payload: {
        ...addNewPlaylistItemsDrawer,
        ...modal,
      },
    });
  };

  setTotalDuration = async (total: number) => {
    await this.props.dispatch({
      type: 'playlists/setTotalDurationReducer',
      payload: total,
    });
  };

  calculateTotalDuration = async () => {
    const { selectedPlaylistItems } = this.props.playlists;

    let total: number = 0;
    selectedPlaylistItems?.forEach((item) => {
      total += item.duration;
    });
    await this.setTotalDuration(total);
  };

  clearDuration = async () => {
    await this.props.dispatch({
      type: 'playlists/setCurrentDurationReducer',
      payload: 10,
    });
  };

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

    await this.callGetListPlaylist();
  };

  handleRemovePlaylist = async (record: Playlist) => {
    const { selectedPlaylist } = this.props.playlists;
    Modal.confirm({
      title: `Are you sure you want to remove ${record?.title}`,
      centered: true,
      closable: false,
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
                Promise.reject(error);
                openNotification('error', 'Fail to remove playlist', error);
              });
          })
          .catch(() => {
            this.setTableLoading(false);
          });
      },
    });
  };

  viewPlaylistComponentRef = React.createRef<ViewEditPlaylistComponent>();

  editPlaylistModalRef = React.createRef<EditPlaylistFormDrawer>();

  render() {
    const {
      listPlaylist,
      getPlaylistParam,
      totalItem,
      tableLoading,
      viewPlaylistDetailComponent,
    } = this.props.playlists;

    return (
      <PageContainer>
        <Row gutter={20}>
          <Col span={10}>
            <Table
              bordered
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
                    await this.setViewPlaylistDetailComponent({
                      visible: true,
                      isLoading: true,
                    })
                      .then(() => {
                        this.setSelectedPlaylist(record);
                        this.setGetItemsByPlaylistIdParam({
                          id: record.id,
                        });
                        this.callGetItemsByPlaylistId().then(() => {
                          this.calculateTotalDuration().then(() => {
                            this.viewPlaylistComponentRef.current?.componentDidMount();
                            this.setViewPlaylistDetailComponent({
                              isLoading: false,
                            });
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
              <Column
                key="action"
                title="Action"
                render={(record) => {
                  return (
                    <Space>
                      <Button
                        onClick={(e) => {
                          this.setViewPlaylistDetailComponent({
                            visible: false,
                          }).then(() => {
                            this.setSelectedPlaylist(record);
                            this.setGetItemsByPlaylistIdParam({
                              id: record.id,
                            });
                            this.callGetItemsByPlaylistId();
                            this.setEditPlaylistDrawer({
                              visible: true,
                            }).then(() => {
                              this.editPlaylistModalRef.current?.componentDidMount();
                            });
                          });
                          e.stopPropagation();
                        }}
                        type="primary"
                      >
                        <EditFilled />
                      </Button>
                      <Button
                        onClick={(e) => {
                          this.handleRemovePlaylist(record);
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
          <Col span={14}>
            {viewPlaylistDetailComponent?.visible && (
              <ViewEditPlaylistComponent ref={this.viewPlaylistComponentRef} {...this.props} />
            )}
          </Col>
        </Row>

        {/* {addNewPlaylistModal.visible && <AddNewPlaylistFormModal {...this.props} />} */}
        <AddNewPlaylistFormModal {...this.props} />

        <EditPlaylistFormDrawer ref={this.editPlaylistModalRef} {...this.props} />
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(PlaylistScreen);
