import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState } from 'umi';
import { connect } from 'umi';
// import { openNotification } from '@/utils/utils';

export type RenameFolderModalProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
};

export class RenameFolderModal extends React.Component<RenameFolderModalProps> {
  updateFolder = async (param: any) => {
    await this.props.dispatch({
      type: 'media/updateFolder',
      payload: param,
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

  handleUpdateFolder = async () => {
    const { listFolder } = this.props.media;
    const selectedFolder = listFolder?.filter((f) => f.isSelected)[0];
    console.log('====================================');
    console.log(selectedFolder);
    console.log('====================================');
    this.formRef.current?.validateFields().then((values) => {
      this.setRenameFolderModal({
        isLoading: true,
      }).then(() => {
        this.updateFolder({ id: selectedFolder.id, name: values.name })
          .then(() => {
            this.callGetListFolders().then(() => {
              this.setRenameFolderModal({
                isLoading: false,
                visible: false,
              });
            });
          })
          .catch((error) => {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            // openNotification('error', 'Fail to rename folder', error.values);
            this.setRenameFolderModal({
              isLoading: false,
              visible: false,
            });
          });
      });
    });
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    return (
      <>
        <Form name="rename_form" layout="vertical" ref={this.formRef}>
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[
              { required: true, message: 'Please enter new folder name' },
              {
                max: 50,
                message: 'Name cannot exceed 50 characters',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(RenameFolderModal);
