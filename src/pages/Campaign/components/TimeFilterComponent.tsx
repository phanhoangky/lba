import { Button, Divider, Input, Space, TimePicker } from 'antd';
import * as React from 'react';
import type { CampaignModelState, DeviceModelState, Dispatch } from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '..';
import { v4 as uuidv4 } from 'uuid';
import {
  ClockCircleTwoTone,
  CloseCircleFilled,
  CloseOutlined,
  PlusSquareTwoTone,
} from '@ant-design/icons';

export type TimeFilterComponentProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  deviceStore: DeviceModelState;
};

class TimeFilterCamponent extends React.Component<TimeFilterComponentProps> {
  state = {
    inputTimeFilterVisible: false,
  };

  setAddNewCampaignModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setAddNewCampaignModalReducer`,
      payload: {
        ...this.props.campaign.addNewCampaignModal,
        ...modal,
      },
    });
  };

  setCreateNewCampaignParam = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCreateCampaignParamReducer`,
      payload: {
        ...this.props.campaign.createCampaignParam,
        ...param,
      },
    });
  };

  clearCreateNewCampaignParam = async () => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/clearCreateCampaignParamReducer`,
    });
  };

  addNewTimeFilter = async (startTime: number, endTime: number) => {
    const { createCampaignParam } = this.props.campaign;

    const newList = createCampaignParam?.timeFilter.split('').map((time, index) => {
      if (index >= startTime && index <= endTime) {
        return '1';
      }

      return '0';
    });
    await this.setCreateNewCampaignParam({
      timeFilter: newList?.toString().replaceAll(',', ''),
    });

    if (this.timePickerRef.current) {
      this.timePickerRef.current.blur();
    }
  };

  handleRemoveTimeFilter = async (index: number) => {
    const { createCampaignParam } = this.props.campaign;

    const newList = createCampaignParam?.timeFilter.split('').map((time, i) => {
      if (index === i) {
        return '0';
      }

      return time;
    });
    await this.setCreateNewCampaignParam({
      timeFilter: newList?.toString().replaceAll(',', ''),
    });
  };

  timePickerRef = React.createRef<any>();

  render() {
    const { createCampaignParam } = this.props.campaign;

    const { inputTimeFilterVisible } = this.state;

    const timeArray = createCampaignParam?.timeFilter.split('');
    return (
      <>
        <Space wrap={true} direction="horizontal">
          {timeArray?.map((time, index) => {
            const startTime = index;
            const endTime = index + 1 === timeArray.length ? 0 : index + 1;
            return (
              time === '1' && (
                <Input
                  value={`${startTime} h - ${endTime} h`}
                  readOnly
                  key={uuidv4()}
                  prefix={<ClockCircleTwoTone twoToneColor="#00cdac" className="lba-icon" />}
                  suffix={
                    <Button
                      danger
                      onClick={() => {
                        this.handleRemoveTimeFilter(index);
                      }}
                    >
                      <CloseCircleFilled className="lba-close-icon" />
                    </Button>
                  }
                />
              )
            );
          })}
        </Space>
        <Divider></Divider>
        {!inputTimeFilterVisible && (
          <Button
            className="lba-btn"
            onClick={() => {
              this.setState({ inputTimeFilterVisible: true });
            }}
            icon={<PlusSquareTwoTone twoToneColor="#00cdac" className="lba-icon" />}
          >
            New Time
          </Button>
        )}

        {inputTimeFilterVisible && (
          <TimePicker.RangePicker
            ref={this.timePickerRef}
            onChange={(e) => {
              if (e) {
                if (e[0] && e[1]) {
                  const startHour = e[0].hour();
                  const endHour = e[1].hour();
                  if (startHour >= 0 && endHour >= startHour) {
                    this.addNewTimeFilter(startHour, endHour);
                  }
                }
              }
            }}
            format="HH"
            onBlur={() => {
              this.setState({ inputTimeFilterVisible: false });
            }}
          />
        )}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(TimeFilterCamponent);
