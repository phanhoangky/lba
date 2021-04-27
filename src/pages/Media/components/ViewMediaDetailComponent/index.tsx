import { TAG_COLOR } from '@/services/constantUrls';
import { Alert, Divider, Form, Image, Tag } from 'antd';
import * as React from 'react';
import type { Dispatch, MediaSourceModelState } from 'umi';
import { connect } from 'umi';

export type ViewMediaDetailComponentProps = {
  dispatch: Dispatch;
  media: MediaSourceModelState;
};

export class ViewMediaDetailComponent extends React.Component<ViewMediaDetailComponentProps> {
  render() {
    const { selectedFile } = this.props.media;

    const signatureOfMedia = (status?: number) => {
      if (status === 0) {
        return 'error';
      }

      if (status === 1) {
        return 'warning';
      }
      return 'success';
    };

    const messageOfSignature = (status?: number) => {
      if (status === 3) {
        return 'Rejected';
      }

      if (status === 1) {
        return 'Waiting';
      }
      return 'Approved';
    };
    return (
      <>
        <Form layout="vertical">
          <Form.Item label="Title">
            {/* <Input readOnly value={selectedFile?.title} /> */}
            <Tag color={TAG_COLOR}>{selectedFile?.title}</Tag>
          </Form.Item>
          <Form.Item label="Description">
            {/* <Input.TextArea readOnly value={selectedFile?.description} /> */}
            <span
              style={{
                color: TAG_COLOR,
              }}
            >
              {selectedFile?.description}
            </span>
          </Form.Item>
          <Form.Item label="Status">
            <Alert
              message={messageOfSignature(selectedFile?.isSigned)}
              type={signatureOfMedia(selectedFile?.isSigned)}
            ></Alert>
          </Form.Item>
          <Form.Item label="Type">
            {/* <Input readOnly value={selectedFile?.type.name} /> */}
            <Tag color={TAG_COLOR}>{selectedFile?.type.name}</Tag>
          </Form.Item>
        </Form>
        <Divider></Divider>
        {selectedFile?.type.name.toLowerCase().includes('image') && (
          <Image src={selectedFile?.urlPreview} width={'100%'} />
        )}
        {selectedFile?.type.name.toLowerCase().includes('video') && (
          <video src={selectedFile?.urlPreview} width="100%" autoPlay controls></video>
        )}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewMediaDetailComponent);
