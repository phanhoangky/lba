import { Form, Input } from 'antd';
import type { FormInstance } from 'antd';
import * as React from 'react';
import type { Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { SCENARIO_STORE } from '@/pages/Scenario';

export type InputTitleStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
};

export class InputTitleStepComponent extends React.Component<InputTitleStepProps> {
  componentDidMount() {}

  setCreateScenarioParam = async (param: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setCreateScenarioParamReducer`,
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...param,
      },
    });
  };

  setAddNewScenarioModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setAddNewScenarioModalReducer',
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  handleOnNext = async () => {
    this.formRef.current?.validateFields().then((values) => {
      const { addNewScenarioModal } = this.props.scenarios;
      this.setCreateScenarioParam({
        ...values,
      }).then(() => {
        if (addNewScenarioModal) {
          this.setAddNewScenarioModal({
            currentStep: addNewScenarioModal.currentStep + 1,
          });
        }
      });
    });
  };
  formRef = React.createRef<FormInstance<any>>();
  render() {
    return (
      <Form ref={this.formRef} name="add_new_scenario" layout="vertical">
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
      </Form>
    );
  }
}
export default connect((state: any) => ({ ...state }))(InputTitleStepComponent);
