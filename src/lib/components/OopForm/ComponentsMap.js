import React, {Fragment} from 'react';
import { DatePicker, InputNumber, Input, Radio, Checkbox, Select, Button, Icon} from 'antd';
import {List, TextareaItem, Picker, DatePicker as DatePickerM, InputItem, Button as ButtonM} from 'antd-mobile';
import zhCN2 from 'antd-mobile/lib/date-picker/locale/zh_CN';
import OopSystemCurrent from '../OopSystemCurrent';
import OopUpload from '../OopUpload';
import OopText from '../OopText';
import CheckBoxPop from './components/CheckBoxPop';
import OopGroupUserPicker from '../OopGroupUserPicker';
import { getUuid } from '../../../framework/common/oopUtils';
import { isAndroid } from '../../../framework/utils/utils';
import styles from './index.less';


const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;
const dateFormat = 'YYYY-MM-DD';
// 移动应用下 IOS系统时间组件自动focus
const hackDatePickerIOSFocus = (e)=>{
  const el = e.target.getElementsByTagName('input')[0];
  if (el) {
    el.setAttribute('readonly', 'readonly');
  }
}
// 移动应用下 Android系统 Input组件 focus弹出软键盘滚动问题
const hackInputAndroidFocusKeyboardOcclusion = (e)=>{
  if (isAndroid()) {
    const inputEl = e.target;
    setTimeout(()=>{
      inputEl.scrollIntoViewIfNeeded && inputEl.scrollIntoViewIfNeeded(true);
      inputEl.scrollIntoView && inputEl.scrollIntoView(true);
    }, 300)
  }
}
const getAntdMobileComponent = (componentName, componentLabel, props, children, rules)=>{
  let component = null;
  const rule = rules && rules.find(it=>it.required);
  const label = rule ? (<Fragment><span className={styles.required}>*</span>{componentLabel}</Fragment>) : componentLabel;
  // let pickerData = [];
  switch (componentName) {
    case 'Input':
      component = <InputItem { ...props} clear>{label}</InputItem>;
      break;
    case 'InputNumber':
      component = <InputItem { ...props} type="money" clear>{label}</InputItem>;
      break;
    case 'Button':
      component = <ButtonM { ...props} />;
      break;
    case 'TextArea':
      component = <TextareaItem { ...props} title={label} rows={3} count={100} />;
      break;
    case 'Select':
      // pickerData = children.map(it=>({...it, value: [it.value]}));
      component = <Picker { ...props} data={children} cols={1}><List.Item arrow="horizontal">{label}</List.Item></Picker>;
      break;
    case 'DatePicker':
      component = <DatePickerM { ...props} locale={zhCN2} mode={props.showTime ? undefined : 'date'}><List.Item arrow="horizontal">{label}</List.Item></DatePickerM>;
      break;
    case 'RadioGroup':
      component = <Picker { ...props} data={children} cols={1}><List.Item arrow="horizontal">{label}</List.Item></Picker>;
      break;
    case 'CheckboxGroup':
      component = <CheckBoxPop { ...props} data={children}>{p => (<List.Item arrow="horizontal" {...p}>{label}</List.Item>)}</CheckBoxPop>;
      break;
    case 'OopText':
      component = <List.Item extra={props.text}>{label}</List.Item>;
      break;
    default: null
  }
  return component;
}
export default (name, label, props, children, rules, isApp)=> {
  const isWeb = !isApp;
  const Map = {
    Input: isWeb ? <Input {...props} autoComplete="on" onFocus={(e) => { hackInputAndroidFocusKeyboardOcclusion(e) }} /> : getAntdMobileComponent(name, label, props, children, rules),
    Button: isWeb ? <Button {...props} /> : getAntdMobileComponent(name, label, props, children, rules),
    Icon: <Icon {...props} />,
    TextArea: isWeb ? <TextArea {...props} /> : getAntdMobileComponent(name, label, props, children, rules),
    Select: isWeb ? (
      <Select style={{ width: '100%' }} {...props} getPopupContainer={ triggerNode=>triggerNode.parentNode }>
        {
          children.map(item=>(<Option key={getUuid(5)} value={item.value}>{item.label}</Option>))
        }
      </Select>
    ) : getAntdMobileComponent(name, label, props, children, rules),
    RadioGroup: isWeb ? (
      <RadioGroup options={children} {...props} />) : getAntdMobileComponent(name, label, props, children, rules),
    CheckboxGroup: isWeb ? (
      <CheckboxGroup options={children} {...props} />) : getAntdMobileComponent(name, label, props, children, rules),
    InputNumber: isWeb ? <InputNumber {...props} /> : getAntdMobileComponent(name, label, props, children, rules),
    DatePicker: isWeb ? <DatePicker format={dateFormat} {...props} onFocus={(e) => { hackDatePickerIOSFocus(e) }} /> : getAntdMobileComponent(name, label, props, children, rules),
    OopSystemCurrent: <OopSystemCurrent {...props} label={label} />,
    OopUpload: <OopUpload accept="image/*" listType="picture" type={['.jpg', '.jpeg', '.png', '.gif', '.bmp']} {...props} />,
    OopText: isWeb ? <OopText {...props} /> : getAntdMobileComponent(name, label, props, children, rules),
    OopGroupUserPicker: <OopGroupUserPicker {...props} />,
  }
  const component = Map[name];
  if (!component) {
    console.error(`warning: cannot find component named ${name}`)
    return
  }
  return component;
}
