import React from 'react';
import { Button, Card, Row, Col, Radio, Input, Tooltip } from 'antd';
import Debounce from 'lodash-decorators/debounce';
import cloneDeep from 'lodash/cloneDeep';
import update from 'immutability-helper/index';
import { getUuid } from '../../../framework/common/oopUtils';
import OopForm from '../../components/OopForm';
import buildEditPanel from './buildEditPanel';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
// console.log(formJson)
const CenterPanel = (props) => {
  const {rowItems, onFormTitleClick,
    onRowItemClick, onRowItemIconCopy, onRowItemIconDelete, onRowItemDrag,
    onFormSubmit, onFormLayoutChange, formLayout, formTitle, self} = props;
  const rowItemClick = (name)=>{
    onRowItemClick(name)
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
        <OopForm {...param} ref={(el)=>{ self.oopForm = el }} />
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
  const { currentRowItem,
    updateCenterPanel, onRowItemIconCopy, onRowItemIconDelete, onPlusClick, onRowItemDrag,
    customRules = false, setCustomRules} = props;
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
      <Card title="编辑组件详情" bordered={false}>
        {buildEditPanel(currentRowItem, {
          rowItemIconCopy,
          rowItemIconDelete,
          rowItemDrag,
          rowItemSetValue,
          onPlusClick,
          updateCenterPanel,
          customRules,
          setCustomRules
        })}
      </Card></div>);
};
const componentData = [
  {label: 'A', value: 'A'},
  {label: 'B', value: 'B'},
  {label: 'C', value: 'C'},
  {label: 'D', value: 'D'}
]

export default class OopFormDesigner extends React.PureComponent {
  state = {
    currentRowItem: null,
    selections: [
      {label: '输入框', key: 'Input', component: {name: 'Input'}},
      {label: '文本域', key: 'TextArea', component: {name: 'TextArea'}},
      {label: '单选框', key: 'RadioGroup', component: {name: 'RadioGroup', children: componentData}},
      {label: '多选框', key: 'CheckboxGroup', component: {name: 'CheckboxGroup', children: componentData}, initialValue: []},
      {label: '选择器', key: 'Select', component: {name: 'Select', children: componentData}},
      {label: '日期选择', key: 'DatePicker', component: {name: 'DatePicker'}},
      {label: '数字输入框', key: 'InputNumber', component: {name: 'InputNumber'}},
      {
        label: '系统当前',
        key: 'OopSystemCurrent',
        component: {
          name: 'OopSystemCurrent',
          props: {url: '/auth/current/user', showPropName: 'name', code: 'currentLoginUser', label: '当前登录人'}}
      },
      {
        label: '上传组件',
        key: 'OopUpload',
        component: {
          name: 'OopUpload',
          props: {
            buttonText: '上传文件'
          },
        }
      }
    ],
    rowItems: this.props.formDetails.formJson,
    formLayout: this.props.formDetails.formLayout,
    formTitle: this.props.formDetails.formTitle,
    customRules: false
  }
  componentWillUnmount() {
    this.renderCenterPanel.cancel();
  }
  componentDidMount() {
    console.log(this.state.currentRowItem, this.state.rowItems)
  }
  onRowItemClick = (name)=>{
    this.setCustomRules(false);
    this.state.rowItems.forEach((item)=>{
      const aItem = item;
      if (aItem.name === name) {
        aItem.active = true;
        this.setState({
          currentRowItem: aItem
        })
      } else {
        aItem.active = false;
      }
    })
    this.forceUpdate()
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
      this.state.rowItems.push(newItem);
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
      this.forceUpdate()
    } else {
      const item = this.state.currentRowItem;
      let index = 0;
      this.state.rowItems.forEach((rItem, i)=>{
        if (item.name === rItem.name) {
          index = i
        }
      })
      this.state.rowItems.splice(index, 1);
      if (item.active) {
        this.state.currentRowItem = null;
      }
    }
  }
  onAddItem = (item)=>{
    const copy = cloneDeep(item);
    const newItem = {
      ...copy,
      name: getUuid(10)
    }
    // 系统当前组件的Name给默认值 不随机生成
    if (newItem.component.name === 'OopSystemCurrent') {
      newItem.name = item.component.props.code;
      newItem.label = item.component.props.label;
      delete newItem.component.props.label;
    }
    this.state.rowItems.push(newItem);
    this.forceUpdate()
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
      this.state.currentRowItem.initialValue = '';
      this.state.currentRowItem.component.children = [];
      this.state.currentRowItem.component.dictCatalog = value;
      // 外部数据源切换
    } else if (attr === 'dataUrl') {
      this.state.currentRowItem.initialValue = '';
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
    this.forceUpdate()
  }
  getFormConfig = ()=>{
    const {rowItems, formLayout, formTitle} = this.state;
    const form = this.oopForm.getForm();
    const fieldsValue = form.getFieldsValue();
    console.log(fieldsValue)
    // 设置默认值
    rowItems.forEach((item)=>{
      const {name, component} = item;
      const value = fieldsValue[name];
      item.initialValue = value;
      if (component.dictCatalog || component.dataUrl) {
        component.children = [];
      }
      // “系统当前” 组件 在设置表单的时候 不设置默认值
      if (component.name === 'OopSystemCurrent') {
        item.initialValue = undefined;
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
  render() {
    return (
      <div className={styles.container} id="OopFormDesigner">
        <Row gutter={16}>
          <Col span={6} >
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
          <Col span={6} >
            <EditPanel
              currentRowItem={this.state.currentRowItem}
              updateCenterPanel={this.onUpdateCenterPanel}
              onRowItemIconCopy={this.onRowItemIconCopy}
              onRowItemIconDelete={this.onRowItemIconDelete}
              onPlusClick={this.onPlusClick}
              onRowItemDrag={this.onEditPanelRowItemDrag}
              customRules={this.state.customRules}
              setCustomRules={this.setCustomRules}
            />
          </Col>
        </Row>
      </div>)
  }
}
