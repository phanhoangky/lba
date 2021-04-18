import { Modal, Form, Divider, List, Card, Image } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';
import styles from '../../index.less';
import TitleStep from './TitleStep';
import { openNotification } from '@/utils/utils';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

export type AddNewScenarioFormModalProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class AddNewScenarioFormModal extends React.Component<AddNewScenarioFormModalProps> {
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

  createNewScenario = async (values: any) => {
    await this.props.dispatch({
      type: 'scenarios/createScenario',
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...values,
      },
    });
  };

  onCreateScenarios = async (values: any) => {
    this.setTableLoading(true)
      .then(() => {
        this.setAddNewScenarioModal({
          isLoading: true,
        })
          .then(() => {
            this.createNewScenario(values)
              .then(() => {
                this.callGetListScenario().then(() => {
                  openNotification(
                    'success',
                    'Create Scenario Successfully',
                    `Create campaign ${values.title} successfully`,
                  );
                  this.setAddNewScenarioModal({
                    visible: false,
                    isLoading: false,
                  }).then(() => {
                    this.setTableLoading(false);
                  });
                });
              })
              .catch((error) => {
                openNotification('error', 'Fail to Create Scenario', error.message);
                this.setAddNewScenarioModal({
                  visible: false,
                  isLoading: false,
                });
                this.setTableLoading(false);
              });
          })
          .catch(() => {
            this.setAddNewScenarioModal({
              visible: false,
              isLoading: false,
            });
          });
      })
      .catch(() => {
        this.setTableLoading(false);
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

  clearListScenarioLayouts = async () => {
    const newList = this.props.layouts.listLayouts.map((item) => ({ ...item, isSelected: false }));
    this.setListScenarioLayouts(newList);
  };

  chooseLayout = async (layout: any) => {
    this.setCreateScenarioParam({
      layoutId: layout.id,
    }).then(() => {
      const newList = this.props.layouts.listLayouts.map((item) => {
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

  formRef = React.createRef<FormInstance<any>>();

  render() {
    const { addNewScenarioModal } = this.props.scenarios;
    const { listLayouts } = this.props.layouts;

    return (
      <Modal
        title="Create New Scenario Layout"
        visible={addNewScenarioModal?.visible}
        confirmLoading={addNewScenarioModal?.isLoading}
        closable={false}
        width={'50%'}
        destroyOnClose={true}
        onCancel={() => {
          this.setAddNewScenarioModal({
            visible: false,
          }).then(() => {
            this.clearListScenarioLayouts();
          });
        }}
        okButtonProps={{
          disabled: listLayouts.every((layouts) => !layouts.isSelected),
          className: 'lba-btn',
          icon: <CheckCircleFilled className="lba-icon" />,
        }}
        cancelButtonProps={{
          icon: <CloseCircleFilled className="lba-close-icon" />,
          danger: true,
        }}
        onOk={async () => {
          if (addNewScenarioModal?.currentStep === 0) {
            this.formRef.current?.validateFields().then((values) => {
              this.onCreateScenarios(values).catch((error) => {
                openNotification('error', 'Fail to Create Scenario', error.message);
              });
              // this.setAddNewScenarioModal({
              //   currentStep: 1,
              // });
            });
          }
        }}
      >
        <Form ref={this.formRef} name="add_new_scenario" layout="vertical">
          <TitleStep {...this.props} />
        </Form>

        {/* <Animated
          animationIn="zoomIn"
          animationOut="fadeOut"
          isVisible={addNewScenarioModal.currentStep === 1}
        >
          <ChooseLayoutDirectionStep {...this.props} />
        </Animated>
        <Animated
          animationIn="zoomIn"
          animationOut="fadeOut"
          isVisible={addNewScenarioModal.currentStep === 2}
        >
          <ChooseLayoutStep {...this.props} />
        </Animated>
        <Animated
          animationIn="zoomIn"
          animationOut="fadeOut"
          isVisible={addNewScenarioModal.currentStep === 3}
        >
          <SetupScenarioItemsStep {...this.props} />
        </Animated>
        <Divider></Divider> */}
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
        <Divider></Divider>
      </Modal>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewScenarioFormModal);
