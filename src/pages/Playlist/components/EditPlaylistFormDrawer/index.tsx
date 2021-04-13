import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
import { openNotification } from '@/utils/utils';
import {
  CloseSquareTwoTone,
  DeleteTwoTone,
  MenuOutlined,
  MinusSquareTwoTone,
  PlaySquareTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import {
  Button,
  Space,
  Form,
  Input,
  Table,
  Row,
  Col,
  Image,
  Slider,
  Modal,
  Drawer,
  Empty,
} from 'antd';
import type { FormInstance } from 'antd/lib/form';
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
import styles from './index.less';
// import { MediasTableComponent } from './components/MediasTableComponent';
import { SelectMediaModal } from './components/SelectMediaModal';
// import AddNewPlaylistItemDrawer from '../AddNewPlaylistItemDrawer';

export type EditPlaylistFormDrawerProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'pointer', color: '#999' }} />
));
const SortableItemComponent = SortableElement((props: any) => <tr {...props} />);
const SortableContainerComponent = SortableContainer((props: any) => <tbody {...props} />);

export class EditPlaylistFormDrawer extends React.Component<EditPlaylistFormDrawerProps> {
  componentDidMount = async () => {
    const { selectedPlaylist } = this.props.playlists;
    if (this.formRef.current && selectedPlaylist) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
      });
    }
    this.setEditPlaylistDrawer({
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
        //     this.setEditPlaylistDrawer({
        //       isLoading: false,
        //     });
        //   });
        // });
        this.setEditPlaylistDrawer({
          isLoading: false,
        });
      })
      .catch(() => {
        this.setEditPlaylistDrawer({
          isLoading: false,
        });
      });
  };

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

  callGetListPlaylist = async () => {
    const { getPlaylistParam } = this.props.playlists;
    this.setTableLoading(true);
    await this.props
      .dispatch({
        type: 'playlists/getListPlaylist',
        payload: getPlaylistParam,
      })
      .then(() => {
        this.setTableLoading(false);
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'playlists/setTableLoadingReducer',
      payload: loading,
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

  removePlaylist = async () => {
    await this.props.dispatch({
      type: 'playlists/removePlaylist',
      payload: this.props.playlists.selectedPlaylist?.id,
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

  handleRemovePlaylist = async () => {
    const { selectedPlaylist } = this.props.playlists;
    Modal.confirm({
      title: `Are you sure you want to remove ${selectedPlaylist?.title}`,
      centered: true,
      closable: false,
      onOk: () => {
        this.setEditPlaylistDrawer({
          isLoading: true,
        })
          .then(() => {
            this.removePlaylist()
              .then(() => {
                openNotification(
                  'success',
                  'Remove playlist successfully',
                  `Playlist ${selectedPlaylist?.title} was removed`,
                );
                this.callGetListPlaylist().then(() => {
                  this.setEditPlaylistDrawer({
                    isLoading: false,
                  });
                });
              })
              .catch((error) => {
                openNotification('error', 'Fail to remove playlist', error.message);
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
      onCancel: () => {
        this.setEditPlaylistDrawer({
          visible: false,
        }).then(() => {
          this.setViewPlaylistDetailComponent({
            visible: true,
          });
        });
      },
    });
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
      await this.props.dispatch({
        type: 'playlists/updatePlaylist',
        payload: updateParam,
      });
    }
  };

  addNewItemToSelectedItems = async (media?: any) => {
    const {
      selectedPlaylistItems,
      selectedPlaylist,
      // currentNewItemDuration,
    } = this.props.playlists;

    if (selectedPlaylist && selectedPlaylistItems) {
      const newList = cloneDeep(selectedPlaylistItems);

      newList.push({
        id: uuidv4(),
        index: selectedPlaylistItems.length,
        displayOrder: selectedPlaylistItems.length,
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
      await this.setSelectedPlaylistItems(newList);
    }
    // await this.props.dispatch({
    //   type: 'playlists/setSelectedPlaylistItemsReducer',
    //   payload: newList,
    // });
  };

  clearDuration = async () => {
    await this.props.dispatch({
      type: 'playlists/setCurrentDurationReducer',
      payload: 10,
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

  setListMediaNotBelongToPlaylist = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/setListMediaNotBelongToPlaylistReducer',
      payload: param,
    });
  };

  removeMediaFromListMedia = async (param?: any) => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;
    const newList = listMediaNotBelongToPlaylist?.filter((media: any) => media.id !== param.id);
    await this.setListMediaNotBelongToPlaylist(newList);
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
    }
  };

  DraggableContainer = (props: any) => {
    return (
      <SortableContainerComponent
        key={Math.random() + 100}
        useDragHandle
        disableAutoscroll
        helperClass={styles.drag}
        onSortEnd={this.onSortEnd}
        {...props}
      />
    );
  };

  DraggableBodyRow = ({ className, style, ...restProps }: any) => {
    const { selectedPlaylistItems } = this.props.playlists;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = selectedPlaylistItems?.findIndex((x) => x.index === restProps['data-row-key']);
    return <SortableItemComponent key={Math.random() + 100} index={index} {...restProps} />;
  };

  selectPlaylistItem = async (record: any) => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (selectedPlaylistItems?.some((playlist) => playlist.id === record.id)) {
      const newList = selectedPlaylistItems?.map((item) => {
        if (item.id === record.id) {
          return {
            ...item,
            isSelected: true,
          };
        }
        return {
          ...item,
          isSelected: false,
        };
      });
      await this.setSelectedPlaylistItems(newList);
    }
  };

  addMediaToListMedia = async (media: any) => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;

    const newList = cloneDeep(listMediaNotBelongToPlaylist);

    if (newList && newList.every((s) => s.id !== media.id)) {
      newList.push({ ...media });
      this.setListMediaNotBelongToPlaylist(newList);
    }
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

  setSelectMediaModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/selectMediaModalReducer',
      payload: {
        ...this.props.playlists.selectMediaModal,
        ...param,
      },
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      selectedPlaylist,
      selectMediaModal,
    } = this.props.playlists;
    const maxD = maxDuration || 240;
    const minD = minDuration || 10;
    const totalD = totalDuration || 0;
    const availableDuration = maxD - totalD;
    return (
      <Modal
        getContainer={false}
        closable={false}
        destroyOnClose={true}
        className={styles.editPlaylistModal}
        visible={editPlaylistDrawer?.visible}
        afterClose={() => {
          this.setSelectedPlaylistItems([]);

          this.clearSelectedPlaylist();
        }}
        title="Edit Playlist"
        width={'55%'}
        onCancel={async () => {
          this.setEditPlaylistDrawer({
            visible: false,
          }).then(() => {
            this.setViewPlaylistDetailComponent({
              visible: true,
            });
          });
        }}
        footer={
          <>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={async () => {
                    await this.setEditPlaylistDrawer({
                      visible: false,
                    });
                  }}
                  icon={<CloseSquareTwoTone />}
                >
                  Cancel
                </Button>
                <Button
                  danger
                  onClick={async () => {
                    this.handleRemovePlaylist();
                  }}
                  icon={<DeleteTwoTone twoToneColor="#f93e3e" />}
                >
                  Delete
                </Button>
                <Button
                  onClick={async () => {
                    if (this.formRef.current) {
                      this.formRef.current.validateFields().then((values) => {
                        this.setEditPlaylistDrawer({
                          isLoading: true,
                        });
                        this.updatePlaylist(values)
                          .then(() => {
                            this.callGetListPlaylist().then(() => {
                              openNotification(
                                'success',
                                'update playlist successfully',
                                `Playlist ${selectedPlaylist?.title} was updated`,
                              );
                              this.setEditPlaylistDrawer({
                                isLoading: false,
                                visible: false,
                              });
                            });
                          })
                          .catch((error) => {
                            openNotification('error', 'Fail tp update playlist', error.message);
                            this.setEditPlaylistDrawer({
                              isLoading: false,
                              visible: false,
                            });
                          });
                      });
                    }
                  }}
                  icon={<SettingTwoTone />}
                >
                  Save Change
                </Button>
              </Space>
            </div>
          </>
        }
      >
        {/* <EditPlaylistDrawer {...this.props}></EditPlaylistDrawer> */}
        <Form name="edit_playlists_form_drawer" layout="vertical" ref={this.formRef}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please input title' },
              { max: 50, message: 'Title cannot exceed 50 characters' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>

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
                className={styles.customTable}
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
                            onClick={() => {
                              this.setEditPlaylistDrawer({
                                playingUrl: record.mediaSrc.urlPreview,
                                playlingMediaType: record.mediaSrc.type.name,
                              });
                            }}
                          >
                            <PlaySquareTwoTone size={20} />
                          </Button>
                          <Button
                            danger
                            onClick={async () => {
                              this.removeItem(record).then(() => {
                                this.calculateTotalDuration().then(() => {
                                  this.clearDuration();
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
              <Button
                className="add-new-media-btn"
                block
                onClick={() => {
                  this.setSelectMediaModal({
                    visible: true,
                  });
                }}
              >
                <div className="add-media-overlap"></div>
                <div className="add-media-text">Add New Media</div>
              </Button>
            </Col>
          </Row>
          {/* <Row><MediasTableComponent {...this.props} /></Row> */}
        </Form>
        <Drawer
          closable={false}
          destroyOnClose={true}
          visible={selectMediaModal?.visible}
          title="Select Media"
          width={'50%'}
          onClose={() => {
            this.setSelectMediaModal({
              visible: false,
            });
          }}
        >
          {selectMediaModal?.visible && <SelectMediaModal {...this.props} />}
        </Drawer>
      </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditPlaylistFormDrawer);
