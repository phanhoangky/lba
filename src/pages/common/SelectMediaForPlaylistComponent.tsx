import { openNotification } from '@/utils/utils';
import { MenuOutlined, MinusSquareTwoTone, PlaySquareFilled } from '@ant-design/icons';
import { Col, Row, Slider, Table, Image, Empty, Space, Button, Divider } from 'antd';
import Column from 'antd/lib/table/Column';
import arrayMove from 'array-move';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import ReactPlayer from 'react-player';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import type {
  Dispatch,
  MediaSourceModelState,
  PlaylistItem,
  PlayListModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import { SelectMediaModal } from '../Playlist/components/EditPlaylistFormDrawer/components/SelectMediaModal';

export type SelectMediaForPlaylistComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export type SelectMediaForPlaylistComponentState = {};

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'pointer' }} className="lba-icon" />
));
const SortableItemComponent = SortableElement((props: any) => <tr {...props} />);
const SortableContainerComponent = SortableContainer((props: any) => <tbody {...props} />);

export class SelectMediaForPlaylistComponent extends React.Component<
  SelectMediaForPlaylistComponentProps,
  SelectMediaForPlaylistComponentState
> {
  constructor(props: SelectMediaForPlaylistComponentProps) {
    super(props);
    this.state = {};
  }

  onSortEnd = ({ oldIndex, newIndex }: any) => {
    if (oldIndex !== newIndex) {
      const { selectedPlaylist } = this.props.playlists;

      if (selectedPlaylist && selectedPlaylist.playlistItems) {
        const array: PlaylistItem[] = [];
        const newData = arrayMove(
          array.concat(selectedPlaylist.playlistItems),
          oldIndex,
          newIndex,
        ).filter((el) => !!el);

        this.setSelectedPlaylist({
          playlistItems: newData.map((playlist, index) => {
            return {
              ...playlist,
              displayOrder: index,
              index,
            };
          }),
        });
      }
    }
  };

  DraggableContainer = (props: any) => {
    return (
      <SortableContainerComponent
        key={uuidv4()}
        useDragHandle
        disableAutoscroll
        helperClass="row-dragging"
        onSortEnd={this.onSortEnd}
        {...props}
      />
    );
  };

  DraggableBodyRow = ({ className, style, ...restProps }: any) => {
    const { selectedPlaylist } = this.props.playlists;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = selectedPlaylist?.playlistItems.findIndex(
      (x) => x.index === restProps['data-row-key'],
    );
    return <SortableItemComponent key={uuidv4()} index={index} {...restProps} />;
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

  setSelectedPlaylistItemsDuration = async (record?: any, duration?: number) => {
    const { selectedPlaylist } = this.props.playlists;
    if (record && duration && selectedPlaylist) {
      const clone = cloneDeep(selectedPlaylist.playlistItems);
      const newItems = clone.map((item) => {
        if (record.id === item.id) {
          return {
            ...item,
            duration,
          };
        }
        return item;
      });
      this.setSelectedPlaylist({
        playlistItems: newItems,
      });
      // this.setSelectedPlaylistItems(newItems);
    }
  };

  removeItem = async (record: any) => {
    const { selectedPlaylist } = this.props.playlists;
    this.setSelectedPlaylist({
      playlistItems: selectedPlaylist?.playlistItems
        .filter((item) => item.id !== record.id)
        .map((item, index) => {
          return {
            ...item,
            displayOrder: index,
            index,
          };
        }),
    });

    // const medias = selectedPlaylist?.playlistItems.filter((item) => item.id === record.id)[0];

    // this.addMediaToListMedia(medias?.mediaSrc);
  };

  renderPreviewMedia = () => {
    const { editPlaylistDrawer } = this.props.playlists;
    if (
      editPlaylistDrawer &&
      editPlaylistDrawer.playingUrl &&
      editPlaylistDrawer.playlingMediaType
    ) {
      if (editPlaylistDrawer.playlingMediaType.toLowerCase().includes('image')) {
        return (
          <>
            <Image src={editPlaylistDrawer.playingUrl} loading="lazy" width="100%" height="100%" />
          </>
        );
      }

      if (editPlaylistDrawer.playlingMediaType.toLowerCase().includes('video')) {
        return (
          <>
            <ReactPlayer
              url={editPlaylistDrawer.playingUrl}
              playing
              controls={true}
              width={'100%'}
              height="100%"
            />
          </>
        );
      }
    }
    return <Empty description={<>Preview Media</>} />;
  };

  render() {
    const {
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      selectedPlaylist,
    } = this.props.playlists;
    const maxD = maxDuration || 240;
    const minD = minDuration || 10;
    const totalD = totalDuration || 0;
    const availableDuration = maxD - totalD;

    return (
      <>
        <Row gutter={20}>
          <Col span={12}>{this.renderPreviewMedia()}</Col>
          <Col span={12}>
            {/* PlaylistItems Table */}
            <Table
              rowKey="index"
              loading={editPlaylistDrawer?.isLoading}
              key={uuidv4()}
              components={{
                body: {
                  wrapper: this.DraggableContainer,
                  row: this.DraggableBodyRow,
                },
              }}
              // className={styles.customTable}
              dataSource={selectedPlaylist?.playlistItems}
              pagination={false}
            >
              <Column
                key="drag"
                dataIndex="sort"
                width={30}
                className="drag-visible"
                render={() => <DragHandle />}
              ></Column>
              <Column key="index" title="No" dataIndex="index"></Column>
              <Column
                key="title"
                title="Title"
                dataIndex={['mediaSrc', 'title']}
                className="drag-visible"
              ></Column>

              <Column
                key="Duration"
                title="Duration"
                className="drag-visible"
                render={(record) => {
                  return (
                    <>
                      <Slider
                        min={minDuration}
                        max={maxDuration}
                        disabled={availableDuration < minD}
                        value={record.duration}
                        onChange={(e: any) => {
                          if (totalDuration + e < maxD) {
                            this.setSelectedPlaylistItemsDuration(record, e);
                            this.calculateTotalDuration();
                          }
                        }}
                      ></Slider>
                    </>
                  );
                }}
              ></Column>

              <Column
                key="action"
                title="Action"
                className="drag-visible"
                render={(record: any) => {
                  return (
                    <>
                      <Space>
                        <Button
                          className="lba-btn"
                          onClick={() => {
                            this.setEditPlaylistDrawer({
                              playingUrl: record.mediaSrc.urlPreview,
                              playlingMediaType: record.mediaSrc.type.name,
                            });
                          }}
                        >
                          <PlaySquareFilled className="lba-icon" size={20} />
                        </Button>
                        <Button
                          danger
                          onClick={async () => {
                            this.removeItem(record).then(() => {
                              this.calculateTotalDuration().then(() => {
                                // this.clearDuration();
                              });
                            });
                          }}
                        >
                          <MinusSquareTwoTone size={20} twoToneColor="#f93e3e" />
                        </Button>
                      </Space>
                    </>
                  );
                }}
              ></Column>
            </Table>
          </Col>
        </Row>
        <Divider orientation="center" className="lba-label">
          Select Media Area
        </Divider>
        <Row>
          <SelectMediaModal {...this.props} />
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectMediaForPlaylistComponent);
