import { sortArea } from '@/utils/utils';
import { Col, List, Row } from 'antd';
import * as React from 'react';
import type { CampaignModelState, Dispatch, LocationModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '../..';

export type SelectScenarioPartProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  scenarios: ScenarioModelState;
  location: LocationModelState;
};

class SelectScenarioPart extends React.Component<SelectScenarioPartProps> {
  setCreateNewCampaignParam = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCreateCampaignParamReducer`,
      payload: {
        ...this.props.campaign.createCampaignParam,
        ...param,
      },
    });
  };

  callGetListScenario = async (param?: any) => {
    this.props.dispatch({
      type: 'scenarios/getListScenarios',
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  selectScenario = async (id?: string) => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: this.props.scenarios.listScenario?.map((scenario) => {
        if (scenario.id === id) {
          return {
            ...scenario,
            isSelected: true,
          };
        }

        return {
          ...scenario,
          isSelected: false,
        };
      }),
    });
  };

  ratioCalculation = () => {
    const element = document.getElementById('areaWrapper');
    if (element) {
      const width = element?.clientWidth;

      const height = (width * 9) / 16;
      element.style.height = `${height}px`;
      // console.log('====================================');
      // console.log('Calculated >>>', height, element);
      // console.log('====================================');
    }
  };

  render() {
    const { listScenario, getListScenarioParam, totalItem, tableLoading } = this.props.scenarios;

    const selectedScenario = listScenario?.filter((s) => s.isSelected)[0];

    return (
      <>
        <Row>
          <Col span={12}>
            <List
              bordered
              loading={tableLoading}
              dataSource={listScenario}
              pagination={{
                current: getListScenarioParam?.pageNumber ? getListScenarioParam.pageNumber + 1 : 1,
                pageSize: getListScenarioParam?.pageLimitItem
                  ? getListScenarioParam?.pageLimitItem
                  : 10,
                total: totalItem,
                onChange: (e) => {
                  this.callGetListScenario({
                    pageNumber: e - 1,
                  });
                },
              }}
              renderItem={(item) => (
                <List.Item
                  style={
                    item.isSelected
                      ? { backgroundColor: '#b3def5', transition: '0.5s ease' }
                      : { transition: '0.5s ease' }
                  }
                  onClick={async () => {
                    this.setCreateNewCampaignParam({
                      scenarioId: item.id,
                    }).then(() => {
                      this.selectScenario(item.id).then(() => {
                        this.ratioCalculation();
                      });
                    });
                  }}
                >
                  <List.Item.Meta title={item.title} description={item.description} />
                </List.Item>
              )}
            ></List>
          </Col>
          <Col span={12}>
            <div
              id="areaWrapper"
              style={{
                margin: `0 auto`,
                display: 'flex',
                width: '100%',
                boxSizing: 'border-box',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {selectedScenario &&
                sortArea(selectedScenario?.layout.areas).map((area) => {
                  return (
                    <>
                      <div
                        key={area.id}
                        style={{
                          flex: `${area.width * 100}%`,
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: `${area.height * 100}%`,
                          textAlign: 'center',
                          border: `2px solid black`,
                          transition: 'ease',
                          transitionDuration: '1s',
                        }}
                      ></div>
                    </>
                  );
                })}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectScenarioPart);
