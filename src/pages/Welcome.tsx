import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Row } from 'antd';
import styles from './Welcome.less';
import illustrations from '@/assets/welcome-orange.svg';

// const CodePreview: React.FC = ({ children }) => (
//   <pre className={styles.pre}>
//     <code>
//       <Typography.Text copyable>{children}</Typography.Text>
//     </code>
//   </pre>
// );

export default (): React.ReactNode => {
  return (
    <PageContainer
      title={false}
      header={{
        ghost: false,
        style: {
          padding: 0,
        },
      }}
    >
      <div className={styles.welcomeWrapper}>
        <div className="col text-section">
          {/* <div className="welcome-text-wrapper">
            <Animated animationIn="rollIn" animationOut="fadeOut" isVisible={true}></Animated>
            <h1>
              Hi, my name is <span className="text-color-main">Your Name</span> <br /> I'm the
              Unknown Developer.
            </h1>
          </div>
          <div className="welcome-text-wrapper">
            <Animated animationIn="rollIn" animationOut="fadeOut" isVisible={true}></Animated>
            <h1>
              Hi, my name is <span className="text-color-main">Your Name</span> <br /> I'm the
              Unknown Developer.
            </h1>
          </div> */}
          <h1>
            Hello, we are <span className="text-color-main">Location Based Advertising.</span>{' '}
            <br />
          </h1>
          <Row>
            <h1>
              Where do you want <span className="text-color-main">to show today?</span> <br />
            </h1>
          </Row>
          {/* <Row>
            <h1>
              Hi, my name is <span className="text-color-main">Your Name</span> <br /> I'm the
              Unknown Developer.
            </h1>
          </Row> */}
        </div>
        <div className="col">
          <img
            src={illustrations}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
        {/* <Row>
          <Col span={10}></Col>
          <Col span={14}>
            <img
              src={illustrations}
              style={{
                width: '100%',
                height: '100%',
              }}
            />
          </Col>
        </Row> */}
      </div>
    </PageContainer>
  );
};
