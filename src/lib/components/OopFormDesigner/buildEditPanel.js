import React from 'react';
import { Radio, Popover, Button, message} from 'antd';
import OopForm from '../../components/OopForm';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const prefix = '_edit';
const createCustomRulesContent = (name, rules = [], setCustomRules, updateCenterPanel)=>{
  const divValue = rules === [] ? null : rules.map(item=>Object.keys(item)[0].concat(',').concat(Object.values(item).join(','))).join(';');
  const getRulesValueByStr = (str)=>{
    const numReg = new RegExp('^[0-9]*$');
    if (numReg.test(str)) {
      return Number(str)
    }
    return str;
  }
  const saveRules = ()=>{
    const {innerText} = this.contentEditable;
    if (!innerText) {
      message.error('自定义规则不能为空!');
      return;
    }
    const arrs = innerText.split(';');
    let flag = false;
    const rulesResult = [];
    arrs.forEach((item)=>{
      if (item) {
        const arr = item.split(',');
        if (arr.length === 3) {
          rulesResult.push({
            [arr[0].trim()]: getRulesValueByStr(arr[1]),
            message: arr[2].trim()
          })
        } else {
          flag = true
          message.error('自定义规则格式不正确!');
        }
      }
    });
    if (flag) {
      return;
    }
    console.log(rulesResult);
    setCustomRules(false);
    updateCenterPanel(name, rulesResult);
    message.success('规则已保存!');
  }
  return (
    <div>
      <div
        ref={(el)=>{ this.contentEditable = el }}
        contentEditable={true}
        className={styles.customRulesContent}
        dangerouslySetInnerHTML={{__html: divValue}}
        title="格式例如:require,true,此项不能为空" />
      <div style={{marginTop: 8, textAlign: 'right'}}>
        <Button size="small" onClick={()=>setCustomRules(false)}>取消</Button>
        <Button type="primary" size="small" onClick={saveRules} style={{marginLeft: 8}}>保存</Button>
      </div>
    </div>);
}

// 数据字典数据源和固定数据源切换
const getDataDictItem = (item, onChange)=>{
  const {name, component} = item;
  const componentName = `${name}${prefix}_changeDataSource`;
  return {
    name: componentName,
    label: '数据来源',
    component: {
      name: 'Select',
      children: [{label: '固定选项', value: 'changeless'}, {label: '字典数据源', value: 'dict'}],
      props: {onChange: (v)=>{
        onChange(componentName, v);
      }}
    },
    initialValue: component.dictCatalog ? 'dict' : 'changeless'
  };
}
export default (item, eventsCollection)=>{
  const { rowItemIconCopy, rowItemIconDelete, rowItemDrag, rowItemSetValue, onPlusClick, updateCenterPanel,
    customRules = false, setCustomRules} = eventsCollection;
  console.log(item)
  if (!item) {
    return
  }
  // console.log(item)
  const { name, label, component, rules} = item;
  const cName = component.name;
  if (!cName) {
    return
  }
  const { children } = component;
  const onChange = (e)=>{
    const element = e.currentTarget;
    updateCenterPanel(element.id, element.value);
  }
  const onSelectChange = (itemName, value)=>{
    updateCenterPanel(itemName, value);
  }
  // TODO name的变化会触发刷新整个OopForm hack失去焦点  下轮有 修改name采用Popover的形式 onChange还是有问题
  const onNameChange = (e)=>{
    const element = e.currentTarget;
    updateCenterPanel(element.id, element.value);
    setTimeout(()=>{
      const el = document.getElementById(`${element.value}_edit_name`);
      el && el.focus();
    }, 1000)
  }
  const plusClick = ()=>{
    onPlusClick(name)
  }
  let formConfig = {
    formJson: []
  }
  // 输入框 文本域 数字输入框
  if ('Input,TextArea,InputNumber,DatePicker'.includes(cName)) {
    formConfig.formJson = [{
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    }, {
      name: `${name}${prefix}_props_placeholder`,
      label: '占位符',
      component: {
        name: 'Input',
        props: {placeholder: '该输入些什么', onChange}
      },
      initialValue: component.props ? component.props.placeholder : null
    },
    {
      name: `${name}${prefix}_name`,
      label: 'name',
      component: {
        name: 'Input',
        props: {placeholder: name, onChange: onNameChange}
      },
      initialValue: name
    }];
    // 为DatePicker增加props showTime
    if (cName === 'DatePicker') {
      const showTimeChange = (event)=>{
        console.log(event);
        // 刷新showTime
        updateCenterPanel(event.target.name, event.target.value);
        // TODO 350延时躲过节流函数
        setTimeout(()=>{
          // 刷新format
          // 时间format 'YYYY-MM-DD HH:mm' 写死的时间格式 应该让用户设置格式
          updateCenterPanel(`${name}${prefix}_props_format`, event.target.value ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
        }, 350);
      }
      const toggleShowTime = (
        <RadioGroup onChange={showTimeChange} size="small" name={`${name}${prefix}_props_showTime`} >
          <RadioButton value={false}>不显示时间</RadioButton>
          <RadioButton value={true}>显示时间</RadioButton>
        </RadioGroup>)
      formConfig.formJson.push({
        name: `${name}${prefix}_props_showTime`,
        label: '是否显示时间',
        component: toggleShowTime,
        initialValue: (component.props && component.props.showTime === true) || false
      })
    }
    formConfig = {...formConfig, formLayout: 'vertical'}
  } else if ('RadioGroup,CheckboxGroup,Select'.includes(cName)) {
    // 增加数据源 数据字典
    const dataDictItem = getDataDictItem(item, onSelectChange);
    formConfig.formJson = [{
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    },
    dataDictItem,
    {
      name: `${name}${prefix}_children`,
      label: '固定选项',
      component: children.length === 0 ? {
        name: 'Button',
        props: {icon: 'plus', onClick: plusClick}
      } : {
        name: 'Input',
        props: {type: 'hidden'}
      },
      initialValue: '',
      display: {
        name: dataDictItem.name,
        value: 'changeless',
      }
    }];
    const childrenArr = children.map((cld, i)=>(
      {
        name: `${name}${prefix}_children_label_${i}`,
        label: '',
        component: {
          name: 'Input',
          props: {onChange}
        },
        initialValue: cld.label,
        initialChildrenValue: cld.value,
        dragable: true,
        active: true,
        display: {
          name: dataDictItem.name,
          value: 'changeless',
        }
      }
    ))
    childrenArr.push({
      name: `${name}${prefix}_dict`,
      label: '字典数据源',
      component: {
        name: 'Select',
        children: [],
        dataUrl: '/sys/datadic/catalog',
        props: {onChange: (value)=>{
          onSelectChange(`${name}${prefix}_dict`, value);
        }}
      },
      initialValue: component.dictCatalog,
      display: {
        name: dataDictItem.name,
        value: 'dict',
      }
    })
    childrenArr.push({
      name: `${name}${prefix}_name`,
      label: 'name',
      component: {
        name: 'Input',
        props: {placeholder: name, onChange: onNameChange}
      },
      initialValue: name
    })
    formConfig.formJson = formConfig.formJson.concat(childrenArr)
    // radio checkbox 增加布局判断
    if ('RadioGroup,CheckboxGroup'.includes(cName)) {
      const layoutChange = (event)=>{
        updateCenterPanel(event.target.name, event.target.value)
      }
      let layout = 'horizontal';
      if (component.props && component.props.className === 'vertical') {
        layout = 'vertical'
      }
      const componentName = `${name}${prefix}_props_className`
      const toggleFormLayoutButtons = (
        <RadioGroup onChange={layoutChange} size="small" name={componentName} >
          <RadioButton value="horizontal">横向布局</RadioButton>
          <RadioButton value="vertical">纵向布局</RadioButton>
        </RadioGroup>)
      formConfig.formJson.push({
        name: componentName,
        label: '布局',
        component: toggleFormLayoutButtons,
        initialValue: layout
      })
    }
    formConfig = {...formConfig, formLayout: 'vertical', rowItemIconCopy, rowItemIconDelete, rowItemDrag, rowItemSetValue}
  }
  const ruleChange = (event)=>{
    const {value} = event.target;
    if (value === '1') {
      const rule = [{required: true, message: '此项为必填项'}];
      updateCenterPanel(event.target.name, rule);
      setCustomRules(false);
    } else if (value === '0') {
      updateCenterPanel(event.target.name, null);
      setCustomRules(false);
    }
  }
  const getRulesValue = (argsRules)=>{
    if (!argsRules) {
      return '0'
    }
    if (JSON.stringify(argsRules) === '[{"required":true,"message":"此项为必填项"}]') {
      return '1'
    }
    return '2';
  }
  const content = createCustomRulesContent(`${name}${prefix}_rules`, rules, setCustomRules, updateCenterPanel);
  const radioClick = ()=>{
    setCustomRules(!customRules)
  }
  const requireRulesRadio = (
    <RadioGroup onChange={ruleChange} size="small" name={`${name}${prefix}_rules`} >
      <Radio value="0">无</Radio>
      <Radio value="1">必填</Radio>
      <Popover
        style={{width: '1000px'}}
        visible={customRules}
        content={content}
        getPopupContainer={triggerNode=>triggerNode.parentNode}
        title="格式:[require,true,此项必填;]">
        <Radio onClick={radioClick} value="2">自定义</Radio>
      </Popover>
    </RadioGroup>);
  // 增加规则判断
  const rulesArr = [{
    name: `${name}${prefix}_rules`,
    label: '规则',
    component: requireRulesRadio,
    initialValue: getRulesValue(rules)
  }]
  formConfig.formJson = formConfig.formJson.concat(rulesArr)
  return (<OopForm {...formConfig} showSetValueIcon={true} />);
}
