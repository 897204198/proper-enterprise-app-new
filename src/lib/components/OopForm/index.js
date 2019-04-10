import React from 'react';
import {connect} from 'dva';
import { Form } from 'antd';
import moment from 'moment';
import {inject} from '@framework/common/inject';
import {isApp} from '@framework/utils/utils';
import {appFormGenerator, formGenerator, toastValidErr, toastLoading} from './utils';
import styles from './index.less';

// const isApp = ()=>{
//   return false;
// }
let ifRenderByAntdMobile = isApp();

// 判断item的值 与 display配置的value 是否匹配 目前支持字符串 以后会支持表达式
function isItemShow(itemValue, displayValue) {
  // TODO 支持表达式匹配
  return JSON.stringify(itemValue) === JSON.stringify(displayValue);
}

@inject('OopForm$model')
@Form.create({wrappedComponentRef: true})
@connect(({OopForm$model, loading})=>({
  OopForm$model,
  loading: loading.models.OopForm$model
}), null, null, {withRef: true})
export default class OopForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const {ifRenderByAntdMobile: irbam} = this.props;
    if (irbam !== undefined) {
      ifRenderByAntdMobile = irbam;
    }
    this.state = {
    }
  }
  componentDidMount() {
    console.log('OopForm componentDidMount');
  }
  dictCatalogRequestCount = 0;
  dataUrlRequestCount = 0;
  componentWillUnmount() {
    this.props.dispatch({
      type: 'OopForm$model/clearData'
    })
  }
  loadDictData = (dictCatalog, name)=>{
    console.log('before', name)
    this.setState({
      [name]: true
    })
    this.props.dispatch({
      type: 'OopForm$model/findDictData',
      payload: {
        catalog: dictCatalog
      },
      callback: ()=>{
        console.log('after', name)
        this.setState({
          [name]: false
        })
      }
    })
  }
  loadUrlData = (url)=>{
    this.props.dispatch({
      type: 'OopForm$model/findUrlData',
      payload: url
    })
  }
  // 是否是数据字典值
  isDictValue = (value)=>{
    return value && typeof value === 'object' && value.catalog !== undefined && value.code !== undefined
  }
  getForm = ()=> {
    return this.props.form;
  }
  // 获取OopForm表单中的数据
  // 1.兼容antd-mobile的数据格式
  // 2.如果是枚举类型增加名称的字段比如
  // formData中下拉菜单的值为{vacationType: 'B'} 获取的值为{vacationType: 'B', vacationType_text: '事假'}
  getFormData = ()=>{
    const { formJson = [], form} = this.props;
    const formData = form.getFieldsValue();
    console.log(formData);
    formJson.forEach((it)=>{
      const {name, component: {name: cName, children, props}} = it;
      const value = formData[name];
      if (value !== null && value !== undefined && value !== '') {
        if ('Select,RadioGroup,CheckboxGroup'.includes(cName)) {
          if (!formData[`${name}_text`]) {
            // am的Picker组件为value为数组
            const child = children.map(c=>(value.toString().includes(c.value) ? c : null)).filter(i=>i !== null);
            if (child) {
              formData[`${name}_text`] = child.map(c=>c.label).join(',');
            }
          }
        } else if ('OopSystemCurrent'.includes(cName)) {
          if (!formData[`${name}_text`]) {
            formData[`${name}_text`] = value.text
          }
        } else if ('DatePicker'.includes(cName)) {
          if (!formData[`${name}_text`]) {
            let dateLong = value;
            let dateStr = '';
            if (value.constructor.name === 'Date') {
              dateStr = moment(value).format(props.format ? props.format : 'YYYY-MM-DD');
              dateLong = value.getTime();
            } else {
              dateStr = value.format(props.format ? props.format : 'YYYY-MM-DD');
              dateLong = value.toDate().getTime();
            }
            formData[`${name}`] = dateLong;
            formData[`${name}_text`] = dateStr;
          }
        } else if (cName === 'InputNumber') {
          // 数字型转换
          const {Number} = window;
          if (value !== +value) {
            formData[`${name}`] = Number(value)
          }
        }
      }
    })
    if (ifRenderByAntdMobile) {
      // app的am组件中 Select、RadioGroup 所 对应的组件是 Picker， 此组件的值类型为[]; 所以这里处理一下
      const data = {
        ...formData
      }
      const selectComs = formJson.filter(it=>'Select,RadioGroup'.includes(it.component.name));
      if (selectComs && selectComs.length) {
        selectComs.forEach((selectCom)=>{
          const {name} = selectCom;
          if (Array.isArray(data[name])) {
            const [first] = data[name]
            data[name] = first;
          }
        })
      }
      return data;
    }
    return formData;
  }
  // 移动端才提示
  showValidErr = (err)=>{
    if (ifRenderByAntdMobile) {
      const { formJson = [] } = this.props;
      toastValidErr(err, formJson);
    }
  }
  showPageLoading = (flag)=>{
    if (ifRenderByAntdMobile) {
      toastLoading(flag);
    }
  }
  render() {
    const { OopForm$model, disabled = false, formJson = [], defaultValue = {}, form } = this.props;
    // const changeEventSequence = new Set();
    formJson.forEach((item)=>{
      const {name, initialValue, component, display} = item;
      // initialValue是数组但是长度为0 或者 没有initialValue;
      const value = defaultValue[name];
      if ((Array.isArray(initialValue) && initialValue.length === 0)
        || initialValue === undefined) {
        item.initialValue = value
      } else {
        item.initialValue = this.isDictValue(value) ? JSON.stringify(value) : (value || initialValue);
      }
      // 处理DatePicker的值 如果是移动端不需要转化成moment对象
      if (component.name === 'DatePicker') {
        if (item.initialValue) {
          if (ifRenderByAntdMobile) {
            item.initialValue = new Date(item.initialValue);
          } else {
            const format = (component.props && component.props.format) || 'YYYY-MM-DD';
            item.initialValue = moment(new Date(item.initialValue), format);
          }
        }
      }
      // 如果是表单只读 那么设置组件的props为disabled
      if (disabled) {
        if (!component.$$typeof) {
          if (!component.props) {
            component.props = {};
          }
          component.props.disabled = true;
        }
      }
      // 如果是有字典数据源的组件
      if (component.children && component.children.length === 0 && component.dictCatalog) {
        const {dictCatalog} = component;
        if (dictCatalog !== '请选择') {
          if (!OopForm$model[dictCatalog] || OopForm$model[dictCatalog].length === 0) {
            if (this.dictCatalogRequestCount <= 3) {
              this.loadDictData(dictCatalog, name);
              this.dictCatalogRequestCount += 1;
            }
          } else {
            component.children = OopForm$model[dictCatalog];
            this.dictCatalogRequestCount = 0;
          }
        }
      }
      // 如果是有url数据源的组件
      if (component.children && component.children.length === 0 && component.dataUrl) {
        const {dataUrl} = component;
        if (dataUrl.value) {
          if (!OopForm$model[dataUrl.value] || OopForm$model[dataUrl.value].length === 0) {
            if (this.dataUrlRequestCount <= 3) {
              this.loadUrlData(dataUrl);
              this.dataUrlRequestCount += 1;
            }
          } else {
            component.children = OopForm$model[dataUrl.value];
            this.dataUrlRequestCount = 0;
          }
        }
      }
      // 解析display配置
      if (display) {
        const changeItem = formJson.find(it=>it.name === display.name);
        if (changeItem) {
          const currentValue = form.getFieldValue(changeItem.name) || changeItem.initialValue;
          item.show = isItemShow(currentValue, display.value)
        }
        // changeEventSequence.add(display.name);
      }
    });
    const formConfig = {...this.props, form, className: styles.container, oopForm: this };
    return ifRenderByAntdMobile ? appFormGenerator(formConfig) : formGenerator(formConfig);
  }
}
