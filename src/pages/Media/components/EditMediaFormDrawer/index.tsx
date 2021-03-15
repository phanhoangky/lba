import type { EditMediaParam } from '@/services/MediaSourceService';
import { DeleteTwoTone, EditOutlined } from '@ant-design/icons';
import { Button, Drawer, Popconfirm, Form, Input, Row, Col, Image } from 'antd';
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

class EditMediaFormDrawer extends React.Component<EditMediaFormDrawerProps> {
  componentDidMount() {
    const { selectedFile } = this.props.media;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedFile.title,
        description: selectedFile.description,
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

  async callGetListMedia(payload?: any) {
    const { dispatch, media } = this.props;
    await dispatch({
      type: 'media/getListMediaFromFileId',
      payload: {
        ...media.getListFileParam,
        ...payload,
      },
    });
  }

  updateFile = async (modal?: any) => {
    const { selectedFile } = this.props.media;

    if (this.formRef.current) {
      this.formRef.current.validateFields().then((values) => {
        const param: EditMediaParam = {
          id: selectedFile.id,
          description: selectedFile.description,
          title: selectedFile.title,
          typeId: selectedFile.type.id,
          isSigned: selectedFile.isSigned,
          ...modal,
          ...values,
        };

        this.props.dispatch({
          type: 'media/updateFile',
          payload: param,
        });
      });
    }
  };

  formRef = React.createRef<FormInstance>();

  render() {
    const { editFileDrawer, selectedFile } = this.props.media;
    return (
      <Drawer
        closable={false}
        destroyOnClose={true}
        visible={editFileDrawer.visible}
        width={700}
        onClose={async () => {
          await this.setEditFileDrawer({
            visible: false,
          });
        }}
        title={
          <>
            <div>{selectedFile.title}</div>
          </>
        }
        footer={
          <>
            <div style={{ textAlign: 'right' }}>
              <Popconfirm
                title={`Remove ${selectedFile.title}`}
                visible={this.state.removeConfirmVisible}
                onConfirm={async () => {
                  await this.setListLoading(true);

                  await this.setEditFileDrawer({
                    visible: false,
                  });
                  this.removeMedia(selectedFile)
                    .then(() => {
                      this.callGetListMedia().then(() => {
                        this.setListLoading(false).then(() => {
                          this.setState({
                            removeConfirmVisible: false,
                          });
                        });
                      });
                    })
                    .catch(() => {
                      this.setListLoading(false).then(() => {
                        this.setState({
                          removeConfirmVisible: false,
                        });
                      });
                    });
                }}
                okButtonProps={{ loading: this.props.media.listLoading }}
                onCancel={() => {
                  this.setState({
                    removeConfirmVisible: false,
                  });
                }}
              >
                <Button
                  danger
                  onClick={() => {
                    this.setState({
                      removeConfirmVisible: true,
                    });
                  }}
                >
                  <DeleteTwoTone twoToneColor={'#f64842'} /> Remove
                </Button>
              </Popconfirm>
              <Button
                type="primary"
                onClick={async () => {
                  await this.setEditFileDrawer({
                    visible: false,
                  });
                  this.setListLoading(true)
                    .then(() => {
                      this.updateFile().then(() => {
                        this.callGetListMedia().then(() => {
                          this.setListLoading(false);
                        });
                      });
                    })
                    .catch(() => {
                      this.setListLoading(false);
                    });
                }}
              >
                <EditOutlined /> Update Media
              </Button>
            </div>
          </>
        }
      >
        {/* <EditMediaDrawer {...this.props}></EditMediaDrawer> */}
        <Form ref={this.formRef} name="edit_file_drawer">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please Input Title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Row>
            <Col span={24}>
              {selectedFile.type.name === 'Image' && (
                <>
                  <Image src={selectedFile.urlPreview} width="100%"></Image>
                </>
              )}

              {selectedFile.type.name === 'Video' && (
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
      </Drawer>
    );
  }
}

export default connect((state: any) => ({ ...state }))(EditMediaFormDrawer);
