import {
  PlusSquareTwoTone,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Select, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, PlayListModelState } from 'umi';
import { connect } from 'umi';

export type PlaylistTableHeaderComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
};

export class PlaylistTableHeaderComponent extends React.Component<PlaylistTableHeaderComponentProps> {
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

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'playlists/setTableLoadingReducer',
      payload: loading,
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

  render() {
    const { getPlaylistParam } = this.props.playlists;
    return (
      <Space>
        <Input.Search
          enterButton
          // value={getPlaylistParam?.searchValue}
          onSearch={(e) => {
            this.setTableLoading(true)
              .then(() => {
                this.callGetListPlaylist({
                  searchValue: e,
                  pageNumber: 0,
                }).then(() => {
                  this.setTableLoading(false);
                });
              })
              .catch(() => {
                this.setTableLoading(false);
              });
          }}
        />

        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                this.setTableLoading(true)
                  .then(() => {
                    this.callGetListPlaylist({
                      isDescending: e.key === 'desc',
                      isSort: true,
                    }).then(() => {
                      this.setTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setTableLoading(false);
                  });
              }}
            >
              <Menu.Item key="asc" icon={<SortAscendingOutlined />}>
                Ascending
              </Menu.Item>
              <Menu.Item key="desc" icon={<SortDescendingOutlined />}>
                Descending
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            {getPlaylistParam?.isDescending && <SortDescendingOutlined />}
            {!getPlaylistParam?.isDescending && <SortAscendingOutlined />}
          </Button>
        </Dropdown>
        <Select
          style={{
            width: '100px',
          }}
          defaultValue="createTime"
          onChange={(e) => {
            this.setTableLoading(true)
              .then(() => {
                this.callGetListPlaylist({
                  orderBy: e,
                  isSort: true,
                }).then(() => {
                  this.setTableLoading(false);
                });
              })
              .catch(() => {
                this.setTableLoading(false);
              });
          }}
        >
          <Select.Option value="createTime">Create Time</Select.Option>
          <Select.Option value="title">Title</Select.Option>
        </Select>
        <Button
          onClick={async () => {
            await this.setAddNewPlaylistModal({
              visible: true,
            });
          }}
        >
          <PlusSquareTwoTone twoToneColor="#00cdac" /> Add New Playlist
        </Button>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(PlaylistTableHeaderComponent);
