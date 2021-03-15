import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserTestModelState,
} from 'umi';
import { connect } from 'umi';

export type ChooseLayoutStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  userTest: UserTestModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class ChooseLayoutStep extends React.Component<ChooseLayoutStepProps> {
  render() {
    return <div></div>;
  }
}

export default connect((state: any) => ({ ...state }))(ChooseLayoutStep);
