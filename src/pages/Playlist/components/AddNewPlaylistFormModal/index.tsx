import { CreateDoneComponent } from '@/pages/common/CreateDoneComponent';
import { openNotification } from '@/utils/utils';
import { FormOutlined, PlaySquareOutlined, SmileFilled } from '@ant-design/icons';
import { Steps, Button, Space } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import { InputTitleStepComponent } from './components/InputTitleStepComponent';
import { SelectMediaStepComponent } from './components/SelectMediaStepComponent';

export type AddNewPlaylistFormModalProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export type AddNewPlaylistFormModalStates = {
  currentStep: number;
};

export const PLAYLIST_STORE = 'playlists';
export class AddNewPlaylistFormModal extends React.Component<
  AddNewPlaylistFormModalProps,
  AddNewPlaylistFormModalStates
> {
  constructor(props: AddNewPlaylistFormModalProps) {
    super(props);

    this.state = {
      currentStep: 0,
    };
  }

  setAddNewPlaylistModal = async (modal: any) => {
    const { addNewPlaylistModal } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/setAddNewPlaylistModalReducer',
      payload: {
        ...addNewPlaylistModal,
        ...modal,
      },
    });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'playlists/setTableLoadingReducer',
      payload: loading,
    });
  };

  callGetListPlaylist = async () => {
    const { getPlaylistParam } = this.props.playlists;

    this.setTableLoading(true)
      .then(() => {
        this.props
          .dispatch({
            type: 'playlists/getListPlaylist',
            payload: getPlaylistParam,
          })
          .then(() => {
            this.setTableLoading(false);
          });
      })
      .catch(() => {
        this.setTableLoading(false);
      });
  };

  createPlaylist = async (param?: any) => {
    const { addNewPlaylistParam } = this.props.playlists;
    await this.props.dispatch({
      type: 'playlists/addNewPlaylist',
      payload: {
        ...addNewPlaylistParam,
        ...param,
        accountId: this.props.user.currentUser?.id,
      },
    });
  };

  onCreatePlaylist = async (values?: any) => {
    // const {  } = this.props.playlists;
    this.setAddNewPlaylistModal({
      isLoading: true,
    })
      .then(() => {
        this.createPlaylist(values)
          .then(() => {
            this.callGetListPlaylist().then(() => {
              const { addNewPlaylistModal, addNewPlaylistParam } = this.props.playlists;
              openNotification(
                'success',
                'Create playlist successfully',
                `${addNewPlaylistParam?.title} was created`,
              );
              if (addNewPlaylistModal) {
                this.setAddNewPlaylistModal({
                  visible: false,
                  isLoading: false,
                  playingUrl: undefined,
                  playlingMediaType: undefined,
                  currentStep: 0,
                });
              }
            });
          })
          .catch((error) => {
            openNotification('error', 'Fail to create Playlist', error.message);
            this.setAddNewPlaylistModal({
              visible: false,
              isLoading: false,
            });
          });
      })
      .catch(() => {
        this.setAddNewPlaylistModal({
          isLoading: false,
          visible: false,
        });
      });
  };
  formRef = React.createRef<FormInstance>();
  inputTitleStepRef = React.createRef<InputTitleStepComponent>();
  steps = [
    {
      title: 'Title and Description',
      content: <InputTitleStepComponent {...this.props} />,
      icon: <FormOutlined className="lba-icon" />,
    },
    {
      title: 'Select Media',
      content: <SelectMediaStepComponent {...this.props} />,
      icon: <PlaySquareOutlined className="lba-icon" />,
    },
    {
      title: 'Done',
      // content: <SelectMediaStepComponent {...this.props} />,
      icon: <SmileFilled className="lba-icon" />,
    },
  ];
  render() {
    const { addNewPlaylistModal } = this.props.playlists;

    const currentStep = addNewPlaylistModal ? addNewPlaylistModal.currentStep : 0;
    return (
      // <Modal
      //   title="Add New Playlist"
      //   visible={addNewPlaylistModal?.visible}
      //   destroyOnClose={true}
      //   centered
      //   confirmLoading={addNewPlaylistModal?.isLoading}
      //   className={styles.addNewPlaylistModal}
      //   onCancel={async () => {
      //     await this.setAddNewPlaylistModal({
      //       visible: false,
      //       playingUrl: undefined,
      //       playlingMediaType: undefined,
      //     });
      //   }}
      //   width={'60%'}
      //   afterClose={async () => {
      //     await this.props.dispatch({
      //       type: 'playlists/clearAddNewPlaylistParamReducer',
      //     });

      //     await this.setAddNewPlaylistModal({
      //       currentStep: 0,
      //       playingUrl: undefined,
      //       playlingMediaType: undefined,
      //     });
      //   }}
      //   onOk={async () => {
      //     if (this.formRef.current) {
      //       this.formRef.current.validateFields().then((values) => {
      //         this.onCreatePlaylist(values);
      //       });
      //     }
      //   }}
      //   okButtonProps={{
      //     className: 'lba-btn',
      //     icon: <CheckCircleFilled className="lba-icon" />,
      //   }}
      //   cancelButtonProps={{
      //     icon: <CloseCircleFilled className="lba-close-icon" />,
      //     danger: true,
      //   }}
      // >
      <div className="modal-content">
        {/* <AddNewPlaylistModal {...this.props} /> */}
        {/* <Form ref={this.formRef} layout="vertical" name={'add_new_playlist_form'}>
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: 'Please input title' },
              { max: 50, message: 'Title cannot exceed 50 characters' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
          >
            <Input />
          </Form.Item>
        </Form> */}
        <Steps current={addNewPlaylistModal?.currentStep}>
          {this.steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>
        <div className="steps-content">
          {currentStep === 0 && (
            <InputTitleStepComponent ref={this.inputTitleStepRef} {...this.props} />
          )}
          {currentStep === 1 && <SelectMediaStepComponent {...this.props} />}
          {currentStep === this.steps.length - 1 && (
            <CreateDoneComponent
              title="Successfully create playlist"
              finish={() => {
                this.setAddNewPlaylistModal({
                  visible: false,
                });
              }}
            />
          )}
        </div>
        <div className="steps-action">
          <Space>
            {currentStep > 0 && currentStep < this.steps.length - 1 && (
              <Button
                className="lba-btn"
                style={{ margin: '0 8px' }}
                onClick={() => {
                  if (addNewPlaylistModal) {
                    this.setAddNewPlaylistModal({
                      currentStep: addNewPlaylistModal.currentStep - 1,
                    });
                  }
                }}
              >
                Previous
              </Button>
            )}
            {currentStep < this.steps.length - 2 && (
              <Button
                className="lba-btn"
                onClick={() => {
                  this.inputTitleStepRef.current?.handleOnNext();
                  // .then(() => {})
                  // .catch((error) => {
                  //   openNotification('error', 'Error', error);
                  // });
                }}
              >
                Next
              </Button>
            )}
            {currentStep === this.steps.length - 2 && (
              <Button
                className="lba-btn"
                onClick={() => {
                  this.onCreatePlaylist().then(() => {});
                }}
              >
                Done
              </Button>
            )}
          </Space>
        </div>
      </div>
      // </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewPlaylistFormModal);
