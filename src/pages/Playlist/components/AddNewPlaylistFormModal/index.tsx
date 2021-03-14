import { Modal, Form, Input } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserTestModelState } from 'umi';
import { connect } from 'umi';

export type AddNewPlaylistFormModalProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  userTest: UserTestModelState;
  media: MediaSourceModelState;
};

class AddNewPlaylistFormModal extends React.Component<AddNewPlaylistFormModalProps> {
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
        accountId: this.props.userTest.currentUser.id,
      },
    });
  };

  onCreatePlaylist = async (values?: any) => {
    // const {  } = this.props.playlists;
    this.setAddNewPlaylistModal({
      isLoading: true,
    })
      .then(() => {
        this.createPlaylist(values).then(() => {
          this.callGetListPlaylist().then(() => {
            this.setAddNewPlaylistModal({
              visible: false,
              isLoading: false,
            });
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

  render() {
    const { addNewPlaylistModal } = this.props.playlists;
    return (
      <Modal
        title="Add New Playlist"
        visible={addNewPlaylistModal.visible}
        destroyOnClose={true}
        confirmLoading={addNewPlaylistModal.isLoading}
        onCancel={async () => {
          await this.setAddNewPlaylistModal({
            visible: false,
          });
        }}
        afterClose={() => {
          this.props.dispatch({
            type: 'playlists/clearAddNewPlaylistParamReducer',
          });
        }}
        onOk={async () => {
          if (this.formRef.current) {
            this.formRef.current.validateFields().then((values) => {
              this.onCreatePlaylist(values);
            });
          }
        }}
      >
        {/* <AddNewPlaylistModal {...this.props} /> */}
        <Form ref={this.formRef} name={'add_new_playlist_form'}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input title' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect((state) => ({ ...state }))(AddNewPlaylistFormModal);
