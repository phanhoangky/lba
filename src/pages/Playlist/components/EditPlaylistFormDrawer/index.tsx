import type { UpdatePlaylistItemsByPlaylistIdParam } from '@/services/PlaylistPageService/PlaylistItemService';
import { openNotification } from '@/utils/utils';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  CloseCircleFilled,
  MenuOutlined,
  MinusSquareTwoTone,
  PlaySquareFilled,
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
  Modal,
  Empty,
  Divider,
  Slider,
  Popconfirm,
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
import { SelectMediaModal } from './components/SelectMediaModal';

export type EditPlaylistFormDrawerProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

type EditPlaylistFormDrawerState = {
  selectedPlaylistItem: PlaylistItem | undefined;
};

const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: 'pointer' }} className="lba-icon" />
));
const SortableItemComponent = SortableElement((props: any) => <tr {...props} />);
const SortableContainerComponent = SortableContainer((props: any) => <tbody {...props} />);

export class EditPlaylistFormDrawer extends React.Component<
  EditPlaylistFormDrawerProps,
  EditPlaylistFormDrawerState
> {
  constructor(props: EditPlaylistFormDrawerProps) {
    super(props);
    this.state = {
      selectedPlaylistItem: undefined,
    };
  }

  componentDidMount = () => {
    const { selectedPlaylist } = this.props.playlists;
    if (this.formRef.current && selectedPlaylist) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist.title,
        description: selectedPlaylist.description,
      });
    }
    this.calculateTotalDuration();
  };

  callGetListPlaylist = async (param?: any) => {
    const { getPlaylistParam } = this.props.playlists;
    // this.setTableLoading(true);
    await this.props.dispatch({
      type: 'playlists/getListPlaylist',
      payload: {
        ...getPlaylistParam,
        ...param,
      },
    });
    // .then(() => {
    //   this.setTableLoading(false);
    // })
    // .catch(() => {
    //   this.setTableLoading(false);
    // });
  };

  // setTableLoading = async (loading: boolean) => {
  //   await this.props.dispatch({
  //     type: 'playlists/setTableLoadingReducer',
  //     payload: loading,
  //   });
  // };

  // setSelectedPlaylistItems = async (payload: any) => {
  //   await this.props.dispatch({
  //     type: `playlists/setSelectedPlaylistItemsReducer`,
  //     payload,
  //   });
  // };

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

  // setViewPlaylistDetailComponent = async (param?: any) => {
  //   await this.props.dispatch({
  //     type: 'playlists/setViewPlaylistDetailComponentReducer',
  //     payload: {
  //       ...this.props.playlists.viewPlaylistDetailComponent,
  //       ...param,
  //     },
  //   });
  // };

  handleRemovePlaylist = async () => {
    const { selectedPlaylist } = this.props.playlists;
    Modal.confirm({
      title: `Are you sure you want to remove ${selectedPlaylist?.title}`,
      centered: true,
      closable: false,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      onOk: () => {
        this.setEditPlaylistDrawer({
          isLoading: true,
        }).then(() => {
          this.removePlaylist()
            .then(() => {
              this.callGetListPlaylist().then(() => {
                openNotification(
                  'success',
                  'Remove playlist successfully',
                  `Playlist ${selectedPlaylist?.title} was removed`,
                );
                this.setEditPlaylistDrawer({
                  isLoading: false,
                  visible: false,
                });
              });
            })
            .catch((error) => {
              openNotification('error', 'Fail to remove playlist', error.message);
              this.setEditPlaylistDrawer({
                isLoading: false,
                visible: false,
              });
            });
        });
      },
      onCancel: () => {
        this.setEditPlaylistDrawer({
          visible: false,
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
      // selectedPlaylistItems,
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

  // addMediaToListMedia = async (media: any) => {
  //   const { listMediaNotBelongToPlaylist } = this.props.playlists;

  //   const newList = cloneDeep(listMediaNotBelongToPlaylist);

  //   if (newList && newList.every((s) => s.id !== media.id)) {
  //     newList.push({ ...media });
  //     this.setListMediaNotBelongToPlaylist(newList);
  //   }
  // };

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
      await this.setSelectedPlaylist({
        playlistItems: newItems,
      });
      // this.setSelectedPlaylistItems(newItems);
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

    // const medias = selectedPlaylist?.playlistItems.filter((item) => item.id === record.id)[0];

    // this.addMediaToListMedia(medias?.mediaSrc);
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

  handleUpdatePlaylist = async () => {
    const { selectedPlaylist } = this.props.playlists;
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
  };

  formRef = React.createRef<FormInstance<any>>();
  durationFormRef = React.createRef<FormInstance<any>>();
  render() {
    const {
      editPlaylistDrawer,
      totalDuration,
      maxDuration,
      minDuration,
      selectedPlaylist,
    } = this.props.playlists;
    const maxD = maxDuration || 240;
    // const minD = minDuration || 10;
    const totalD = totalDuration || 0;
    const availableDuration = maxD - totalD;
    return (
      <div className="modal-content">
        <Form
          name="edit_playlists_form_drawer"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 24,
          }}
          layout="vertical"
          ref={this.formRef}
        >
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
                  render={(record: PlaylistItem) => {
                    const available = maxD - (totalD - record.duration);
                    return (
                      <>
                        <Popconfirm
                          icon={<ClockCircleFilled className="lba-icon" />}
                          title={
                            <>
                              <Form ref={this.durationFormRef} name="slider_duration_form">
                                <Form.Item label="Total Duration">{totalD}</Form.Item>
                                <Form.Item label="Remain Duration">{available}</Form.Item>
                                <Form.Item
                                  label="Duration"
                                  name="duration"
                                  style={{
                                    width: '200px',
                                  }}
                                  rules={[
                                    {
                                      validator: (rule, value) => {
                                        const currentDuration = totalD - record.duration;
                                        if (currentDuration + value > maxD) {
                                          return Promise.reject(new Error('Over maximum duration'));
                                        }
                                        return Promise.resolve();
                                      },
                                    },
                                  ]}
                                >
                                  <Slider
                                    min={minDuration}
                                    max={maxDuration}
                                    disabled={totalD > maxD}
                                  />
                                </Form.Item>
                              </Form>
                            </>
                          }
                          visible={record.id === this.state.selectedPlaylistItem?.id}
                          onConfirm={() => {
                            this.durationFormRef.current?.validateFields().then((values) => {
                              this.setSelectedPlaylistItemsDuration(record, values.duration).then(
                                () => {
                                  this.calculateTotalDuration();
                                  this.setState({
                                    selectedPlaylistItem: undefined,
                                  });
                                },
                              );
                            });
                          }}
                          okButtonProps={{
                            loading: editPlaylistDrawer?.isLoading,
                            className: 'lba-btn',
                            icon: <CheckCircleFilled className="lba-icon" />,
                          }}
                          onCancel={() => {
                            this.setState({
                              selectedPlaylistItem: undefined,
                            });
                          }}
                          cancelButtonProps={{
                            loading: editPlaylistDrawer?.isLoading,
                            icon: <CloseCircleFilled className="lba-close-icon" />,
                          }}
                          destroyTooltipOnHide
                          popupVisible
                          afterVisibleChange={() => {
                            this.durationFormRef.current?.setFieldsValue({
                              duration: record.duration,
                            });
                          }}
                        >
                          <Button
                            className="lba-btn"
                            icon={<ClockCircleFilled className="lba-icon" />}
                            onClick={() => {
                              this.setState({
                                selectedPlaylistItem: record,
                              });
                            }}
                          >
                            {record.duration} s
                          </Button>
                        </Popconfirm>
                      </>
                    );
                  }}
                ></Column>

                <Column
                  key="action"
                  title="Action"
                  fixed="right"
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
                            onClick={() => {
                              this.removeItem(record).then(() => {
                                this.calculateTotalDuration();
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
        </Form>
      </div>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditPlaylistFormDrawer);
