import React from 'react';
import { Radio, Popover, Button, Spin, message} from 'antd';
import OopForm from '@pea/components/OopForm';
import styles from '../index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const prefix = '_edit';
const createCustomRulesContent = (name, rules = [], setCustomRules, updateCenterPanel)=>{
  const divValue = rules === [] ? null : rules.map(item=>Object.keys(item)[0].concat(',').concat(Object.values(item).join(','))).join(';'); //eslint-disable-line
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
      children: [{label: '固定选项', value: 'changeless'}, {label: '字典数据源', value: 'dict'}, {label: '外部数据源', value: 'outer'}],
      props: {allowClear: false, onChange: (v)=>{
        onChange(componentName, v);
      }}
    },
    initialValue: component.dictCatalog ? 'dict' : (component.dataUrl ? 'outer' : 'changeless')
  };
}
export default (item, eventsCollection, loading)=>{
  const { rowItemIconCopy, rowItemIconDelete, rowItemDrag, rowItemSetValue, onPlusClick, updateCenterPanel,
    customRules = false, setCustomRules} = eventsCollection;
  console.log(item)
  if (!item) {
    return
  }
  // console.log(item)
  const { key, name, label, component, rules} = item;
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
    // setTimeout(()=>{
    //   const el = document.getElementById(`${element.value}_edit_name`);
    //   el && el.focus();
    // }, 1000)
  }
  const plusClick = ()=>{
    onPlusClick(name)
  }
  let formConfig = {
    formJson: []
  }
  // 输入框 文本域 数字输入框
  if ('Input,TextArea,InputNumber,DatePicker,OopGroupUserPicker,OopOrgEmpPicker,OopOrgPicker,OopTextEditor,Switch,'.includes(`${cName},`)) {
    formConfig.formJson = [{
      key: `${key}${prefix}_label`,
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    }, {
      key: `${key}${prefix}_props_placeholder`,
      name: `${name}${prefix}_props_placeholder`,
      label: '占位符',
      component: {
        name: 'Input',
        props: {placeholder: '该输入些什么', onChange}
      },
      initialValue: component.props ? component.props.placeholder : null
    },
    {
      key: `${key}${prefix}_name`,
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
        updateCenterPanel(event.target.name, event.target.value ? true : null);
        // TODO 350延时躲过节流函数
        setTimeout(()=>{
          // 刷新format
          // 时间format 'YYYY-MM-DD HH:mm' 写死的时间格式 应该让用户设置格式
          updateCenterPanel(`${name}${prefix}_props_format`, event.target.value ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD');
        }, 350);
      }
      const toggleShowTime = (
        <RadioGroup onChange={showTimeChange} size="small" name={`${name}${prefix}_props_showTime`}>
          <RadioButton value={false}>不显示时间</RadioButton>
          <RadioButton value={true}>显示时间</RadioButton>
        </RadioGroup>)
      formConfig.formJson.push({
        key: `${key}${prefix}_props_showTime`,
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
      key: `${key}${prefix}_label`,
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    },
      (cName === 'Select' ?
        {
          key: `${key}${prefix}_props_placeholder`,
          name: `${name}${prefix}_props_placeholder`,
          label: '占位符',
          component: {
            name: 'Input',
            props: {placeholder: '该输入些什么', onChange}
          },
          initialValue: component.props ? component.props.placeholder : null
        } : undefined),
      dataDictItem,
      {
        key: `${key}${prefix}_children`,
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
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'changeless',
            property: 'display'
          }]
        }],
      },
      {
        key: `${key}${prefix}_dataUrl`,
        name: `${name}${prefix}_dataUrl`,
        label: '外部数据源配置',
        component: {
          name: 'Input',
          props: {type: 'hidden'}
        },
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'outer',
            property: 'display'
          }]
        }],
      },
      {
        key: `${key}${prefix}_dataUrl_value`,
        name: `${name}${prefix}_dataUrl_value`,
        component: {
          name: 'Input',
          props: {
            placeholder: '请求URL'
          },
          rules: [{
            require: true
          }]
        },
        initialValue: component.dataUrl && component.dataUrl.value,
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'outer',
            property: 'display'
          }]
        }],
      },
      {
        key: `${key}${prefix}_dataUrl_labelPropName`,
        name: `${name}${prefix}_dataUrl_labelPropName`,
        component: {
          name: 'Input',
          props: {
            placeholder: '回显的属性名'
          },
          rules: [{
            require: true
          }]
        },
        initialValue: component.dataUrl && component.dataUrl.labelPropName,
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'outer',
            property: 'display'
          }]
        }],
      },
      {
        key: `${key}${prefix}_dataUrl_valuePropName`,
        name: `${name}${prefix}_dataUrl_valuePropName`,
        component: {
          name: 'Input',
          props: {
            placeholder: '保存的属性值'
          },
          rules: [{
            require: true
          }]
        },
        initialValue: component.dataUrl && component.dataUrl.valuePropName,
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'outer',
            property: 'display'
          }]
        }],
      },
      {
        key: `${key}${prefix}_dataUrl_button`,
        name: `${name}${prefix}_dataUrl_button`,
        component: (
      <Button
        type="primary"
        onClick={()=>{
        const dataUrl = {
          value: document.getElementById(`${name}${prefix}_dataUrl_value`).value,
          labelPropName: document.getElementById(`${name}${prefix}_dataUrl_labelPropName`).value,
          valuePropName: document.getElementById(`${name}${prefix}_dataUrl_valuePropName`).value
        }
        if (!dataUrl.value || !dataUrl.labelPropName || !dataUrl.valuePropName) {
          message.error('必填项不能为空')
        }
        onSelectChange(`${name}${prefix}_dataUrl`, {});
        setTimeout(()=>{
          onSelectChange(`${name}${prefix}_dataUrl`, dataUrl);
        }, 350)
      }}>
        测试
      </Button>),
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'outer',
            property: 'display'
          }]
        }],
      }].filter(it=>it !== undefined);
    const childrenArr = children.map((cld, i)=>(
      {
        key: `${key}${prefix}_children_label_${i}`,
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
        subscribe: [{
          name: dataDictItem.name,
          publish: [{
            value: 'changeless',
            property: 'display'
          }]
        }],
      }
    ))
    childrenArr.push({
      key: `${key}${prefix}_dict`,
      name: `${name}${prefix}_dict`,
      label: '字典数据源',
      component: {
        name: 'Select',
        children: [],
        dataUrl: {
          value: '/sys/datadic/catalog',
          labelPropName: 'catalogName',
          valuePropName: 'id',
          disabledPropName: 'enable',
        },
        props: {onChange: (value)=>{
          onSelectChange(`${name}${prefix}_dict`, value);
        }}
      },
      initialValue: component.dictCatalog,
      subscribe: [{
        name: dataDictItem.name,
        publish: [{
          value: 'dict',
          property: 'display'
        }]
      }],
    })
    childrenArr.push({
      key: `${key}${prefix}_name`,
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
  } else if ('OopSystemCurrent'.includes(cName)) {
    formConfig.formJson = [{
      key: `${key}${prefix}_label`,
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    },
    {
      key: `${key}${prefix}_name`,
      name: `${name}${prefix}_name`,
      label: 'name',
      component: {
        name: 'Input',
        props: {placeholder: name, onChange: onNameChange}
      },
      initialValue: name
    }];
    const currentSysArgsComp = {
      key: `${key}${prefix}_dict`,
      name: `${name}${prefix}_dict`,
      label: '当前系统参数',
      component: {
        name: 'Select',
        children: [],
        dataUrl: {
          value: 'PEP_FORM_CURRENTCOMPONENTSETTING',
          labelPropName: 'name',
          valuePropName: 'code',
          disabledPropName: 'enable'
        },
        props: {allowClear: false, onChange: (value)=>{
          const optionProps = currentSysArgsComp.component.children.find(it=>it.code === value);
          const props = {
            code: value,
            url: optionProps.url,
            showPropName: optionProps.showPropName,
            editable: optionProps.editable === 1
          }
          // TODO 300毫秒节流
          updateCenterPanel(`${name}${prefix}_label`, optionProps.name);
          setTimeout(()=>{
            setTimeout(()=>{
              updateCenterPanel(`${name}${prefix}_name`, value);
            }, 350)
            updateCenterPanel(`${name}${prefix}_props_props`, props);
          }, 350)
        }}
      },
      initialValue: component.props.code,
    };
    formConfig.formJson.push(currentSysArgsComp);
    formConfig = {...formConfig, formLayout: 'vertical'};
  } else if ('OopUpload'.includes(cName)) {
    formConfig.formJson = [{
      key: `${key}${prefix}_label`,
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    },
    {
      key: `${key}${prefix}_name`,
      name: `${name}${prefix}_name`,
      label: 'name',
      component: {
        name: 'Input',
        props: {placeholder: name, onChange: onNameChange}
      },
      initialValue: name
    }];
    formConfig = {...formConfig, formLayout: 'vertical'};
  } else if ('OopText'.includes(cName)) {
    formConfig.formJson = [{
      key: `${key}${prefix}_label`,
      name: `${name}${prefix}_label`,
      label: '标题',
      component: {
        name: 'Input',
        props: {placeholder: label, onChange}
      },
      initialValue: label
    },
    {
      key: `${key}${prefix}_name`,
      name: `${name}${prefix}_name`,
      label: 'name',
      component: {
        name: 'Input',
        props: {placeholder: name, onChange: onNameChange}
      },
      initialValue: name
    },
    {
      key: `${key}${prefix}_props_text`,
      name: `${name}${prefix}_props_text`,
      label: '请输入内容',
      component: {
        name: 'TextArea',
        props: {onChange}
      },
      initialValue: component.props && component.props.text
    }];
    formConfig = {...formConfig, formLayout: 'vertical'};
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
    key: `${key}${prefix}_rules`,
    name: `${name}${prefix}_rules`,
    label: '规则',
    component: requireRulesRadio,
    initialValue: getRulesValue(rules)
  }]
  formConfig.formJson = formConfig.formJson.concat(rulesArr);
  return loading ? <Spin /> : (<OopForm {...formConfig} showSetValueIcon={true} />);
}
