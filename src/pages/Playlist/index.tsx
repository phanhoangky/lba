import { PageContainer } from '@ant-design/pro-layout';
import { Col, Row, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import React from 'react';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserModelState } from 'umi';
import { connect } from 'umi';
// import AddNewPlaylistItemDrawer from './components/AddNewPlaylistItemDrawer';
// import AddNewPlaylistModal from './components/AddNewPlaylistModal';
// import EditPlaylistDrawer from './components/EditPlaylistDrawer';
import { EditPlaylistFormDrawer } from './components/EditPlaylistFormDrawer';
import AddNewPlaylistFormModal from './components/AddNewPlaylistFormModal';
import { PlaylistTableHeaderComponent } from './components/PlaylistTableHeaderComponent';
import { ViewEditPlaylistComponent } from './components/ViewEditPlaylistComponent';

type PlaylistProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

class Playlist extends React.Component<PlaylistProps> {
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
        console.log('====================================');
        console.log(error);
        console.log('====================================');
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
    selectedPlaylistItems.forEach((item) => {
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

  editPlaylistComponentRef = React.createRef<ViewEditPlaylistComponent>();
  render() {
    const {
      listPlaylist,
      addNewPlaylistModal,
      getPlaylistParam,
      totalItem,
      tableLoading,
      editPlaylistDrawer,
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
                    await this.setEditPlaylistDrawer({
                      visible: true,
                      isLoading: true,
                    }).then(() => {
                      this.setSelectedPlaylist(record);
                      this.setGetItemsByPlaylistIdParam({
                        id: record.id,
                      });
                      this.calculateTotalDuration().then(() => {
                        this.editPlaylistComponentRef.current?.componentDidMount();
                        this.setEditPlaylistDrawer({
                          isLoading: false,
                        });
                      });
                    });
                    this.callGetItemsByPlaylistId()
                      .then(() => {
                        this.calculateTotalDuration().then(() => {
                          this.editPlaylistComponentRef.current?.componentDidMount();
                          this.setEditPlaylistDrawer({
                            isLoading: false,
                          });
                        });
                      })
                      .catch(() => {
                        this.setEditPlaylistDrawer({
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
            </Table>
          </Col>
          <Col span={14}>
            <ViewEditPlaylistComponent ref={this.editPlaylistComponentRef} {...this.props} />
          </Col>
        </Row>

        {addNewPlaylistModal.visible && <AddNewPlaylistFormModal {...this.props} />}

        {/* {editPlaylistDrawer.visible && <EditPlaylistFormDrawer {...this.props} />} */}
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(Playlist);
