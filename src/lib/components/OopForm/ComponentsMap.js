import React from 'react';
import { DatePicker, InputNumber, Input, Radio, Checkbox, Select, Button, Icon} from 'antd';
import {List, TextareaItem, Picker, DatePicker as DatePickerM, InputItem, Button as ButtonM} from 'antd-mobile';
import zhCN2 from 'antd-mobile/lib/date-picker/locale/zh_CN';
import OopSystemCurrent from '../OopSystemCurrent';
import OopUpload from '../OopUpload';
import OopText from '../OopText';
import OopGroupUserPicker from '../OopGroupUserPicker';
import { getUuid } from '../../../framework/common/oopUtils';
import { isApp, isAndroid } from '../../../framework/utils/utils';

const CheckboxGroup = Checkbox.Group;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;
// const isWeb = !isApp();
console.log(isApp)
const isWeb = true;
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
const getAntdMobileComponent = (componentName, componentLabel, props, children)=>{
  let component = null;
  // let pickerData = [];
  switch (componentName) {
    case 'Input':
      component = <InputItem { ...props} >{componentLabel}</InputItem>;
      break;
    case 'InputNumber':
      component = <InputItem { ...props} type="money" clear>{componentLabel}</InputItem>;
      break;
    case 'Button':
      component = <ButtonM { ...props} />;
      break;
    case 'TextArea':
      component = <TextareaItem { ...props} title={componentLabel} rows={3} count={100} />;
      break;
    case 'Select':
      // pickerData = children.map(it=>({...it, value: [it.value]}));
      component = <Picker { ...props} data={children} cols={1}><List.Item arrow="horizontal">{componentLabel}</List.Item></Picker>;
      break;
    case 'DatePicker':
      component = <DatePickerM { ...props} locale={zhCN2}><List.Item arrow="horizontal">{componentLabel}</List.Item></DatePickerM>;
      break;
    default: null
  }
  return component;
}
export default (name, label, props, children)=> {
  const Map = {
    Input: isWeb ? <Input {...props} onFocus={(e) => { hackInputAndroidFocusKeyboardOcclusion(e) }} /> : getAntdMobileComponent(name, label, props, children),
    Button: isWeb ? <Button {...props} /> : getAntdMobileComponent(name, label, props, children),
    Icon: <Icon {...props} />,
    TextArea: isWeb ? <TextArea {...props} /> : getAntdMobileComponent(name, label, props, children),
    Select: isWeb ? (
      <Select style={{ width: '100%' }} {...props} getPopupContainer={ triggerNode=>triggerNode.parentNode }>
        {
          children.map(item=>(<Option key={getUuid(5)} value={item.value}>{item.label}</Option>))
        }
      </Select>
    ) : getAntdMobileComponent(name, label, props, children),
    RadioGroup: (
      <RadioGroup options={children} {...props} />),
    CheckboxGroup: (
      <CheckboxGroup options={children} {...props} />),
    InputNumber: isWeb ? <InputNumber {...props} /> : getAntdMobileComponent(name, label, props, children),
    DatePicker: isWeb ? <DatePicker format={dateFormat} {...props} onFocus={(e) => { hackDatePickerIOSFocus(e) }} /> : getAntdMobileComponent(name, label, props, children),
    OopSystemCurrent: <OopSystemCurrent {...props} />,
    OopUpload: <OopUpload accept="image/*" listType="picture" type={['.jpg', '.jpeg', '.png', '.gif', '.bmp']} {...props} />,
    OopText: <OopText {...props} />,
    OopGroupUserPicker: <OopGroupUserPicker {...props} />,
  }
  const component = Map[name];
  if (!component) {
    console.error(`warning: cannot find component named ${name}`)
    return
  }
  return component;
}
