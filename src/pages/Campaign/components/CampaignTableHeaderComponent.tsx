import {
  PlusSquareTwoTone,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Select, Space } from 'antd';
import * as React from 'react';
import type { CampaignModelState, Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { CAMPAIGN } from '..';

export type CampaignTableHeaderComponentProps = {
  dispatch: Dispatch;
  campaign: CampaignModelState;
  scenarios: ScenarioModelState;
};

export class CampaignTableHeaderComponent extends React.Component<CampaignTableHeaderComponentProps> {
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

  setAddNewCampaignModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setAddNewCampaignModalReducer`,
      payload: {
        ...this.props.campaign.addNewCampaignModal,
        ...modal,
      },
    });
  };

  callGetListCampaigns = async (param?: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/getListCampaigns`,
      payload: {
        ...this.props.campaign.getListCampaignParam,
        ...param,
      },
    });
  };

  setCampaignTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCampaignTableLoadingReducer`,
      payload: loading,
    });
  };

  render() {
    const { getListCampaignParam } = this.props.campaign;
    return (
      <Space>
        <Input.Search
          enterButton
          onSearch={(e) => {
            this.setCampaignTableLoading(true)
              .then(() => {
                this.callGetListCampaigns({
                  searchValue: e,
                  pageNumber: 0,
                }).then(() => {
                  this.setCampaignTableLoading(false);
                });
              })
              .catch(() => {
                this.setCampaignTableLoading(false);
              });
          }}
        />
        <Button
          onClick={async () => {
            this.setListScenarioWithAtLeastOneItems().then(() => {
              this.setAddNewCampaignModal({
                visible: true,
              });
            });
          }}
          icon={<PlusSquareTwoTone />}
        >
          Add New Campaign
        </Button>
        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                this.setCampaignTableLoading(true)
                  .then(() => {
                    this.callGetListCampaigns({
                      isDescending: e.key === 'desc',
                    }).then(() => {
                      this.setCampaignTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setCampaignTableLoading(false);
                  });
              }}
            >
              <Menu.Item key="asc" icon={<SortAscendingOutlined />}>
                Ascending
              </Menu.Item>
              <Menu.Item key="desc" icon={<SortDescendingOutlined />}>
                Descending
              </Menu.Item>
            </Menu>
          }
        >
          <Button>
            {getListCampaignParam.isDescending && <SortDescendingOutlined />}
            {!getListCampaignParam.isDescending && <SortAscendingOutlined />}
          </Button>
        </Dropdown>
        <Select
          defaultValue=""
          value={getListCampaignParam.orderBy}
          onChange={(e) => {
            this.setCampaignTableLoading(true)
              .then(() => {
                this.callGetListCampaigns({
                  orderBy: e,
                }).then(() => {
                  this.setCampaignTableLoading(false);
                });
              })
              .catch(() => {
                this.setCampaignTableLoading(false);
              });
          }}
        >
          <Select.Option value="">Default</Select.Option>
          <Select.Option value="createDate">Create Date</Select.Option>
        </Select>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(CampaignTableHeaderComponent);
