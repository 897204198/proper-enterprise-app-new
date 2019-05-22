import React from 'react';
import { Select, Radio, Checkbox } from 'antd';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';

const { Option } = Select;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;

@inject(['OopDict$model', 'global'])
@connect(({ OopDict$model, global }) => ({
  OopDict$model,
  global,
}))
export default class OopDict extends React.PureComponent {
  constructor(props) {
    super(props);
    const { value = [] } = props;
    this.state = {
      selectedValue: [...value]
    }
  }
  componentDidMount() {
    const { catalog, urlData } = this.props;
    if (catalog) {
      this.findDictData(catalog)
    } else if (urlData && urlData.length > 0) {
      this.props.dispatch({
        type: 'OopDict$model/saveDictData',
        payload: urlData
      })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value.length) {
      this.setState({
        selectedValue: [...nextProps.value]
      })
    }
  }
  findDictData = (value) => {
    this.props.dispatch({
      type: 'OopDict$model/findDictData',
      payload: {
        catalog: value
      },
    })
  }
  nodeSelect = (value) => {
    const { listData } = this.props.OopDict$model;
    const { multiple } = this.props;
    let selectedArray = [];
    if (multiple) {
      for (let i = 0; i < value.length; i++) {
        const child = listData.find((item) => {
          return item.id === value[i]
        })
        selectedArray.push(child)
      }
    } else {
      const obj = listData.filter((item) => {
        return item.id === value
      })
      selectedArray = obj
    }
    this.handleChange(selectedArray)
    // console.log(selectedArray)
  }
  radioChange = (e) => {
    const { listData } = this.props.OopDict$model;
    const sign = e.target.value
    const obj = listData.filter((item) => {
      return item.id === sign
    })
    this.handleChange(obj)
    // console.log(obj)
  }
  checkboxChange = (value) => {
    const { listData } = this.props.OopDict$model;
    const selectedArray = [];
    for (let i = 0; i < value.length; i++) {
      const child = listData.find((item) => {
        return item.id === value[i]
      })
      selectedArray.push(child)
    }
    this.handleChange(selectedArray)
    // console.log(selectedArray)
  }
  handleChange = (data) => {
    this.setState({
      selectedValue: data
    })
    const {onChange} = this.props;
    if (onChange) {
      onChange(data);
    }
  }
  render() {
    const { OopDict$model: { listData },
      nodeKey = 'name', type = 'select', multiple = false, placeholder = '请选择', disabled = false, config = {},
    } = this.props
    const { selectedValue } = this.state;
    const dataList = selectedValue.map((item) => {
      return item.id
    })
    const SelectNode = () => {
      return (
        <Select
          {
            ...config
          }
          onChange={this.nodeSelect}
          showSearch
          mode={ multiple ? 'multiple' : null}
          defaultValue={dataList}
          allowClear
          placeholder={placeholder}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          style={{width: '100%'}}
          disabled={disabled}
        >
          {
            listData.length > 0 ? (
              listData.map((item) => {
                return <Option value={item.id} key={item.id}>{item[nodeKey]}</Option>
              })
            ) : null
          }
        </Select>
      )
    }
    const RadioNode = () => {
      return (
        <RadioGroup
          {
            ...config
          }
          onChange={this.radioChange}
          disabled={disabled}
          defaultValue={dataList[0]}
        >
        {
          listData.length > 0 ? (
            listData.map((item) => {
              return <Radio value={item.id} key={item.id}>{item[nodeKey]}</Radio>
            })
          ) : null
        }
        </RadioGroup>
      )
    }
    const CheckboxNode = () => {
      const options = [];
      for (const item of listData) {
        const obj = {
          label: item.name,
          value: item.id
        }
        options.push(obj)
      }
      return (
        <CheckboxGroup
          {
            ...config
          }
          disabled={disabled}
          options={options}
          defaultValue={dataList}
          onChange={this.checkboxChange}
        />
      )
    }
    const RenderNode = () => {
      if (type === 'select') {
        return <SelectNode />
      } else if (type === 'radio') {
        return <RadioNode />
      } else if (type === 'checkbox') {
        return <CheckboxNode />
      }
    }
    return (
      <RenderNode />
    )
  }
}