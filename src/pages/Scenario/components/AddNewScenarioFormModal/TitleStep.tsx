import { Form, Input } from 'antd';
import * as React from 'react';
import type { Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';

export type TitleStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
};

class TitleStep extends React.Component<TitleStepProps> {
  componentDidMount() {
    console.log('====================================');
    console.log('Title Step');
    console.log('====================================');
  }
  render() {
    return (
      <>
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please input title' },
            { max: 50, message: 'Title cannot exceed 50 characters' },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ max: 250, message: 'Description cannot exceed 250 characters' }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
      </>
    );
  }
}
export default connect((state: any) => ({ ...state }))(TitleStep);
