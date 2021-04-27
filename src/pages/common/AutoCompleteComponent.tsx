import * as React from 'react';
import type { Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '../Location';
// import AsyncSelect from 'react-select/async';
import { autoComplete } from '@/services/MapService/LocationIQService';
import { AutoComplete, Input } from 'antd';

export type AutoCompleteComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  inputValue?: string;
  value?: string;
  address?: string;
  onInputChange?: (value: string) => void | Promise<void>;
  onChange?: (address: string) => void | Promise<void>;
  onSelect?: (address: string) => void | Promise<void>;
};

export class AutoCompleteComponent extends React.Component<AutoCompleteComponentProps> {
  componentDidMount() {}

  state = {
    isLoading: false,
    searchValue: '',
    listOptions: [],
    options: [],
  };

  setAddNewLocationModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setAddNewLocationModalReducer`,
      payload: {
        ...this.props.location.addNewLocationModal,
        ...modal,
      },
    });
  };

  fetchData = async (inputValue: string) => {
    if (!inputValue || inputValue === '') {
      this.setState({
        options: [],
      });
      return;
    }

    const { data } = await autoComplete(inputValue);
    this.setState({
      options: data.map((item: any) => {
        return {
          // label: item.display_name,
          // value: `${item.lat}-${item.lon}`,
          value: item.display_name,
        };
      }),
    });
  };

  promiseOptions = async (inputValue: any, callback: any): Promise<any> => {
    const { data } = await autoComplete(inputValue);

    callback(
      data.map((item: any) => {
        return {
          label: item.display_name,
          value: `${item.lat}-${item.lon}`,
        };
      }),
    );
  };

  handleChange = (value: string) => {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  };

  handleOnSelect = (value: string) => {
    if (this.props.onSelect) {
      this.props.onSelect(value);
    }
  };
  render() {
    return (
      <AutoComplete
        value={this.props.value}
        // searchValue={this.props.inputValue}
        allowClear
        options={this.state.options}
        style={{ width: '100%' }}
        // onSelect={(e) => {
        //   this.props.onChange(e);
        // }}
        onSelect={this.handleOnSelect}
        onSearch={(e) => {
          this.fetchData(e);
        }}
        // onChange={(e) => {
        //   this.props.onInputChange(e);
        // }}
        onChange={this.handleChange}
        placeholder="input address here"
      >
        <Input.TextArea></Input.TextArea>
      </AutoComplete>
    );
  }
}

export default connect((state: any) => ({ ...state }))(AutoCompleteComponent);
