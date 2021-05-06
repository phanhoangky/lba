import { CreateDoneComponent } from '@/pages/common/CreateDoneComponent';
import { openNotification } from '@/utils/utils';
import { FormOutlined, PlaySquareOutlined, SmileFilled } from '@ant-design/icons';
import { Steps } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import { Animated } from 'react-animated-css';
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
export const steps = [
  {
    title: 'Title and Description',
    // content: <InputTitleStepComponent {...this.props} />,
    icon: <FormOutlined className="lba-icon" />,
  },
  {
    title: 'Select Media',
    // content: <SelectMediaStepComponent {...this.props} />,
    icon: <PlaySquareOutlined className="lba-icon" />,
  },
  {
    title: 'Done',
    // content: <SelectMediaStepComponent {...this.props} />,
    icon: <SmileFilled className="lba-icon" />,
  },
];

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
    }).then(() => {
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
    });
  };

  onPrevious = () => {
    const { addNewPlaylistModal } = this.props.playlists;
    if (addNewPlaylistModal) {
      this.setAddNewPlaylistModal({
        currentStep: addNewPlaylistModal.currentStep - 1,
      });
    }
  };

  onNext = () => {
    this.inputTitleStepRef.current?.handleOnNext();
  };
  formRef = React.createRef<FormInstance>();
  inputTitleStepRef = React.createRef<InputTitleStepComponent>();

  render() {
    const { addNewPlaylistModal } = this.props.playlists;

    const currentStep = addNewPlaylistModal ? addNewPlaylistModal.currentStep : 0;
    return (
      <div className="modal-content">
        <Steps current={addNewPlaylistModal?.currentStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>
        <div className="steps-content">
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === 0}
          >
            {currentStep === 0 && (
              <InputTitleStepComponent ref={this.inputTitleStepRef} {...this.props} />
            )}
            {/* <InputTitleStepComponent ref={this.inputTitleStepRef} {...this.props} /> */}
          </Animated>
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === 1}
          >
            {currentStep === 1 && <SelectMediaStepComponent {...this.props} />}
            {/* <SelectMediaStepComponent {...this.props} /> */}
          </Animated>
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 && (
              <CreateDoneComponent
                title="Successfully create playlist"
                finish={() => {
                  this.setAddNewPlaylistModal({
                    visible: false,
                  });
                }}
              />
            )}
          </Animated>
        </div>
      </div>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewPlaylistFormModal);
