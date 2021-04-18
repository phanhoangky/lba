import { sortArea } from '@/utils/utils';
import * as React from 'react';
import type { Area, Dispatch, ScenarioModelState } from 'umi';
import { connect } from 'umi';
import { Checkbox, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export type ScenarioAreaComponentProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  doubleClickToArea: () => any;
  clickToArea: () => any;
  clickToAudioCheckbox: (scenarioItemId: string, checked: boolean) => any;
};

export class ScenarioAreaComponent extends React.Component<ScenarioAreaComponentProps> {
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

  render() {
    const { selectedSenario, selectedArea } = this.props.scenarios;
    return (
      <>
        <div
          id="areaWrapper"
          style={{
            margin: `0 auto`,
            display: 'flex',
            width: '100%',
            boxSizing: 'border-box',
            justifyContent: 'center',
            alignItems: 'center',
            // border: '2px solid transparent',
            // background: `linear-gradient(#000, #000) padding-box,
            // radial-gradient(farthest-corner at var(--x) var(--y), #00C9A7, #845EC2) border-box`,
          }}
        >
          {selectedSenario &&
            selectedSenario.layout.areas &&
            sortArea(selectedSenario.layout.areas).map((area) => {
              const scenarioItem = this.checkAreaIsUsed(area);
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
                    border: selectedArea?.id === area.id ? `5px ridge red` : `2px solid black`,
                    transition: 'ease',
                    transitionDuration: '1s',
                  }}
                  onDoubleClick={() => {
                    // this.setPlaylistDrawer({
                    //   visible: true,
                    // });
                    this.props.doubleClickToArea();
                  }}
                  onClick={async () => {
                    // this.setSelectedScenarioItem(scenarioItem);
                    // this.setSelectedArea(area);
                    this.props.clickToArea();
                  }}
                >
                  {scenarioItem ? (
                    <>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '80%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column',
                        }}
                      >
                        <div>{scenarioItem?.playlist?.title}</div>
                        <div
                          style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            left: 0,
                            top: 0,
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
                              <video src={area.urlPreview} width={'100%'} autoPlay controls></video>
                            )}
                        </div>
                        {/* {!area.urlPreview && (
                              <ReactPlayer
                                url={scenarioItem.playlist?.playlistItems.map((item) => {
                                  return item.mediaSrc.urlPreview;
                                })}
                                playing
                                height="100%"
                                controls={true}
                                width={'100%'}
                              />
                            )} */}
                      </div>
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '20%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Checkbox
                          checked={scenarioItem.audioArea}
                          onChange={(e) => {
                            // this.setAudioArea(scenarioItem.id, e.target.checked);
                            this.props.clickToAudioCheckbox(scenarioItem.id, e.target.checked);
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <UploadOutlined />
                  )}
                </div>
              );
            })}
        </div>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ScenarioAreaComponent);
