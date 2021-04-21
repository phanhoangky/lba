import { CheckOutlined, ClockCircleFilled, CloseOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Divider, Form, Input, Row, Select, Space, Switch } from 'antd';
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
    const { listScenario } = this.props.scenarios;
    const timeFilter = selectedDevice?.timeFilter;
    const displayTimeFilter = timeFilter?.map((time, index) => {
      return (
        time === '1' && (
          <Button
            icon={<ClockCircleFilled className="lba-icon" />}
            style={{
              fontWeight: 'bolder',
            }}
            className="lba-btn"
          >
            {`${index} h - ${index + 1} h`}
          </Button>
        )
      );
    });

    return (
      <>
        <Form layout="vertical" name="Update_Device_Form">
          <Form.Item label="Name">
            <Input readOnly value={selectedDevice?.name} />
          </Form.Item>
          <Form.Item label="Description">
            {/* <Skeleton active loading={editMultipleDevicesDrawer?.isLoading}> */}
            <Input.TextArea rows={4} readOnly value={selectedDevice?.description} />
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
            <DatePicker.RangePicker
              format={'YYYY/MM/DD'}
              disabled
              value={[
                moment(moment(selectedDevice?.startDate).format('YYYY-MM-DD')),
                moment(moment(selectedDevice?.endDate).format('YYYY-MM-DD')),
              ]}
            />
            {/* </Skeleton> */}
          </Form.Item>
          <Divider></Divider>

          <Form.Item label="Publish">
            <Switch
              checked={selectedDevice?.isPublished}
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            ></Switch>
          </Form.Item>
          <Row gutter={20}>
            <Col span={12}>
              <Form.Item label="Slot">
                <Input readOnly value={selectedDevice?.slot} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Mininum Bid">
                <Input readOnly value={selectedDevice?.minBid} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Scenario">
            <Select size="large" value={selectedDevice?.defaultScenarioId} disabled>
              {listScenario &&
                listScenario.map((scenario) => {
                  return (
                    <Select.Option key={scenario.id} value={scenario.id}>
                      {scenario.title}
                    </Select.Option>
                  );
                })}
            </Select>
          </Form.Item>
        </Form>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewDeviceDetailComponent);
