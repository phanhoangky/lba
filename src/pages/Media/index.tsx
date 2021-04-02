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
  CloseCircleFilled,
  ExclamationCircleOutlined,
  FolderOpenFilled,
  FolderOpenTwoTone,
  FormOutlined,
  HomeTwoTone,
  SettingTwoTone,
} from '@ant-design/icons';
import { Keccak } from 'sha3';
import type { EditMediaParam } from '@/services/MediaSourceService';
import { AddNewFolderFormModal } from './components/AddNewFolderFormModal';
import { AddNewFileFormModal } from './components/AddNewFileFormModal';
import { EditMediaFormDrawer } from './components/EditMediaFormDrawer';
import { ListMediasHeaderComponent } from './components/ListMediasHeaderComponent';
import { EditDrawerFooter } from './components/EditMediaFormDrawer/EditDrawerFooter';

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
          this.readJWT();
          Promise.all([
            this.callGetListFolders(),
            this.callGetListMedia(),
            this.callGetListMediaType(),
            this.addBreadscrumbHome(),
          ]).then(() => {
            this.setGetListFilesParam({
              id: undefined,
            });
            this.setListLoading(false);
          });
        });
      })
      .catch(() => {
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
    await this.props.dispatch({
      type: 'media/setBreadScrumbReducer',
      payload: [
        {
          id: user.currentUser?.rootFolderId,
          name: 'Home',
          path: '',
          parent_id: '',
          created_at: '',
          updated_at: '',
        },
      ],
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
      payload: '',
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
    this.callGetListFolders({
      ...getListFolderParam,
      parent_id: item.id,
    }).then(() => {
      this.callGetListMedia({
        ...getListFileParam,
        folder: item.id,
      }).then(() => {
        const newItem: FolderType = {
          id: item.id,
          name: item.name,
          created_at: '',
          updated_at: '',
          parent_id: '',
          path: '',
        };
        const newList = cloneDeep(breadScrumb);
        newList?.push(newItem);
        this.props.dispatch({
          type: 'media/setBreadScrumbReducer',
          payload: newList,
        });
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

  signMedia = async (item: any) => {
    Modal.confirm({
      centered: true,
      title: 'Do you want to sign this media?',
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        // const { createFileParam } = this.props.media;
        // await this.setCreateFileParam({
        //   isSigned: 1,
        // });
        this.setListLoading(true)
          .then(async () => {
            const { currentUser } = this.props.user;

            const signature = await currentUser?.ether?.signDocument(item.securityHash);
            this.updateFile({
              isSigned: 1,
              hash: signature,
            }).then(() => {
              this.callGetListMedia().then(() => {
                this.setListLoading(false);
              });
            });
          })
          .catch(() => {
            this.setListLoading(false);
          });
      },
      onCancel: async () => {},
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
    this.props.dispatch({
      type: 'media/setSelectedFileReducer',
      payload: {
        ...this.props.media.selectedFile,
        ...item,
      },
    });
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

    this.props.dispatch({
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

  breadScrumbNavigate = async (index: number) => {
    const { breadScrumb, getListFileParam } = this.props.media;
    if (breadScrumb) {
      const newBreadScrumb = breadScrumb.slice(0, index + 1);

      await this.setListLoading(true);
      this.setBreadScrumb(newBreadScrumb)
        .then(() => {
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

  removeFolder = async (id: string) => {
    await this.props.dispatch({
      type: `media/removeFolder`,
      payload: id,
    });
  };

  // handleRemoveFolder = async (id: string) => {};

  handleFolderContextMenuClick = async (menu: any, item: any) => {
    if (menu === 'open') {
      this.toNextFolder(item);
    }

    if (menu === 'remove') {
      this.removeFolder(item.id);
    }
  };

  editMediaFormRef = React.createRef<EditMediaFormDrawer>();
  editMediaFooterRef = React.createRef<EditDrawerFooter>();
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
      if (status === 0) {
        return 'Not Verify';
      }

      if (status === 1) {
        return 'Waiting for server';
      }
      return 'Approved';
    };

    return (
      <>
        <PageContainer>
          <Skeleton active loading={listLoading}>
            <Breadcrumb>
              <Breadcrumb.Item></Breadcrumb.Item>
              {breadScrumb &&
                breadScrumb.map((item: FolderType, index: number) => {
                  return (
                    <Breadcrumb.Item
                      key={item.id}
                      onClick={() => {
                        this.breadScrumbNavigate(index);
                      }}
                    >
                      {item.name === 'Home' ? <HomeTwoTone /> : item.name}
                    </Breadcrumb.Item>
                  );
                })}
            </Breadcrumb>
          </Skeleton>
          <Divider></Divider>
          {/* ========================================================================================================================== */}

          <ListMediasHeaderComponent {...this.props} />
          <Divider></Divider>
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}
          {/** List Folders */}
          <List
            grid={{
              gutter: 20,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 6,
            }}
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
                              <Menu.Item key="open" icon={<FolderOpenFilled />}>
                                Open
                              </Menu.Item>
                              <Menu.Item key="remove" icon={<CloseCircleFilled />}>
                                Remove
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={['contextMenu']}
                        >
                          <Button
                            size="large"
                            type={item.isSelected ? 'primary' : 'default'}
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
                              this.toNextFolder(item);
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

          <Divider></Divider>
          {/* ========================================================================================================================== */}

          {/* ========================================================================================================================== */}

          {/** List Media */}

          <List
            grid={{
              gutter: 10,
              md: 2,
              lg: 2,
              xl: 3,
              xxl: 4,
            }}
            split
            style={{ alignItems: 'center', alignContent: 'center' }}
            dataSource={listMedia}
            loading={listLoading}
            pagination={{
              current: getListFileParam?.pageNumber ? getListFileParam.pageNumber + 1 : 1,
              total: totalItem,
              pageSize: getListFileParam?.limit ? getListFileParam?.limit : 9,
              onChange: async (e) => {
                if (searchListMediaParam?.title === '') {
                  if (getListFileParam?.limit) {
                    this.setListLoading(true).then(() => {});

                    this.callGetListMedia({
                      offset: (e - 1) * getListFileParam.limit,
                      pageNumber: e - 1,
                    })
                      .then(() => {
                        this.setListLoading(false);
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  }
                } else {
                  await this.setListLoading(true);

                  this.callSearchListMedia({
                    pageNumber: e - 1,
                  })
                    .then(() => {
                      this.setListLoading(false);
                    })
                    .catch(() => {
                      this.setListLoading(false);
                    });
                }
              },
            }}
            header={<>{/* <Skeleton active loading={listLoading}></Skeleton> */}</>}
            renderItem={(item) => {
              return (
                <>
                  {listMedia && listMedia.length > 0 && (
                    <Skeleton active avatar loading={listLoading}>
                      <List.Item>
                        <Card
                          bordered
                          hoverable
                          onClick={() => {
                            this.setSelectedFile(item);
                          }}
                          style={{ width: '100%', height: '100%' }}
                          cover={
                            item.type.name.toLowerCase().includes('image') ? (
                              <Image
                                src={item.urlPreview}
                                alt="image"
                                height={200}
                                preview={false}
                              />
                            ) : (
                              <HoverVideoPlayer
                                style={{ height: 200 }}
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
                              onClick={() => {
                                if (item.isSigned === 0) {
                                  this.signMedia(item);
                                }
                              }}
                            ></Alert>,

                            <SettingTwoTone
                              style={{ height: '40px', lineHeight: '40px', fontSize: '1.5em' }}
                              onClick={async () => {
                                this.setSelectedFile(item).then(() => {
                                  this.setEditFileDrawer({
                                    visible: true,
                                  });
                                });
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
          {/* ========================================================================================================================== */}

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
        </PageContainer>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(Media);
