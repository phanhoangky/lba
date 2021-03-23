import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
import {
  CloseSquareTwoTone,
  DeleteTwoTone,
  MenuOutlined,
  MinusSquareTwoTone,
  PlaySquareTwoTone,
  PlusSquareTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import { Button, Drawer, Space, Form, Input, Table, Row, Col, Image, Slider } from 'antd';
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
import styles from '../../index.less';
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
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
      });
    }
    this.setEditPlaylistDrawer({
      isLoading: true,
    })
      .then(() => {
        this.getMediaNotBelongToPlaylist({ isPaging: false }).then(() => {
          this.calculateTotalDuration().then(() => {
            this.setEditPlaylistDrawer({
              isLoading: false,
            });
          });
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
    this.props.dispatch({
      type: 'playlists/getMediaNotBelongToPlaylist',
      payload: {
        ...getListMediaParam,
        ...param,
      },
    });
  };

  callGetListPlaylist = async () => {
    this.setTableLoading(true);
    const { getPlaylistParam } = this.props.playlists;
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
      payload: this.props.playlists.selectedPlaylist.id,
    });

    await this.callGetListPlaylist();
  };

  updatePlaylist = async (param: any) => {
    const { selectedPlaylistItems, selectedPlaylist } = this.props.playlists;

    const updateParam: UpdatePlaylistItemsByPlaylistIdParam = {
      id: selectedPlaylist.id,
      title: selectedPlaylist.title,
      description: selectedPlaylist.description,
      updatePlaylistItems: selectedPlaylistItems,
      ...param,
    };

    console.log('====================================');
    console.log(updateParam, param, selectedPlaylist);
    console.log('====================================');
    await this.props.dispatch({
      type: 'playlists/updatePlaylist',
      payload: updateParam,
    });
  };

  clearSearchListMediaParam = async () => {
    await this.props.dispatch({
      type: 'media/clearSearchListMediaParamReducer',
    });
  };

  addNewItemToSelectedItems = async (media?: any) => {
    const {
      selectedPlaylistItems,
      selectedPlaylist,
      // currentNewItemDuration,
    } = this.props.playlists;

    const newList = cloneDeep(selectedPlaylistItems);

    newList.push({
      id: uuidv4(),
      index: selectedPlaylistItems.length,
      displayOrder: selectedPlaylistItems.length,
      duration: 10,
      isActive: true,
      key: `${uuidv4()}`,
      mediaSrcId: media.id,
      playlistId: selectedPlaylist.id,
      title: media.title,
      typeName: media.type.name,
      url: media.urlPreview,
    });
    await this.setSelectedPlaylistItems(newList);
    // await this.props.dispatch({
    //   type: 'playlists/setSelectedPlaylistItemsReducer',
    //   payload: newList,
    // });
  };

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
        this.setAddNewPlaylistItemsDrawer({
          visible: false,
        });
      });
  };

  clearDuration = async () => {
    await this.props.dispatch({
      type: 'playlists/setCurrentDurationReducer',
      payload: 10,
    });
  };

  calculateTotalDuration = async () => {
    const { selectedPlaylistItems } = this.props.playlists;

    let total: number = 0;
    selectedPlaylistItems.forEach((item) => {
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

  onSortEnd = ({ oldIndex, newIndex }: any) => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (oldIndex !== newIndex) {
      const array: PlaylistItem[] = [];
      const newData = arrayMove(array.concat(selectedPlaylistItems), oldIndex, newIndex).filter(
        (el) => !!el,
      );
      // console.log('Sorted items: ', newData);

      this.props.dispatch({
        type: 'playlists/setSelectedPlaylistItemsReducer',
        payload: newData.map((playlist, index) => {
          return {
            ...playlist,
            displayOrder: index,
            index,
          };
        }),
      });
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
    const index = selectedPlaylistItems.findIndex((x) => x.index === restProps['data-row-key']);
    return <SortableItemComponent key={Math.random() + 100} index={index} {...restProps} />;
  };

  selectPlaylistItem = async (record: any) => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (selectedPlaylistItems.some((playlist) => playlist.id === record.id)) {
      const newList = selectedPlaylistItems.map((item) => {
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

  removeItem = async (record: any) => {
    const { selectedPlaylistItems } = this.props.playlists;

    this.setSelectedPlaylistItems(
      selectedPlaylistItems
        .filter((item) => item.id !== record.id)
        .map((item, index) => {
          return {
            ...item,
            displayOrder: index,
            index,
          };
        }),
    );
  };

  addMediaToListMedia = async (media: any) => {
    const { listMediaNotBelongToPlaylist } = this.props.playlists;

    const newList = cloneDeep(listMediaNotBelongToPlaylist);
    newList.push({ ...media });

    this.setListMediaNotBelongToPlaylist(newList);
  };

  getSelectedPlaylistItem = () => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (selectedPlaylistItems.some((item) => item.isSelected)) {
      const selected = selectedPlaylistItems.filter((playlist) => playlist.isSelected)[0];
      return selected;
    }

    return null;
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
    return null;
  };

  setSelectedPlaylistItemsDuration = async (record?: any, duration?: number) => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (record && duration) {
      const clone = cloneDeep(selectedPlaylistItems);
      const newItems = clone.map((item) => {
        if (record.id === item.id) {
          return {
            ...item,
            duration,
          };
        }
        return item;
      });
      this.setSelectedPlaylistItems(newItems);
    }
  };
  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      listMediaNotBelongToPlaylist,
      selectedPlaylistItems,
    } = this.props.playlists;

    const listMedia = listMediaNotBelongToPlaylist.filter((media) =>
      selectedPlaylistItems.every((p) => p.mediaSrcId !== media.id),
    );

    const availableDuration = maxDuration - totalDuration;
    console.log('====================================');
    console.log('Duration >>>', availableDuration, totalDuration);
    console.log('====================================');
    return (
      <Drawer
        getContainer={false}
        closable={false}
        destroyOnClose={true}
        visible={editPlaylistDrawer.visible}
        afterVisibleChange={(e) => {
          this.setSelectedPlaylistItems([]);
          if (!e) {
            this.clearSelectedPlaylist();
          }
        }}
        title="Edit Playlist"
        width={'80%'}
        onClose={async () => {
          await this.setEditPlaylistDrawer({
            visible: false,
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
                    this.setEditPlaylistDrawer({
                      visible: true,
                    });
                    this.removePlaylist()
                      .then(() => {
                        this.setEditPlaylistDrawer({
                          visible: false,
                        });
                      })
                      .catch(() => {
                        this.setEditPlaylistDrawer({
                          visible: false,
                        });
                      });
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
                              this.setEditPlaylistDrawer({
                                isLoading: false,
                                visible: false,
                              });
                            });
                          })
                          .catch(() => {
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
            rules={[{ required: true, message: 'Please input title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row>
            <Col span={12}>{this.renderPreviewMedia()}</Col>
            <Col span={12}>
              {/* PlaylistItems Table */}
              <Table
                bordered
                rowKey="index"
                loading={editPlaylistDrawer.isLoading}
                key={uuidv4()}
                components={{
                  body: {
                    wrapper: this.DraggableContainer,
                    row: this.DraggableBodyRow,
                  },
                }}
                dataSource={selectedPlaylistItems}
                pagination={false}
              >
                <Column
                  key="drag"
                  dataIndex="sort"
                  className={styles.dragVisible}
                  render={() => <DragHandle />}
                ></Column>
                <Column key="index" title="No" dataIndex="index"></Column>
                <Column
                  key="title"
                  title="Title"
                  dataIndex="title"
                  className="drag-visible"
                ></Column>

                <Column
                  key="description"
                  title="Duration"
                  render={(record) => {
                    return (
                      <>
                        <Slider
                          min={minDuration}
                          max={maxDuration}
                          disabled={availableDuration < minDuration}
                          value={record.duration}
                          onChange={(e: any) => {
                            if (totalDuration + e < maxDuration) {
                              console.log('====================================');
                              console.log(e, record.duration);
                              console.log('====================================');
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
                              this.setEditPlaylistDrawer({
                                playingUrl: record.url,
                                playlingMediaType: record.typeName,
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
            </Col>
          </Row>
        </Form>
        <Table
          dataSource={listMedia}
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
        {/* Add New Playlist Item */}
      </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditPlaylistFormDrawer);
