import { Steps } from 'antd';
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
// import styles from '../../index.less';
import { ChooseLayoutStepComponent } from './components/ChooseLayoutStepComponent';
import { SetupScenarioItemsStepComponent } from './components/SetupScenarioItemsStepComponent';
import { openNotification } from '@/utils/utils';
import { InputTitleStepComponent } from './components/InputTitleStepComponent';
import { SCENARIO_STORE } from '../..';
import { v4 as uuidv4 } from 'uuid';
import { FormOutlined, LayoutFilled, SmileFilled, SolutionOutlined } from '@ant-design/icons';
import { CreateDoneComponent } from '@/pages/common/CreateDoneComponent';
import { Animated } from 'react-animated-css';

export type AddNewScenarioFormModalProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

export const steps = [
  {
    title: 'Title and Description',
    // content: <InputTitleStepComponent {...this.props} />,
    icon: <FormOutlined className="lba-icon" />,
  },
  {
    title: 'Layout',
    // content: <ChooseLayoutStepComponent {...this.props} />,
    icon: <LayoutFilled className="lba-icon" />,
  },
  {
    title: 'Playlist',
    // content: <SetupScenarioItemsStepComponent {...this.props} />,
    icon: <SolutionOutlined className="lba-icon" />,
  },
  {
    title: 'Done',
    // content: <SetupScenarioItemsStepComponent {...this.props} />,
    icon: <SmileFilled className="lba-icon" />,
  },
];

export class AddNewScenarioFormModal extends React.Component<AddNewScenarioFormModalProps> {
  componentDidMount = () => {
    this.setCreateScenarioParam({
      id: uuidv4(),
    });
  };

  setAddNewScenarioModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setAddNewScenarioModalReducer`,
      payload: {
        ...this.props.scenarios.addNewScenarioModal,
        ...modal,
      },
    });
  };

  setTableLoading = async (loading: boolean) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setTableLoadingReducer`,
      payload: loading,
    });
  };

  createNewScenario = async (values: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/createScenario`,
      payload: {
        ...this.props.scenarios.createScenarioParam,
        ...values,
      },
    });
  };

  onCreateScenarios = async (values?: any) => {
    this.setTableLoading(true)
      .then(() => {
        this.setAddNewScenarioModal({
          isLoading: true,
        })
          .then(() => {
            this.createNewScenario(values)
              .then(() => {
                this.callGetListScenario().then(() => {
                  const { addNewScenarioModal } = this.props.scenarios;
                  openNotification(
                    'success',
                    'Create Scenario Successfully',
                    `Create campaign ${this.props.scenarios.createScenarioParam?.title} successfully`,
                  );
                  if (addNewScenarioModal) {
                    this.setAddNewScenarioModal({
                      // visible: false,
                      currentStep: addNewScenarioModal.currentStep + 1,
                      isLoading: false,
                    }).then(() => {
                      this.setTableLoading(false);
                    });
                  }
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
      type: `${SCENARIO_STORE}/getListScenarios`,
      payload: {
        ...this.props.scenarios.getListScenarioParam,
        ...param,
      },
    });
  };

  setCreateScenarioParam = async (param: any) => {
    await this.props.dispatch({
      type: `${SCENARIO_STORE}/setCreateScenarioParamReducer`,
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

  clearListScenarioLayouts = () => {
    const newList = this.props.layouts.listLayouts?.map((item) => ({ ...item, isSelected: false }));
    this.setListScenarioLayouts(newList);
  };

  chooseLayout = async (layout: any) => {
    this.setCreateScenarioParam({
      layoutId: layout.id,
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

  handleOnNext = () => {
    const { addNewScenarioModal } = this.props.scenarios;
    if (addNewScenarioModal) {
      const { currentStep } = addNewScenarioModal;
      if (currentStep === 0) {
        this.inputTitleStepRef.current?.handleOnNext();
      }

      if (currentStep === 1) {
        this.chooseLayoutStepRef.current?.handleOnNext();
      }
    }
  };

  handleOnPrevious = () => {
    const { addNewScenarioModal } = this.props.scenarios;
    if (addNewScenarioModal) {
      this.setAddNewScenarioModal({
        currentStep: addNewScenarioModal.currentStep - 1,
      });
    }
  };

  formRef = React.createRef<FormInstance<any>>();
  inputTitleStepRef = React.createRef<InputTitleStepComponent>();
  chooseLayoutStepRef = React.createRef<ChooseLayoutStepComponent>();
  setupScenarioRef = React.createRef<SetupScenarioItemsStepComponent>();

  render() {
    const { addNewScenarioModal } = this.props.scenarios;

    const currentStep = addNewScenarioModal ? addNewScenarioModal.currentStep : 0;

    return (
      <>
        <Steps current={addNewScenarioModal?.currentStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>
        <div className="steps-content">
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === 0}
          >
            {currentStep === 0 && (
              <InputTitleStepComponent ref={this.inputTitleStepRef} {...this.props} />
            )}
          </Animated>
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === 1}
          >
            {currentStep === 1 && (
              <ChooseLayoutStepComponent ref={this.chooseLayoutStepRef} {...this.props} />
            )}
          </Animated>
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === 2}
          >
            {currentStep === 2 && (
              <SetupScenarioItemsStepComponent ref={this.setupScenarioRef} {...this.props} />
            )}
          </Animated>
          <Animated
            animationIn="fadeInLeft"
            animationOut="fadeOutRight"
            isVisible={currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 && (
              <CreateDoneComponent
                finish={() => {
                  this.setAddNewScenarioModal({
                    visible: false,
                    isLoading: false,
                    currentStep: 0,
                  });
                }}
                title="Successfully create scenario"
                {...this.props}
              />
            )}
          </Animated>
        </div>
        {/* <div className="steps-action">
          <Space>
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <Button
                className="lba-btn"
                style={{ margin: '0 8px' }}
                onClick={() => {
                  if (addNewScenarioModal) {
                    this.setAddNewScenarioModal({
                      currentStep: addNewScenarioModal.currentStep - 1,
                    });
                  }
                }}
              >
                Previous
              </Button>
            )}
            {currentStep < steps.length - 2 && (
              <Button
                className="lba-btn"
                onClick={() => {
                  if (addNewScenarioModal) {
                    // this.setAddNewScenarioModal({
                    //   currentStep: addNewScenarioModal.currentStep + 1,
                    // });
                    this.handleOnNext();
                  }
                }}
              >
                Next
              </Button>
            )}
            {currentStep === steps.length - 2 && (
              <Button
                className="lba-btn"
                onClick={() => {
                  this.onCreateScenarios();
                }}
              >
                Done
              </Button>
            )}
          </Space>
        </div> */}
        {/* <Modal
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
            disabled: listLayouts?.every((layouts) => !layouts.isSelected),
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
        > */}
        {/* <Form ref={this.formRef} name="add_new_scenario" layout="vertical">
          <TitleStep {...this.props} />
        </Form> */}

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
        {/* <List
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
        ></List> */}
        {/* </Modal> */}
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AddNewScenarioFormModal);
