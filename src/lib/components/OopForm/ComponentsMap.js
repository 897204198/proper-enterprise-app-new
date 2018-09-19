import React from 'react';
import { DatePicker, InputNumber, Input, Radio, Checkbox, Select, Button, Icon} from 'antd';
import OopSystemCurrent from '../OopSystemCurrent';
import OopUpload from '../OopUpload';
import OopText from '../OopText';
import OopGroupUserPicker from '../OopGroupUserPicker';
import { getUuid } from '../../../framework/common/oopUtils';

const isAndroid = ()=>{
  const {userAgent} = navigator;
  return userAgent.includes('Android') || userAgent.includes('Adr');
}
// const isIOS = ()=>{
//   const {userAgent} = navigator;
//   return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
// }
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
  if (true || isAndroid()) {
    const inputEl = e.target;
    setTimeout(()=>{
      inputEl.scrollIntoViewIfNeeded && inputEl.scrollIntoViewIfNeeded(true);
      inputEl.scrollIntoView && inputEl.scrollIntoView(true);
    }, 300)
  }
}
export default (name, props, children)=> {
  const Map = {
    Input: <Input {...props} onFocus={(e) => { hackInputAndroidFocusKeyboardOcclusion(e) }} />,
    Button: <Button {...props} />,
    Icon: <Icon {...props} />,
    TextArea: <TextArea {...props} />,
    Select: (
      <Select style={{ width: '100%' }} {...props} getPopupContainer={ triggerNode=>triggerNode.parentNode }>
        {
          children.map(item=>(<Option key={getUuid(5)} value={item.value}>{item.label}</Option>))
        }
      </Select>
    ),
    RadioGroup: (
      <RadioGroup options={children} {...props} />),
    CheckboxGroup: (
      <CheckboxGroup options={children} {...props} />),
    InputNumber: <InputNumber {...props} />,
    DatePicker: <DatePicker format={dateFormat} {...props} onFocus={(e) => { hackDatePickerIOSFocus(e) }} />,
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
