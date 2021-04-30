import type { EditMediaParam } from '@/services/MediaSourceService';
import { Form, Input, Row, Col, Image } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import ReactPlayer from 'react-player';
import type { Dispatch, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';

export type EditMediaFormDrawerProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
  user: UserModelState;
};

export class EditMediaFormDrawer extends React.Component<EditMediaFormDrawerProps> {
  componentDidMount() {
    const { selectedFile } = this.props.media;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedFile?.title,
        description: selectedFile?.description,
      });
    }
  }

  state = {
    removeConfirmVisible: false,
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

  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
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

    if (this.formRef.current) {
      this.formRef.current.validateFields().then((values) => {
        const param: EditMediaParam = {
          id: selectedFile?.id,
          description: selectedFile?.description,
          title: selectedFile?.title,
          typeId: selectedFile?.type.id,
          isSigned: selectedFile?.isSigned,
          ...modal,
          ...values,
        };
        this.updateMedia(param);
        // this.setEditFileDrawer({
        //   isLoading: true,
        // }).then(() => {
        //   const param: EditMediaParam = {
        //     id: selectedFile?.id,
        //     description: selectedFile?.description,
        //     title: selectedFile?.title,
        //     typeId: selectedFile?.type.id,
        //     isSigned: selectedFile?.isSigned,
        //     ...modal,
        //     ...values,
        //   };
        //   this.updateMedia(param)
        //     .then(() => {
        //       openNotification('success', 'Update File Success');
        //       this.setEditFileDrawer({
        //         isLoading: false,
        //       });
        //     })
        //     .catch((error) => {
        //       openNotification('error', 'Fail to update file', error.message);
        //       this.setEditFileDrawer({
        //         isLoading: false,
        //       });
        //     });
        // });
      });
    }
  };

  formRef = React.createRef<FormInstance>();

  render() {
    const { selectedFile } = this.props.media;
    return (
      <Form ref={this.formRef} name="edit_file_drawer" layout="vertical">
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please Input Title' },
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
          <Input.TextArea />
        </Form.Item>
        <Row>
          <Col span={24}>
            {selectedFile?.type.name === 'Image' && (
              <>
                <Image src={selectedFile.urlPreview} width="100%"></Image>
              </>
            )}

            {selectedFile?.type.name === 'Video' && (
              <>
                <ReactPlayer
                  url={selectedFile.urlPreview}
                  playing={true}
                  controls={true}
                  width={'100%'}
                />
              </>
            )}
          </Col>
        </Row>
      </Form>
      // </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditMediaFormDrawer);
