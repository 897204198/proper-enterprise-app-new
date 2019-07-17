import React from 'react';
import { Button, Card, Row, Col, Radio, Input, Tooltip, message } from 'antd';
import {Controlled as CodeMirror} from 'react-codemirror2';
import moment from 'moment';
import Debounce from 'lodash-decorators/debounce';
import cloneDeep from 'lodash/cloneDeep';
import update from 'immutability-helper/index';
import { getUuid } from '@framework/common/oopUtils';
import { isRegExp } from '@framework/utils/utils';
import OopForm from '@pea/components/OopForm';
import {toString2} from './utils/toString';
import buildEditPanel from './utils/buildEditPanel';
import jsBeautify from './utils/jsbeautify';
import styles from './index.less';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/mode/javascript/javascript.js');

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
// console.log(formJson)
const CenterPanel = (props) => {
  const {rowItems, onFormTitleClick,
    onRowItemClick, onRowItemIconCopy, onRowItemIconDelete, onRowItemDrag,
    onFormSubmit, onFormLayoutChange, formLayout, formTitle, self} = props;
  const rowItemClick = (name, event)=>{
    onRowItemClick(name, event)
  }
  const rowItemIconCopy = ()=>{
    onRowItemIconCopy()
  }
  const rowItemIconDelete = ()=>{
    onRowItemIconDelete()
  }
  const rowItemDrag = (i, j)=>{
    onRowItemDrag(i, j)
  }
  const formLayoutChange = (event)=>{
    onFormLayoutChange(event)
  }
  const toggleFormLayoutButtons = (
    <RadioGroup defaultValue={formLayout} onChange={formLayoutChange}>
      <RadioButton value="horizontal">横向布局</RadioButton>
      <RadioButton value="vertical">纵向布局</RadioButton>
    </RadioGroup>)
  const param = {formJson: rowItems, dragable: true, formLayout,
    rowItemClick, rowItemIconCopy, rowItemIconDelete, rowItemDrag
  }
  const titleCss = {
    maxWidth: '380px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'inline-block'
  }
  const wrapperCss = {
    display: 'flex',
    alignItems: 'center'
  }
  const titleClick = ()=>{
    onFormTitleClick(formTitle)
  }
  const title = (
    <div style={wrapperCss}>
      { typeof formTitle === 'object' ? <span style={titleCss}>{formTitle}</span> : (
        <Tooltip placement="topLeft" title={formTitle}>
          <span style={titleCss}>{formTitle}</span>
        </Tooltip>)}
      {(typeof formTitle === 'object') ? null : (<a onClick={titleClick} className="form-title">编辑</a>)}
    </div>);
  return (
    <div className={styles.centerPanel}>
      <Card title={title} extra={toggleFormLayoutButtons}>
        <OopForm {...param} mode="design" ref={(el)=>{ self.oopForm = el && el.getWrappedInstance() }} />
        <div style={{textAlign: 'center', display: 'none'}}>
          {rowItems.length ? (<Button type="primary" onClick={onFormSubmit}>保存为自定义组件</Button>) : null}
        </div>
      </Card>
    </div>);
};
const AddPanel = (props) => {
  const { selections, onAddItem} = props;
  const addItem = (item)=>{
    onAddItem(item)
  }
  return (
    <div className={styles.addPanel}><Card title="添加组件" bordered={false}><ul>{
      selections.map(item=>(<li key={item.key}><Button type="primary" ghost onClick={()=>addItem(item)}>{item.label}</Button></li>))
    }</ul></Card></div>);
};
const EditPanel = (props) => {
  const { loading, currentRowItem, currentRowItemJson, self,
    updateCenterPanel, onRowItemIconCopy, onRowItemIconDelete, onPlusClick, onRowItemDrag,
    customRules = false, setCustomRules, formPattern, onFormPatternChange} = props;
  const toggleFormPatternButtons = (
    <RadioGroup defaultValue={formPattern} onChange={onFormPatternChange}>
      <RadioButton value="simple">简单模式</RadioButton>
      <RadioButton value="advanced">高级模式</RadioButton>
    </RadioGroup>)
  const rowItemIconCopy = (event, name)=>{
    onRowItemIconCopy(name)
  }
  const rowItemIconDelete = (event, name)=>{
    onRowItemIconDelete(name)
  }
  const rowItemDrag = (i, j, item)=>{
    onRowItemDrag(i, j, item)
  }
  // 设置Select RadioGroup 等选项的值
  const rowItemSetValue = (event)=>{
    const element = event.currentTarget;
    updateCenterPanel(element.name, element.value);
  }
  return (
    <div className={styles.editPanel}>
      <Card title="编辑组件详情" bordered={false} extra={toggleFormPatternButtons}>
        {
          loading ? null :
            (self.renderEditPanel(formPattern, currentRowItem, currentRowItemJson, {
            rowItemIconCopy,
            rowItemIconDelete,
            rowItemDrag,
            rowItemSetValue,
            onPlusClick,
            updateCenterPanel,
            customRules,
            setCustomRules
          }, loading))
        }
      </Card></div>);
}
const componentData = [
  {label: 'A', value: 'A'},
  {label: 'B', value: 'B'},
  {label: 'C', value: 'C'},
  {label: 'D', value: 'D'}
]

export default class OopFormDesigner extends React.PureComponent {
  constructor(props) {
    super(props);
    const {formDetails: {formJson = [], formLayout, formTitle}} = this.props;
    formJson.forEach((item)=>{
      const {subscribe = []} = item;
      if (subscribe.length) {
        subscribe.forEach((sb)=>{
          const {publish = []} = sb;
          if (publish.length) {
            publish.forEach((pb)=>{
              const {value: v} = pb;
              if (typeof v === 'string' && v.includes('function')) {
                const fn = new Function(`return ${v}`); // eslint-disable-line
                pb.value = fn();
              }
            })
          }
        })
      }
    });
    let currentRowItem = null;
    if (formJson.length) {
      const first = formJson[0];
      first.active = true;
      currentRowItem = first;
    }
    this.state = {
      currentRowItem,
      selections: [
        {label: '输入框', key: 'Input', component: {name: 'Input'}},
        {label: '文本域', key: 'TextArea', component: {name: 'TextArea'}},
        {label: '单选框', key: 'RadioGroup', component: {name: 'RadioGroup', children: componentData}},
        {label: '多选框', key: 'CheckboxGroup', component: {name: 'CheckboxGroup', children: componentData}, initialValue: []},
        {label: '选择器', key: 'Select', component: {name: 'Select', children: componentData}},
        {label: '日期选择', key: 'DatePicker', component: {name: 'DatePicker'}, initialValue: moment().format('YYYY-MM-DD HH:mm:ss')},
        {label: '数字输入框', key: 'InputNumber', component: {name: 'InputNumber'}},
        {
          label: '系统当前',
          key: 'OopSystemCurrent',
          component: {
            name: 'OopSystemCurrent',
            props: {url: '/auth/current/user', showPropName: 'name', code: 'currentLoginUser', label: '当前登录人'}}
        },
        {
          label: '上传图片',
          key: 'OopUpload_pic',
          component: {
            name: 'OopUpload',
            props: {
              buttonText: '上传图片',
              accept: 'image/*',
              listType: 'picture',
              type: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
            }
          }
        },
        {
          label: '上传文件',
          key: 'OopUpload_file',
          component: {
            name: 'OopUpload',
            props: {
              buttonText: '上传文件',
            }
          }
        },
        {
          label: '文本组件',
          key: 'OopText',
          component: {
            name: 'OopText',
            props: {
              editable: true
            },
          }
        },
        {
          label: '用户选择',
          key: 'OopGroupUserPicker',
          component: {
            name: 'OopGroupUserPicker',
            props: {
              placeholder: '请选择'
            }
          }
        },
        {
          label: '员工选择',
          key: 'OopOrgEmpPicker',
          component: {
            name: 'OopOrgEmpPicker',
            props: {
              placeholder: '请选择'
            }
          }
        },
        {
          label: '部门选择',
          key: 'OopOrgPicker',
          component: {
            name: 'OopOrgPicker',
            props: {
              placeholder: '请选择'
            }
          }
        },
        {
          label: '开关',
          key: 'Switch',
          component: {
            name: 'Switch',
          },
          valuePropName: 'checked'
        },
        {
          label: '文本编辑器',
          key: 'OopTextEditor',
          component: {
            name: 'OopTextEditor',
          },
        },
        {
          label: '数据字典',
          key: 'OopDict',
          component: {
            name: 'OopDict',
          },
        }
      ],
      rowItems: formJson,
      formLayout,
      formTitle,
      customRules: false,
      formPattern: 'simple',
      currentRowItemJson: ''
    }
  }
  componentWillUnmount() {
    this.renderCenterPanel.cancel();
    this.handleCodeMirrorChange.cancel();
  }
  componentDidMount() {
    console.log(this.state.rowItems);
    console.log('OopFormDesigner componentDidMount');
  }
  onRowItemClick = (key)=>{
    if (this.state.currentRowItem !== null && this.state.currentRowItem.key === key) {
      console.log('click the same one!')
      return
    }
    this.setState({
      editPanelLoading: true
    }, ()=>{
      this.setCustomRules(false);
      const {rowItems, formPattern} = this.state;
      rowItems.forEach((item)=>{
        const aItem = item;
        if (aItem.key === key) {
          aItem.active = true;
          const isAdvanced = formPattern === 'advanced';
          const jsonItem = {
            ...aItem
          }
          delete jsonItem.active;
          delete jsonItem.initialValue;
          delete jsonItem.syncTag;

          this.setState({
            currentRowItem: aItem,
            currentRowItemJson: isAdvanced ? jsBeautify(toString2(jsonItem)) : '',
            editPanelLoading: false
          })
        } else {
          aItem.active = false;
        }
      })
      this.forceUpdate()
    })
  }
  /**
   * 如果传了name那么是“EditPanel”中的复制
   * 否则是“CenterPanel中”的复制
   * 下面的删除一样
   * @param name
   */
  onRowItemIconCopy = (name)=>{
    if (name) {
      const item = this.state.currentRowItem;
      const {children} = item.component
      const arr = name.split('_');
      arr.pop();
      const index = arr.pop();
      const options = children[index];
      const copy = {
        ...options,
        value: getUuid(5)
      }
      children.push(copy);
      this.forceUpdate()
    } else {
      const item = this.state.currentRowItem;
      const copy = cloneDeep(item);
      const newItem = {
        ...copy,
        name: getUuid(10),
        active: false
      }
      newItem.key = `${newItem.key}_${newItem.name}`;
      this.state.rowItems.push(newItem);
      this.forceUpdate()
    }
  }
  onRowItemIconDelete = (name)=>{
    if (name) {
      const item = this.state.currentRowItem;
      const {children} = item.component
      const arr = name.split('_');
      const index = arr.pop();
      children.splice(index, 1);
      console.log(children)
      this.forceUpdate();
    } else {
      const item = this.state.currentRowItem;
      // this.state.rowItems.forEach((rItem, i)=>{
      //   if (item.name === rItem.name) {
      //     index = i
      //   }
      // })
      const index = this.state.rowItems.findIndex(it=>it.key === item.key);
      this.state.rowItems.splice(index, 1);
      if (item.active) {
        this.state.currentRowItem = null;
        this.state.currentRowItemJson = null;
      }
      this.forceUpdate();
    }
  }
  onAddItem = (item)=>{
    const copy = cloneDeep(item);
    const newItem = {
      ...copy,
      name: getUuid(10),
    }
    newItem.key = `${newItem.key}_${newItem.name}`;
    // 系统当前组件的Name给默认值 不随机生成
    if (newItem.component.name === 'OopSystemCurrent') {
      newItem.name = item.component.props.code;
      newItem.label = item.component.props.label;
      delete newItem.component.props.label;
    }
    this.state.rowItems.push(newItem);
    if (this.props.onAddItem) {
      this.props.onAddItem(newItem);
    }
    this.forceUpdate();
  }
  onPlusClick = ()=>{
    this.state.currentRowItem.component.children = [
      {label: 'A', value: 'A'}
    ]
    this.forceUpdate();
  }
  onRowItemDrag = (dragIndex, hoverIndex)=>{
    const dragCard = this.state.rowItems[dragIndex]
    console.log(dragCard)
    this.setState(
      update(this.state, {
        rowItems: {
          $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
        },
      }),
    )
  }
  onEditPanelRowItemDrag = (dragIndex, hoverIndex)=>{
    const {children} = this.state.currentRowItem.component;
    const dragCard = children[dragIndex];
    console.log(dragCard)
    const newChildren = update(children, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]]
    })
    console.log(newChildren)
    this.state.currentRowItem.component.children = newChildren;
    this.forceUpdate();
  }
  onUpdateCenterPanel = (elementId, value)=>{
    if (elementId) {
      this.renderCenterPanel(elementId, value);
    }
  }

  /**
   * id, value 数据格式如下:
   * BQfwB_edit_label, A1
   * BQfwB_edit_children_0, A2
   * BQfwB_edit_rules, [{…}]
   * BQfwB_edit_props_placeholder, B4
   * @param id
   * @param value
   */
  @Debounce(300)
  renderCenterPanel(id, value) {
    console.log(id, value);
    const idAttr = id.split('_');
    const attr = idAttr[2];
    // 组件内部props的同步
    if (attr === 'props') {
      const { component } = this.state.currentRowItem;
      // 支持批量更新props
      if (idAttr[3] === 'props') {
        component.props = {
          ...component.props,
          ...value
        };
      } else {
        component.props = {
          ...component.props,
          [idAttr[3]]: value
        };
      }
      this.forceUpdate();
      return
    }
    // children 或者 组件外部属性的同步
    if (attr === 'children') {
      const {children} = this.state.currentRowItem.component;
      const i = idAttr.pop();
      const labelOrValue = idAttr.pop();
      children[i][labelOrValue] = value;
    } else if (attr === 'rules') {
      let rules = [];
      if (value !== null) {
        rules = value
      }
      this.state.currentRowItem.rules = rules;
      // 数据字典切换
    } else if (attr === 'dict') {
      this.state.currentRowItem.initialValue = undefined;
      this.state.currentRowItem.component.children = [];
      this.state.currentRowItem.component.dictCatalog = value;
      // 外部数据源切换
    } else if (attr === 'dataUrl') {
      this.state.currentRowItem.initialValue = undefined;
      this.state.currentRowItem.component.children = [];
      this.state.currentRowItem.component.dataUrl = value;
      // 数据来源切换
    } else if (attr === 'changeDataSource') {
      if (value === 'changeless') {
        delete this.state.currentRowItem.component.dictCatalog;
        delete this.state.currentRowItem.component.dataUrl;
      }
      if (value === 'dict') {
        delete this.state.currentRowItem.component.dataUrl;
        this.state.currentRowItem.component.dictCatalog = '请选择';
        this.state.currentRowItem.component.children = [];
      }
      if (value === 'outer') {
        delete this.state.currentRowItem.component.dictCatalog;
        this.state.currentRowItem.component.dataUrl = {};
        this.state.currentRowItem.component.children = [];
      }
    } else {
      this.state.currentRowItem[attr] = value;
    }
    this.forceUpdate();
    // Select 清空选中的值
    if (this.state.currentRowItem.component.name === 'Select') {
      this.oopForm.getForm().setFieldsValue({[this.state.currentRowItem.name]: undefined})
    }
  }
  // 返回一个表单的配置 ※注※：其中会对`函数`和`正则表达式`字符串化
  getFormConfig = ()=>{
    const {rowItems, formLayout, formTitle, formPattern} = this.state;
    const isAdvanced = formPattern === 'advanced';
    if (isAdvanced) {
      const value = this.codeMirror.editor.getValue();
      const result = this.validateItemJson(value);
      if (result === false) {
        return;
      }
    }
    if (formTitle && formTitle.$$typeof && formTitle.$$typeof.toString() === 'Symbol(react.element)') {
      return message.warning('请保存表单的标题');
    }
    const form = this.oopForm.getForm();
    const fieldsValue = form.getFieldsValue();
    console.log(fieldsValue)
    // 设置默认值
    rowItems.forEach((item)=>{
      const {name, component, subscribe = [], rules = []} = item;
      const value = fieldsValue[name];
      item.initialValue = value;
      if (component.dictCatalog || component.dataUrl) {
        component.children = [];
      }
      // “系统当前” 组件 在设置表单的时候 不设置默认值
      if (component.name === 'OopSystemCurrent') {
        item.initialValue = undefined;
      }
      // antd日期格式取出来的是Moment对象 这里做一个转换成字符串的操作
      if (item.initialValue && typeof item.initialValue === 'object' && item.initialValue.format) {
        const format = (component.props && component.props.format) || 'YYYY-MM-DD';
        item.initialValue = item.initialValue.format(format);
      }
      // subscribe 中的publish的value可能是函数 那么需要 字符串化
      if (subscribe.length) {
        subscribe.forEach((sb)=>{
          const {publish = []} = sb;
          if (publish.length) {
            publish.forEach((pb)=>{
              const {value: v} = pb;
              if (typeof v === 'function') {
                pb.value = v.toString()
              }
            })
          }
        })
      }
      if (rules.length) {
        rules.forEach((rule)=>{
          const {pattern} = rule;
          if (pattern && isRegExp(pattern)) {
            rule.pattern = pattern.toString();
          }
        })
      }
    })
    return {
      formJson: rowItems,
      formTitle,
      formLayout
    }
  }
  resetForm = ()=>{
    this.setState({
      rowItems: [],
      formLayout: 'horizontal',
      formTitle: '你的表单'
    })
  }
  onFormLayoutChange = (event)=>{
    this.setState({
      formLayout: event.target.value
    })
  }
  onFormTitleClick = (title)=>{
    const confirm = ()=>{
      const {value} = this.formTitleEditInput.input;
      this.setState({
        formTitle: value
      })
    }
    const cancel = ()=>{
      this.setState({
        formTitle: title
      })
    }
    const formTitle = (
      <div>
        <Input defaultValue={title} style={{width: '208px'}} ref={ (el)=>{ this.formTitleEditInput = el } } />
        <Button type="primary" onClick={confirm}>确定</Button><Button onClick={cancel}>取消</Button>
      </div>);
    this.setState({
      formTitle
    })
  }
  setCustomRules = (flag)=>{
    this.setState({
      customRules: flag
    })
  }
  handleFormPatternChange = (event)=>{
    const {currentRowItem} = this.state;
    if (currentRowItem === null) {
      message.error('please select a item first !')
      return
    }
    // console.log(event);
    const { value: formPattern } = event.target;
    if (formPattern === 'advanced') {
      const jsonItem = {
        ...currentRowItem
      }
      delete jsonItem.active;
      delete jsonItem.initialValue;
      delete jsonItem.syncTag;
      const currentRowItemJson = jsBeautify(toString2(jsonItem))
      this.setState({
        formPattern,
        currentRowItemJson
      });
    } else {
      const values = this.state.currentRowItemJson;
      const item = this.validateItemJson(values);
      if (item) {
        const index = this.state.rowItems.findIndex(it=>it.active === true);
        const oldItem = this.state.rowItems[index];
        const newItem = {
          ...item,
          initialValue: oldItem.initialValue,
          active: oldItem.active
        }
        if (oldItem.syncTag) {
          newItem.syncTag = oldItem.syncTag
        }
        this.state.rowItems[index] = newItem;
        this.setState({
          formPattern,
          currentRowItem: newItem
        })
      }
    }
  }
  renderCodeMirror = (formJson)=>{
    console.log(formJson)
  }
  validateItemJson = (formJson) =>{
    try {
      const fn = new Function(`return ${formJson}`); // eslint-disable-line
      const result = fn();
      return result;
    } catch (e) {
      message.error(`语法错误，${e.message}`);
      return false;
    }
  }
  renderEditPanel = (formPattern, currentRowItem, currentRowItemJson, config, loading)=>{
    if (formPattern === 'advanced') {
      return (
        <CodeMirror
          ref={ (el)=>{ this.codeMirror = el }}
          value={currentRowItemJson}
          options={{
            mode: {name: 'javascript', json: true},
            matchBrackets: true,
            lineWrapping: true,
            theme: 'material',
            lineNumbers: true
          }}
          onBeforeChange={(editor, data, value) => {
            this.setState({currentRowItemJson: value});
          }}
          onChange={(editor, value) => {
            this.handleCodeMirrorChange(editor, value);
          }}
        />);
    }
    return buildEditPanel(currentRowItem, config, loading);
  }
  @Debounce(300)
  handleCodeMirrorChange(editor, value) {
    if ('+input,+delete,undo,*compose,cut,paste'.includes(value.origin)) {
      const values = editor.getValue();
      const item = this.validateItemJson(values);
      if (item) {
        const index = this.state.rowItems.findIndex(it=>it.active === true);
        const oldItem = this.state.rowItems[index];
        const newItem = {
          ...item,
          initialValue: oldItem.initialValue,
          active: oldItem.active
        }
        if (oldItem.syncTag) {
          newItem.syncTag = oldItem.syncTag
        }
        this.state.rowItems[index] = newItem;
        this.forceUpdate();
      }
    }
  }
  render() {
    const { formPattern } = this.state;
    const isAdvanced = formPattern === 'advanced';
    return (
      <div className={styles.container}>
        <Row gutter={16}>
          <Col span={6} style={ isAdvanced ? {display: 'none'} : null }>
            <AddPanel
              selections={this.state.selections}
              onAddItem={this.onAddItem} />
          </Col>
          <Col span={12} >
            <CenterPanel
              rowItems={this.state.rowItems}
              onRowItemClick={this.onRowItemClick}
              onRowItemIconCopy={this.onRowItemIconCopy}
              onRowItemIconDelete={this.onRowItemIconDelete}
              onRowItemDrag={this.onRowItemDrag}
              onFormLayoutChange={this.onFormLayoutChange}
              formTitle={this.state.formTitle}
              formLayout={this.state.formLayout}
              onFormTitleClick={this.onFormTitleClick}
              self={this} />
          </Col>
          <Col span={isAdvanced ? 12 : 6} >
            <EditPanel
              loading={this.state.editPanelLoading}
              currentRowItem={this.state.currentRowItem}
              currentRowItemJson={this.state.currentRowItemJson}
              updateCenterPanel={this.onUpdateCenterPanel}
              onRowItemIconCopy={this.onRowItemIconCopy}
              onRowItemIconDelete={this.onRowItemIconDelete}
              onPlusClick={this.onPlusClick}
              onRowItemDrag={this.onEditPanelRowItemDrag}
              customRules={this.state.customRules}
              setCustomRules={this.setCustomRules}
              onFormPatternChange={this.handleFormPatternChange}
              formPattern={this.state.formPattern}
              self={this}
            />
          </Col>
        </Row>
      </div>)
  }
}
