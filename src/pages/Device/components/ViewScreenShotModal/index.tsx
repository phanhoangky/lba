import * as React from 'react';
import type { DeviceModelState, Dispatch } from 'umi';
import { connect } from 'umi';
import { Divider, Image } from 'antd';

export type ViewScreenShotModalProps = {
  dispatch: Dispatch;
  deviceStore: DeviceModelState;
};

export class ViewScreenShotModal extends React.Component<ViewScreenShotModalProps> {
  componentDidMount = async () => {
    const { selectedDevice } = this.props.deviceStore;
    if (selectedDevice && selectedDevice.macaddress) {
      await this.fetchDevicesScreenShot(selectedDevice.macaddress);
    }
  };

  componentDidUpdate = async () => {
    // const { selectedDevice } = this.props.deviceStore;
    // if (selectedDevice && selectedDevice.macaddress)
    //   await this.fetchDevicesScreenShot(selectedDevice.macaddress);
  };

  fetchDevicesScreenShot = async (macAddress: string) => {
    await this.props.dispatch({
      type: 'deviceStore/fetchDevicesScreenShot',
      payload: macAddress,
    });
  };

  render() {
    const { listDevicesScreenShot } = this.props.deviceStore;

    // const firstUrl =
    //   listDevicesScreenShot && listDevicesScreenShot.length > 0 && listDevicesScreenShot;
    // let url = '';
    return (
      <>
        {listDevicesScreenShot && <Image src={listDevicesScreenShot.url} />}
        <Divider orientation="center" className="lba-text">
          Time Shoot
        </Divider>
        {listDevicesScreenShot && listDevicesScreenShot.createDate}
        {/* <img src={listDevicesScreenShot[0]} width={'100%'} height={'100%'} /> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewScreenShotModal);
