import { openNotification } from '@/utils/utils';
import { Card, List, Image } from 'antd';
import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import styles from '../../../index.less';

export type ChooseLayoutStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

export class ChooseLayoutStepComponent extends React.Component<ChooseLayoutStepProps> {
  setCreateScenarioParam = async (param: any) => {
    await this.props.dispatch({
      type: 'scenarios/setCreateScenarioParamReducer',
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...param,
      },
    });
  };

  setListScenarioLayouts = async (list: any) => {
    await this.props.dispatch({
      type: 'layouts/setListLayoutsReducer',
      payload: list,
    });
  };

  chooseLayout = async (layout: any) => {
    this.setCreateScenarioParam({
      layoutId: layout.id,
      layout,
    }).then(() => {
      const newList = this.props.layouts.listLayouts?.map((item) => {
        if (item.id === layout.id) {
          return {
            ...item,
            isSelected: true,
          };
        }
        return {
          ...item,
          isSelected: false,
        };
      });
      this.setListScenarioLayouts(newList);
    });
  };

  setAddNewScenarioModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'scenarios/setAddNewScenarioModalReducer',
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  handleOnNext = () => {
    const { listLayouts } = this.props.layouts;
    const selectedLayout = listLayouts?.filter((l) => l.isSelected)[0];
    if (selectedLayout) {
      const { addNewScenarioModal } = this.props.scenarios;
      if (addNewScenarioModal) {
        this.setAddNewScenarioModal({
          currentStep: addNewScenarioModal.currentStep + 1,
        });
      }
    } else {
      openNotification('error', 'Please choose a layout of scenario');
    }
  };
  render() {
    const { listLayouts } = this.props.layouts;
    return (
      <>
        <List
          itemLayout="horizontal"
          dataSource={listLayouts}
          grid={{
            gutter: 20,
            md: 2,
            lg: 2,
            xl: 3,
            xxl: 3,
          }}
          split
          className={styles.listScenarios}
          style={{ alignItems: 'center', alignContent: 'center' }}
          renderItem={(item) => {
            return (
              <List.Item>
                <Card
                  style={{ width: '100%', boxSizing: 'border-box', padding: 5 }}
                  hoverable
                  title={item.title}
                  cover={<Image src={item.layoutUrl} height={150} />}
                  className={item.isSelected ? styles.selectedLayout : 'card-lba'}
                  onClick={() => {
                    this.chooseLayout(item);
                  }}
                >
                  <Card.Meta description={item.description} />
                </Card>
              </List.Item>
            );
          }}
        ></List>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ChooseLayoutStepComponent);
