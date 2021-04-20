import { PageContainer } from '@ant-design/pro-layout';
import {
  Image,
  Button,
  Modal,
  Divider,
  Drawer,
  List,
  Card,
  Skeleton,
  Breadcrumb,
  Alert,
  Dropdown,
  Menu,
} from 'antd';
import * as React from 'react';
import type { Dispatch, FolderType, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import HoverVideoPlayer from 'react-hover-video-player';
import 'react-loader-spinner/dist/loader/css/react-spinner-loader.css';
import { cloneDeep } from 'lodash';

import {
  CheckCircleFilled,
  CloseCircleFilled,
  DeleteTwoTone,
  ExclamationCircleOutlined,
  FolderOpenFilled,
  FolderOpenTwoTone,
  FormOutlined,
  HomeTwoTone,
  SettingFilled,
  SettingTwoTone,
} from '@ant-design/icons';
import { Keccak } from 'sha3';
import type { EditMediaParam } from '@/services/MediaSourceService';
import { AddNewFolderFormModal } from './components/AddNewFolderFormModal';
import { AddNewFileFormModal } from './components/AddNewFileFormModal';
import { EditMediaFormDrawer } from './components/EditMediaFormDrawer';
import { ListMediasHeaderComponent } from './components/ListMediasHeaderComponent';
import { EditDrawerFooter } from './components/EditMediaFormDrawer/EditDrawerFooter';
import { RenameFolderModal } from './components/RenameFolderModal';
import styles from './index.less';
import { openNotification } from '@/utils/utils';
import { ViewMediaDetailComponent } from './components/ViewMediaDetailComponent';

export type MediaSourceProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
  user: UserModelState;
};

class Media extends React.Component<MediaSourceProps> {
  state = {
    removeConfirmVisible: false,
  };

  componentDidMount = () => {
    this.setListLoading(true)
      .then(() => {
        this.getCurrentUser().then(async () => {
          this.readJWT().catch((error) => {
            openNotification('error', 'Error Occured', error.message);
          });
          Promise.all([
            this.callGetListFolders(),
            this.callGetListMedia(),
            this.callGetListMediaType(),
            this.addBreadscrumbHome(),
          ]).then(() => {
            this.setGetListFilesParam({
              id: undefined,
              isSigned: undefined,
            });
            this.setListLoading(false);
          });
        });
      })
      .catch((error) => {
        openNotification('error', 'Error occured', error);
        this.setListLoading(false);
      });
  };

  readJWT = async () => {
    await this.props.dispatch({
      type: 'user/readJWT',
    });
  };

  addBreadscrumbHome = async () => {
    const { user } = this.props;
    await this.setBreadScrumb([
      {
        id: user.currentUser?.rootFolderId,
        name: 'Home',
        path: '',
        parent_id: '',
      },
    ]);
  };

  setListMedias = async (list: any) => {
    await this.props.dispatch({
      type: 'media/setListMediaReducer',
      payload: list,
    });
  };

  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
    });
  };

  getCurrentUser = async () => {
    const res = await this.props.dispatch({
      type: 'user/getCurrentUser',
    });
    Promise.all([
      this.setCreateFileParam({
        accountId: this.props.user.currentUser?.id,
      }),
      this.setGetListFilesParam({
        folder: res.rootFolderId,
      }),
      this.setGetListFolderParam({
        parent_id: res.rootFolderId,
      }),
    ]);
  };

  setCreateFileParam = async (param: any) => {
    await this.props.dispatch({
      type: 'media/setCreateFileParamReducer',
      payload: {
        ...this.props.media.createFileParam,
        ...param,
      },
    });
  };

  setGetListFolderParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setGetListFolderParamReducer',
      payload: {
        ...this.props.media.getListFolderParam,
        ...param,
      },
    });
  };

  setGetListFilesParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setGetListFileParamReducer',
      payload: {
        ...this.props.media.getListFileParam,
        ...param,
      },
    });
  };

  callGetListMedia = async (payload?: any) => {
    const { dispatch, media } = this.props;
    await dispatch({
      type: 'media/getListMediaFromFileId',
      payload: {
        ...media.getListFileParam,
        ...payload,
      },
    });
  };

  callSearchListMedia = async (payload?: any) => {
    await this.props.dispatch({
      type: 'media/searchListMedia',
      payload: {
        ...this.props.media.searchListMediaParam,
        ...payload,
      },
    });
  };

  callGetListFolders = async (payload?: any) => {
    await this.props.dispatch({
      type: 'media/getListFolder',
      payload: {
        ...this.props.media.getListFolderParam,
        ...payload,
      },
    });
  };

  callGetListMediaType = async () => {
    await this.props.dispatch({
      type: 'media/getListMediaType',
    });
  };

  setSelectedFolder = async (folder: any) => {
    const { listFolder } = this.props.media;
    await this.props.dispatch({
      type: 'media/setListFolderReducer',
      payload: listFolder?.map((f: any) => {
        if (f.id === folder.id) {
          return {
            ...f,
            isSelected: true,
          };
        }
        return {
          ...f,
          isSelected: false,
        };
      }),
    });
  };

  toNextFolder = async (item: any) => {
    const { getListFolderParam, getListFileParam, breadScrumb } = this.props.media;
    this.setListLoading(true).then(() => {
      Promise.all([
        this.callGetListFolders({
          ...getListFolderParam,
          parent_id: item.id,
        }),
        this.callGetListMedia({
          ...getListFileParam,
          folder: item.id,
        }),
      ])
        .then(() => {
          const newItem: FolderType = {
            id: item.id,
            name: item.name,
            parent_id: '',
            path: '',
          };
          const newList = cloneDeep(breadScrumb);
          newList?.push(newItem);
          this.setBreadScrumb(newList).then(() => {
            this.setListLoading(false);
          });
        })
        .catch(() => {
          this.setListLoading(false);
        });
    });
  };

  addNewFile = async () => {
    const { createFileParam } = this.props.media;
    const { currentUser } = this.props.user;
    const hash = new Keccak(256);
    const byte = await createFileParam?.file.arrayBuffer();
    hash.update(Buffer.from(byte));
    const security = hash.digest('hex');
    if (currentUser) {
      if (createFileParam?.isSigned) {
        await currentUser.ether?.addDocument(security);
      }
    }

    await this.props.dispatch({
      type: 'media/createFile',
      payload: {
        ...createFileParam,
        securityHash: security,
        public_id: security,
        accountId: this.props.user.currentUser?.id,
        fileId: createFileParam?.fileId,
        isSigned: createFileParam?.isSigned,
      },
    });

    this.setListLoading(true)
      .then(async () => {
        Promise.all([
          this.callGetListMedia(),
          this.callGetListFolders(),
          this.clearCreateFileParam(),
          this.clearFilelist(),
        ]).then(() => {
          this.setListLoading(false);
        });
      })
      .catch(() => {
        this.setListLoading(false);
      });
  };

  clearFilelist = async () => {
    await this.props.dispatch({
      type: 'media/clearAddNewFileNodalFileList',
    });
  };

  setEditFileDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: 'media/setEditFileDrawerReducer',
      payload: {
        ...this.props.media.editFileDrawer,
        ...modal,
      },
    });
  };

  setSelectedFile = async (item: any) => {
    const { listMedia } = this.props.media;
    await this.props.dispatch({
      type: 'media/setSelectedFileReducer',
      // payload: {
      //   ...this.props.media.selectedFile,
      //   ...item,
      // },
      payload: item,
    });

    const newList = listMedia?.map((m) => {
      if (m.id === item.id) {
        return {
          ...m,
          isSelected: true,
        };
      }
      return {
        ...m,
        isSelected: false,
      };
    });

    await this.setListMedias(newList);
  };

  updateFile = async (modal?: any) => {
    const { selectedFile } = this.props.media;

    const param: EditMediaParam = {
      id: selectedFile?.id,
      description: selectedFile?.description,
      title: selectedFile?.title,
      typeId: selectedFile?.type.id,
      isSigned: selectedFile?.isSigned,
      ...modal,
    };

    await this.props.dispatch({
      type: 'media/updateFile',
      payload: param,
    });
  };

  removeMedia = async (item: any) => {
    await this.props.dispatch({
      type: 'media/removeMedia',
      payload: {
        ...item,
        privacy: 0,
      },
    });
  };

  clearCreateFileParam = async () => {
    await this.props.dispatch({
      type: 'media/clearCreateFileParamReducer',
      payload: '',
    });
  };

  breadScrumbNavigate = (index: number) => {
    const { breadScrumb, getListFileParam } = this.props.media;
    if (breadScrumb) {
      const newBreadScrumb = breadScrumb.slice(0, index + 1);

      this.setListLoading(true)
        .then(() => {
          this.setBreadScrumb(newBreadScrumb).then(() => {
            this.callGetListFolders({
              parent_id: breadScrumb[index].id,
            }).then(() => {
              this.callGetListMedia({
                ...getListFileParam,
                folder: breadScrumb[index].id,
              }).then(() => {
                this.setListLoading(false);
              });
            });
          });
        })
        .catch(() => {
          this.setListLoading(false);
        });
    }
  };

  setBreadScrumb = async (list: any) => {
    await this.props.dispatch({
      type: 'media/setBreadScrumbReducer',
      payload: list,
    });
  };

  removeFolder = async (id: string, path: string) => {
    const res = await this.props.dispatch({
      type: `media/removeFolder`,
      payload: {
        id,
        path,
      },
    });
    return res;
  };

  checkFolderHaveAnySubfolders = async (parent_id: string) => {
    const res = await this.props.dispatch({
      type: `media/checkFolderHaveAnySubfolders`,
      payload: {
        parent_id,
      },
    });
    return res;
  };

  handleRemoveFolder = async (item: any) => {
    Modal.confirm({
      centered: true,
      closable: false,
      title: `Do you want to remove ${item.name} ?`,
      icon: <ExclamationCircleOutlined />,
      okButtonProps: {
        className: 'lba-btn',
        icon: <CheckCircleFilled className="lba-icon" />,
      },
      cancelButtonProps: {
        icon: <CloseCircleFilled className="lba-close-icon" />,
        danger: true,
      },
      content: (
        <>
          If you remove this folder, every files inside will be removes aslo{'\n'}
          <span style={{ color: 'red' }}>No undo option is possible</span>
        </>
      ),
      onOk: () => {
        this.setListLoading(true).then(() => {
          this.removeFolder(item.id, item.path)
            .then(() => {
              this.callGetListFolders().then(() => {
                openNotification('success', 'Remove folder successfully');
                this.setListLoading(false);
              });
            })
            .catch((error) => {
              openNotification('error', 'Fail to remove folders', error.message);
              this.setListLoading(false);
            });
        });
      },
      onCancel: () => {
        this.setListLoading(false);
      },
    });
  };

  handleFolderContextMenuClick = async (menu: any, item: any) => {
    if (menu.key === 'open') {
      this.toNextFolder(item).then(() => {
        // this.setViewMediaDetailComponent({
        //   visible: false,
        // });
      });
    }

    if (menu.key === 'remove') {
      this.handleRemoveFolder(item).then(() => {
        // this.setViewMediaDetailComponent({
        //   visible: false,
        // });
      });
    }

    if (menu.key === 'rename') {
      this.setSelectedFolder(item).then(() => {
        this.setRenameFolderModal({
          visible: true,
        });
      });
    }
  };

  setRenameFolderModal = async (param?: any) => {
    await this.props.dispatch({
      type: `media/setRenameFolderModalReducer`,
      payload: {
        ...this.props.media.renameFolderModal,
        ...param,
      },
    });
  };

  setViewMediaDetailComponent = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setViewMediaDetailComponentReducer',
      payload: {
        ...this.props.media.viewMediaDetailComponent,
        ...param,
      },
    });
  };
  editMediaFormRef = React.createRef<EditMediaFormDrawer>();
  editMediaFooterRef = React.createRef<EditDrawerFooter>();
  renameFolderModalRef = React.createRef<RenameFolderModal>();
  render() {
    const {
      totalItem,
      getListFileParam,
      listMedia,
      listLoading,
      listFolder,
      breadScrumb,
      editFileDrawer,
      searchListMediaParam,
      selectedFile,
      renameFolderModal,
      viewMediaDetailComponent,
    } = this.props.media;

    const signatureOfMedia = (status: number) => {
      if (status === 0) {
        return 'error';
      }

      if (status === 1) {
        return 'warning';
      }
      return 'success';
    };

    const messageOfSignature = (status: number) => {
      if (status === 3) {
        return 'Rejected';
      }

      if (status === 1) {
        return 'Waiting';
      }
      return 'Approved';
    };

    return (
      <>
        <PageContainer
          title={false}
          header={{
            ghost: false,
            style: {
              padding: 0,
            },
          }}
        >
          <Skeleton active loading={listLoading}>
            <Breadcrumb className={styles.breadscrumb}>
              {breadScrumb &&
                breadScrumb.map((item: FolderType, index: number) => {
                  return (
                    <Breadcrumb.Item
                      className="breadcrumb-item"
                      key={item.id}
                      onClick={() => {
                        this.breadScrumbNavigate(index);
                      }}
                    >
                      {item.name === 'Home' ? (
                        <HomeTwoTone
                          twoToneColor="#000000"
                          style={{
                            fontSize: '1.2em',
                          }}
                        />
                      ) : (
                        item.name
                      )}
                    </Breadcrumb.Item>
                  );
                })}
            </Breadcrumb>
          </Skeleton>
          <Divider></Divider>
          {/* ========================================================================================================================== */}

          <ListMediasHeaderComponent {...this.props} />
          <Divider orientation="left" className="lba-text">
            Folders
          </Divider>
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}
          {/** List Folders */}
          <List
            grid={{
              gutter: 20,
            }}
            className={styles.listFolderStyles}
            dataSource={listFolder}
            loading={listLoading}
            renderItem={(item) => {
              return (
                <>
                  {listFolder && listFolder.length > 0 && (
                    <Skeleton active loading={listLoading}>
                      <List.Item style={{ height: 50 }}>
                        <Dropdown
                          overlay={
                            <Menu
                              onClick={(e) => {
                                this.handleFolderContextMenuClick(e, item);
                              }}
                            >
                              <Menu.Item
                                key="open"
                                icon={
                                  <FolderOpenFilled
                                    style={{
                                      color: '#00cdac',
                                    }}
                                  />
                                }
                              >
                                Open
                              </Menu.Item>
                              <Menu.Item
                                key="rename"
                                icon={
                                  <FormOutlined
                                    style={{
                                      color: '#00cdac',
                                    }}
                                  />
                                }
                              >
                                Rename
                              </Menu.Item>
                              <Menu.Item
                                key="remove"
                                icon={<DeleteTwoTone twoToneColor="#f93e3e" />}
                              >
                                Remove
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['contextMenu']}
                        >
                          <Button
                            size="large"
                            // type={item.isSelected ? 'primary' : 'default'}
                            className={item.isSelected ? 'selected-folder' : ''}
                            style={{
                              width: 200,
                              height: 50,
                              borderRadius: '5px',
                              textAlign: 'left',
                            }}
                            icon={<FolderOpenTwoTone twoToneColor="#ffbb55" />}
                            onClick={() => {
                              this.setSelectedFolder(item);
                            }}
                            onDoubleClick={() => {
                              this.toNextFolder(item).then(() => {
                                // this.setViewMediaDetailComponent({
                                //   visible: false,
                                // });
                              });
                            }}
                          >
                            {item.name}
                          </Button>
                        </Dropdown>
                      </List.Item>
                    </Skeleton>
                  )}
                </>
              );
            }}
          ></List>

          <Divider orientation="left" className="lba-text">
            Medias
          </Divider>
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}

          {/** List Media */}

          <List
            className={styles.listMediasStyles}
            grid={{
              gutter: 20,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 3,
            }}
            style={{ alignItems: 'center', alignContent: 'center' }}
            dataSource={listMedia}
            loading={listLoading}
            pagination={{
              current: getListFileParam?.pageNumber ? getListFileParam.pageNumber + 1 : 1,
              total: totalItem,
              pageSize: getListFileParam?.limit ? getListFileParam?.limit : 9,
              onChange: async (e) => {
                if (searchListMediaParam?.title === '') {
                  if (getListFileParam && getListFileParam.limit) {
                    this.setListLoading(true)
                      .then(() => {
                        this.callGetListMedia({
                          offset: getListFileParam.limit ? (e - 1) * getListFileParam.limit : 0,
                          pageNumber: e - 1,
                        }).then(() => {
                          this.setListLoading(false);
                        });
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  }
                } else {
                  this.setListLoading(true)
                    .then(() => {
                      this.callSearchListMedia({
                        pageNumber: e - 1,
                      }).then(() => {
                        this.setListLoading(false);
                      });
                    })
                    .catch(() => {
                      this.setListLoading(false);
                    });
                }
              },
            }}
            header={false}
            renderItem={(item) => {
              return (
                <>
                  {listMedia && listMedia.length > 0 && (
                    <Skeleton active avatar loading={listLoading}>
                      <List.Item>
                        <Card
                          className={item.isSelected ? 'selected-media' : 'normal-media'}
                          bordered
                          hoverable
                          onClick={() => {
                            this.setSelectedFile(item).then(() => {
                              this.setViewMediaDetailComponent({
                                visible: true,
                              });
                            });
                          }}
                          style={{ width: '100%', height: '100%' }}
                          cover={
                            item.type.name.toLowerCase().includes('image') ? (
                              <Image
                                src={item.urlPreview}
                                height={300}
                                alt="image"
                                preview={false}
                              />
                            ) : (
                              <HoverVideoPlayer
                                style={{ height: '300px', width: '100%' }}
                                videoSrc={item.urlPreview}
                                restartOnPaused
                              />
                            )
                          }
                          // title={item.title}
                          actions={[
                            <Alert
                              style={{ height: '40px' }}
                              type={signatureOfMedia(item.isSigned)}
                              message={messageOfSignature(item.isSigned)}
                              icon={<FormOutlined />}
                              showIcon={true}
                            ></Alert>,
                            <SettingFilled
                              className="lba-icon"
                              style={{ height: '40px', lineHeight: '40px', fontSize: '1.5em' }}
                              onClick={(e) => {
                                this.setSelectedFile(item).then(() => {
                                  this.setEditFileDrawer({
                                    visible: true,
                                  });
                                });
                                e.stopPropagation();
                              }}
                            />,
                          ]}
                        >
                          <Card.Meta title={item.title} />
                        </Card>
                      </List.Item>
                    </Skeleton>
                  )}
                </>
              );
            }}
          ></List>
          {/* <Col span={8}>
              {viewMediaDetailComponent?.visible && (
                <Typography.Title level={4} className="lba-text">
                  Media Detail
                </Typography.Title>
              )}
              {viewMediaDetailComponent?.visible && <ViewMediaDetailComponent {...this.props} />}
              {!viewMediaDetailComponent?.visible && <Empty description={<>Preview Media</>} />}
            </Col> */}
          {/* View Detail Media Drawer ========================================================================================================================== */}
          <Drawer
            visible={viewMediaDetailComponent?.visible}
            closable={false}
            destroyOnClose={true}
            width={'40%'}
            onClose={() => {
              this.setViewMediaDetailComponent({
                visible: false,
              });
            }}
            title="Media Detail"
          >
            <ViewMediaDetailComponent {...this.props} />
          </Drawer>
          {/* ========================================================================================================================== */}
          {/** Add New File Modal */}

          <AddNewFileFormModal {...this.props} />
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}
          {/** Add New Folder Modal */}
          <AddNewFolderFormModal {...this.props} />

          {/* ========================================================================================================================== */}

          {/** Edit File */}
          {/* ========================================================================================================================== */}
          {/* {editFileDrawer.visible && <EditMediaFormDrawer {...this.props} />} */}
          <Drawer
            closable={false}
            destroyOnClose={true}
            visible={editFileDrawer?.visible}
            width={700}
            onClose={async () => {
              await this.setEditFileDrawer({
                visible: false,
              });
            }}
            title={
              <>
                <div>{selectedFile?.title}</div>
              </>
            }
            footer={
              <>
                <EditDrawerFooter
                  ref={this.editMediaFooterRef}
                  handleUpdate={async () => {
                    this.editMediaFormRef.current?.handleUpdateFile();
                  }}
                  {...this.props}
                />
              </>
            }
          >
            <EditMediaFormDrawer ref={this.editMediaFormRef} {...this.props} />
          </Drawer>
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}
          {/* Rename Folder Modal */}
          <Modal
            visible={renameFolderModal?.visible}
            confirmLoading={renameFolderModal?.isLoading}
            destroyOnClose={true}
            closable={false}
            centered
            onCancel={() => {
              this.setRenameFolderModal({
                visible: false,
                isLoading: false,
              });
            }}
            onOk={() => {
              this.renameFolderModalRef.current?.handleUpdateFolder();
            }}
            okButtonProps={{
              className: 'lba-btn',
              icon: <CheckCircleFilled className="lba-icon" />,
            }}
            cancelButtonProps={{
              icon: <CloseCircleFilled className="lba-close-icon" />,
              danger: true,
            }}
          >
            {renameFolderModal?.visible && (
              <RenameFolderModal ref={this.renameFolderModalRef} {...this.props} />
            )}
          </Modal>
          {/* End Rename Folder Modal */}
        </PageContainer>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(Media);
