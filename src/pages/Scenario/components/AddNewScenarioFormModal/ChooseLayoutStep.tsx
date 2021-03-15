import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';

export type ChooseLayoutStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class ChooseLayoutStep extends React.Component<ChooseLayoutStepProps> {
  render() {
    return <div></div>;
  }
}

export default connect((state: any) => ({ ...state }))(ChooseLayoutStep);
