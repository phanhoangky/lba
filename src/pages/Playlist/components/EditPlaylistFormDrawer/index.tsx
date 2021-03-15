import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
import {
  CloseSquareTwoTone,
  DeleteTwoTone,
  MenuOutlined,
  PlaySquareTwoTone,
  PlusCircleTwoTone,
  PlusSquareTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import { Button, Drawer, Space, Form, Input, Table, Row, Col, Image } from 'antd';
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
import AddNewPlaylistItemDrawer from '../AddNewPlaylistItemDrawer';

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
  componentDidMount() {
    const { selectedPlaylist } = this.props.playlists;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
      });
    }
  }

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
    await this.setTotalDuration(total);
  };

  setTotalDuration = async (total: number) => {
    await this.props.dispatch({
      type: 'playlists/setTotalDurationReducer',
      payload: total,
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
    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistItemsReducer',
      payload: selectedPlaylistItems
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

  getSelectedPlaylistItem = () => {
    const { selectedPlaylistItems } = this.props.playlists;
    if (selectedPlaylistItems.some((item) => item.isSelected)) {
      const selected = selectedPlaylistItems.filter((playlist) => playlist.isSelected)[0];
      return selected;
    }

    return null;
  };

  renderPreviewMedia = () => {
    const selectedPlaylistItem = this.getSelectedPlaylistItem();
    if (selectedPlaylistItem) {
      if (selectedPlaylistItem.typeName === 'Image') {
        return (
          <>
            <Image src={selectedPlaylistItem.url} loading="lazy" width="100%" />
          </>
        );
      }

      if (selectedPlaylistItem.typeName === 'Video') {
        return (
          <>
            <ReactPlayer url={selectedPlaylistItem.url} controls={true} width={'100%'} />
          </>
        );
      }
    }
    return null;
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const {
      // listPlaylist,
      // addNewPlaylistModal,
      // getPlaylistParam,
      // totalItem,
      // tableLoading,
      // addNewPlaylistParam,
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      listMediaNotBelongToPlaylist,
      selectedPlaylistItems,
    } = this.props.playlists;

    const isMediaSelected = listMediaNotBelongToPlaylist.some(
      (media: any) => media.isSelected === true,
    );
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
          <Table
            bordered
            rowKey="index"
            key={uuidv4()}
            components={{
              body: {
                wrapper: this.DraggableContainer,
                row: this.DraggableBodyRow,
              },
            }}
            dataSource={selectedPlaylistItems}
            title={() => {
              return (
                <>
                  <Button
                    onClick={async () => {
                      await this.setAddNewPlaylistItemsDrawer({
                        visible: true,
                      });
                    }}
                  >
                    <PlusSquareTwoTone /> Add New Playlist Items
                  </Button>
                </>
              );
            }}
          >
            <Column
              key="drag"
              dataIndex="sort"
              className={styles.dragVisible}
              render={() => <DragHandle />}
            ></Column>
            <Column key="index" title="No" dataIndex="index"></Column>
            <Column key="title" title="Title" dataIndex="title" className="drag-visible"></Column>
            <Column key="description" title="Duration" dataIndex="duration"></Column>
            <Column
              key="action"
              title="Action"
              render={(record: any) => {
                return (
                  <>
                    <Space>
                      <PlaySquareTwoTone
                        size={20}
                        onClick={() => {
                          this.selectPlaylistItem(record);
                        }}
                      />
                      <DeleteTwoTone
                        size={20}
                        twoToneColor="#f93e3e"
                        onClick={async () => {
                          this.removeItem(record).then(() => {
                            this.calculateTotalDuration().then(() => {
                              this.clearDuration();
                            });
                          });
                        }}
                      />
                    </Space>
                  </>
                );
              }}
            ></Column>
          </Table>
          <Row>
            <Col span={24}>{this.renderPreviewMedia()}</Col>
          </Row>
        </Form>
        {/* Add New Playlist Item */}
        <Drawer
          title="Media"
          width="80%"
          visible={this.props.playlists.addNewPlaylistItemsDrawer.visible}
          destroyOnClose={true}
          afterVisibleChange={() => {
            this.clearSearchListMediaParam();
          }}
          closable={false}
          footer={
            <>
              <Button
                onClick={this.addNewPlaylistItem}
                disabled={maxDuration - totalDuration < minDuration || !isMediaSelected}
              >
                <PlusCircleTwoTone />
                Add New PlaylistItem
              </Button>
            </>
          }
          onClose={async () => {
            this.calculateTotalDuration().then(() => {
              this.clearDuration().then(() => {
                this.clearSelectedMedia().then(() => {
                  this.setAddNewPlaylistItemsDrawer({
                    visible: false,
                  });
                });
              });
            });
          }}
        >
          <AddNewPlaylistItemDrawer {...this.props} />
        </Drawer>
      </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditPlaylistFormDrawer);
