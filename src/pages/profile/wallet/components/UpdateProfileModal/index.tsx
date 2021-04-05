import { LIST_AVATAR_SUPPORTED_FILES } from '@/services/constantUrls';
import { openNotification } from '@/utils/utils';
import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Space, Upload } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, ProfileWalletModelState, UserModelState } from 'umi';
import { connect } from 'umi';
import styles from '../../index.less';

export type UpdateProfileModalProps = {
  dispatch: Dispatch;
  profileWallet: ProfileWalletModelState;
  user: UserModelState;
};

export class UpdateProfileModal extends React.Component<UpdateProfileModalProps> {
  componentDidMount() {
    const { currentUser } = this.props.user;
    this.updateProfileFormRef.current?.setFieldsValue({
      // avatar: currentUser?.avatar,
      name: currentUser?.name,
    });
  }

  setUpdateProfileModal = async (param?: any) => {
    await this.props.dispatch({
      type: 'profileWallet/setUpdateProfileModalReducer',
      payload: {
        ...this.props.profileWallet.updateProfileModal,
        ...param,
      },
    });
  };

  updateProfile = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/updateProfile',
      payload: {
        ...this.props.user.updateProfileParam,
        ...param,
      },
    });
  };

  handleUpdateProfile = async () => {
    this.updateProfileFormRef.current
      ?.validateFields()
      .then((values) => {
        this.setUpdateProfileModal({
          isLoading: true,
        }).then(() => {
          this.updateProfile(values).then(() => {
            this.setUpdateProfileModal({
              isLoading: false,
              visible: false,
            });
          });
        });
      })
      .catch(() => {
        this.setUpdateProfileModal({
          isLoading: false,
          visible: false,
        });
      });
  };

  setUpdateProfileParam = async (param?: any) => {
    await this.props.dispatch({
      type: 'user/setUpdateProfileParamReducer',
      payload: {
        ...this.props.user.updateProfileParam,
        ...param,
      },
    });
  };

  updateProfileFormRef = React.createRef<FormInstance<any>>();
  render() {
    const { updateProfileParam } = this.props.user;
    return (
      <Space
        wrap
        style={{
          width: '100%',
        }}
        direction="vertical"
      >
        <Form name="update_profile_form" layout="vertical" ref={this.updateProfileFormRef}>
          <Form.Item
            label="Avatar"
            // valuePropName="fileList"
            // getValueFromEvent={(e) => {
            //   console.log('Upload event:', e);
            //   if (Array.isArray(e)) {
            //     return e;
            //   }
            //   return e && e.fileList;
            // }}
          >
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              // fileList={addNewFileModal.fileList}
              showUploadList={true}
              onChange={() => {}}
            ></Upload>
            <Upload
              name="avatar"
              listType="picture-card"
              className={styles.uploadInput}
              // fileList={addNewFileModal.fileList}
              showUploadList={true}
              beforeUpload={(file) => {
                if (!LIST_AVATAR_SUPPORTED_FILES.some((f) => file.type.includes(f))) {
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
                await this.setUpdateProfileParam({
                  file: file.file.originFileObj,
                });
              }}
            >
              {updateProfileParam?.file ? null : <UploadOutlined />}
            </Upload>
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              { required: true, message: 'Please input name' },
              { max: 50, message: 'name cannot exceed 50 characters' },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(UpdateProfileModal);
