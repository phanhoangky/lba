import { EyeFilled } from '@ant-design/icons';
import { Button, Col, List, Modal, Row } from 'antd';
import * as React from 'react';
import type { CampaignModelState, Dispatch, LocationModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '../..';
import { ViewScenarioDetailComponent } from './ViewScenarioDetailComponent';

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

  setSelectedScenario = async (item: any) => {
    await this.props.dispatch({
      type: 'scenarios/setSelectedScenarioReducer',
      payload: {
        ...this.props.scenarios.selectedSenario,
        ...item,
      },
    });
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

  setPreviewScenarioModal = async (param?: any) => {
    await this.setAddNewCampaignModal({
      previewScenarioModal: {
        ...this.props.campaign.addNewCampaignModal.previewScenarioModal,
        ...param,
      },
    });
  };

  handlePreviewScenario = async (item: any) => {
    await this.setPreviewScenarioModal({
      visible: true,
    });

    await this.setSelectedScenario(item);
  };

  render() {
    const { listScenario, getListScenarioParam, totalItem, tableLoading } = this.props.scenarios;
    const { addNewCampaignModal } = this.props.campaign;

    // const selectedScenario = listScenario?.filter((s) => s.isSelected)[0];

    return (
      <>
        <Row>
          <Col span={24}>
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
                  extra={
                    <>
                      <Button
                        className="lba-btn"
                        onClick={() => {
                          this.handlePreviewScenario(item);
                        }}
                      >
                        <EyeFilled /> Detail
                      </Button>
                    </>
                  }
                >
                  <List.Item.Meta title={item.title} description={item.description} />
                </List.Item>
              )}
            ></List>
          </Col>
          <Modal
            visible={addNewCampaignModal.previewScenarioModal?.visible}
            closable={false}
            destroyOnClose={true}
            onCancel={() => {
              this.setPreviewScenarioModal({
                visible: false,
              });
            }}
          >
            {addNewCampaignModal.previewScenarioModal?.visible && (
              <ViewScenarioDetailComponent {...this.props} />
            )}
          </Modal>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectScenarioPart);
