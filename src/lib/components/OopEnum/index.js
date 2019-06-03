import React from 'react';
import { Select, Radio, Checkbox } from 'antd';
import {isArray, isObject} from '@framework/utils/utils';

const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const SelectNode = (props) => {
  const {value, valuePropName, labelPropName, onChange, multiple, listData, disabled, ...otherProps} = props;
  return (
    <Select
      showSearch
      allowClear
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
      disabled={disabled}
      style={{width: '100%'}}
      {
        ...otherProps
      }
      value={value}
      onChange={onChange}
      mode={ multiple ? 'multiple' : null}
    >
      {
        listData.length > 0 ? (
          listData.map((item) => {
            const key = item[valuePropName] || item.value || item.id;
            return <Option value={key} key={key}>{item[labelPropName] || item.title || item.label}</Option>
          })
        ) : null
      }
    </Select>
  )
}
const RadioNode = (props) => {
  const {value, valuePropName, labelPropName, onChange, listData, disabled = false, ...otherProps} = props;
  return (
    <RadioGroup
      {
        ...otherProps
      }
      value={value}
      onChange={(e)=>{ onChange(e.target.value) }}
      disabled={disabled}
    >
      {
        listData.length > 0 ? (
          listData.map((item) => {
            const key = item[valuePropName] || item.value || item.id;
            return <Radio value={key} key={key}>{item[labelPropName] || item.title || item.label}</Radio>
          })
        ) : null
      }
    </RadioGroup>
  )
}
const CheckboxNode = (props) => {
  const {value, valuePropName, labelPropName, onChange, listData, disabled = false, ...otherProps} = props;
  const options = [];
  for (const item of listData) {
    const obj = {
      label: item[labelPropName] || item.title || item.label,
      value: item[valuePropName] || item.value || item.id
    }
    options.push(obj)
  }
  return (
    <CheckboxGroup
      {
        ...otherProps
      }
      value={value}
      disabled={disabled}
      options={options}
      onChange={onChange}
    />
  )
}

export default class OopEnum extends React.PureComponent {
  constructor(props) {
    super(props);
    const { value = [] } = props;
    this.state = {
      selectedValue: [...value]
    }
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    const {value} = nextProps;
    if (value) {
      let v = value;
      if (isObject(v)) {
        v = {
          ...value
        }
      } else if (isArray(v)) {
        v = [...value]
      }
      this.setState({
        selectedValue: v
      })
    }
  }
  selectChange = (value) => {
    this.handleChange(value)
  }
  radioChange = (value) => {
    this.handleChange(value)
  }
  checkboxChange = (value) => {
    this.handleChange(value)
  }
  handleChange = (data) => {
    this.setState({
      selectedValue: data
    }, ()=>{
      const {onChange} = this.props;
      if (onChange) {
        onChange(data);
      }
    })
  }
  filterArrayData = (value, listData = [])=>{
    const {valuePropName} = this.props;
    const selectedResult = [];
    for (let i = 0; i < value.length; i++) {
      const child = listData.find((item) => {
        const v = value[i];
        return (item.id === v || item.value === v)
      });
      if (child) {
        selectedResult.push(child[valuePropName] || child.value || child.id)
      }
    }
    return selectedResult;
  }
  filterObjectData = (value, listData = [])=>{
    const {valuePropName} = this.props;
    const obj = listData.find((item) => {
      return (item.id === value || item.value === value)
    }) || {};
    return obj[valuePropName] || obj.value || obj.id;
  }
  getValue = ()=>{
    return {
      ...this.state.selectedValue
    }
  }
  render() {
    const {selectedValue} = this.state;
    const { valuePropName = 'id', labelPropName = 'name', listData = [], dropDown = true, multiple = false, disabled = false, ...otherProps} = this.props;
    // 下拉菜单
    if (dropDown) {
      return <SelectNode
        {...otherProps}
        disabled={disabled}
        value={selectedValue}
        labelPropName={labelPropName}
        valuePropName={valuePropName}
        listData={listData}
        onChange={this.selectChange}
        multiple={multiple}
      />
    } else { // radio or checkbox
      if (multiple) { // eslint-disable-line
        return <CheckboxNode
          {...otherProps}
          disabled={disabled}
          value={selectedValue}
          labelPropName={labelPropName}
          valuePropName={valuePropName}
          listData={listData}
          onChange={this.checkboxChange}
        />
      } else {
        return <RadioNode
          {...otherProps}
          disabled={disabled}
          value={selectedValue}
          labelPropName={labelPropName}
          valuePropName={valuePropName}
          listData={listData}
          onChange={this.radioChange}
        />
      }
    }
  }
}
