import React from 'react';
import {connect} from 'dva';
import { Form } from 'antd';
import moment from 'moment';
import {inject} from '@framework/common/inject';
import {isApp} from '@framework/utils/utils';
import {appFormGenerator, formGenerator, toastValidErr, toastLoading, setFormJsonProperties /* getValueByFunctionStr */ } from './utils';
import styles from './index.less';

let ifRenderByAntdMobile = isApp();
const isAntdMobliePicker = (item)=>{
  if (ifRenderByAntdMobile) {
    const {component: {name}, initialValue} = item;
    // antd-mobile Picker的默认值为数组
    if (name === 'Select' || name === 'RadioGroup') {
      const type = typeof initialValue;
      if ((type === 'string' || type === 'number') || type === 'boolean') {
        return true;
      }
    }
    if (name === 'OopDict') {
      return true;
    }
  }
  return false;
};

const FormContainer = Form.create({
  mapPropsToFields(props) {
    const {fields = {}, formJson = []} = props;
    const result = {};
    formJson.forEach((item)=>{
      const {name, component, subscribe = [], initialValue} = item;
      // 赋值
      if (name) {
        let {value} = fields[name] || {};
        if (value !== undefined) {
          // 数据字典 数据字典值啥code的时候 （默认值）做下转换
          // if (component.name === 'OopDict') {
          // }
          // 时间
          if (component.name === 'DatePicker') {
            if (ifRenderByAntdMobile) {
              value = new Date(value);
            } else {
              const format = (component.props && component.props.format) || 'YYYY-MM-DD';
              value = (value === null ? undefined : moment(new Date(value), format));
            }
          }
        }
        result[name] = Form.createFormField({...fields[name], value})
        // 联动
        if (subscribe.length) {
          subscribe.forEach((sbcb)=>{
            const {name: subscribeName, publish: publishes = []} = sbcb;
            if (publishes.length) {
              publishes.forEach((publish)=>{
                const changeItem = formJson.find(it=>it.name === subscribeName);
                if (changeItem) {
                  const changeField = fields[subscribeName];
                  let changeValue = changeField === undefined ? undefined : changeField.value;
                  if (isAntdMobliePicker(changeItem)) {
                    const [first] = changeValue;
                    changeValue = first
                  }
                  if (changeItem.display === false) {
                    changeValue = undefined;
                  }
                  const currentValue = value === undefined ? initialValue : value;
                  // 被依赖的组件还没有 渲染
                  setFormJsonProperties(item, changeValue, currentValue, publish, result);
                }
              })
            }
          })
        }
      }
    })
    return result;
  },
  onFieldsChange(props, changedFields) {
    props.onChange(changedFields);
  }
})((props)=>{
  const { OopForm$model, disabled = false, formJson = [], form, self } = props;
  formJson.forEach((item)=>{
    const {name, component, readonly = false} = item;
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
    if (readonly === false && component.children && component.children.length === 0 && component.dictCatalog) {
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
    if (readonly === false && component.children && component.children.length === 0 && component.dataUrl) {
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
    const {ifRenderByAntdMobile: irbam, formJson = [], defaultValue = {}} = this.props;
    if (irbam !== undefined) {
      ifRenderByAntdMobile = irbam;
    }
    const fields = {};
    // 初始化表单值的时候 1.formJson配置的initialValue 2.defaultValue中改name的值 3. undefined
    formJson.forEach((item)=>{
      const {name, initialValue, component = {}} = item;
      const {prototype: {hasOwnProperty}} = Object;
      if (hasOwnProperty.call(defaultValue, name)) {
        if (component.props && component.props.disabled === true) {
          item.readonly = true;
        }
        fields[name] = {
          value: isAntdMobliePicker(item) ? [defaultValue[name]] : defaultValue[name]
        }
      } else if (hasOwnProperty.call(item, 'initialValue')) {
        fields[name] = {
          value: isAntdMobliePicker(item) ? [initialValue] : initialValue
        }
      } else {
        fields[name] = {
          value: undefined
        }
      }
    })
    this.state = {
      fields
    }
  }
  dictCatalogRequestCount = 0;
  dataUrlRequestCount = 0;
  componentDidMount() {
    console.log('OopForm componentDidMount');
  }
  componentWillReceiveProps(nextProps) {
    const {defaultValue = {}, formJson = []} = nextProps;
    const {fields} = this.state;
    // 比对当前的formJson与fields的差别 把formJson多的内容添加进来
    formJson.forEach((item)=>{
      const {name, initialValue} = item;
      if (!Object.prototype.hasOwnProperty.call(fields, name)) {
        fields[name] = Form.createFormField({value: initialValue})
      } else {
        // 如果是initialValue有值 fields没值的情况 可能是 initialValue是被订阅的字段这块给fields赋值
        if (fields[name].value === undefined || fields[name].value === null) {  // eslint-disable-line
          fields[name].value = initialValue
        }
      }
    })
    // 把fields多的内容删除 存在的看看是否需要赋值
    for (const name in fields) {
      const item = formJson.find(it=>it.name === name);
      if (item) {
        const {component = {}} = item;
        if (Object.prototype.hasOwnProperty.call(defaultValue, name)) {
          if (component.props && component.props.disabled === true) {
            item.readonly = true;
          }
          fields[name] = {
            ...fields[name],
            value: isAntdMobliePicker(item) ? [defaultValue[name]] : defaultValue[name]
          }
        }
      } else {
        delete fields[name];
      }
    }
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
    const data = {
      ...formData
    };
    console.log(data);
    if (ifRenderByAntdMobile) {
      // app的am组件中 Select、RadioGroup 所 对应的组件是 Picker， 此组件的值类型为[]; 所以这里处理一下
      // const selectComs = formJson.filter(it=>'Select,RadioGroup'.includes(it.component.name));
      const selectComs = formJson.filter((it)=>{
        const {component: {name, props}} = it;
        if ('Select,RadioGroup'.includes(name)) {
          return true
        }
        if ('OopEnum,OopDict'.includes(name) && props.multiple !== true) {
          return true
        }
        return false
      });
      if (selectComs && selectComs.length) {
        selectComs.forEach((selectCom)=>{
          const {name} = selectCom;
          if (Array.isArray(data[name])) {
            const [first] = data[name]
            data[name] = first;
          }
        })
      }
    }
    // 给数据增加快照文本信息
    formJson.forEach((it)=>{
      const {name, component: {name: cName, children = [], props = {}}} = it;
      const value = data[name];
      if (value !== null && value !== undefined && value !== '') {
        const textKey = `${name}_text`;
        if ('Select,RadioGroup,CheckboxGroup,OopEnum'.includes(cName)) {
          if (!data[textKey]) {
            let list = children;
            if (cName === 'OopEnum') {
              list = props.listData
            }
            // am的Picker组件为value为数组
            const child = list.map(c=>(value.toString().includes(c.value) ? c : null)).filter(i=>i !== null);
            if (child) {
              data[textKey] = child.map(c=>c.label).join(',');
            }
          }
        } else if ('OopDict'.includes(cName)) {
          if (!data[textKey]) {
            if (props.multiple === true) {
              data[textKey] = value.map(v=>v.name || v.label || v.title).join(',')
            } else {
              data[textKey] = value.name || value.label || value.title;
            }
          }
        } else if ('OopSystemCurrent'.includes(cName)) {
          if (!data[textKey]) {
            if (value.code === 'currentSysDate') {
              data[textKey] = value.id;
            } else {
              data[textKey] = value.text;
            }
          }
        } else if ('DatePicker'.includes(cName)) {
          if (!data[textKey]) {
            let dateLong = value;
            let dateStr = '';
            if (value.constructor.name === 'Date') {
              dateStr = moment(value).format(props.format ? props.format : 'YYYY-MM-DD');
              dateLong = value.getTime();
            } else {
              dateStr = value.format(props.format ? props.format : 'YYYY-MM-DD');
              dateLong = value.toDate().getTime();
            }
            data[`${name}`] = dateLong;
            data[textKey] = dateStr;
          }
        } else if (cName === 'InputNumber') {
          // 数字型转换
          const {Number} = window;
          if (value !== +value) {
            data[`${name}`] = Number(value)
          }
        } else if ('OopGroupUserPicker,OopOrgEmpPicker,OopOrgPicker'.includes(cName)) {
          if (!data[textKey]) {
            data[textKey] = value.map(v=>v.name).join(',');
          }
        }
      }
    })
    return data;
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
  handleFormChange = (changedFields)=>{
    this.setState(({ fields }) => ({
      fields: { ...fields, ...changedFields },
    }));
    // console.log(this.state.fields)
    // this.setState({
    //   fields: { ...this.state.fields, ...changedFields }
    // })
    // TODO 注释写法不好用??? 不理解
  }
  render() {
    const {fields} = this.state;
    return <FormContainer
      fields={{...fields}}
      {...this.props}
      self={this}
      ref={(el)=>{ this.formContainer = el }}
      onChange={this.handleFormChange} />
  }
}
