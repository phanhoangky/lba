import { Col, Divider, Row } from 'antd';
import * as React from 'react';
import type {
  Dispatch,
  LayoutModelState,
  PlayListModelState,
  ScenarioModelState,
  UserModelState,
} from 'umi';
import { connect } from 'umi';

export type ChooseLayoutDirectionStepProps = {
  dispatch: Dispatch;
  scenarios: ScenarioModelState;
  user: UserModelState;
  playlists: PlayListModelState;
  layouts: LayoutModelState;
};

class ChooseLayoutDirecttionStep extends React.Component<ChooseLayoutDirectionStepProps> {
  render() {
    return (
      <>
        <Row>
          <Col flex={1}>
            Horizontal
            <Divider />
          </Col>
          <Col flex={1}>Verticle</Col>
        </Row>
      </>
    );
  }
}

export default connect((state: any) => ({ ...state }))(ChooseLayoutDirecttionStep);
