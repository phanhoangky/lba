import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';

export type SetupScenarioItemsStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class SetupScenarioItemsStep extends React.Component<SetupScenarioItemsStepProps> {
  render() {
    return <></>;
  }
}

export default connect((state: any) => ({ ...state }))(SetupScenarioItemsStep);
