import { PlaySquareTwoTone } from '@ant-design/icons';
import { Col, Form, Input, Row, Table, Image, Space, Button, Empty } from 'antd';
import type { FormInstance } from 'antd';
import Column from 'antd/lib/table/Column';
import arrayMove from 'array-move';
import * as React from 'react';
// import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import type {
  Dispatch,
  MediaSourceModelState,
  PlaylistItem,
  PlayListModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import styles from '../../index.less';
import ReactPlayer from 'react-player';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash';
import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
// import { openNotification } from '@/utils/utils';

export type ViewEditPlaylistComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

// const DragHandle = SortableHandle(() => (
//   <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />
// ));
// const SortableItemComponent = SortableElement((props: any) => <tr {...props} />);
// const SortableContainerComponent = SortableContainer((props: any) => <tbody {...props} />);

export class ViewEditPlaylistComponent extends React.Component<ViewEditPlaylistComponentProps> {
  componentDidMount() {
    const {
      selectedPlaylist,
      // listMediaNotBelongToPlaylist,
      // selectedPlaylistItems,
    } = this.props.playlists;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist?.title,
        description: selectedPlaylist?.description,
      });
    }
    this.setViewPlaylistDetailComponent({
      isLoading: true,
    })
      .then(() => {
        // this.getMediaNotBelongToPlaylist({ isPaging: false, isSigned: 2 }).then(() => {
        //   this.calculateTotalDuration().then(() => {
        //     // this.setListMediaNotBelongToPlaylist(
        //     //   listMediaNotBelongToPlaylist.filter((media) =>
        //     //     selectedPlaylistItems.every((p) => p.mediaSrcId !== media.id),
        //     //   ),
        //     // )
        //     this.setViewPlaylistDetailComponent({
        //       isLoading: false,
        //     });
        //   });
        // });
        this.setViewPlaylistDetailComponent({
          isLoading: false,
        });
      })
      .catch(() => {
        this.setViewPlaylistDetailComponent({
          isLoading: false,
        });
      });
  }

  // setPlaylistTableLoading = async (loading: boolean) => {
  //   await this.props.dispatch({
  //     type: 'playlists/setTableLoadingReducer',
  //     payload: loading,
  //   });
  // };

  // callGetListPlaylist = async () => {
  //   const { getPlaylistParam } = this.props.playlists;
  //   this.setPlaylistTableLoading(true)
  //     .then(() => {
  //       this.props
  //         .dispatch({
  //           type: 'playlists/getListPlaylist',
  //           payload: getPlaylistParam,
  //         })
  //         .then(() => {
  //           this.setPlaylistTableLoading(false);
  //         });
  //     })
  //     .catch(() => {
  //       this.setPlaylistTableLoading(false);
  //     });
  // };

  getMediaNotBelongToPlaylist = async (param?: any) => {
    const { getListMediaParam } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/getMediaNotBelongToPlaylist',
      payload: {
        ...getListMediaParam,
        ...param,
      },
    });
  };

  onSortEnd = ({ oldIndex, newIndex }: any) => {
    const { selectedPlaylist } = this.props.playlists;
    if (oldIndex !== newIndex && selectedPlaylist) {
      const array: PlaylistItem[] = [];
      const newData = arrayMove(
        array.concat(selectedPlaylist.playlistItems),
        oldIndex,
        newIndex,
      ).filter((el) => !!el);
      // console.log('Sorted items: ', newData);

      this.setSelectedPlaylist({
        playlistItems: newData.map((playlist, index) => {
          return {
            ...playlist,
            displayOrder: index,
            index,
          };
        }),
      });

      // this.props.dispatch({
      //   type: 'playlists/setSelectedPlaylistItemsReducer',
      //   payload: newData.map((playlist, index) => {
      //     return {
      //       ...playlist,
      //       displayOrder: index,
      //       index,
      //     };
      //   }),
      // });
    }
  };

  // DraggableContainer = (props: any) => {
  //   return (
  //     <SortableContainerComponent
  //       key={Math.random() + 100}
  //       useDragHandle
  //       disableAutoscroll
  //       helperClass={styles.drag}
  //       onSortEnd={this.onSortEnd}
  //       {...props}
  //     />
  //   );
  // };

  // DraggableBodyRow = ({ className, style, ...restProps }: any) => {
  //   const { selectedPlaylist } = this.props.playlists;
  //   // function findIndex base on Table rowKey props and should always be a right array index
  //   const index = selectedPlaylist?.playlistItems.findIndex(
  //     (x) => x.index === restProps['data-row-key'],
  //   );
  //   return <SortableItemComponent key={Math.random() + 100} index={index} {...restProps} />;
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
      this.setSelectedPlaylistItems(newItems);
    }
  };

  setSelectedPlaylistItems = async (payload: any) => {
    await this.props.dispatch({
      type: `playlists/setSelectedPlaylistItemsReducer`,
      payload,
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

    const medias = selectedPlaylist?.playlistItems.filter((item) => item.id === record.id)[0];

    this.addMediaToListMedia(medias?.mediaSrc);
  };

  addMediaToListMedia = async (media: any) => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;

    const newList = cloneDeep(listMediaNotBelongToPlaylist);

    if (newList && newList.every((s) => s.id !== media.id)) {
      newList.push({ ...media });
      this.setListMediaNotBelongToPlaylist(newList);
    }
  };

  setListMediaNotBelongToPlaylist = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/setListMediaNotBelongToPlaylistReducer',
      payload: param,
    });
  };

  clearDuration = async () => {
    await this.props.dispatch({
      type: 'playlists/setCurrentDurationReducer',
      payload: 10,
    });
  };

  renderPreviewMedia = () => {
    const { viewPlaylistDetailComponent } = this.props.playlists;
    if (
      viewPlaylistDetailComponent &&
      viewPlaylistDetailComponent.playingUrl &&
      viewPlaylistDetailComponent.playlingMediaType
    ) {
      if (viewPlaylistDetailComponent.playlingMediaType.toLowerCase().includes('image')) {
        return (
          <>
            <Image
              src={viewPlaylistDetailComponent.playingUrl}
              loading="lazy"
              width="100%"
              height="100%"
            />
          </>
        );
      }

      if (viewPlaylistDetailComponent.playlingMediaType.toLowerCase().includes('video')) {
        return (
          <>
            <ReactPlayer
              url={viewPlaylistDetailComponent.playingUrl}
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

  updatePlaylist = async (param: any) => {
    const { selectedPlaylist } = this.props.playlists;

    if (selectedPlaylist) {
      const updateParam: UpdatePlaylistItemsByPlaylistIdParam = {
        id: selectedPlaylist.id,
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
        updatePlaylistItems: selectedPlaylist.playlistItems,
        ...param,
      };

      console.log('====================================');
      console.log(updateParam, param, selectedPlaylist);
      console.log('====================================');
      await this.props.dispatch({
        type: 'playlists/updatePlaylist',
        payload: updateParam,
      });
    }
  };

  removePlaylist = async () => {
    await this.props.dispatch({
      type: 'playlists/removePlaylist',
      payload: this.props.playlists.selectedPlaylist?.id,
    });
  };

  // handleRemovePlaylist = async () => {
  //   const { selectedPlaylist } = this.props.playlists;
  //   Modal.confirm({
  //     title: `Are you sure you want to remove ${selectedPlaylist?.title}`,
  //     centered: true,
  //     closable: false,
  //     onOk: () => {
  //       this.setViewPlaylistDetailComponent({
  //         isLoading: true,
  //       })
  //         .then(() => {
  //           this.removePlaylist()
  //             .then(() => {
  //               openNotification(
  //                 'success',
  //                 'Remove playlist successfully',
  //                 `Playlist ${selectedPlaylist?.title} was removed`,
  //               );
  //               this.callGetListPlaylist().then(() => {
  //                 this.setViewPlaylistDetailComponent({
  //                   isLoading: false,
  //                 });
  //               });
  //             })
  //             .catch((error) => {
  //               Promise.reject(error);
  //               openNotification('error', 'Fail to remove playlist', error);
  //             });
  //         })
  //         .catch(() => {
  //           this.setViewPlaylistDetailComponent({
  //             isLoading: false,
  //           });
  //         });
  //     },
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      // listMediaNotBelongToPlaylist,
      // selectedPlaylistItems,
      selectedPlaylist,
      viewPlaylistDetailComponent,
    } = this.props.playlists;

    // const listMedia = listMediaNotBelongToPlaylist.filter((media) =>
    //   selectedPlaylistItems.every((p) => p.mediaSrcId !== media.id),
    // );

    return (
      <>
        <Form name="view_playlists_form_drawer" layout="vertical" ref={this.formRef}>
          <Form.Item name="title" label="Title">
            <Input readOnly />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea readOnly rows={4} />
          </Form.Item>
          <Row>
            <Col span={12}>{this.renderPreviewMedia()}</Col>
            <Col span={12}>
              {/* PlaylistItems Table */}
              <Table
                rowKey="index"
                loading={viewPlaylistDetailComponent?.isLoading}
                key={uuidv4()}
                className={styles.customTable}
                dataSource={selectedPlaylist?.playlistItems}
                pagination={false}
              >
                {/* <Column
                  key="drag"
                  dataIndex="sort"
                  width={30}
                  className="drag-visible"
                  render={() => <DragHandle />}
                ></Column> */}
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
                    return <>{record.duration}</>;
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
                            onClick={() => {
                              // this.selectPlaylistItem(record);
                              console.log('====================================');
                              console.log(record);
                              console.log('====================================');
                              this.setViewPlaylistDetailComponent({
                                playingUrl: record.mediaSrc.urlPreview,
                                playlingMediaType: record.mediaSrc.type.name,
                              });
                            }}
                          >
                            <PlaySquareTwoTone size={20} />
                          </Button>
                        </Space>
                      </>
                    );
                  }}
                ></Column>
              </Table>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewEditPlaylistComponent);
