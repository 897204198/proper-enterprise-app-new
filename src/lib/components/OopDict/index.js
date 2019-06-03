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
    const { catalog } = this.props;
    if (catalog) {
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
    const { catalog, OopDict$model: { [catalog]: listData }} = this.props;
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
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }
  render() {
    const { catalog, OopDict$model: { [catalog]: listData }, multiple = false, disabled = false, ...otherProps} = this.props;
    let {value} = this.props;
    if (catalog && (isObject(value) || isArray(value))) {
      value = this.getDictTypeValue(value);
    }
    return (
      <OopEnum
        {
          ...otherProps
        }
        value={value}
        catalog={catalog}
        valuePropName="value"
        listData={listData}
        multiple={multiple}
        disabled={disabled}
        onChange={this.handleOnChange}
      />
    )
  }
}
