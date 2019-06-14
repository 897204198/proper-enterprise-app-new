import React, { PureComponent } from 'react';
import { Drawer} from 'antd';
import { SearchBar, Checkbox, List } from 'antd-mobile';
import Debounce from 'lodash-decorators/debounce';
import cloneDeep from 'lodash/cloneDeep';
import styles from './CheckBoxPop.less';

const { CheckboxItem } = Checkbox;

let _selected = null;

export default class CheckBoxPop extends PureComponent {
  constructor(props) {
    super(props);
    const {data, value = []} = props;
    const selected = data.map(it=>(value.includes(it.value) ? it : null)).filter(i=>i !== null);
    this.state = {
      visible: false,
      selected,
      searchStr: ''
    }
  }
  handleDrawerVisible = (flag)=>{
    this.setState({
      visible: flag
    })
  }
  handleOk = ()=>{
    const {onChange} = this.props;
    onChange && onChange(this.state.selected.map(it=>it.value));
    this.handleDrawerVisible(false);
  }
  handleCheckboxChange = (e, value)=>{
    if (e.target.checked) {
      this.setState(({selected})=>({
        selected: [...selected, value]
      }))
    } else {
      this.setState(({selected})=>{
        const index = selected.indexOf(value);
        const newSelected = selected.slice();
        newSelected.splice(index, 1);
        return {
          selected: newSelected,
        };
      })
    }
  }
  handleSearchChange = (inputStr)=>{
    this.renderCheckboxListByFilter(inputStr);
  }
  handleClearSearch = ()=>{
    this.setState({
      searchStr: ''
    })
  }
  @Debounce(300)
  renderCheckboxListByFilter(inputStr) {
    this.setState({
      searchStr: inputStr
    })
  }
  renderHeader = ()=>{
    const {disabled, componentLabel} = this.props;
    return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between'}}>
        <span><a onClick={()=>this.cancelDrawer()}>取消</a></span>
        <span style={{fontSize: 20, fontWeight: 'bold'}}>{componentLabel}</span>
        <span>{disabled ? <a onClick={()=>this.handleDrawerVisible(false)}>确定</a> : <a onClick={()=>this.handleOk()}>完成{`(${this.state.selected.length})`}</a>}</span>
      </div>
      <div><SearchBar placeholder="输入搜索内容" onChange={this.handleSearchChange} onClear={this.handleClearSearch} /></div>
    </div>);
  }
  renderContent = (props)=>{
    const { disabled, data } = props;
    const { selected, searchStr } = this.state;
    const selectedKeys = selected.map(i=>i.value);
    if (disabled) {
      return (
        <List>
          {selected.map(it => (
            it.label.includes(searchStr) ?
              (
                <List.Item
                  key={it.value}
                >
                  {it.label}
                </List.Item>) : null
          ))}
        </List>);
    }
    const checkboxList = (
    <List>
      {data.map(it => (
        it.label.includes(searchStr) ?
        (
          <CheckboxItem
            key={it.value}
            onChange={e=> this.handleCheckboxChange(e, it)}
            defaultChecked={selectedKeys.includes(it.value)}
            checked={selectedKeys.includes(it.value)}
          >
          {it.label}
        </CheckboxItem>) : null
      ))}
    </List>);
    return checkboxList
  }
  openDrawer = ()=>{
    const {selected} = this.state;
    _selected = cloneDeep(selected);
    this.handleDrawerVisible(true);
  }
  cancelDrawer = ()=>{
    this.handleDrawerVisible(false);
    this.setState({
      selected: _selected
    }, ()=>{
      _selected = null;
    })
  }
  render() {
    const { children, placeholder = '请选择', ...otherProps } = this.props;
    const { visible, selected = []} = this.state;
    return (
      <div className={styles.container}>
        <Drawer
          visible={visible}
          placement="bottom"
          title={this.renderHeader()}
          closable={false}
          height="100%"
          className={styles.checkBoxPopContainer}
        >
          {this.renderContent(otherProps)}
        </Drawer>
        {children({onClick: ()=>this.openDrawer(), extra: selected.length ? selected.map(it=>it.label).join(',') : placeholder})}
      </div>);
  }
}
