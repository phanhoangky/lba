import {
  PlusSquareTwoTone,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Select, Space } from 'antd';
import * as React from 'react';
import type { Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';

export type ScenarioTableHeaderComponentProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
};

export class ScenarioTableHeaderComponent extends React.Component<ScenarioTableHeaderComponentProps> {
  setAddNewScenarioModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setAddNewScenarioModalReducer',
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: 'scenarios/setTableLoadingReducer',
      payload: loading,
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

  render() {
    const { getListScenarioParam } = this.props.scenarios;
    return (
      <Space>
        <Input.Search
          enterButton
          value={getListScenarioParam?.searchValue}
          onSearch={(e) => {
            this.setTableLoading(true)
              .then(() => {
                this.callGetListScenario({
                  searchValue: e,
                  pageNumber: 0,
                });
              })
              .catch((error) => {
                console.log('====================================');
                console.log(error);
                console.log('====================================');
                this.setTableLoading(false);
              });
          }}
        />

        <Dropdown
          overlay={
            <Menu
              onClick={(e) => {
                this.setTableLoading(true)
                  .then(() => {
                    this.callGetListScenario({
                      isDescending: e.key === 'desc',
                    }).then(() => {
                      this.setTableLoading(false);
                    });
                  })
                  .catch(() => {
                    this.setTableLoading(false);
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
            {getListScenarioParam?.isDescending && <SortDescendingOutlined />}
            {!getListScenarioParam?.isDescending && <SortAscendingOutlined />}
          </Button>
        </Dropdown>
        <Select
          style={{ width: '150px' }}
          defaultValue="createTime"
          onChange={(e) => {
            this.setTableLoading(true)
              .then(() => {
                this.callGetListScenario({
                  orderBy: e,
                  isSort: true,
                }).then(() => {
                  this.setTableLoading(false);
                });
              })
              .catch(() => {
                this.setTableLoading(false);
              });
          }}
        >
          <Select.Option value="createTime">Create Time</Select.Option>
          <Select.Option value="title">Title</Select.Option>
        </Select>
        <Button
          onClick={() => {
            this.setAddNewScenarioModal({
              visible: true,
            });
          }}
          className="lba-btn"
        >
          <PlusSquareTwoTone twoToneColor="#00cdac" /> Add New Scenario
        </Button>
      </Space>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ScenarioTableHeaderComponent);
