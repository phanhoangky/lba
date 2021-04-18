import type { EditMediaParam } from '@/services/MediaSourceService';
import { openNotification } from '@/utils/utils';
import { DeleteTwoTone, EditFilled } from '@ant-design/icons';
import { Button, Popconfirm, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';

export type EditDrawerFooterProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
  user: UserModelState;
  handleUpdate: () => Promise<any>;
};

export class EditDrawerFooter extends React.Component<EditDrawerFooterProps> {
  state = {
    removeConfirmVisible: false,
  };

  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
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

  removeMedia = async (item: any) => {
    await this.props.dispatch({
      type: 'media/removeMedia',
      payload: {
        ...item,
        // privacy: 0,
        // hash,
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
  updateMedia = async (param: any) => {
    await this.props.dispatch({
      type: 'media/updateFile',
      payload: param,
    });
  };

  handleUpdateFile = async (modal?: any) => {
    const { selectedFile } = this.props.media;

    const param: EditMediaParam = {
      id: selectedFile?.id,
      description: selectedFile?.description,
      title: selectedFile?.title,
      typeId: selectedFile?.type.id,
      isSigned: selectedFile?.isSigned,
      ...modal,
      // ...values,
    };
    this.updateMedia(param);
    // if (this.formRef.current) {
    //   this.formRef.current.validateFields().then((values) => {
    //     const param: EditMediaParam = {
    //       id: selectedFile.id,
    //       description: selectedFile.description,
    //       title: selectedFile.title,
    //       typeId: selectedFile.type.id,
    //       isSigned: selectedFile.isSigned,
    //       ...modal,
    //       ...values,
    //     };
    //     this.updateMedia(param);
    //   });
    // }
  };

  render() {
    const { selectedFile } = this.props.media;
    // const { currentUser } = this.props.user;
    return (
      <>
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Popconfirm
              title={`Remove ${selectedFile?.title}`}
              visible={this.state.removeConfirmVisible}
              onConfirm={async () => {
                this.setEditFileDrawer({
                  isLoading: true,
                })
                  .then(async () => {
                    // const signature: string = await currentUser?.ether?.deleteDocument(
                    //   selectedFile?.securityHash,
                    // );
                    // console.log('====================================');
                    // console.log('Remove Media >>>', selectedFile, signature);
                    // console.log('====================================');
                    this.removeMedia(selectedFile)
                      .then(() => {
                        this.callGetListMedia().then(() => {
                          openNotification(
                            'success',
                            'remove media sucessfully',
                            `${selectedFile?.title} is removed`,
                          );
                          this.setEditFileDrawer({
                            isLoading: false,
                          }).then(() => {
                            this.setState({
                              removeConfirmVisible: false,
                            });
                          });
                        });
                      })
                      .catch((error) => {
                        openNotification('error', 'fail to remove media', error.message);
                      });
                    // if (signature && !signature.toLowerCase().includes('fail')) {

                    // } else {
                    //   // throw new Error(signature);
                    //   openNotification('error', 'fail to remove media', signature);
                    // }
                  })
                  .catch((error) => {
                    openNotification('error', 'fail to remove media', error);
                    this.setEditFileDrawer({
                      isLoading: false,
                    }).then(() => {
                      this.setState({
                        removeConfirmVisible: false,
                      });
                    });
                  });
              }}
              okButtonProps={{ loading: this.props.media.editFileDrawer?.isLoading }}
              onCancel={() => {
                this.setState({
                  removeConfirmVisible: false,
                });
              }}
            >
              <Button
                danger
                onClick={() => {
                  this.setState({
                    removeConfirmVisible: true,
                  });
                }}
              >
                <DeleteTwoTone twoToneColor={'#f64842'} /> Remove
              </Button>
            </Popconfirm>
            <Button
              className="lba-btn"
              onClick={async () => {
                // await this.setEditFileDrawer({
                //   visible: false,
                // });
                this.setEditFileDrawer({
                  isLoading: true,
                })
                  .then(() => {
                    this.props
                      .handleUpdate()
                      .then(() => {
                        this.callGetListMedia().then(() => {
                          openNotification(
                            'success',
                            'update media sucessfully',
                            `${selectedFile?.title} is updated`,
                          );
                          this.setEditFileDrawer({
                            isLoading: false,
                          });
                        });
                      })
                      .catch((error: any) => {
                        openNotification('error', 'Fail to update media ', error.message);
                        this.setEditFileDrawer({
                          isLoading: false,
                        });
                      });
                  })
                  .catch((error) => {
                    openNotification('error', 'Fail to update media ', error.message);
                    this.setEditFileDrawer({
                      isLoading: false,
                    });
                  });
              }}
            >
              <EditFilled className="lba-icon" /> Update Media
            </Button>
          </Space>
        </div>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditDrawerFooter);
