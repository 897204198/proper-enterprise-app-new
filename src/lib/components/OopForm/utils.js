import React from 'react';
import {Form, Icon, Tooltip, Popover, Input, Spin} from 'antd';
import {List, Toast} from 'antd-mobile';
import cloneDeep from 'lodash/cloneDeep';
import getComponent from './ComponentsMap';
import FormContainer from './components/FormContainer';

const getOopFormChildrenRef = (el, oopForm)=>{
  if (el) {
    try {
      const instance = el.getWrappedInstance && el.getWrappedInstance();
      if (instance) {
        oopForm.childrenRef = instance;
      } else {
        oopForm.childrenRef = el;
      }
    } catch (e) {
      console.error(e);
    }
  }
}
export const formGenerator = (formConfig)=>{
  const {children: Component, loading = false, formTitle, className,
    formJson, form, formLayout = 'horizontal',
    rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemDrag, rowItemSetValue,
    dragable = false, showSetValueIcon = false, formLayoutConfig = null, columnsNum = 1,
    mode, defaultValue} = formConfig;
  const _formLayout = formLayoutConfig || (formLayout === 'horizontal' ? {
    labelCol: {
      xs: {span: 24},
      sm: {span: 5},
    },
    wrapperCol: {
      xs: {span: 24},
      sm: {span: 16},
    },
  } : undefined);
  // 把正则的字符串形式转义成正则形式 fe: "/^0-9*$/" => /^0-9*$/
  // {React.createElement(extraComponent, {...formConfig})}
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
      const {name, label, initialValue, rules = [], component,
        display = true, valuePropName = 'value', readonly = false, formItemLayout = {} } = formItemConfig;
      if (display === true || mode === 'design') {
        let formItem = null;
        let _rules = null;
        if (component) {
          // component增加loading属性
          if (rules.length && readonly === false) {
            _rules = transformRules(rules);
          }
          // component是函数的时候直接作为参数传入createComponent ，否则解构component 再附加其他参数传入
          let comArgs = {};
          if (typeof component === 'function') {
            comArgs = component;
          } else if (typeof component === 'object') {
            comArgs = {
              ...component,
              comName: component.name,
              name, label, rules, valuePropName,
              initialValue,
              defaultValue,
              readonly,
              form
            }
          }
          const com = createComponent(comArgs, false);
          if (com) {
            let formItemInner;
            // 有name表示需要双相绑定的组件 否则是展示组件 不做双向绑定的处理
            if (name) {
              formItemInner = getFieldDecorator(name, {initialValue, rules: _rules, valuePropName})(com);
            } else {
              formItemInner = com;
            }
            formItem = getFormItem(formItemInner,
              {...formItemConfig, columnsNum, formItemLayout: {..._formLayout, ...formItemLayout}, rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemSetValue, showSetValueIcon});
            formItemList.push(formItem);
          }
        }
      }
    }
  }
  if (formItemList.length === 0 && !Component) {
    console.error('the arguments `formJson` no be `[]` and no children')
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
        onMove={rowItemDrag} />
    ) : (
      <Spin spinning={loading}>
        <div className={className}><h3>{formTitle}</h3>
          <Form layout={formLayout} style={{display: 'flex', flexWrap: 'wrap'}} >{Component ? <Component {...formConfig} ref={(el)=>{ getOopFormChildrenRef(el, formConfig.oopForm) }} /> : null}{formItemList}</Form>
        </div>
      </Spin>
    ));
}
const getFormItem = (formItemInner, formItemConfig)=>{
  const {key, name, initialChildrenValue, label, wrapper, wrapperClass, formItemLayout = {},
    rowItemClick = f=>f, rowItemIconCopy, rowItemIconDelete, active, showSetValueIcon, rowItemSetValue, columnsNum, display, extra = ''} = formItemConfig;
  const FormItem = Form.Item;
  const { itemStyle } = formItemLayout;
  if (wrapper) {
    return (
      <div className={wrapperClass} key={key || name}>
        {formItemInner}
      </div>
    )
  } else {
    const style = {opacity: display === false ? 0.5 : 1}
    return (<div key={key || name} style={itemStyle ? {...itemStyle} : {flex: `0 0 ${100 / columnsNum}%`}}>
      <div
        className={active ? 'rowItemWrapper active' : 'rowItemWrapper'}
        style={style}
        onClick={(event)=>{ rowItemClick(key || name, event) }}
      >
        <FormItem
          key={key || name}
          {...formItemLayout}
          label={label}
          extra={extra}
        >
          {formItemInner}
        </FormItem>{active ? (
        <div className="ant-form-item-action">
          {
            showSetValueIcon ? (
              <Popover
                content={(<div><Input name={name.replace('label', 'value')} defaultValue={initialChildrenValue} onChange={rowItemSetValue} /></div>)}
                title="该项的值"
                trigger="click">
                <Tooltip title="设置值" getPopupContainer={triggerNode=> triggerNode.parentNode} placement="bottom">
                  <Icon type="up-square-o" onClick={(event)=>{ rowItemSetValue(event, name) }} />
                </Tooltip>
              </Popover>
            ) : null
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
        </div>) : null}
      </div>
    </div>);
  }
}

// appFormGenerator 为了移动端展示用 没有设计的功能
export const appFormGenerator = (formConfig)=>{
  const {loading = false, formTitle, className, formJson, form, defaultValue} = formConfig;
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
      const {name, label, initialValue, rules = [], component, display = true, valuePropName = 'value', readonly} = formItemConfig;
      if (display === true) {
        let formItem = null;
        let _rules = null;
        if (name && component) {
          if (rules.length) {
            _rules = transformRules(rules);
          }
          const obj = {initialValue, rules: _rules};
          const formItemInner = getFieldDecorator(name, obj)(
            createComponent(
              {...component,
                comName: component.name,
                name, label, rules, valuePropName, initialValue, form, defaultValue, readonly},
              true)
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
    </Spin>
  );
}
// 获取ListItem
const getListItem = (formItemInner, formItemConfig)=>{
  // const {name, label, component, rules, wrapper, wrapperClass} = formItemConfig;
  const {key, name, component, wrapper, wrapperClass} = formItemConfig;
  let className = null;
  if (component.props && component.props.disabled) {
    className = 'oopform-list-item-disabled';
  }
  const listItem = (<div key={key || name} className={className}>{formItemInner}</div>);
  return wrapper ? (
    <div className={wrapperClass} key={key || name}>
      {formItemInner}
    </div>
  ) : listItem;
}
// 获取web端和移动端组件
// component中包括了 创建组件需要的form rules label等属性
// 请注意：这些属性在配置 表单的时候并不在component中配置
const createComponent = (component, isApp)=>{
  if (typeof component === 'object') {
    if (component.comName) {
      // object desc
      const {comName, label, props = {}, children = [], rules, readonly} = component;
      if (props.disabled === true && readonly === true) {
        // 只读的表单
        return getReadOnlyForm(component, isApp);
      } else {
        return getComponent(comName, label, props, children, rules, isApp);
      }
    } else if (component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)') {
      // React component
      return component
    }
  } else if (typeof component === 'function') {
    return component(component.form)
  }
}

// 提示表单验证信息
export const toastValidErr = (validErr, formJson)=>{
  // 移动端错误提示
  if (validErr && formJson.length) {
    setTimeout(()=>{
      const {message, field} = validErr[Object.keys(validErr)[0]].errors[0];
      const {label} = formJson.find(it=>it.name === field);
      Toast.info(`${label}${message}`);
    });
  }
}
// 移动端提示表单loading
export const toastLoading = (flag)=>{
  if (flag) {
    setTimeout(()=>{
      Toast.loading('Loading...', 600);
    });
  } else {
    Toast.hide();
  }
}

// 判断item的值 与 display配置的value 是否匹配 目前支持字符串 以后会支持表达式
export const isItemShow = (itemValue, displayValue)=>{
  // TODO 支持表达式匹配
  return JSON.stringify(itemValue) === JSON.stringify(displayValue);
}

// 表单的值是否相等
export const equals = (value, value2)=>{
  if (value === value2) {
    return true;
  } else {
    return JSON.stringify(value) === JSON.stringify(value2)
  }
}

// 通知formJson变化
export const setFormJsonProperties = (item, changedValue, currentValue, publish, result)=>{
  const {value, property} = publish;
  const allValue = {};
  Object.keys(result).forEach((key)=>{ allValue[key] = result[key].value })
  if (property) {
    if (property === 'component.props.value' || property === 'value') {
      result[item.name].value = caculateSubscribeResult(changedValue, currentValue, allValue, value)
    } else if (property === 'initialValue') {
      const v = caculateSubscribeResult(changedValue, currentValue, allValue, value);
      if (v && (item.initialValue === null || item.initialValue === undefined)) {
        result[item.name].value = v;
        item[property] = v;
      }
    } else {
      const properties = property.split('.');
      if (properties.length > 1) {
        let tempObj = item;
        for (let i = 0; i < properties.length; i++) {
          const proper = properties[i];
          if (tempObj[proper] === undefined) {
            if (properties.length !== (i + 1)) {
              tempObj[proper] = {}
            }
          } else {
            tempObj = tempObj[proper]
          }
        }
        const funcStr = `return this.${property} = arguments[0](arguments[1], arguments[2], arguments[3])`;
        let fn = null;
        try {
          // eslint-disable-next-line
          fn = new Function(funcStr);
          fn.apply(item, [caculateSubscribeResult, changedValue, currentValue, allValue, value]);
        } catch (e) {
          console.error(e)
        }
        setTimeout(()=>{
          fn = null;
        })
      } else {
        item[property] = caculateSubscribeResult(changedValue, currentValue, allValue, value);
      }
    }
  }
}

// 根据subscribe中的设置 来计算结果
const caculateSubscribeResult = (changedValue, currentValue, allValue, value)=>{
  try {
    return getValueByFunctionStr(value, changedValue, currentValue, allValue);
  } catch (e) {
    return equals(changedValue, value)
  }
}

/**
 * 根据一个函数或者字符串的函数
 * 返回这个函数执行后的结果
 * @param functionStr
 * @param value
 * @returns {*}
 */
export const getValueByFunctionStr = (functionStr, ...value)=>{
  if (functionStr) {
    if (typeof functionStr === 'function') {
      try {
        return functionStr(...value);
      } catch (e) {
        return undefined;
      }
    } else if (typeof functionStr === 'string' && functionStr.includes('function')) {
      try {
        let fn = new Function(`return ${functionStr}`)(); // eslint-disable-line
        const result = fn(...value);
        fn = null;
        return result;
      } catch (e) {
        return undefined;
      }
    } else {
      throw Error(`${functionStr}不是一个合法的函数或函数字符串`);
    }
  }
}

const getDisplayValue = (component)=>{
  const {name, defaultValue = {}, initialValue, comName, label, props, children, rules} = component;
  if (comName === 'OopUpload') {
    const value = defaultValue[name] || initialValue;
    return getComponent(comName, label, {...props, value}, children, rules, false);
  }
  const {prototype: {hasOwnProperty}} = Object;
  if (hasOwnProperty.call(defaultValue, `${name}_text`)) {
    return defaultValue[`${name}_text`];
  } else if (defaultValue[name] !== undefined && defaultValue[name] !== null) {
    if ('OopGroupUserPicker,OopOrgEmpPicker,OopOrgPicker'.includes(comName)) {
      // hack 选择组件 默认取name
      return defaultValue[name].map(it=>it.name).join(',');
    }
    return defaultValue[name].toString();
  } else {
    return (initialValue !== undefined && initialValue !== null) ? initialValue.toString() : '';
  }
}

const getReadOnlyForm = (component, isApp)=>{
  const {label} = component;
  const styleCss = {
    whiteSpace: 'normal',
    maxHeight: '120px',
    overflowY: 'scroll'
  }
  return isApp === true ? (
    <List.Item
    arrow="horizontal"
    extra={<div style={styleCss}>{getDisplayValue(component)}</div>}>
      {label}
    </List.Item>) : (<div>{getDisplayValue(component)}</div>);
}

