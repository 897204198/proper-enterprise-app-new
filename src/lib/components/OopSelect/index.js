import React from 'react';
import {Select} from 'antd';

const {Option} = Select;

const filterOption = (input, option, optionFilterPropName)=>{
  const { props: {[optionFilterPropName]: filterName, children}} = option;
  const inputStr = input.toLowerCase();
  return (filterName ? filterName.toString().toLowerCase().includes(inputStr) : false)
    || (children ? children.toString().toLowerCase().includes(inputStr) : false);
}

export default class OopSelect extends React.Component {
  render() {
    const {data = [], optionFilterPropName = 'py', ...otherProps} = this.props;
    return (
        <Select
          showSearch
          optionFilterProp="children"
          filterOption={(input, option)=>filterOption(input, option, optionFilterPropName)}
          {...otherProps}
        >
          {
            data.map(it=>(
              <Option key={it.value || it.key || it.id} {...{[optionFilterPropName]: it[optionFilterPropName]}}>{it.label}</Option>
            ))
          }
        </Select>);
  }
}
