import React from 'react';
import { Select, Radio, Checkbox } from 'antd';
import {isArray, isObject, isApp} from '@framework/utils/utils';
import {Picker, List} from 'antd-mobile';
import CheckBoxPop from '../OopForm/components/CheckBoxPop';

const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const SelectNode = (props) => {
  const {value, valuePropName, labelPropName, onChange, multiple, listData, disabled, ifRenderByAntdMobile, ...otherProps} = props;
  if (ifRenderByAntdMobile) {
    if (multiple === true) {
      return <CheckBoxPop { ...props} data={listData} componentLabel={props.label}>{p => (<List.Item arrow="horizontal" {...p}>{props.label}</List.Item>)}</CheckBoxPop>;
    } else {
      return <Picker { ...props} data={listData} cols={1}><List.Item arrow="horizontal">{props.label}</List.Item></Picker>;
    }
  }
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
  const {value, valuePropName, labelPropName, onChange, listData, disabled = false, ifRenderByAntdMobile, ...otherProps} = props;
  if (ifRenderByAntdMobile) {
    return <Picker { ...props} data={listData} cols={1}><List.Item arrow="horizontal">{props.label}</List.Item></Picker>;
  }
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
  const {value, valuePropName, labelPropName, onChange, listData, disabled = false, ifRenderByAntdMobile, ...otherProps} = props;
  if (ifRenderByAntdMobile) {
    return <CheckBoxPop { ...props} data={listData} componentLabel={props.label}>{p => (<List.Item arrow="horizontal" {...p}>{props.label}</List.Item>)}</CheckBoxPop>;
  }
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
    const { value, ifRenderByAntdMobile: irbam } = props;
    this.state = {
      selectedValue: value
    }
    this.ifRenderByAntdMobile = irbam === undefined ? isApp() : !!irbam
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
        ifRenderByAntdMobile={this.ifRenderByAntdMobile}
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
          ifRenderByAntdMobile={this.ifRenderByAntdMobile}
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
          ifRenderByAntdMobile={this.ifRenderByAntdMobile}
        />
      }
    }
  }
}
