import type { UpdateBrandParam } from '@/services/BrandService/BrandServices';
import { Form, Input, Modal } from 'antd';
import type { FormInstance } from 'antd/lib/form';
import React from 'react';
import type { BrandModelState, Dispatch } from 'umi';
import { connect } from 'umi';

export type EditBrandFormOnDrawerProps = {
  dispatch: Dispatch;
  brand: BrandModelState;
};

class EditBrandFormOnModal extends React.Component<EditBrandFormOnDrawerProps> {
  formRef = React.createRef<FormInstance<any>>();

  componentDidMount() {
    this.initialValues();
  }

  initialValues = () => {
    const { selectedBrand } = this.props.brand;
    if (this.formRef.current) {
      this.formRef.current.setFieldsValue({
        name: selectedBrand.name,
        description: selectedBrand.description,
      });
    }
  };

  setSelectedBrand = async (item: any) => {
    await this.props.dispatch({
      type: 'brand/setSelectedBrandReducer',
      payload: {
        ...this.props.brand.selectedBrand,
        ...item,
      },
    });
  };

  setEditBrandModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'brand/setEditBrandModalReducer',
      payload: {
        ...this.props.brand.editBrandModal,
        ...modal,
      },
    });
  };

  callGetListBrands = async (param?: any) => {
    await this.props.dispatch({
      type: 'brand/getListBrands',
      payload: {
        ...this.props.brand.getListBrandParam,
        ...param,
      },
    });
  };

  updateBrand = async (param: any) => {
    const { selectedBrand } = this.props.brand;
    const updateParam: UpdateBrandParam = {
      id: selectedBrand.id,
      ...param,
    };
    this.setEditBrandModal({
      isLoading: true,
    })
      .then(() => {
        this.props
          .dispatch({
            type: 'brand/updateBrand',
            payload: updateParam,
          })
          .then(() => {
            this.callGetListBrands().then(() => {
              this.setEditBrandModal({
                isLoading: false,
                visible: false,
              });
            });
          });
      })
      .catch(() => {
        this.setEditBrandModal({
          isLoading: false,
          visible: false,
        });
      });
  };

  render() {
    const { editBrandModal } = this.props.brand;
    return (
      <Modal
        visible={editBrandModal.visible}
        title="Create a new brand"
        destroyOnClose={true}
        okText="Create"
        confirmLoading={editBrandModal.isLoading}
        cancelText="Cancel"
        onCancel={() => {
          this.setEditBrandModal({
            visible: false,
          });
        }}
        onOk={() => {
          if (this.formRef.current) {
            this.formRef.current.validateFields().then((values) => {
              this.updateBrand(values).then(() => {
                this.formRef.current?.resetFields();
              });
            });
          }
        }}
      >
        <Form ref={this.formRef} layout="vertical" name="edit_brand_modal_form">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please input the name of brand!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default connect((state) => ({ ...state }))(EditBrandFormOnModal);
