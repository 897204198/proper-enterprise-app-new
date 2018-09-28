import React from 'react';
import { Form, Icon, Tooltip, Popover, Input, Spin } from 'antd';
import List from 'antd-mobile/lib/list';
import 'antd-mobile/lib/list/style';
import cloneDeep from 'lodash/cloneDeep';
import getComponent from './ComponentsMap';
import FormContainer from './components/FormContainer';


export const formGenerator = (formConfig)=>{
  const {loading = false, formTitle, className, formJson, form, formLayout = 'horizontal', rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemDrag,
    rowItemSetValue, dragable = false, showSetValueIcon = false} = formConfig;
  const formItemLayout = formLayout === 'horizontal' ? {
    labelCol: {
      xs: {span: 24},
      sm: {span: 5},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 16},
    },
  } : null;
  // 把正则的字符串形式转义成正则形式 fe: "/^0-9*$/" => /^0-9*$/
  const transformRules = (rules)=>{
    const arr = cloneDeep(rules);
    arr.forEach((it)=>{
      const {pattern} = it
      if (pattern && pattern.constructor.name === 'String') {
        it.pattern = new RegExp(pattern.split('/')[1]);
      }
    });
    return arr;
  }
  const {getFieldDecorator} = form;
  const formItemList = [];
  if (Array.isArray(formJson) && formJson.length > 0) {
    for (let i = 0; i < formJson.length; i++) {
      const formItemConfig = formJson[i];
      const {name, initialValue, rules = [], component, show = true } = formItemConfig;
      if (show === true) {
        let formItem = null;
        let _rules = null;
        if (name && component) {
          // component增加loading属性
          if (rules.length) {
            _rules = transformRules(rules);
          }
          const formItemInner = getFieldDecorator(name, {initialValue, rules: _rules})(
            createComponent(component)
          );
          formItem = getFormItem(formItemInner,
            {...formItemConfig, formItemLayout, rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemSetValue, showSetValueIcon});
          formItemList.push(formItem);
        }
      }
    }
  }
  if (formItemList.length === 0) {
    console.error('the arguments `formJson` no be length === 0')
    return null
  }
  return (dragable ?
    (
      <FormContainer
        className={className}
        formLayout={formLayout}
        formItemList={formItemList}
        formTitle={formTitle}
        loading={loading}
        onMove={rowItemDrag} />) : (<Spin spinning={loading}><div className={className}><h3>{formTitle}</h3><Form layout={formLayout}>{formItemList}</Form></div></Spin>));
}
const getFormItem = (formItemInner, formItemConfig)=>{
  const {name, initialChildrenValue, label, wrapper, wrapperClass, formItemLayout,
    rowItemClick = f=>f, rowItemIconCopy, rowItemIconDelete, active, showSetValueIcon, rowItemSetValue} = formItemConfig;
  const FormItem = Form.Item;
  const content = (
    <div>
      <Input name={name.replace('label', 'value')} defaultValue={initialChildrenValue} onChange={rowItemSetValue} />
    </div>
  );
  return wrapper ? (
    <div className={wrapperClass} key={name}>
      {formItemInner}
    </div>) : (
    <div key={name} className={active ? 'rowItemWrapper active' : 'rowItemWrapper'} onClick={(event)=>{ rowItemClick(name, event) }}>
      <FormItem
        key={name}
        {...formItemLayout}
        label={label}
      >
        {formItemInner}
      </FormItem>{active ? (
      <div className="ant-form-item-action">
        {showSetValueIcon ? (
          <Popover content={content} title="该项的值" trigger="click">
            <Tooltip title="设置值" getPopupContainer={triggerNode=> triggerNode.parentNode} placement="bottom">
              <Icon type="up-square-o" onClick={(event)=>{ rowItemSetValue(event, name) }} />
            </Tooltip>
          </Popover>) : null
        }
        <Tooltip title="复制">
          <Icon type="copy" onClick={(event)=>{ rowItemIconCopy(event, name) }} />
        </Tooltip>
        <Tooltip title="删除">
          <Icon type="delete" onClick={(event)=>{ rowItemIconDelete(event, name) }} />
        </Tooltip>
        <Tooltip title="拖拽">
          <Icon
            type="pause-circle-o"
            style={{cursor: 'move', transform: 'rotate(90deg)', display: 'none'}} />
        </Tooltip>
      </div>) : null}</div>);
}


// appFormGenerator 为了移动端展示用 没有设计的功能
export const appFormGenerator = (formConfig)=>{
  const {loading = false, formTitle, className, formJson, form} = formConfig;
  // 把正则的字符串形式转义成正则形式 fe: "/^0-9*$/" => /^0-9*$/
  const transformRules = (rules)=>{
    const arr = cloneDeep(rules);
    arr.forEach((it)=>{
      const {pattern} = it
      if (pattern && pattern.constructor.name === 'String') {
        it.pattern = new RegExp(pattern.split('/')[1]);
      }
    });
    return arr;
  }
  const {getFieldDecorator} = form;
  const formItemList = [];
  if (Array.isArray(formJson) && formJson.length > 0) {
    for (let i = 0; i < formJson.length; i++) {
      const formItemConfig = formJson[i];
      const {name, label, initialValue, rules = [], component, show = true } = formItemConfig;
      if (show === true) {
        let formItem = null;
        let _rules = null;
        if (name && component) {
          if (rules.length) {
            _rules = transformRules(rules);
          }
          const obj = {initialValue, rules: _rules};
          // antd-mobile Picker的默认值为数组
          if (component.name === 'Select') {
            obj.initialValue = [initialValue];
          }
          const formItemInner = getFieldDecorator(name, obj)(
            createComponent({...component, label})
          );
          formItem = getListItem(formItemInner,
            {...formItemConfig});
          formItemList.push(formItem);
        }
      }
    }
  }
  if (formItemList.length === 0) {
    console.error('the arguments `formJson` no be length === 0')
    return null
  }
  return (
    <Spin spinning={loading}>
      <div className={className}>
        <h3>{formTitle}</h3>
        <List>{formItemList}</List>
      </div>
    </Spin>);
}
// 获取ListItem
const getListItem = (formItemInner, formItemConfig)=>{
  const {name, wrapper, wrapperClass} = formItemConfig;
  return wrapper ? (
    <div className={wrapperClass} key={name}>
      {formItemInner}
    </div>) : (
    <div key={name}>
      {formItemInner}</div>);
}
// 获取web端和移动端组件
const createComponent = (component)=>{
  if (typeof component === 'object') {
    if (component.name) {
      // object desc
      const {name, label, props = {}, children = [] } = component;
      if (name) {
        return getComponent(name, label, props, children)
      }
    } else if (component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)') {
      // React component
      return component
    }
  } else if (typeof component === 'function') {
    return component()
  }
}
