import React from 'react';
import { Form, Icon, Tooltip, Popover, Input, Spin } from 'antd';
import {List, Toast} from 'antd-mobile';
import cloneDeep from 'lodash/cloneDeep';
import getComponent from './ComponentsMap';
import FormContainer from './components/FormContainer';

// const a = <span>222</span>;
// const node = <div>{a}</div>;
// console.log(node.toString())
// console.log(node)
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
  const {children: Component, loading = false, formTitle, className, formJson, form, formLayout = 'horizontal', rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemDrag,
    rowItemSetValue, dragable = false, showSetValueIcon = false, formLayoutConfig = null, columnsNum = 1, mode} = formConfig;
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
      const {name, label, initialValue, rules = [], component, display = true, valuePropName = 'value', formItemLayout = {} } = formItemConfig;
      if (display === true || mode === 'design') {
        let formItem = null;
        let _rules = null;
        if (name && component) {
          // component增加loading属性
          if (rules.length) {
            _rules = transformRules(rules);
          }
          const com = createComponent({...component, label, rules, valuePropName, form}, false)
          if (com) {
            const formItemInner = getFieldDecorator(name, {initialValue, rules: _rules, valuePropName})(
              com
            );
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
          <Form layout={formLayout} style={{display: 'flex', flexWrap: 'wrap'}}>{Component ? <Component {...formConfig} ref={(el)=>{ getOopFormChildrenRef(el, formConfig.oopForm) }} /> : null}{formItemList}</Form>
        </div>
      </Spin>
    ));
}
const getFormItem = (formItemInner, formItemConfig)=>{
  const {name, initialChildrenValue, label, wrapper, wrapperClass, formItemLayout = {},
    rowItemClick = f=>f, rowItemIconCopy, rowItemIconDelete, active, showSetValueIcon, rowItemSetValue, columnsNum, display} = formItemConfig;
  const FormItem = Form.Item;
  const { itemStyle } = formItemLayout;
  const content = (
    <div>
      <Input name={name.replace('label', 'value')} defaultValue={initialChildrenValue} onChange={rowItemSetValue} />
    </div>
  );

  const style = {opacity: display === false ? 0.5 : 1}
  return wrapper ? (
      <div className={wrapperClass} key={name}>
        {formItemInner}
      </div>
  ) : (
    <div key={name} style={itemStyle ? {...itemStyle} : {flex: `0 0 ${100 / columnsNum}%`}}>
      <div
        className={active ? 'rowItemWrapper active' : 'rowItemWrapper'}
        style={style}
        onClick={(event)=>{ rowItemClick(name, event) }}
        >
        <FormItem
          key={name}
          {...formItemLayout}
          label={label}
        >
          {formItemInner}
        </FormItem>{active ? (
        <div className="ant-form-item-action">
          {
            showSetValueIcon ? (
              <Popover content={content} title="该项的值" trigger="click">
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
        </div>
      ) : null}</div>
    </div>
  );
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
      const {name, label, initialValue, rules = [], component, display = true, valuePropName = 'value' } = formItemConfig;
      if (display === true) {
        let formItem = null;
        let _rules = null;
        if (name && component) {
          if (rules.length) {
            _rules = transformRules(rules);
          }
          const obj = {initialValue, rules: _rules};
          // antd-mobile Picker的默认值为数组
          if (component.name === 'Select' || component.name === 'RadioGroup') {
            if (obj.initialValue && (typeof (obj.initialValue) === 'string' || typeof (obj.initialValue) === 'number')) {
              obj.initialValue = [initialValue];
            }
          }
          const formItemInner = getFieldDecorator(name, obj)(
            createComponent({...component, label, rules, valuePropName, form}, true)
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
  const {name, component, wrapper, wrapperClass} = formItemConfig;
  let className = null;
  if (component.props && component.props.disabled) {
    className = 'oopform-list-item-disabled';
  }
  const listItem = (<div key={name} className={className}>{formItemInner}</div>);
  // if ('RadioGroup,CheckboxGroup'.includes(component.name)) {
  //   const rule = rules && rules.find(it=>it.required);
  //   listItem = (
  // <div key={name} className={component.props.disabled ? 'oopform-list-item-disabled' : null}>
  //   <div className="am-list-item am-list-item-middle">
  //     <div className="am-list-line">
  //       <div className="am-list-content">{rule ? (<Fragment><span className={styles.required}>*</span>{label}</Fragment>) : label}</div>
  //       <div className="am-list-extra">{formItemInner}</div>
  //     </div>
  //   </div>
  // </div>);
  // }
  return wrapper ? (
    <div className={wrapperClass} key={name}>
      {formItemInner}
    </div>
  ) : listItem;
}
// 获取web端和移动端组件
// component中包括了 创建组件需要的form rules label等属性
// 请注意：这些属性在配置 表单的时候并不在component中配置
const createComponent = (component, isApp)=>{
  if (typeof component === 'object') {
    if (component.name) {
      // object desc
      const {name, label, props = {}, children = [], rules} = component;
      if (name) {
        return getComponent(name, label, props, children, rules, isApp);
      }
    } else if (component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)') {
      // React component
      return component
    }
  } else if (typeof component === 'function') {
    return component()
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

// 注册订阅者与发布者
export const registerSubscribeAndPublish = (props)=>{
  const subscribeObj = {};
  const {formJson} = props;
  formJson.forEach((item)=>{
    const {subscribe = [], name: itemName} = item;
    subscribe.forEach((sbcb)=>{
      const {name: subscribeName, publish = []} = sbcb;
      if (publish.length) {
        // 为publish增加当前formjson的name
        const newPublish = publish.map(pb=>({...pb, name: itemName}));
        const publishes = subscribeObj[subscribeName];
        if (publishes === undefined) {
          subscribeObj[subscribeName] = newPublish;
        } else {
          publishes.push(newPublish);
        }
      }
    })
  });
  return Object.keys(subscribeObj).length === 0 ? null : subscribeObj
}

// 表单改变之后根据subscribe 设置表单属性
export const handleFormFieldChangeBySubscribe = (props, changedValues, allValues, subscribe)=>{
  if (subscribe) {
    const {formJson} = props;
    console.log('current subscribe', subscribe)
    console.log(props, changedValues, allValues);
    const changeName = Object.keys(changedValues)[0];
    const publishes = subscribe[changeName];
    if (publishes) {
      publishes.forEach((publish)=>{
        console.log(publish.property)
        const currentItem = formJson.find(item=>item.name === publish.name);
        currentItem[publish.property] = equals(changedValues[changeName], publish.value)
      })
    }
  }
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
export const setFormJsonProperties = (item, changedValue, publish)=>{
  const {value, property} = publish;
  if (property) {
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
      const funcStr = `return this.${property} = arguments[0](arguments[1], arguments[2])`;
      let fn = null;
      try {
        // eslint-disable-next-line
        fn = new Function(funcStr);
        fn.apply(item, [equals, changedValue, value]);
      } catch (e) {
        console.error(e)
      }
      setTimeout(()=>{
        fn = null;
      })
    } else {
      item[property] = equals(changedValue, value)
    }
  }
}
