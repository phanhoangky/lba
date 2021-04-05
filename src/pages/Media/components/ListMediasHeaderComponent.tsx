import { PlusSquareTwoTone } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState } from 'umi';
import { connect } from 'umi';

export type ListMediasHeaderComponentProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
};

export class ListMediasHeaderComponent extends React.Component<ListMediasHeaderComponentProps> {
  setListLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'media/setListLoadingReducer',
      payload: loading,
    });
  };

  callSearchListMedia = async (payload?: any) => {
    await this.props.dispatch({
      type: 'media/searchListMedia',
      payload: {
        ...this.props.media.searchListMediaParam,
        ...payload,
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

  render() {
    const { breadScrumb } = this.props.media;
    return (
      <>
        <Row>
          <Col span={12}>
            <Space>
              <Input.Search
                style={{
                  width: '100%',
                }}
                enterButton
                // value={searchListMediaParam.title}
                // onChange={async (e) => {
                //   this.setSearchListMediaParam({
                //     title: e.target.value,
                //   });
                // }}
                onSearch={async (e) => {
                  await this.setListLoading(true);
                  if (e !== '') {
                    this.callSearchListMedia({
                      title: e,
                    })
                      .then(() => {
                        this.setListLoading(false);
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  } else {
                    this.callGetListMedia({
                      folder: breadScrumb?.[breadScrumb.length - 1].id,
                    })
                      .then(() => {
                        this.setListLoading(false);
                      })
                      .catch(() => {
                        this.setListLoading(false);
                      });
                  }
                }}
              />
              <Select
                style={{ width: '100px' }}
                defaultValue={-1}
                // value={searchListMediaParam.isSigned}
                onChange={(e) => {
                  this.setListLoading(true)
                    .then(() => {
                      this.callSearchListMedia({
                        isSigned: e === -1 ? undefined : e,
                      }).then(() => {
                        this.setListLoading(false);
                      });
                    })
                    .catch(() => {
                      this.setListLoading(false);
                    });
                }}
              >
                <Select.Option key={'all'} value={-1}>
                  All
                </Select.Option>
                <Select.Option key={'Not Sign'} value={0}>
                  Not Sign
                </Select.Option>
                <Select.Option key={'Waiting'} value={1}>
                  Waiting
                </Select.Option>
                <Select.Option key={'Approved'} value={2}>
                  Approved
                </Select.Option>
              </Select>
            </Space>
          </Col>
          <Col span={12}>
            <div style={{ textAlign: 'right' }}>
              <Space>
                <Button
                  onClick={() => {
                    this.setAddNewFolderModal({
                      visible: true,
                    });
                  }}
                >
                  <PlusSquareTwoTone />
                  Add New Folder
                </Button>
                <Button
                  onClick={() => {
                    this.setAddNewFileModal({
                      visible: true,
                    });
                  }}
                >
                  <PlusSquareTwoTone />
                  Add New File
                </Button>

                {/* <Select
                      defaultValue={'Current Files'}
                      value={
                        getListFileParam.filter_privacy === 'public'
                          ? 'Current Files'
                          : 'Deleted Files'
                      }
                      showSearch
                      onChange={async (e) => {
                        this.callGetListMedia({
                          filter_privacy: e,
                        });
                      }}
                    >
                      <Select.Option key={'Public'} value={'public'}>
                        Current Files
                      </Select.Option>
                      <Select.Option key={'Private'} value={'private'}>
                        Deleted Files
                      </Select.Option>
                    </Select> */}
              </Space>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ListMediasHeaderComponent);
