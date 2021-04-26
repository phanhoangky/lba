import { Button, Space } from 'antd';
import * as React from 'react';
import type { DeviceModelState, Dispatch } from 'umi';

type FilterTimeProps = {
  dispatch: Dispatch;
  deviceStore: DeviceModelState;
  disabled?: boolean;
};

export class FilterDate extends React.Component<FilterTimeProps> {
  state = {
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  handleChooseDate = (index: number) => {
    const { isUpdateMultiple, selectedDevice, updateDevicesState } = this.props.deviceStore;
    const data = isUpdateMultiple ? updateDevicesState?.dateFilter : selectedDevice?.dateFilter;
    if (!this.props.disabled && data) {
      if (isUpdateMultiple) {
        this.props.dispatch({
          type: 'deviceStore/setUpdateDevicesState',
          payload: {
            ...updateDevicesState,
            dateFilter: data.map((value, i) => {
              const state = value === '0' ? '1' : '0';
              if (i === index) {
                return state;
              }
              return value;
            }),
          },
        });
      } else {
        this.props.dispatch({
          type: 'deviceStore/setCurrentDevice',
          payload: {
            ...selectedDevice,
            dateFilter: data.map((value, i) => {
              const state = value === '0' ? '1' : '0';
              if (i === index) {
                return state;
              }
              return value;
            }),
          },
        });
      }
    }
  };
  render() {
    const { isUpdateMultiple, selectedDevice, updateDevicesState } = this.props.deviceStore;
    const data = isUpdateMultiple ? updateDevicesState?.dateFilter : selectedDevice?.dateFilter;
    return (
      <>
        <Space wrap={true}>
          {data?.map((d, index) => {
            return (
              <Button
                onClick={() => {
                  this.handleChooseDate(index);
                }}
                // type={d === '1' ? 'primary' : 'default'}
                className={d === '1' ? 'lba-btn' : ''}
                key={`${Math.random() + 100}`}
              >
                {index === 0 && 'Monday'}
                {index === 1 && 'Tuesday'}
                {index === 2 && 'Wednesday'}
                {index === 3 && 'Thursday'}
                {index === 4 && 'Friday'}
                {index === 5 && 'Saturday'}
                {index === 6 && 'Sunday'}
              </Button>
            );
          })}
        </Space>
      </>
    );
  }
}

export default FilterDate;
