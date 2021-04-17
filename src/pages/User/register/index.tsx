import { CreateUserWithEmailAndPasswordHandler } from '@/services/login';
import { openNotification } from '@/utils/utils';
import { LockTwoTone, ScheduleFilled, UserOutlined } from '@ant-design/icons';
import { Form, Button, Input, Popover, Progress, message, Space } from 'antd';
import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { Animated } from 'react-animated-css';
import type { Dispatch } from 'umi';
import { Link, connect, history, FormattedMessage, formatMessage } from 'umi';

import type { StateType } from './model';
import styles from './style.less';

const FormItem = Form.Item;
// const { Option } = Select;
// const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: (
    <div className={styles.success}>
      <FormattedMessage id="userandregister.strength.strong" />
    </div>
  ),
  pass: (
    <div className={styles.warning}>
      <FormattedMessage id="userandregister.strength.medium" />
    </div>
  ),
  poor: (
    <div className={styles.error}>
      <FormattedMessage id="userandregister.strength.short" />
    </div>
  ),
};

const passwordProgressMap: {
  ok: 'success';
  pass: 'normal';
  poor: 'exception';
} = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

interface RegisterProps {
  dispatch: Dispatch;
  userAndregister: StateType;
  submitting: boolean;
}

export interface UserRegisterParams {
  mail: string;
  password: string;
  confirm: string;
  mobile: string;
  captcha: string;
  prefix: string;
}

const Register: FC<RegisterProps> = ({ dispatch, userAndregister }) => {
  // const [count, setcount]: [number, any] = useState(0);
  const [visible, setvisible]: [boolean, any] = useState(false);
  const [isLoading, setIsLoading]: [boolean, any] = useState(false);
  // const [prefix, setprefix]: [string, any] = useState('86');
  const [popover, setpopover]: [boolean, any] = useState(false);
  const confirmDirty = false;
  let interval: number | undefined;
  const [form] = Form.useForm();
  useEffect(() => {
    if (!userAndregister) {
      return;
    }
    const account = form.getFieldValue('mail');
    if (userAndregister.status === 'ok') {
      message.success('注册成功！');
      history.push({
        pathname: '/user/register-result',
        state: {
          account,
        },
      });
    }
  }, [userAndregister]);
  useEffect(
    () => () => {
      clearInterval(interval);
    },
    [],
  );
  // const onGetCaptcha = () => {
  //   let counts = 59;
  //   setcount(counts);
  //   interval = window.setInterval(() => {
  //     counts -= 1;
  //     setcount(counts);
  //     if (counts === 0) {
  //       clearInterval(interval);
  //     }
  //   }, 1000);
  // };
  const getPasswordStatus = () => {
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  const register = async (user: any) => {
    dispatch({
      type: 'user/registerEmail',
      payload: user,
    });
  };

  const onFinish = (values: Record<string, any>) => {
    setIsLoading(true);
    CreateUserWithEmailAndPasswordHandler(values.email, values.password)
      .then((res) => {
        if (res) {
          res.user
            ?.updateProfile({
              displayName: 'User',
              photoURL: 'https://media.publit.io/file/logo_user.png',
            })
            .then(() => {
              register(res)
                .then(() => {
                  setIsLoading(false);
                })
                .catch(() => {
                  setIsLoading(false);
                });
            });
        }
      })
      .catch((err) => {
        setIsLoading(false);
        openNotification('error', 'Register fail', err.message);
      });
    // register(values).catch((error) => {

    // });
  };
  const checkConfirm = (_: any, value: string) => {
    const promise = Promise;
    if (value && value !== form.getFieldValue('password')) {
      return promise.reject(formatMessage({ id: 'userandregister.password.twice' }));
    }
    return promise.resolve();
  };
  const checkPassword = (_: any, value: string) => {
    const promise = Promise;
    // 没有值的情况
    if (!value) {
      setvisible(!!value);
      return promise.reject(formatMessage({ id: 'userandregister.password.required' }));
    }
    // 有值的情况
    if (!visible) {
      setvisible(!!value);
    }
    setpopover(!popover);
    if (value.length < 6) {
      return promise.reject('');
    }
    if (value && confirmDirty) {
      form.validateFields(['confirm']);
    }
    return promise.resolve();
  };
  // const changePrefix = (value: string) => {
  //   setprefix(value);
  // };
  const renderPasswordProgress = () => {
    const value = form.getFieldValue('password');
    const passwordStatus = getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  return (
    <Animated isVisible={true} animationIn="bounceInLeft" animationOut="bounceInRight">
      <div className={styles.main}>
        <div className="register-form-title">
          <h2>
            <FormattedMessage id="userandregister.register.register" />
          </h2>
        </div>
        <Form form={form} name="UserRegister" onFinish={onFinish}>
          <FormItem
            name="email"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'userandregister.email.required' }),
              },
              {
                type: 'email',
                message: formatMessage({ id: 'userandregister.email.wrong-format' }),
              },
            ]}
          >
            <Input
              size="large"
              placeholder={formatMessage({ id: 'userandregister.email.placeholder' })}
              prefix={<UserOutlined className={styles.prefixIcon} />}
            />
          </FormItem>
          <Popover
            getPopupContainer={(node) => {
              if (node && node.parentNode) {
                return node.parentNode as HTMLElement;
              }
              return node;
            }}
            content={
              visible && (
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[getPasswordStatus()]}
                  {renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    <FormattedMessage id="userandregister.strength.msg" />
                  </div>
                </div>
              )
            }
            overlayStyle={{ width: 240 }}
            placement="right"
            visible={visible}
          >
            <FormItem
              name="password"
              className={
                form.getFieldValue('password') &&
                form.getFieldValue('password').length > 0 &&
                styles.password
              }
              rules={[
                {
                  validator: checkPassword,
                },
              ]}
            >
              <Input
                size="large"
                type="password"
                placeholder={formatMessage({ id: 'userandregister.password.placeholder' })}
                prefix={<LockTwoTone className={styles.prefixIcon} />}
              />
            </FormItem>
          </Popover>
          <FormItem
            name="confirm"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'userandregister.confirm-password.required' }),
              },
              {
                validator: checkConfirm,
              },
            ]}
          >
            <Input
              size="large"
              type="password"
              placeholder={formatMessage({ id: 'userandregister.confirm-password.placeholder' })}
              prefix={<LockTwoTone className={styles.prefixIcon} />}
            />
          </FormItem>
          {/* <InputGroup compact>
          <Select size="large" value={prefix} onChange={changePrefix} style={{ width: '20%' }}>
            <Option value="86">+86</Option>
            <Option value="87">+87</Option>
          </Select>
          <FormItem
            style={{ width: '80%' }}
            name="mobile"
            rules={[
              {
                required: true,
                message: formatMessage({ id: 'userandregister.phone-number.required' }),
              },
              {
                pattern: /^\d{11}$/,
                message: formatMessage({ id: 'userandregister.phone-number.wrong-format' }),
              },
            ]}
          >
            <Input
              size="large"
              placeholder={formatMessage({ id: 'userandregister.phone-number.placeholder' })}
            />
          </FormItem>
        </InputGroup> */}
          {/* <Row gutter={8}>
          <Col span={16}>
            <FormItem
              name="captcha"
              rules={[
                {
                  required: true,
                  message: formatMessage({ id: 'userandregister.verification-code.required' }),
                },
              ]}
            >
              <Input
                size="large"
                placeholder={formatMessage({ id: 'userandregister.verification-code.placeholder' })}
              />
            </FormItem>
          </Col>
          <Col span={8}>
            <Button
              size="large"
              disabled={!!count}
              className={styles.getCaptcha}
              onClick={onGetCaptcha}
            >
              {count
                ? `${count} s`
                : formatMessage({ id: 'userandregister.register.get-verification-code' })}
            </Button>
          </Col>
        </Row> */}
          <FormItem>
            <div className={styles.submit}>
              <Button size="large" loading={isLoading} htmlType="submit" className="submit-btn">
                <div className="register-btn-overlap"></div>
                <div className="register-btn-text">
                  {/* <FormattedMessage id="userandregister.register.register" /> */}
                  <Space>
                    <ScheduleFilled
                      className="google-icon"
                      style={{
                        fontSize: '1.2em',
                      }}
                    />
                    Register
                  </Space>
                </div>
              </Button>
            </div>
            <Link className={styles.login} to="/account/login">
              <FormattedMessage id="userandregister.register.sign-in" />
            </Link>
          </FormItem>
        </Form>
      </div>
    </Animated>
  );
};
export default connect(
  ({
    userAndregister,
    loading,
  }: {
    userAndregister: StateType;
    loading: {
      effects: Record<string, boolean>;
    };
  }) => ({
    userAndregister,
    submitting: loading.effects['userAndregister/submit'],
  }),
)(Register);
