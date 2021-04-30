// import { TAG_COLOR } from '@/services/constantUrls';
import { CheckCircleOutlined, ClockCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Alert, Divider, Form, Image } from 'antd';
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

    const iconOfStatus = (status?: number) => {
      if (status === 3) {
        return <StopOutlined className="lba-close-icon" />;
      }

      if (status === 1) {
        return <ClockCircleOutlined className="lba-icon" />;
      }
      return <CheckCircleOutlined className="lba-icon" />;
    };
    return (
      <>
        <Form
          layout="horizontal"
          labelCol={{
            span: 4,
          }}
          wrapperCol={{
            span: 24,
          }}
        >
          <Form.Item label="Title">
            {/* <Input readOnly value={selectedFile?.title} /> */}
            {/* <Tag color={TAG_COLOR}>{selectedFile?.title}</Tag> */}
            {selectedFile?.title}
          </Form.Item>
          <Form.Item label="Description">
            {/* <Input.TextArea readOnly value={selectedFile?.description} /> */}
            {/* <span
              style={{
                color: TAG_COLOR,
              }}
            >
              {selectedFile?.description}
            </span> */}
            {selectedFile?.description}
          </Form.Item>
          <Form.Item label="Status">
            <Alert
              message={messageOfSignature(selectedFile?.isSigned)}
              type={signatureOfMedia(selectedFile?.isSigned)}
              icon={iconOfStatus(selectedFile?.isSigned)}
              showIcon
            ></Alert>
          </Form.Item>
          <Form.Item label="Type">
            {/* <Input readOnly value={selectedFile?.type.name} /> */}
            {/* <Tag color={TAG_COLOR}>{selectedFile?.type.name}</Tag> */}
            {selectedFile?.type.name}
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
