import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch } from 'umi';
import { connect } from 'umi';

export type ConfirmPasswordStepProps = {
  dispatch: Dispatch;
};

export class ConfirmPasswordStep extends React.Component<ConfirmPasswordStepProps> {
  formRef = React.createRef<FormInstance<any>>();
  render() {
    return (
      <>
        <Form name="confirm_password" layout="horizontal" ref={this.formRef}>
          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            rules={[{ required: true, message: 'Please confirm your current password' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ConfirmPasswordStep);
