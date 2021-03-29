import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography, Divider, Button, Row } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import styles from './Welcome.less';
import { Animated } from 'react-animated-css';

const CodePreview: React.FC = ({ children }) => (
  <pre className={styles.pre}>
    <code>
      <Typography.Text copyable>{children}</Typography.Text>
    </code>
  </pre>
);

export default (): React.ReactNode => {
  const intl = useIntl();
  return (
    <PageContainer>
      {/* <Card>
        <Alert
          message={intl.formatMessage({
            id: 'pages.welcome.alertMessage',
            defaultMessage: '更快更强的重型组件，已经发布。',
          })}
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <Typography.Text strong>
          <FormattedMessage id="pages.welcome.advancedComponent" defaultMessage="高级表格" />{' '}
          <a
            href="https://procomponents.ant.design/components/table"
            rel="noopener noreferrer"
            target="__blank"
          >
            <FormattedMessage id="pages.welcome.link" defaultMessage="欢迎使用" />
          </a>
        </Typography.Text>
        <CodePreview>yarn add @ant-design/pro-table</CodePreview>
        <Typography.Text
          strong
          style={{
            marginBottom: 12,
          }}
        >
          <FormattedMessage id="pages.welcome.advancedLayout" defaultMessage="高级布局" />{' '}
          <a
            href="https://procomponents.ant.design/components/layout"
            rel="noopener noreferrer"
            target="__blank"
          >
            <FormattedMessage id="pages.welcome.link" defaultMessage="欢迎使用" />
          </a>
        </Typography.Text>
        <CodePreview>yarn add @ant-design/pro-layout</CodePreview>  
      </Card> */}

      <div className={styles.welcomeWrapper}>
        <Animated animationIn="rollIn" animationOut="fadeOut" isVisible={true}>
          <div className="welcome-text-wrapper">
            <h1>
              Hi, my name is <span className="text-color-main">Your Name</span> <br /> I'm the
              Unknown Developer.
            </h1>
          </div>
        </Animated>

        <br />
        <Button className="signin-btn">
          <div className="sign-in-btn-overlap"></div>
          <div className="sign-in-btn-text">SIGN IN</div>
        </Button>
      </div>
    </PageContainer>
  );
};
