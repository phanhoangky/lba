import { openNotification } from '@/utils/utils';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { Input, Modal, Skeleton, Form } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';

export type AddNewFolderFormModalProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
  user: UserModelState;
};

export class AddNewFolderFormModal extends React.Component<AddNewFolderFormModalProps> {
  setGetListFolderParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'media/setGetListFolderParamReducer',
      payload: {
        ...this.props.media.getListFolderParam,
        ...param,
      },
    });
  };

  createFolder = async (values: any) => {
    const { breadScrumb, createFolderParam } = this.props.media;
    await this.props.dispatch({
      type: 'media/createFolder',
      payload: {
        ...createFolderParam,
        parent_id: breadScrumb?.[breadScrumb.length - 1].id,
        ...values,
      },
    });
  };

  handleCreateFolder = async () => {
    if (this.formRef.current) {
      this.formRef.current.validateFields().then((values) => {
        this.setAddNewFolderModal({
          isLoading: true,
        }).then(() => {
          this.createFolder(values)
            .then(() => {
              this.callGetListFolders().then(() => {
                openNotification(
                  'success',
                  'Create Folder Successfully',
                  `${values.name} was created`,
                );
                this.setAddNewFolderModal({
                  isLoading: false,
                  visible: false,
                });
              });
            })
            .catch((error) => {
              openNotification('error', 'Create Folder fail', error.message);
              this.setAddNewFolderModal({
                isLoading: false,
                visible: false,
              });
            });
        });
      });
    }
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

  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
    });
  };

  setAddNewFolderModal = async (modal: any) => {
    const { addNewFolderModal } = this.props.media;
    await this.props.dispatch({
      type: 'media/setAddNewFolderModalReducer',
      payload: {
        ...addNewFolderModal,
        ...modal,
      },
    });
  };

  setAddNewFolderParam = async (params: any) => {
    await this.props.dispatch({
      type: 'media/setCreateFolderParamReducer',
      payload: {
        ...this.props.media.createFolderParam,
        ...params,
      },
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { addNewFolderModal } = this.props.media;
    return (
      <Modal
        centered
        title={<>Create New Folder</>}
        visible={addNewFolderModal?.visible}
        confirmLoading={addNewFolderModal?.isLoading}
        closable={false}
        destroyOnClose={true}
        onOk={() => {
          this.handleCreateFolder();
        }}
        onCancel={() => {
          this.setAddNewFolderModal({
            visible: false,
          });
        }}
        cancelButtonProps={{
          icon: <CloseCircleFilled className="lba-close-icon" />,
          danger: true,
        }}
        okButtonProps={{
          className: 'lba-btn',
          icon: <CheckCircleFilled className="lba-icon" />,
        }}
      >
        <Form ref={this.formRef} layout="vertical" name="Create_Folder">
          <Skeleton active loading={addNewFolderModal?.isLoading}>
            <Form.Item
              label="Folder Name"
              name="name"
              rules={[
                { required: true, message: 'Please input name' },
                { max: 50, message: 'Name cannot exceed 50 characters' },
              ]}
            >
              <Input
                type="text"
                // value={createFolderParam.name}
                onChange={() => {
                  // this.setAddNewFolderParam({
                  //   name: e.target.value,
                  // });
                }}
              />
            </Form.Item>
          </Skeleton>
        </Form>
      </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewFolderFormModal);
