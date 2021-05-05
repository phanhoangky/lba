import {
  CaretRightFilled,
  CheckOutlined,
  ClockCircleFilled,
  CloseOutlined,
} from '@ant-design/icons';
import { Form, Space, Switch, Tag } from 'antd';
import moment from 'moment';
import * as React from 'react';
import type { Dispatch, DeviceModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import FilterDate from '../FilterDate';

export type ViewDeviceDetailComponentProps = {
  dispatch: Dispatch;
  deviceStore: DeviceModelState;
  scenarios: ScenarioModelState;
};

export class ViewDeviceDetailComponent extends React.Component<ViewDeviceDetailComponentProps> {
  render() {
    const { selectedDevice } = this.props.deviceStore;
    const timeFilter = selectedDevice?.timeFilter;
    const displayTimeFilter = timeFilter?.map((time, index) => {
      return (
        time === '1' && (
          <Tag
            icon={<ClockCircleFilled className="lba-icon" />}
            style={{
              fontWeight: 'bolder',
            }}
            className="lba-nornal-btn"
          >
            {`${index} h - ${index + 1} h`}
          </Tag>
        )
      );
    });

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
          name="Update_Device_Form"
        >
          <Form.Item label="Name">
            {/* <Input readOnly value={selectedDevice?.name} /> */}
            <Tag color="orange">{selectedDevice?.name}</Tag>
          </Form.Item>
          <Form.Item label="Description">
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
            {/* <Input.TextArea rows={4} readOnly value={selectedDevice?.description} /> */}
            <Tag color="orange">{selectedDevice?.description}</Tag>
            {/* </Skeleton> */}
          </Form.Item>
          <Form.Item label="Time Filter">
            <Space wrap={true}>{displayTimeFilter}</Space>
          </Form.Item>
          {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
          <Form.Item label="Date Filter">
            <FilterDate disabled={true} {...this.props}></FilterDate>
          </Form.Item>
          {/* </Skeleton> */}

          <Form.Item label="Start-End">
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
            {/* <DatePicker.RangePicker
              format={'YYYY/MM/DD'}
              disabled
              value={[
                moment(moment(selectedDevice?.startDate).format('YYYY-MM-DD')),
                moment(moment(selectedDevice?.endDate).format('YYYY-MM-DD')),
              ]}
            /> */}
            {/* <Tag>
              {moment(moment(selectedDevice?.startDate).format('YYYY-MM-DD'))}-
              {moment(moment(selectedDevice?.endDate).format('YYYY-MM-DD'))}
            </Tag> */}
            <Space>
              <Tag color="orange">
                {moment(selectedDevice?.startDate).format('YYYY/MM/DD')}
                {/* {moment(selectedDevice?.endDate).format('YYYY/MM/DD')} */}
              </Tag>
              <CaretRightFilled className="lba-icon" />
              <Tag color="orange">
                {moment(selectedDevice?.endDate).format('YYYY/MM/DD')}
                {/* {moment(selectedDevice?.endDate).format('YYYY/MM/DD')} */}
              </Tag>
            </Space>
            {/* </Skeleton> */}
          </Form.Item>

          <Form.Item label="Publish">
            <Switch
              checked={selectedDevice?.isPublished}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            ></Switch>
          </Form.Item>
          <Form.Item label="Mininum Bid">
            <Tag color="orange">{selectedDevice?.minBid}</Tag>
          </Form.Item>
          <Form.Item label="Scenario">
            {/* <Select size="large" value={selectedDevice?.defaultScenarioId} disabled>
              {listScenario &&
                listScenario.map((scenario) => {
                  return (
                    <Select.Option key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </Select.Option>
                  );
                })}
            </Select> */}
            <Tag color="orange">{selectedDevice?.defaultScenario?.title}</Tag>
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewDeviceDetailComponent);
