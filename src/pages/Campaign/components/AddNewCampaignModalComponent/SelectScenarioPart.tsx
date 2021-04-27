import { EyeFilled } from '@ant-design/icons';
import { Button, Col, List, Modal, Row } from 'antd';
import * as React from 'react';
import type { CampaignModelState, Dispatch, LocationModelState, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '../..';
import { ViewScenarioDetailComponent } from './ViewScenarioDetailComponent';
import styles from '../../index.less';

export type SelectScenarioPartProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  scenarios: ScenarioModelState;
  location: LocationModelState;
};

class SelectScenarioPart extends React.Component<SelectScenarioPartProps> {
  componentDidMount = async () => {
    this.setScenarioTableLoading(true).then(() => {
      this.callGetListScenario()
        .then(() => {
          this.setListScenarioWithAtLeastOneItems().then(() => {
            this.setScenarioTableLoading(false);
          });
        })
        .catch(() => {
          this.setScenarioTableLoading(false);
        });
    });
  };

  setListScenarioWithAtLeastOneItems = async () => {
    const { listScenario } = this.props.scenarios;
    const newList = listScenario?.filter((s) => s.scenarioItems.length > 0);
    await this.setListScenarios(newList);
  };

  setListScenarios = async (list: any) => {
    await this.props.dispatch({
      type: `scenarios/setListScenarioReducer`,
      payload: list,
    });
  };

  setScenarioTableLoading = async (isLoading: boolean) => {
    await this.props.dispatch({
      type: `scenarios/setTableLoadingReducer`,
      payload: isLoading,
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

  callGetListScenario = async (param?: any) => {
    await this.props.dispatch({
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
        ...this.props.campaign.addNewCampaignModal?.previewScenarioModal,
        ...param,
      },
    });
  };

  handlePreviewScenario = async (item: any) => {
    this.setSelectedScenario(item).then(() => {
      this.setPreviewScenarioModal({
        visible: true,
      });
    });
  };

  render() {
    const { listScenario, getListScenarioParam, totalItem, tableLoading } = this.props.scenarios;
    const { addNewCampaignModal } = this.props.campaign;
    console.log('====================================');
    console.log(listScenario);
    console.log('====================================');
    // const selectedScenario = listScenario?.filter((s) => s.isSelected)[0];

    return (
      <>
        <Row>
          <Col span={24}>
            <List
              bordered
              loading={tableLoading}
              dataSource={listScenario}
              className={styles.listScenarios}
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
                  className={item.isSelected ? 'selected-scenario' : 'scenario-record'}
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
            visible={addNewCampaignModal?.previewScenarioModal?.visible}
            closable={false}
            centered
            destroyOnClose={true}
            title="Scenario Preview"
            onCancel={() => {
              this.setPreviewScenarioModal({
                visible: false,
              });
            }}
            footer={null}
          >
            {addNewCampaignModal?.previewScenarioModal?.visible && (
              <ViewScenarioDetailComponent {...this.props} />
            )}
          </Modal>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(SelectScenarioPart);
