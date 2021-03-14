import * as React from 'react';
import type { BrandModelState, Dispatch } from 'umi';
import { connect } from 'umi';
import AddNewBrandFormOnModal from './AddNewBrandFormOnModal';

export type AddNewBrandComponentProps = {
  dispatch: Dispatch;
  brand: BrandModelState;
};

class AddNewBrandComponent extends React.Component<AddNewBrandComponentProps> {
  setAddNewBrandModal = async (modal: any) => {
    await this.props.dispatch({
      type: 'brand/setAddNewBrandModalReducer',
      payload: {
        ...this.props.brand.addNewBrandModal,
        ...modal,
      },
    });
  };
  render() {
    const { addNewBrandModal } = this.props.brand;
    return (
      <>
        <AddNewBrandFormOnModal
          {...this.props}
          visible={addNewBrandModal.visible}
          onCreate={() => {}}
          onCancel={() => {
            this.setAddNewBrandModal({
              visible: false,
              isLoading: false,
            });
          }}
        />
      </>
    );
  }
}

export default connect((state) => ({ ...state }))(AddNewBrandComponent);
