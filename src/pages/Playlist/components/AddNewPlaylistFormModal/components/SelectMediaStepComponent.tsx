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
import { PLAYLIST_STORE } from '..';
import { SelectMediaComponent } from './SelectMediaComponent';

export type SelectMediaStepComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export type SelectMediaStepComponentState = {};

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'pointer' }} className="lba-icon" />
));
const SortableItemComponent = SortableElement((props: any) => <tr {...props} />);
const SortableContainerComponent = SortableContainer((props: any) => <tbody {...props} />);

export class SelectMediaStepComponent extends React.Component<
  SelectMediaStepComponentProps,
  SelectMediaStepComponentState
> {
  constructor(props: SelectMediaStepComponentProps) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.calculateTotalDuration();
  };
  onSortEnd = ({ oldIndex, newIndex }: any) => {
    if (oldIndex !== newIndex) {
      const { addNewPlaylistParam } = this.props.playlists;

      if (addNewPlaylistParam && addNewPlaylistParam.playlistItems) {
        const array: PlaylistItem[] = [];
        const newData = arrayMove(
          array.concat(addNewPlaylistParam.playlistItems),
          oldIndex,
          newIndex,
        ).filter((el) => !!el);

        this.setAddNewPlaylistParam({
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

  removeItem = async (record: any) => {
    const { addNewPlaylistParam } = this.props.playlists;
    this.setAddNewPlaylistParam({
      playlistItems: addNewPlaylistParam?.playlistItems
        .filter((item) => item.id !== record.id)
        .map((item, index) => {
          return {
            ...item,
            displayOrder: index,
            index,
          };
        }),
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

  setSelectedPlaylistItemsDuration = async (record?: any, duration?: number) => {
    const { addNewPlaylistParam } = this.props.playlists;
    if (record && duration && addNewPlaylistParam) {
      const clone = cloneDeep(addNewPlaylistParam.playlistItems);
      const newItems = clone.map((item) => {
        if (record.id === item.id) {
          return {
            ...item,
            duration,
          };
        }
        return item;
      });
      this.setAddNewPlaylistParam({
        playlistItems: newItems,
      });
    }
  };

  renderPreviewMedia = () => {
    const { addNewPlaylistModal } = this.props.playlists;
    if (
      addNewPlaylistModal &&
      addNewPlaylistModal.playingUrl &&
      addNewPlaylistModal.playlingMediaType
    ) {
      if (addNewPlaylistModal.playlingMediaType.toLowerCase().includes('image')) {
        return (
          <>
            <Image src={addNewPlaylistModal.playingUrl} loading="lazy" width="100%" height="100%" />
          </>
        );
      }

      if (addNewPlaylistModal.playlingMediaType.toLowerCase().includes('video')) {
        return (
          <>
            <ReactPlayer
              url={addNewPlaylistModal.playingUrl}
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
      addNewPlaylistModal,
      addNewPlaylistParam,
      totalDuration,
      maxDuration,
      minDuration,
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
              loading={addNewPlaylistModal?.isLoading}
              key={uuidv4()}
              components={{
                body: {
                  wrapper: this.DraggableContainer,
                  row: this.DraggableBodyRow,
                },
              }}
              // className={styles.customTable}
              dataSource={addNewPlaylistParam?.playlistItems}
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
                            this.setAddNewPlaylistModal({
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
          <SelectMediaComponent {...this.props} />
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectMediaStepComponent);
