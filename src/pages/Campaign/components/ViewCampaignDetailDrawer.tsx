import { LOCATION_DISPATCHER } from '@/pages/Location';
import { LeafletMapComponent } from '@/pages/Location/components/LeafletMapComponent';
import { TAG_COLOR } from '@/services/constantUrls';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import { Gauge, Liquid } from '@ant-design/charts';
import { CaretRightFilled, ClockCircleFilled } from '@ant-design/icons';
import { Button, Col, Divider, Form, Row, Space, Tag } from 'antd';
import L from 'leaflet';
import moment from 'moment';
import * as React from 'react';
import type { CampaignModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { v4 as uuidv4 } from 'uuid';
import { CAMPAIGN } from '..';

export type ViewCampaignDetailDrawerProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  // deviceStore: DeviceModelState;
  // scenarios: ScenarioModelState;
  location: LocationModelState;
};

export class ViewCampaignDetailDrawer extends React.Component<ViewCampaignDetailDrawerProps> {
  componentDidMount() {
    const { mapComponent } = this.props.location;

    if (mapComponent && mapComponent.map) {
      const { selectedCampaign } = this.props.campaign;
      if (selectedCampaign && selectedCampaign.location.split('-').length === 2) {
        const lat = Number.parseFloat(selectedCampaign.location.split('-')[0]);
        const lng = Number.parseFloat(selectedCampaign.location.split('-')[1]);
        mapComponent.map.setView([lat, lng]);
        if (!mapComponent.marker) {
          if (lat && lng) {
            const marker = L.marker([lat, lng]);
            marker.addTo(mapComponent.map);
            this.setMapComponent({
              marker,
            });
          }
        } else {
          mapComponent.marker.setLatLng([lat, lng]).addTo(mapComponent.map);
        }

        if (mapComponent.circle) {
          mapComponent.circle.setLatLng([lat, lng]);
          mapComponent.circle.setRadius(selectedCampaign.radius * 1000);
          // mapComponent.circle.redraw();
        } else {
          const circle = L.circle([lat, lng]).setRadius(selectedCampaign.radius * 1000);
          circle.addTo(mapComponent.map);
          this.setMapComponent({
            circle,
          });
        }
      }
      mapComponent.map.invalidateSize(true);
    }
  }

  setMapComponent = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setMapComponentReducer`,
      payload: {
        ...this.props.location.mapComponent,
        ...payload,
      },
    });
  };

  reverseGeocodingToAddress = async (lat: string, lng: string) => {
    const { data } = await reverseGeocoding(Number.parseFloat(lat), Number.parseFloat(lng));
    if (data) {
      return data.display_name;
    }

    return '';
  };
  setEditCampaignDrawer = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setEditCampaignReducer`,
      payload: {
        ...this.props.campaign.editCampaignDrawer,
        ...modal,
      },
    });
  };
  render() {
    const { selectedCampaign, fees } = this.props.campaign;
    // const { mapComponent } = this.props.location;
    const campaignBudget = selectedCampaign ? selectedCampaign.budget : 0;
    const listType = selectedCampaign?.campaignDeviceTypes?.map((type) => {
      return (
        <Tag color={'green'} key={type.deviceType.id}>
          {type.deviceType.typeName}
        </Tag>
      );
    });
    return (
      <>
        {/* <Drawer
          title={<>Campaign Detail</>}
          width={'80%'}
          closable={false}
          afterVisibleChange={(e) => {
            if (!e) {
              if (mapComponent) {
                if (mapComponent.map) {
                  if (mapComponent.marker) {
                    mapComponent.marker.remove();
                  }
                  if (mapComponent.circle) {
                    mapComponent.circle.remove();
                  }
                }
                this.setMapComponent({
                  marker: undefined,
                  circle: undefined,
                  map: undefined,
                });
              }
            }
          }}
          onClose={() => {
            this.setEditCampaignDrawer({
              visible: false,
            });
          }}
          visible={editCampaignDrawer?.visible}
          destroyOnClose={true}
          forceRender={true}
        > */}
        <Row gutter={24}>
          <Col span={12}>
            {/* <Row>
                <Col span={4}>Name</Col>
                <Col span={20}>
                  <Input readOnly value={selectedCampaign?.name} />
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>Budget</Col>
                <Col span={20}>
                  <Input
                    readOnly
                    value={selectedCampaign?.budget
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                      .concat(' VND')}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={4}>Calculate Fees</Col>
                <Col span={20}>
                  <Row>
                    <Col span={4}>Total Fee</Col>
                    <Col span={20}>
                      {fees && campaignBudget && campaignBudget * fees.Advertiser + campaignBudget}{' '}
                      VND
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4}>Remain Fee</Col>
                    <Col span={20}>
                      {fees && campaignBudget && campaignBudget - campaignBudget * fees.Supplier}{' '}
                      VND
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4}>Cancel Fee</Col>
                    <Col span={20}>
                      {fees && campaignBudget && campaignBudget * fees.CancelCampagin} VND
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>Types</Col>
                <Col span={20}>
                  <Space wrap>{listType}</Space>
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>From - To</Col>
                <Col span={20}>
                  <DatePicker.RangePicker
                    disabled={true}
                    value={[
                      moment(moment(selectedCampaign?.startDate).format('YYYY-MM-DD')),
                      moment(moment(selectedCampaign?.endDate).format('YYYY-MM-DD')),
                    ]}
                    inputReadOnly={true}
                  />
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>Time Filter</Col>
                <Col span={20}>
                  <Space wrap={true}>
                    {selectedCampaign?.timeFilter.split('').map((time, index) => {
                      const start = index;
                      const end = index + 1 === 24 ? 0 : index + 1;
                      if (time === '1') {
                        return (
                          <Button
                            key={uuidv4()}
                            style={{ textAlign: 'center' }}
                            icon={<ClockCircleFilled className="lba-icon" />}
                          >{`${start}h - ${end}h`}</Button>
                        );
                      }
                      return '';
                    })}
                  </Space>
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>Date Filter</Col>
                <Col span={20}>
                  <Space wrap={true}>
                    {selectedCampaign?.dateFilter.split('').map((date, index) => {
                      return (
                        <Button key={uuidv4()} type={date === '1' ? 'primary' : 'default'}>
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
                </Col>
              </Row>
              <Divider></Divider>
              <Row>
                <Col span={4}>Address</Col>
                <Col span={20}>{selectedCampaign?.address}</Col>
              </Row> */}
            <Form name="view_campaign_detail_form" layout="vertical">
              <Form.Item label="Name">
                {/* <Input readOnly value={selectedCampaign?.name} /> */}
                <Tag color={TAG_COLOR}>{selectedCampaign?.name}</Tag>
              </Form.Item>
              <Form.Item label="Budget">
                {/* <Input
                    readOnly
                    value={selectedCampaign?.budget
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                      .concat(' VND')}
                  /> */}
                <Tag color={TAG_COLOR}>
                  {selectedCampaign?.budget
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                    .concat(' VND')}
                </Tag>
              </Form.Item>
              <Form.Item label="Calculate Fees">
                <Row gutter={20}>
                  <Col>
                    <Form.Item label="Total Fee">
                      {/* <Input
                          value={(
                            fees &&
                            campaignBudget &&
                            campaignBudget * fees.Advertiser + campaignBudget
                          )
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                            .concat(' VND')}
                        /> */}
                      <Tag color={TAG_COLOR}>
                        {(
                          fees &&
                          campaignBudget &&
                          campaignBudget * fees.Advertiser + campaignBudget
                        )
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                          .concat(' VND')}
                      </Tag>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label="Remain Fee">
                      {/* <Input
                          value={(
                            fees &&
                            campaignBudget &&
                            campaignBudget - campaignBudget * fees.Supplier
                          )
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                            .concat(' VND')}
                        /> */}
                      <Tag color={TAG_COLOR}>
                        {(fees && campaignBudget && campaignBudget - campaignBudget * fees.Supplier)
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                          .concat(' VND')}
                      </Tag>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Form.Item label="Cancel Fee">
                      {/* <Input
                          value={(fees && campaignBudget && campaignBudget * fees.CancelCampagin)
                            ?.toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                            .concat(' VND')}
                        /> */}
                      <Tag color={TAG_COLOR}>
                        {(fees && campaignBudget && campaignBudget * fees.CancelCampagin)
                          ?.toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
                          .concat(' VND')}
                      </Tag>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
              <Form.Item label="Types">
                <Space wrap>{listType}</Space>
              </Form.Item>
              <Form.Item label="From - To">
                {/* <DatePicker.RangePicker
                    disabled={true}
                    value={[
                      moment(moment(selectedCampaign?.startDate).format('YYYY-MM-DD')),
                      moment(moment(selectedCampaign?.endDate).format('YYYY-MM-DD')),
                    ]}
                    inputReadOnly={true}
                  /> */}
                <Space wrap direction="horizontal">
                  <Tag color={TAG_COLOR}>
                    {moment(selectedCampaign?.startDate).format('YYYY-MM-DD')}
                  </Tag>
                  <CaretRightFilled className="lba-icon" />
                  <Tag color={TAG_COLOR}>
                    {moment(selectedCampaign?.startDate).format('YYYY-MM-DD')}
                  </Tag>
                </Space>
              </Form.Item>
              <Form.Item label="Times">
                <Space wrap={true}>
                  {selectedCampaign?.timeFilter.split('').map((time, index) => {
                    const start = index;
                    const end = index + 1 === 24 ? 0 : index + 1;
                    if (time === '1') {
                      return (
                        <Button
                          key={uuidv4()}
                          style={{ textAlign: 'center' }}
                          icon={<ClockCircleFilled className="lba-icon" />}
                        >{`${start}h - ${end}h`}</Button>
                      );
                    }
                    return '';
                  })}
                </Space>
              </Form.Item>
              <Form.Item label="Day In Week">
                <Space wrap={true}>
                  {selectedCampaign?.dateFilter.split('').map((date, index) => {
                    return (
                      <Button key={uuidv4()} className={date === '1' ? 'lba-btn' : ''}>
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
              </Form.Item>
            </Form>
            <Divider></Divider>
            <Row>
              <Col span={24}>
                <LeafletMapComponent disabledClick={true} showLocations={true} {...this.props} />
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Divider orientation="left"></Divider>
            <Gauge
              percent={selectedCampaign?.percentMoneyUsed ? selectedCampaign.percentMoneyUsed : 0}
              range={{ color: 'l(0) 0:#bde8ff 1:#9ec9ff' }}
              startAngle={Math.PI}
              endAngle={2 * Math.PI}
              statistic={{
                title: {
                  offsetY: 36,
                  style: {
                    fontSize: '36px',
                    color: '#4B535E',
                  },
                  formatter: function formatter() {
                    return 'Percent Money Used';
                  },
                },
                // content: {
                //   style: {
                //     fontSize: '24px',
                //     lineHeight: '44px',
                //     color: '#4B535E',
                //   },
                //   formatter: function formatter() {
                //     return 'Percent Money Used';
                //   },
                // },
              }}
            />
            <Divider orientation="left"></Divider>
            <Liquid
              percent={selectedCampaign?.percentWin ? selectedCampaign.percentWin : 0}
              outline={{ border: 4, distance: 8 }}
              wave={{ length: 128 }}
              statistic={{
                title: {
                  formatter: function formatter() {
                    return 'Percent Win';
                  },
                  style: function style(_ref) {
                    const { percent } = _ref;
                    return { fill: percent > 0.65 ? 'white' : 'rgba(44,53,66,0.85)' };
                  },
                },
              }}
            />
          </Col>
        </Row>
        {/* </Drawer> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewCampaignDetailDrawer);
