import type { CreateFileParam } from '@/services/PublitioService/PublitioService';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Modal, Select, Skeleton, Switch, Upload } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import { Keccak } from 'sha3';
import { v4 as uuidv4 } from 'uuid';
import type { Dispatch, MediaSourceModelState, UserModelState } from 'umi';
import { connect } from 'umi';

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

  addNewFile = async (values: any) => {
    const { createFileParam } = this.props.media;
    const { currentUser } = this.props.user;
    const hash = new Keccak(256);
    const byte = await values.upload.file.originFileObj.arrayBuffer();
    hash.update(Buffer.from(byte));
    const security = hash.digest('hex');

    // const signature = await currentUser?.ether?.addDocument(security, createFileParam.isSigned);
    const param: CreateFileParam = {
      ...createFileParam,
      ...values,
      securityHash: security,
      public_id: security,
      accountId: currentUser?.id,
      fileId: createFileParam.fileId,
      isSigned: createFileParam.isSigned,
      mediaSrcId: uuidv4(),
    };
    await this.props.dispatch({
      type: 'media/createFile',
      payload: {
        ...param,
      },
    });

    this.setListLoading(true)
      .then(() => {
        this.callGetListMedia().then(() => {
          this.clearCreateFileParam().then(() => {
            this.clearFilelist().then(() => {
              this.setListLoading(false);
            });
          });
        });
      })
      .catch(() => {
        this.setListLoading(false);
      });
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
    const {
      listLoading,
      addNewFileModal,
      listMediaType,
      breadScrumb,
      createFileParam,
    } = this.props.media;
    return (
      <Modal
        centered
        title={
          <>
            <Skeleton active loading={listLoading}>
              Add New File
            </Skeleton>
          </>
        }
        visible={addNewFileModal.visible}
        closable={false}
        onOk={() => {
          this.showConfirmCreateNewFile();
        }}
        destroyOnClose={true}
        confirmLoading={addNewFileModal.isLoading}
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
              className="avatar-uploader"
              // fileList={addNewFileModal.fileList}
              showUploadList={true}
              onChange={async (file) => {
                this.setCreateFileParam({
                  ...createFileParam,
                  file: file.file.originFileObj,
                  folder: breadScrumb[breadScrumb.length - 1].id,
                }).then(() => {
                  this.setAddNewFileModal({
                    fileList: file.fileList,
                  });
                });
              }}
            >
              {addNewFileModal.fileList.length >= 1 ? null : <UploadOutlined />}
            </Upload>
          </Form.Item>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input title' }]}
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
            rules={[{ required: true, message: 'Please input description' }]}
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
          <Form.Item
            name="isSign"
            label="Sign Media"
            rules={[{ required: true, message: 'select sign media or later' }]}
          >
            <Switch
              defaultChecked={false}
              onChange={(e) => {
                this.setCreateFileParam({
                  isSigned: e ? 1 : 0,
                });
              }}
            />
          </Form.Item>
          <Form.Item
            name="typeId"
            label="Type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select
              showSearch
              style={{ width: 200 }}
              placeholder="Select a type"
              // defaultValue={listMediaType[0].name}
              // optionFilterProp="children"
              // onChange={(value) => {
              //   const type = listMediaType.filter((t) => t.id === value)[0];
              //   if (createFileParam) {
              //     this.setCreateFileParam({
              //       typeId: type.id,
              //       typeName: type.name,
              //     });
              //   }
              // }}
              // value={createFileParam.typeName}
            >
              {listMediaType.map((type) => {
                return (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewFileFormModal);
