import { PlusSquareTwoTone } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import React from 'react';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserModelState } from 'umi';
import { connect } from 'umi';
// import AddNewPlaylistItemDrawer from './components/AddNewPlaylistItemDrawer';
// import AddNewPlaylistModal from './components/AddNewPlaylistModal';
// import EditPlaylistDrawer from './components/EditPlaylistDrawer';
import { cloneDeep } from 'lodash';
import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
import { v4 as uuidv4 } from 'uuid';
import { EditPlaylistFormDrawer } from './components/EditPlaylistFormDrawer';
import AddNewPlaylistFormModal from './components/AddNewPlaylistFormModal';

type PlaylistProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

class Playlist extends React.Component<PlaylistProps> {
  state = {};

  componentDidMount = async () => {
    this.readJWT().then(() => {
      this.callGetListPlaylist();
    });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
      payload: '',
    });
  };

  callGetListPlaylist = async (param?: any) => {
    this.setTableLoading(true);
    const { getPlaylistParam } = this.props.playlists;
    await this.props
      .dispatch({
        type: 'playlists/getListPlaylist',
        payload: {
          ...getPlaylistParam,
          ...param,
        },
      })
      .then(() => {
        this.setTableLoading(false);
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  setAddNewPlaylistModal = async (modal: any) => {
    const { addNewPlaylistModal } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/setAddNewPlaylistModalReducer',
      payload: {
        ...addNewPlaylistModal,
        ...modal,
      },
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

  addNewPlaylistItem = async () => {
    await this.addNewItemToSelectedItems()
      .then(() => {
        this.removeMediaFromListMedia().then(() => {
          this.calculateTotalDuration().then(() => {
            this.clearDuration().then(() => {
              this.setAddNewPlaylistItemsDrawer({
                visible: false,
              });
            });
          });
        });
      })
      .catch(() => {
        this.setAddNewPlaylistItemsDrawer({
          visible: false,
        });
      });
  };

  addNewItemToSelectedItems = async () => {
    const {
      selectedPlaylistItems,
      selectedMedia,
      selectedPlaylist,
      currentNewItemDuration,
    } = this.props.playlists;

    const newList = cloneDeep(selectedPlaylistItems);

    newList.push({
      id: uuidv4(),
      createTime: '',
      modifyBy: '',
      index: selectedPlaylistItems.length,
      displayOrder: selectedPlaylistItems.length,
      duration: currentNewItemDuration,
      isActive: true,
      key: `${uuidv4()}`,
      mediaSrcId: selectedMedia.id,
      modifyTime: '',
      playlistId: selectedPlaylist.id,
      createBy: '',
      title: selectedMedia.title ? selectedMedia.title : '',
      typeName: selectedMedia.type.name,
      url: selectedMedia.urlPreview,
    });
    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistItemsReducer',
      payload: newList,
    });
  };

  removeMediaFromListMedia = async () => {
    const { listMediaNotBelongToPlaylist, selectedMedia } = this.props.playlists;
    const newList = listMediaNotBelongToPlaylist.filter(
      (media: any) => media.id !== selectedMedia.id,
    );
    await this.props.dispatch({
      type: 'playlists/setListMediaNotBelongToPlaylistReducer',
      payload: newList,
    });
  };

  updatePlaylist = async () => {
    const { selectedPlaylistItems, selectedPlaylist } = this.props.playlists;

    const param: UpdatePlaylistItemsByPlaylistIdParam = {
      id: this.props.playlists.selectedPlaylist.id,
      title: selectedPlaylist.title,
      description: selectedPlaylist.description,
      updatePlaylistItems: selectedPlaylistItems,
    };

    await this.props.dispatch({
      type: 'playlists/updatePlaylist',
      payload: param,
    });
  };

  removePlaylist = async () => {
    await this.props.dispatch({
      type: 'playlists/removePlaylist',
      payload: this.props.playlists.selectedPlaylist.id,
    });

    await this.callGetListPlaylist();
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

  clearSelectedMedia = async () => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/clearSelectedMediaReducer',
    });

    await this.props.dispatch({
      type: 'playlists/setListMediaNotBelongToPlaylistReducer',
      payload: listMediaNotBelongToPlaylist.map((media: any) => {
        return {
          ...media,
          isSelected: false,
        };
      }),
    });
  };

  setGetListPlaylistParam = async (modal: any) => {
    this.props.dispatch({
      type: 'playlists/setGetPlaylistParamReducer',
      payload: {
        ...this.props.playlists.getPlaylistParam,
        ...modal,
      },
    });
  };

  setSelectedPlaylistItems = async (payload: any) => {
    await this.props.dispatch({
      type: `playlists/setSelectedPlaylistItemsReducer`,
      payload,
    });
  };

  clearSelectedPlaylist = async () => {
    await this.props.dispatch({
      type: `playlists/clearSelectedPlaylistReducer`,
    });
  };

  clearSearchListMediaParam = async () => {
    await this.props.dispatch({
      type: 'media/clearSearchListMediaParamReducer',
    });
  };
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
        <Table
          bordered
          dataSource={listPlaylist}
          loading={tableLoading}
          pagination={{
            current: getPlaylistParam.pageNumber + 1,
            total: totalItem,
            onChange: (e) => {
              this.callGetListPlaylist({
                pageNumber: e - 1,
              });
            },
          }}
          onRow={(record) => {
            return {
              onClick: async () => {
                await this.setSelectedPlaylist(record);

                await this.setGetItemsByPlaylistIdParam({
                  id: record.id,
                });

                await this.setEditPlaylistDrawer({
                  visible: true,
                  isLoading: true,
                });
                this.callGetItemsByPlaylistId()
                  .then(() => {
                    this.calculateTotalDuration().then(() => {
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
            return (
              <>
                <Button
                  onClick={async () => {
                    await this.setAddNewPlaylistModal({
                      visible: true,
                    });
                  }}
                >
                  <PlusSquareTwoTone /> Add New Playlist
                </Button>
              </>
            );
          }}
        >
          <Column key="title" title="Title" dataIndex="title"></Column>
          <Column key="description" title="Description" dataIndex="description"></Column>
        </Table>

        {addNewPlaylistModal.visible && <AddNewPlaylistFormModal {...this.props} />}

        {editPlaylistDrawer.visible && <EditPlaylistFormDrawer {...this.props} />}
      </PageContainer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(Playlist);
