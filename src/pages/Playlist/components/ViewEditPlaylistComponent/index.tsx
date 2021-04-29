import { PlaySquareFilled } from '@ant-design/icons';
import { Col, Form, Row, Table, Image, Space, Button, Empty } from 'antd';
import type { FormInstance } from 'antd';
import Column from 'antd/lib/table/Column';
import * as React from 'react';
// import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import type { Dispatch, MediaSourceModelState, PlayListModelState, UserModelState } from 'umi';
import { connect } from 'umi';
// import styles from '../../index.less';
import ReactPlayer from 'react-player';
import { v4 as uuidv4 } from 'uuid';
import { TAG_COLOR } from '@/services/constantUrls';
// import { openNotification } from '@/utils/utils';

export type ViewEditPlaylistComponentProps = {
  dispatch: Dispatch;
  playlists: PlayListModelState;
  user: UserModelState;
  media: MediaSourceModelState;
};

export class ViewEditPlaylistComponent extends React.Component<ViewEditPlaylistComponentProps> {
  componentDidMount() {
    const { selectedPlaylist } = this.props.playlists;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        title: selectedPlaylist?.title,
        description: selectedPlaylist?.description,
      });
    }
    // this.setViewPlaylistDetailComponent({
    //   isLoading: true,
    // })
    //   .then(() => {
    //     this.setViewPlaylistDetailComponent({
    //       isLoading: false,
    //     });
    //   })
    //   .catch(() => {
    //     this.setViewPlaylistDetailComponent({
    //       isLoading: false,
    //     });
    //   });
  }
  setSelectedPlaylist = async (modal: any) => {
    const { selectedPlaylist } = this.props.playlists;

    await this.props.dispatch({
      type: 'playlists/setSelectedPlaylistReducer',
      payload: {
        ...selectedPlaylist,
        ...modal,
      },
    });
  };

  renderPreviewMedia = () => {
    const { viewPlaylistDetailComponent } = this.props.playlists;
    if (
      viewPlaylistDetailComponent &&
      viewPlaylistDetailComponent.playingUrl &&
      viewPlaylistDetailComponent.playlingMediaType
    ) {
      if (viewPlaylistDetailComponent.playlingMediaType.toLowerCase().includes('image')) {
        return (
          <>
            <Image
              src={viewPlaylistDetailComponent.playingUrl}
              loading="lazy"
              width="100%"
              height="100%"
            />
          </>
        );
      }

      if (viewPlaylistDetailComponent.playlingMediaType.toLowerCase().includes('video')) {
        return (
          <>
            <ReactPlayer
              url={viewPlaylistDetailComponent.playingUrl}
              playing
              controls={true}
              width={'100%'}
              height="100%"
            />
          </>
        );
      }
    }
    return <Empty description={<>Preview Media</>} />;
  };

  setViewPlaylistDetailComponent = async (param?: any) => {
    await this.props.dispatch({
      type: 'playlists/setViewPlaylistDetailComponentReducer',
      payload: {
        ...this.props.playlists.viewPlaylistDetailComponent,
        ...param,
      },
    });
  };

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { selectedPlaylist, viewPlaylistDetailComponent } = this.props.playlists;
    return (
      <>
        <Form
          name="view_playlists_form_drawer"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 24,
          }}
          layout="horizontal"
          ref={this.formRef}
        >
          <Form.Item name="title" label="Title">
            {/* <Input readOnly /> */}
            {/* <Tag color={TAG_COLOR}>{selectedPlaylist?.title}</Tag> */}
            {selectedPlaylist?.title}
          </Form.Item>
          <Form.Item name="description" label="Description">
            {/* <Input.TextArea readOnly rows={4} /> */}
            <span
              style={{
                color: TAG_COLOR,
              }}
            >
              {selectedPlaylist?.description}
            </span>
          </Form.Item>
          <Row gutter={20}>
            <Col span={12}>{this.renderPreviewMedia()}</Col>
            <Col span={12}>
              {/* PlaylistItems Table */}
              <Table
                rowKey="index"
                loading={viewPlaylistDetailComponent?.isLoading}
                key={uuidv4()}
                // className={styles.customTable}
                dataSource={selectedPlaylist?.playlistItems}
                pagination={false}
              >
                {/* <Column
                  key="drag"
                  dataIndex="sort"
                  width={30}
                  className="drag-visible"
                  render={() => <DragHandle />}
                ></Column> */}
                <Column key="index" title="No" dataIndex="index"></Column>
                <Column
                  key="title"
                  title="Title"
                  dataIndex={['mediaSrc', 'title']}
                  className="drag-visible"
                ></Column>

                <Column
                  key="Duration"
                  title="Duration"
                  className="drag-visible"
                  render={(record) => {
                    return <>{record.duration}</>;
                  }}
                ></Column>

                <Column
                  key="action"
                  title="Action"
                  className="drag-visible"
                  render={(record: any) => {
                    return (
                      <>
                        <Space>
                          <Button
                            className="lba-btn"
                            onClick={() => {
                              this.setViewPlaylistDetailComponent({
                                playingUrl: record.mediaSrc.urlPreview,
                                playlingMediaType: record.mediaSrc.type.name,
                              });
                            }}
                          >
                            <PlaySquareFilled className="lba-icon" size={20} />
                          </Button>
                        </Space>
                      </>
                    );
                  }}
                ></Column>
              </Table>
            </Col>
          </Row>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewEditPlaylistComponent);
