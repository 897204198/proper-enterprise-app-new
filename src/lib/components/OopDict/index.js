import React from 'react';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import {isArray, isObject, isString} from '@framework/utils/utils';
import OopEnum from '../OopEnum';


@inject(['OopDict$model', 'global'])
@connect(({ OopDict$model, global }) => ({
  OopDict$model,
  global,
}))
export default class OopDict extends React.PureComponent {
  componentDidMount() {
    const { catalog, listData = [] } = this.props;
    if (catalog && listData.length === 0) {
      this.findDictData(catalog)
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
  handleOnChange = (value)=>{
    const {onChange} = this.props;
    const listData = this.getListData();
    let result;
    if (isArray(value)) {
      result = [];
      listData.forEach((it)=>{
        if (value.includes(it.value)) {
          result.push({...it})
        }
      })
    } else if (isString(value)) {
      result = listData.find(it=>it.value === value);
    }
    if (onChange) {
      onChange(result);
    }
  }
  getDictTypeValue = (value)=>{
    if (value) {
      if (isArray(value)) {
        return value.map(it=>(`${JSON.stringify({catalog: it.catalog, code: it.code})}`));
      } else if (isObject(value)) {
        if (value.value) {
          return value.value
        } else {
          return `${JSON.stringify({catalog: value.catalog, code: value.code})}`;
        }
      } else if (isString(value)) {
        const listData = this.getListData();
        const dict = listData.find(it=>it.code === value);
        if (dict) {
          return `${JSON.stringify({catalog: dict.catalog, code: dict.code})}`;
        }
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  getListData = ()=>{
    const { catalog, OopDict$model, listData} = this.props;
    if (listData) {
      if (listData.length) {
        listData.forEach((it)=>{
          if (!it.value) {
            it.value = `${JSON.stringify({catalog: it.catalog, code: it.code})}`;
          }
        });
      }
      return listData
    }
    if (OopDict$model[catalog]) {
      return OopDict$model[catalog]
    }
    return []
  }
  render() {
    const { multiple = false, disabled = false, ...otherProps } = this.props;
    let {value} = this.props;
    if ((isObject(value) || isArray(value) || isString(value))) {
      value = this.getDictTypeValue(value);
    }
    return (
      <OopEnum
        {
          ...otherProps
        }
        value={value}
        valuePropName="value"
        listData={this.getListData()}
        multiple={multiple}
        disabled={disabled}
        onChange={this.handleOnChange}
      />
    )
  }
}
