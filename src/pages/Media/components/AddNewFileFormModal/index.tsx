import type { CreateFileParam } from '@/services/PublitioService/PublitioService';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Skeleton, Upload } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import { Keccak } from 'sha3';
import { v4 as uuidv4 } from 'uuid';
import type { Dispatch, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import { openNotification } from '@/utils/utils';
import { LIST_SUPPORTED_FILES } from '@/services/constantUrls';
import styles from '../../index.less';

export type AddNewFileFormModalProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
  user: UserModelState;
};

export class AddNewFileFormModal extends React.Component<AddNewFileFormModalProps> {
  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
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

  setAddNewFileModal = async (modal: any) => {
    const { addNewFileModal } = this.props.media;
    await this.props.dispatch({
      type: 'media/setAddNewFileModalReducer',
      payload: {
        ...addNewFileModal,
        ...modal,
      },
    });
  };

  showConfirmCreateNewFile = async () => {
    if (this.formRef.current) {
      this.formRef.current
        .validateFields()
        .then((values) => {
          this.setAddNewFileModal({
            isLoading: true,
          }).then(() => {
            // const { currentUser } = this.props.user;
            this.addNewFile(values).then(() => {
              this.setAddNewFileModal({
                isLoading: false,
              });
            });
          });
        })
        .catch(() => {
          this.setAddNewFileModal({
            isLoading: false,
          });
        });
    }
  };

  createFile = async (param: any) => {
    await this.props.dispatch({
      type: 'media/createFile',
      payload: {
        ...param,
      },
    });
  };

  addNewFile = async (values: any) => {
    const { createFileParam } = this.props.media;
    const { currentUser } = this.props.user;
    const hash = new Keccak(256);
    const byte = await values.upload.file.originFileObj.arrayBuffer();
    hash.update(Buffer.from(byte));
    const security = hash.digest('hex');
    const signature = await currentUser?.ether?.addDocument(security);
    if (signature && !signature.toLowerCase().includes('Fail'.toLowerCase())) {
      console.log('====================================');
      console.log('Param  222>>>', security, signature);
      console.log('====================================');
      const param: CreateFileParam = {
        ...createFileParam,
        ...values,
        securityHash: security,
        public_id: security,
        accountId: currentUser?.id,
        hash: signature,
        fileId: createFileParam?.fileId,
        isSigned: 1,
        mediaSrcId: uuidv4(),
      };
      console.log('====================================');
      console.log('Param >>>', signature, param);
      console.log('====================================');
      this.createFile(param).then(() => {
        openNotification('success', 'Create File Successfully', `Create ${values.title}`);
        Promise.all([this.callGetListMedia(), this.clearCreateFileParam(), this.clearFilelist()]);
      });

      // this.setListLoading(true)
      //   .then(() => {
      //     this.callGetListMedia().then(() => {
      //       this.clearCreateFileParam().then(() => {
      //         this.clearFilelist().then(() => {
      //           this.setListLoading(false);
      //         });
      //       });
      //     });
      //   })
      //   .catch(() => {
      //     this.setListLoading(false);
      //   });
    } else {
      openNotification('error', 'Create File fail', signature);
    }
  };

  clearCreateFileParam = async () => {
    await this.props.dispatch({
      type: 'media/clearCreateFileParamReducer',
      payload: '',
    });
  };

  clearFilelist = async () => {
    this.props.dispatch({
      type: 'media/clearAddNewFileNodalFileList',
      payload: '',
    });
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { listLoading, addNewFileModal, listMediaType, breadScrumb } = this.props.media;
    return (
      <Modal
        className={styles.addNewFileModal}
        centered
        title={
          <>
            <Skeleton active loading={listLoading}>
              Add New File
            </Skeleton>
          </>
        }
        visible={addNewFileModal?.visible}
        closable={false}
        onOk={() => {
          this.showConfirmCreateNewFile();
        }}
        destroyOnClose={true}
        confirmLoading={addNewFileModal?.isLoading}
        onCancel={() => {
          this.clearFilelist();
        }}
      >
        {/* <AddNewModal {...this.props}></AddNewModal> */}
        <Form ref={this.formRef} name="add_new_file_form" layout="vertical">
          <Form.Item
            name="upload"
            label="Upload"
            rules={[{ required: true, message: 'Please upload file' }]}
          >
            <Upload
              name="avatar"
              listType="picture-card"
              style={{
                width: '100%',
              }}
              className="avatar-uploader"
              // fileList={addNewFileModal.fileList}
              showUploadList={true}
              beforeUpload={(file) => {
                console.log('====================================');
                console.log(file);
                console.log('====================================');
                if (!LIST_SUPPORTED_FILES.some((f) => file.type.includes(f))) {
                  openNotification('error', 'file is not support');
                  return Upload.LIST_IGNORE;
                }
                if (file.size > 25 * (1000 * 1000)) {
                  // Promise.reject(new Error('Oversize'));
                  openNotification('error', 'file is oversize', `File must smaller than ${25}MB`);
                  return Upload.LIST_IGNORE;
                }
                return true;
                // return file.type === 'image/png' ? true : Upload.LIST_IGNORE;
              }}
              onChange={async (file) => {
                const mediaType = listMediaType?.filter((type) =>
                  file.file.originFileObj?.type.toLowerCase().includes(type.name.toLowerCase()),
                )[0];
                if (mediaType) {
                  this.setCreateFileParam({
                    typeId: mediaType.id,
                    typeName: mediaType.name,
                  });
                }
                this.setCreateFileParam({
                  file: file.file.originFileObj,
                  folder: breadScrumb?.[breadScrumb.length - 1].id,
                }).then(() => {
                  this.setAddNewFileModal({
                    fileList: file.fileList,
                  });
                });
              }}
            >
              {addNewFileModal?.fileList.length >= 1 ? null : <UploadOutlined />}
            </Upload>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: 'Please input title' },
              { max: 50, message: 'Title cannot exceed 50 characters' },
            ]}
          >
            <Input
              type="text"
              // value={createFileParam.title}
              // onChange={(e) => {
              //   this.setCreateFileParam({
              //     title: e.target.value,
              //   });
              // }}
            ></Input>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
          >
            <Input
              type="text"
              // value={createFileParam.description}
              // onChange={(e) => {
              //   this.setCreateFileParam({
              //     description: e.target.value,
              //   });
              // }}
            ></Input>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewFileFormModal);
