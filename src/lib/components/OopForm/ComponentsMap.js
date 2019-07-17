import React, {Fragment} from 'react';
import { DatePicker, InputNumber, Input, Radio, Checkbox, Select, Button, Switch} from 'antd';
import {List, TextareaItem, Picker, DatePicker as DatePickerM, InputItem, Button as ButtonM} from 'antd-mobile';
import zhCN2 from 'antd-mobile/lib/date-picker/locale/zh_CN';
import { getUuid } from '@framework/common/oopUtils';
import { isAndroid } from '@framework/utils/utils';
import OopSystemCurrent from '../OopSystemCurrent';
import OopUpload from '../OopUpload';
import OopText from '../OopText';
import CheckBoxPop from './components/CheckBoxPop';
import OopGroupUserPicker from '../OopGroupUserPicker';
import OopOrgEmpPicker from '../OopOrgEmpPicker';
import OopOrgPicker from '../OopOrgPicker';
import OopTextEditor from '../OopTextEditor';
import OopEnum from '../OopEnum';
import OopDict from '../OopDict';
import OopFormSelectUser from '../OopFormSelectUser';
import OopFormSelectOrg from '../OopFormSelectOrg';
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
const hackInputAndroidFocusKeyboardOcclusion = (id)=>{
  const inputEl = document.getElementById(id)
  if (inputEl && isAndroid()) {
    setTimeout(()=>{
      // inputEl.scrollIntoViewIfNeeded && inputEl.scrollIntoViewIfNeeded(true);
      // inputEl.scrollIntoView && inputEl.scrollIntoView({block: 'center'});
      inputEl.scrollIntoView({behavior: 'auto', block: 'center', inline: 'nearest'});
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
      component = <InputItem { ...props} clear onFocus={function () { hackInputAndroidFocusKeyboardOcclusion(this.id) }} >{label}</InputItem>;
      break;
    case 'InputNumber':
      component = <InputItem { ...props} type="digit" clear onFocus={function () { hackInputAndroidFocusKeyboardOcclusion(this.id) }}>{label}</InputItem>;
      break;
    case 'Button':
      component = <ButtonM { ...props} />;
      break;
    case 'TextArea':
      component = <TextareaItem autoHeight { ...props} title={label} onFocus={function () { hackInputAndroidFocusKeyboardOcclusion(this.id) }} />;
      break;
    case 'Select':
      // pickerData = children.map(it=>({...it, value: [it.value]})); arrow="horizontal"
      component = <Picker { ...props} data={children} cols={1}><List.Item arrow="horizontal">{label}</List.Item></Picker>;
      break;
    case 'DatePicker':
      component = <DatePickerM { ...props} locale={zhCN2} mode={props.showTime ? undefined : 'date'}><List.Item arrow="horizontal">{label}</List.Item></DatePickerM>;
      break;
    case 'RadioGroup':
      component = <Picker { ...props} data={children} cols={1}><List.Item arrow="horizontal">{label}</List.Item></Picker>;
      break;
    case 'CheckboxGroup':
      component = <CheckBoxPop { ...props} data={children} componentLabel={componentLabel}>{p => (<List.Item arrow="horizontal" {...p}>{label}</List.Item>)}</CheckBoxPop>;
      break;
    case 'OopText':
      component = (
      <div className={styles.oopTextContainer}>
        <div className={styles.title}>{label}</div>
        {(<div
        style={{whiteSpace: 'normal'}}
        dangerouslySetInnerHTML={{ __html: props.text }} />)}
        </div>);
      break;
    case 'OopUpload':
      component =
      (
        <OopUpload
        {...props}
      >{ p => <List.Item arrow="horizontal" extra={p.extra}>{label}</List.Item>}</OopUpload>)
      break;
    case 'OopSystemCurrent':
      component = (<OopSystemCurrent {...props} label={undefined} >
        {c=> <List.Item arrow="horizontal" extra={c}>{label}</List.Item>}
      </OopSystemCurrent>)
      break;
    case 'OopGroupUserPicker':
      component = <OopGroupUserPicker {...props} />
      break;
    case 'OopOrgEmpPicker':
      component = (
        <OopFormSelectUser
        {...props}
      >{ p => <List.Item arrow="horizontal" extra={p}>{label}</List.Item>}</OopFormSelectUser>)
      break;
    case 'OopOrgPicker':
      component = (
        <OopFormSelectOrg
        {...props}
      >{ p => <List.Item arrow="horizontal" extra={p}>{label}</List.Item>}</OopFormSelectOrg>)
      break;
    case 'Switch':
      component = <List.Item arrow="horizontal" extra={<Switch {...props} />}>{label}</List.Item>
      break;
    case 'OopTextEditor':
      component = <OopTextEditor {...props} />
      break;
    case 'OopEnum':
      component = <OopEnum {...props} label={label} />
      break;
    case 'OopDict':
      component = <OopDict {...props} label={label} />
      break;
    default: null
  }
  return component;
}
const getAntdComponent = (componentName, componentLabel, props, children)=>{
  let component = null;
  // let pickerData = [];
  switch (componentName) {
    case 'Input':
      component = <Input {...props} autoComplete="on" onFocus={(e) => { hackInputAndroidFocusKeyboardOcclusion(e) }} />;
      break;
    case 'Button':
      component = <Button { ...props} />;
      break;
    case 'TextArea':
      component = <TextArea {...props} />;
      break;
    case 'Select':
      component = (
        <Select allowClear={true} style={{ width: '100%' }} {...props} getPopupContainer={ triggerNode=>triggerNode.parentNode }>
          {
            children.map(item=>(<Option key={getUuid(5)} value={item.value} disabled={item.disabled || false}>{item.label}</Option>))
          }
        </Select>
      );
      break;
    case 'RadioGroup':
      component = <RadioGroup options={children} {...props} />;
      break;
    case 'CheckboxGroup':
      component = <CheckboxGroup options={children} {...props} />;
      break;
    case 'InputNumber':
      component = <InputNumber {...props} />;
      break;
    case 'DatePicker':
      component = <DatePicker placeholder="" format={dateFormat} {...props} onFocus={(e) => { hackDatePickerIOSFocus(e) }} />;
      break;
    case 'OopText':
      component = <OopText {...props} />;
      break;
    case 'OopUpload':
      component = <OopUpload {...props} />
      break;
    case 'OopSystemCurrent':
      component = <OopSystemCurrent {...props} />
      break;
    case 'OopGroupUserPicker':
      component = <OopGroupUserPicker {...props} />
      break;
    case 'OopOrgEmpPicker':
      component = <OopOrgEmpPicker {...props} />
      break;
    case 'OopOrgPicker':
      component = <OopOrgPicker {...props} />
      break;
    case 'Switch':
      component = <Switch {...props} />
      break;
    case 'OopTextEditor':
      component = <OopTextEditor {...props} />
      break;
    case 'OopEnum':
      component = <OopEnum {...props} />
      break;
    case 'OopDict':
      component = <OopDict {...props} />
      break;
    default: null
  }
  return component;
}
export default (name, label, props, children, rules, isApp)=> {
  const isWeb = !isApp;
  const component = isWeb ? getAntdComponent(name, label, props, children) : getAntdMobileComponent(name, label, props, children, rules);
  if (!component) {
    console.error(`Error: cannot find component named ${name}`)
    return null;
  }
  return component;
}
