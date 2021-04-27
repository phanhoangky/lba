import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, PlayListModelState } from 'umi';
import { connect } from 'umi';
import { PLAYLIST_STORE } from '..';

export type InputTitleStepComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
};

export type InputTitleStepComponentState = {};

export class InputTitleStepComponent extends React.Component<
  InputTitleStepComponentProps,
  InputTitleStepComponentState
> {
  constructor(props: InputTitleStepComponentProps) {
    super(props);
    this.state = {};
  }

  setAddNewPlaylistParam = async (params: any) => {
    await this.props.dispatch({
      type: `${PLAYLIST_STORE}/setAddNewPlaylistParamReducer`,
      payload: {
        ...this.props.playlists.addNewPlaylistParam,
        ...params,
      },
    });
  };

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

  handleOnNext = () => {
    this.formRef.current?.validateFields().then((values) => {
      const { addNewPlaylistModal } = this.props.playlists;
      this.setAddNewPlaylistParam({
        ...values,
      });
      if (addNewPlaylistModal) {
        this.setAddNewPlaylistModal({
          currentStep: addNewPlaylistModal.currentStep + 1,
        });
      }
      return values;
    });
    // .catch((error) => {
    //   const e = error.errorFields.map((s: any) => s.errors[0]).toString();

    //   openNotification('error', 'Error', e);
    // });
  };

  formRef = React.createRef<FormInstance>();

  render() {
    return (
      <>
        <Form ref={this.formRef} layout="vertical" name={'add_new_playlist_form'}>
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
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(InputTitleStepComponent);
