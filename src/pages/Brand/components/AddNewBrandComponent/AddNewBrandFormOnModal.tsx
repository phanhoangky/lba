import { Form, Input, Modal } from 'antd';
import * as React from 'react';
import type { BrandModelState, Dispatch } from 'umi';
import { connect } from 'umi';

export type BrandCreateFormProps = {
  dispatch: Dispatch;
  brand: BrandModelState;
  visible: boolean;
  onCreate?: (values: any) => void;
  onCancel?: () => void;
};

const BrandCreateForm: React.FC<BrandCreateFormProps> = ({ ...props }) => {
  const [form] = Form.useForm();

  const setAddNewBrandModal = async (modal: any) => {
    await props.dispatch({
      type: 'brand/setAddNewBrandModalReducer',
      payload: {
        ...props.brand.addNewBrandModal,
        ...modal,
      },
    });
  };

  // const setCreateBrandParam = async (param: any) => {
  //   await props.dispatch({
  //     type: 'brand/setCreateBrandParamReducer',
  //     payload: {
  //       ...props.brand.createBrandParam,
  //       ...param,
  //     },
  //   });
  // };

  const callGetListBrands = async (param?: any) => {
    await props.dispatch({
      type: 'brand/getListBrands',
      payload: {
        ...props.brand.getListBrandParam,
        ...param,
      },
    });
  };

  const createBrand = async (values: any) => {
    await props.dispatch({
      type: 'brand/createBrand',
      payload: {
        ...values,
      },
    });
  };

  const onCreateBrand = async (values: any) => {
    setAddNewBrandModal({
      isLoading: true,
    })
      .then(() => {
        createBrand(values).then(() => {
          callGetListBrands().then(() => {
            setAddNewBrandModal({
              isLoading: false,
              visible: false,
            });
          });
        });
      })
      .catch(() => {
        setAddNewBrandModal({
          isLoading: false,
          visible: false,
        });
      });
  };

  const { visible, onCancel } = props;
  const { addNewBrandModal } = props.brand;
  return (
    <Modal
      visible={visible}
      title="Create a new brand"
      destroyOnClose={true}
      okText="Create"
      confirmLoading={addNewBrandModal.isLoading}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            onCreateBrand(values);
            form.resetFields();
          })
          .catch((info) => {
            console.error('Validate Failed:', info);
          });
      }}
    >
      <Form form={form} layout="vertical" name="create_brand_modal_form">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please input the name of collection!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default connect((state) => ({ ...state }))(BrandCreateForm);
