import { PlaySquareTwoTone, PlusSquareTwoTone } from '@ant-design/icons';
import { Button, Space, Table } from 'antd';
import Column from 'antd/lib/table/Column';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import { v4 as uuidv4 } from 'uuid';

export type MediasTableComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export class MediasTableComponent extends React.Component<MediasTableComponentProps> {
  addNewPlaylistItem = async (media?: any) => {
    await this.addNewItemToSelectedItems(media)
      .then(() => {
        this.removeMediaFromListMedia(media).then(() => {
          this.calculateTotalDuration().then(() => {
            this.clearDuration().then(() => {
              // this.setAddNewPlaylistItemsDrawer({
              //   visible: false,
              // });
            });
          });
        });
      })
      .catch(() => {
        // this.setAddNewPlaylistItemsDrawer({
        //   visible: false,
        // });
      });
  };

  addNewItemToSelectedItems = async (media?: any) => {
    const {
      selectedPlaylist,
      // currentNewItemDuration,
    } = this.props.playlists;

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
    // await this.props.dispatch({
    //   type: 'playlists/setSelectedPlaylistItemsReducer',
    //   payload: newList,
    // });
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

  calculateTotalDuration = async () => {
    const { selectedPlaylist } = this.props.playlists;

    let total: number = 0;
    selectedPlaylist.playlistItems.forEach((item) => {
      total += item.duration;
    });
    console.log('====================================');
    console.log('Total >>>>', total);
    console.log('====================================');
    await this.setTotalDuration(total);
  };

  setTotalDuration = async (total: number) => {
    await this.props.dispatch({
      type: 'playlists/setTotalDurationReducer',
      payload: total,
    });
  };

  setListMediaNotBelongToPlaylist = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/setListMediaNotBelongToPlaylistReducer',
      payload: param,
    });
  };

  removeMediaFromListMedia = async (param?: any) => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;
    const newList = listMediaNotBelongToPlaylist.filter((media: any) => media.id !== param.id);
    await this.setListMediaNotBelongToPlaylist(newList);
  };

  clearDuration = async () => {
    await this.props.dispatch({
      type: 'playlists/setCurrentDurationReducer',
      payload: 10,
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

  render() {
    const {
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      listMediaNotBelongToPlaylist,
      selectedPlaylist,
    } = this.props.playlists;

    const listMedia = listMediaNotBelongToPlaylist.filter((media) =>
      selectedPlaylist.playlistItems.every((p) => p.mediaSrcId !== media.id),
    );

    const availableDuration = maxDuration - totalDuration;
    return (
      <>
        <Table
          dataSource={listMedia.map((item) => {
            return {
              ...item,
              key: item.id,
            };
          })}
          pagination={false}
          loading={editPlaylistDrawer.isLoading}
          scroll={{
            x: 400,
            y: 300,
          }}
        >
          <Column key="Title" dataIndex="title" title="Title"></Column>
          <Column key="Title"></Column>
          <Column
            key="action"
            title="Action"
            render={(record) => {
              return (
                <Space>
                  <Button
                    disabled={availableDuration < minDuration}
                    onClick={() => {
                      this.addNewPlaylistItem(record);
                    }}
                  >
                    <PlusSquareTwoTone />
                  </Button>
                  <Button
                    onClick={() => {
                      this.setEditPlaylistDrawer({
                        playingUrl: record.urlPreview,
                        playlingMediaType: record.type.name ? record.type.name : record.typeName,
                      });
                    }}
                  >
                    <PlaySquareTwoTone />
                  </Button>
                </Space>
              );
            }}
          ></Column>
        </Table>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(MediasTableComponent);
