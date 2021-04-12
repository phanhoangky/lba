import { sortArea } from '@/utils/utils';
import { UploadOutlined } from '@ant-design/icons';
import { Image } from 'antd';
import * as React from 'react';
import type { Area, Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import styles from '../../index.less';

export type ViewScenarioDetailComponentProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
};

export class ViewScenarioDetailComponent extends React.Component<ViewScenarioDetailComponentProps> {
  componentDidMount() {
    const { selectedSenario } = this.props.scenarios;

    selectedSenario?.scenarioItems.forEach((item) => {
      item.playlist?.playlistItems.forEach((playlistItem, index) => {
        const previous = item.playlist?.playlistItems[index - 1];
        const deplayTime = previous ? index * previous.duration : 0;
        console.log('====================================');
        console.log('>>>', playlistItem.mediaSrc.urlPreview, previous, deplayTime);
        console.log('====================================');
        setTimeout(() => {
          console.log('====================================');
          console.log('Set URL');
          console.log('====================================');
          this.setUrlAreasOfScenario(
            item.area,
            playlistItem.mediaSrc.urlPreview,
            playlistItem.mediaSrc.type.name,
          );
        }, index * deplayTime * 1000);
      });
    });
  }

  componentDidUpdate() {
    this.ratioCalculation();
  }

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

  checkAreaIsUsed = (area: Area) => {
    const { selectedSenario } = this.props.scenarios;
    const scenarioItems = selectedSenario?.scenarioItems.filter((s) => s?.area?.id === area.id);
    if (scenarioItems && scenarioItems.length) {
      if (scenarioItems.length > 0) {
        return scenarioItems[0];
      }
    }
    return undefined;
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

  setUrlAreasOfScenario = async (item: any, urlPreview: string, typeName: string) => {
    const { selectedSenario } = this.props.scenarios;
    const newAreas = selectedSenario?.layout.areas.map((area) => {
      console.log('====================================');
      console.log('Param >>>>', area, item, urlPreview, typeName);
      console.log('====================================');
      console.log('====================================');
      console.log(area.id === item.id);
      console.log('====================================');
      if (area.id === item.id) {
        const newArea = {
          ...area,
          urlPreview,
          typeMediaName: typeName,
        };
        console.log('====================================');
        console.log('New Area >>>');
        console.log('====================================');
        return newArea;
      }

      return area;
    });
    console.log('====================================');
    console.log('New Areassssss >>>', newAreas);
    console.log('====================================');
    await this.setSelectedScenario({
      layout: {
        ...selectedSenario?.layout,
        areas: newAreas,
      },
    });

    // scenario?.layout.areas.forEach((area) => {
    //   if (area.id === item.id) {
    //     return {
    //       ...area,
    //       urlPreview,
    //       typeMediaName: typeName,
    //     };
    //   }

    //   return area;
    // });
  };

  toNextMedia = async () => {};

  render() {
    const { selectedSenario } = this.props.scenarios;
    console.log('====================================');
    console.log(selectedSenario);
    console.log('====================================');
    return (
      <div
        id="areaWrapper"
        style={{
          position: 'relative',
          width: '100%',
          height: '80%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className={styles.areaWrapper}
      >
        {selectedSenario &&
          selectedSenario.layout.areas &&
          sortArea(selectedSenario.layout.areas).map((area) => {
            const scenarioItem = this.checkAreaIsUsed(area);
            console.log('====================================');
            console.log(scenarioItem, area);
            console.log('====================================');
            return (
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
              >
                {scenarioItem ? (
                  <>
                    <div className="media-wrapper">
                      <div>{scenarioItem?.playlist?.title}</div>
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          left: 0,
                          top: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {area &&
                          area.typeMediaName &&
                          area.typeMediaName.toLowerCase().includes('image') && (
                            <Image
                              src={area.urlPreview}
                              width={'100%'}
                              height={'100%'}
                              preview={false}
                            />
                          )}
                        {area &&
                          area.typeMediaName &&
                          area.typeMediaName.toLowerCase().includes('video') && (
                            <video
                              src={area.urlPreview}
                              width={'100%'}
                              loop
                              autoPlay
                              controls
                            ></video>
                          )}
                      </div>
                    </div>
                    {/* {scenarioItem.playlist?.playlistItems.forEach((item) => {
                        if (item.mediaSrc.type.name.toString().includes('image')) {
                          <Image
                            src={item.mediaSrc.urlPreview}
                            width={'100%'}
                            height={'100%'}
                            preview={false}
                          />;
                        }
                        if (item.mediaSrc.type.name.toString().includes('video')) {
                          <video
                            src={item.mediaSrc.urlPreview}
                            width={'100%'}
                            loop
                            autoPlay
                            controls
                          ></video>;
                        }
                        
                      })} */}
                    {/* <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          left: 0,
                          top: 0,
                        }}
                      >
                        <div>
                          {scenarioItem.playlist?.playlistItems.map((item, index) => {
                            if (item.mediaSrc.type.name.toString().includes('image')) {
                              return (
                                <Image
                                  src={item.mediaSrc.urlPreview}
                                  width={'100%'}
                                  height={'100%'}
                                  preview={false}
                                />
                              );
                            }
                            if (item.mediaSrc.type.name.toString().includes('video')) {
                              return (
                                <video
                                  src={item.mediaSrc.urlPreview}
                                  width={'100%'}
                                  loop
                                  autoPlay
                                  controls
                                ></video>
                              );
                            }
                            return <></>;

                          })}
                        </div>
                      </div> */}
                  </>
                ) : (
                  <UploadOutlined />
                )}
              </div>
            );
          })}
      </div>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ViewScenarioDetailComponent);
