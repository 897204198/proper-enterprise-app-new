import React from 'react';
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import {isApp, isArray, isObject, isString} from '@framework/utils/utils';
import OopEnum from '../OopEnum';

const ifRenderByAntdMobile = isApp();

@inject(['OopDict$model', 'global'])
@connect(({ OopDict$model, global }) => ({
  OopDict$model,
  global,
}))
export default class OopDict extends React.PureComponent {
  componentDidMount() {
    const { catalog, listData = [] } = this.props;
    if (catalog && listData.length === 0) {
      this.findDictData(catalog, (ld)=>{
        // 初始化之后通知propchange
        this.notifyPropsOnChange(ld)
      })
    } else {
      // 初始化之后通知propchange
      this.notifyPropsOnChange(listData)
    }
  }
  componentWillReceiveProps(nextProps) {
    const {catalog, OopDict$model} = nextProps;
    if (OopDict$model[catalog] === undefined) {
      this.findDictData(catalog);
    }
  }

  notifyPropsOnChange = (listData)=>{
    let result;
    const {value, onChange} = this.props;
    // const { props: {listData = []} } = component;
    if (isString(value)) {
      result = listData.find(it=>it.code === value);
      if (ifRenderByAntdMobile) {
        result = [result];
      }
    }
    if (isArray(value)) {
      if (value.every(it=>isString(it))) {
        result = listData.filter(it=>value.includes(it.code))
      }
    }
    if (isObject(value) && ifRenderByAntdMobile) {
      result = [result];
    }
    if (result) {
      onChange && onChange(result)
    }
  }
  findDictData = (value, callback) => {
    this.props.dispatch({
      type: 'OopDict$model/findDictData',
      payload: {
        catalog: value
      },
      callback: (listData)=>{
        callback && callback(listData);
      }
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
  // 在OopDict中为OopEnum拼装value值格式例如为: `{catalog: "RULE", code: "USER"}`
  getDictTypeValue = (value)=>{
    if (value) {
      if (isArray(value)) {
        const result = [];
        value.forEach((it)=>{
          if (isObject(it)) {
            result.push(`${JSON.stringify({catalog: it.catalog, code: it.code})}`)
          } else if (isString(it)) {
            const listData = this.getListData();
            const dict = listData.find(ld=>ld.code === it);
            if (dict) {
              result.push(`${JSON.stringify({catalog: dict.catalog, code: dict.code})}`);
            }
          }
        })
        return result;
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
