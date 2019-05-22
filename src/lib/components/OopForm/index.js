import React from 'react';
import {connect} from 'dva';
import { Form } from 'antd';
import moment from 'moment';
import {inject} from '@framework/common/inject';
import {isApp} from '@framework/utils/utils';
import {appFormGenerator, formGenerator, toastValidErr, toastLoading, setFormJsonProperties /* getValueByFunctionStr */ } from './utils';
import styles from './index.less';

let ifRenderByAntdMobile = isApp();

// 渲染的时候获取OopForm的值
const getOopFormValueInRender = (item, form)=>{
  const {display, initialValue, name} = item;
  // 组件不显示
  if (display === false) {
    const value = form.getFieldValue(name);
    // 没有渲染 返回 initialValue
    if (value === undefined) {
      return initialValue;
    } else {
      // 渲染了 返回undefined
      return undefined;
    }
  } else {
    // 组件显示
    const value = form.getFieldValue(name);
    // 没有渲染 返回 initialValue
    if (value === undefined) {
      return initialValue;
    } else {
      // 渲染了 返回undefined
      return value;
    }
  }
}


const FormContainer = Form.create({
  mapPropsToFields(props) {
    const {defaultValue = {}, formJson = [], self} = props;
    if (Object.keys(defaultValue).length > 0) {
      const result = {};
      formJson.forEach((item)=>{
        const {name, component, subscribe = [], initialValue} = item;
        // 赋值
        if (name) {
          let value = defaultValue[name];
          if (value !== undefined) {
            // 数据字典
            if (self.isDictValue(value)) {
              value = JSON.stringify(value)
            }
            // 时间
            if (component.name === 'DatePicker') {
              if (ifRenderByAntdMobile) {
                value = new Date(value);
              } else {
                const format = (component.props && component.props.format) || 'YYYY-MM-DD';
                value = moment(new Date(value), format);
              }
            }
            result[name] = Form.createFormField({value})
          }
        }
        // 联动
        if (subscribe.length) {
          subscribe.forEach((sbcb)=>{
            const {name: subscribeName, publish: publishes = []} = sbcb;
            if (publishes.length) {
              publishes.forEach((publish)=>{
                const changeItem = formJson.find(it=>it.name === subscribeName);
                if (changeItem) {
                  const changeValue = defaultValue[subscribeName];
                  const currentValue = defaultValue[name] === undefined ? initialValue : defaultValue[name];
                  // 被依赖的组件还没有 渲染
                  setFormJsonProperties(item, changeValue, currentValue, publish);
                }
              })
            }
          })
        }
      })
      console.log(result);
      return result;
    }
  }
})((props)=>{
  const { OopForm$model, disabled = false, formJson = [], form, self } = props;
  formJson.forEach((item)=>{
    const {name, component, subscribe = [], /* render */} = item;
    // initialValue是数组但是长度为0 或者 没有initialValue;
    // const value = defaultValue[name];
    // if ((Array.isArray(initialValue) && initialValue.length === 0)
    //   || initialValue === undefined) {
    //   item.initialValue = value
    // } else {
    //   item.initialValue = self.isDictValue(value) ? JSON.stringify(value) : (value || initialValue);
    // }
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
    // TODO render
    if (component.name === 'Input' || component.name === 'TextArea' || component.name === 'OopSystemCurrent') {
      // const v = getValueByFunctionStr(render, value);
      // item.initialValue = v
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
        if (OopForm$model[dictCatalog] === undefined) {
          if (self.dictCatalogRequestCount <= 3) {
            self.loadDictData(dictCatalog, name);
            self.dictCatalogRequestCount += 1;
          }
        } else {
          component.children = OopForm$model[dictCatalog];
          self.dictCatalogRequestCount = 0;
        }
      }
    }
    // 如果是有url数据源的组件
    if (component.children && component.children.length === 0 && component.dataUrl) {
      const {dataUrl} = component;
      if (dataUrl.value) {
        if (!OopForm$model[dataUrl.value] || OopForm$model[dataUrl.value].length === 0) {
          if (self.dataUrlRequestCount <= 3) {
            self.loadUrlData(dataUrl);
            self.dataUrlRequestCount += 1;
          }
        } else {
          component.children = OopForm$model[dataUrl.value];
          self.dataUrlRequestCount = 0;
        }
      }
    }
    if (subscribe.length) {
      subscribe.forEach((sbcb)=>{
        const {name: subscribeName, publish: publishes = []} = sbcb;
        if (publishes.length) {
          publishes.forEach((publish)=>{
            const changeItem = formJson.find(it=>it.name === subscribeName);
            if (changeItem) {
              const changeValue = getOopFormValueInRender(changeItem, form);
              const currentValue = getOopFormValueInRender(item, form);
              setFormJsonProperties(item, changeValue, currentValue, publish);
            }
          })
        }
      })
    }
  });
  const formConfig = {...props, form, className: styles.container, oopForm: self };
  return ifRenderByAntdMobile ? appFormGenerator(formConfig) : formGenerator(formConfig);
})

@inject('OopForm$model')
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
  dictCatalogRequestCount = 0;
  dataUrlRequestCount = 0;
  componentDidMount() {
    console.log('OopForm componentDidMount');
    const {formJson} = this.props;
    const form = this.formContainer.getForm();
    formJson.forEach((item)=>{
      const {subscribe = [], /* render */} = item;
      // 解析subscribe配置
      if (subscribe.length) {
        subscribe.forEach((sbcb)=>{
          const {name: subscribeName, publish: publishes = []} = sbcb;
          if (publishes.length) {
            publishes.forEach((publish)=>{
              const changeItem = formJson.find(it=>it.name === subscribeName);
              if (changeItem) {
                // const changeItemValue = form.getFieldValue(changeItem.name);
                // const changeValue = changeItem.display === false ? undefined : changeItemValue;
                // const currentValue = (item.display === false && form.getFieldValue(item.name) === undefined) ? item.initialValue :
                //   form.getFieldValue(item.name);
                const changeValue = getOopFormValueInRender(changeItem, form);
                const currentValue = getOopFormValueInRender(item, form);
                // 被依赖的组件还没有 渲染
                setFormJsonProperties(item, changeValue, currentValue, publish);
                // if (changeItem.display !== false && form.getFieldValue(changeItem.name) === undefined) {
                //   setTimeout(()=>{
                //     setFormJsonProperties(item, form.getFieldValue(changeItem.name), currentValue, publish);
                //     self.forceUpdate();
                //   }, 200)
                // } else {
                //   setFormJsonProperties(item, changeValue, currentValue, publish);
                // }
              }
            })
          }
        })
      }
    })
    this.forceUpdate();
  }
  liandongForm = ()=>{
    const {formJson} = this.props;
    const form = this.formContainer.getForm();
    formJson.forEach((item)=>{
      const {subscribe = [], /* render */} = item;
      // 解析subscribe配置
      if (subscribe.length) {
        subscribe.forEach((sbcb)=>{
          const {name: subscribeName, publish: publishes = []} = sbcb;
          if (publishes.length) {
            publishes.forEach((publish)=>{
              const changeItem = formJson.find(it=>it.name === subscribeName);
              if (changeItem) {
                // const changeItemValue = form.getFieldValue(changeItem.name);
                // const changeValue = changeItem.display === false ? undefined : changeItemValue;
                // const currentValue = (item.display === false && form.getFieldValue(item.name) === undefined) ? item.initialValue :
                //   form.getFieldValue(item.name);
                const changeValue = getOopFormValueInRender(changeItem, form);
                const currentValue = getOopFormValueInRender(item, form);
                // 被依赖的组件还没有 渲染
                setFormJsonProperties(item, changeValue, currentValue, publish);
                // if (changeItem.display !== false && form.getFieldValue(changeItem.name) === undefined) {
                //   setTimeout(()=>{
                //     setFormJsonProperties(item, form.getFieldValue(changeItem.name), currentValue, publish);
                //     self.forceUpdate();
                //   }, 200)
                // } else {
                //   setFormJsonProperties(item, changeValue, currentValue, publish);
                // }
              }
            })
          }
        })
      }
    })
    this.forceUpdate();
  }
  componentWillUnmount() {
    this.props.dispatch({
      type: 'OopForm$model/clearData'
    });
  }
  loadDictData = (dictCatalog, name)=>{
    this.setState({
      [name]: true
    })
    this.props.dispatch({
      type: 'OopForm$model/findDictData',
      payload: {
        catalog: dictCatalog
      },
      callback: ()=>{
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
    return this.formContainer.getForm();
  }
  // 获取OopForm表单中的数据
  // 1.兼容antd-mobile的数据格式
  // 2.如果是枚举类型增加名称的字段比如
  // formData中下拉菜单的值为{vacationType: 'B'} 获取的值为{vacationType: 'B', vacationType_text: '事假'}
  getFormData = ()=>{
    const { formJson = []} = this.props;
    const form = this.getForm();
    const formData = form.getFieldsValue();
    console.log(formData);
    formJson.forEach((it)=>{
      const {name, component: {name: cName, children, props = {}}} = it;
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
    return <FormContainer {...this.props} self={this} ref={(el)=>{ this.formContainer = el }} />
  }
}
