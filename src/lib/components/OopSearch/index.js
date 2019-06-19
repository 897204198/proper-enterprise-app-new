import React from 'react';
import {connect} from 'dva';
import { Input, Tooltip, Icon } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import Debounce from 'lodash-decorators/debounce';
import styles from './index.less';


/*  光标向前直到空格之前的字符串 */
const getCursorBackToWhitespaceValue = (element) =>{
  const { value, selectionStart } = element;
  // console.log('光标开始位置：：：：' + start)
  if (selectionStart === value.length) {
    return value.split(' ').pop();
  } else {
    const end = selectionStart;
    let i = selectionStart;
    for (; i < value.length; i--) {
      if (value[i - 1] === ' ' || i === 0) {
        break;
      }
    }
    // console.log('匹配的值:::::' + value.substring(i, end))
    return value.substring(i, end)
  }
}
/* 光标向后直到空格之前的字符串 */
const getCursorForwardWhitespaceValue = (element)=>{
  const { value, selectionStart } = element;
  if (selectionStart === value.length) {
    return '';
  } else {
    const begin = selectionStart;
    let i = selectionStart;
    for (; i < value.length; i++) {
      if (value[i] === ' ' || i === value.length) {
        break;
      }
    }
    return value.substring(begin, i)
  }
}
/* 计算页面中的文本宽度 */
const calculateLetterWidth = (letter, size)=>{
  const constant = ['并且', '或者'];
  if (constant.indexOf(letter) !== -1) {
    return 35
  }
  const span = document.createElement('span');
  span.innerText = letter
  span.style.fontSize = size
  document.body.append(span)
  const length = span.offsetWidth;
  span.remove();
  return length;
}

// const getSize = (size)=>{
//   const arr = ['default', 'small', 'middle', 'large'];
//   const index = arr.indexOf(size);
//   if (index === -1) {
//     return 'default'
//   } else if (index === 2) {
//     return 'default'
//   } else {
//     return arr[index]
//   }
// }
const filterTableList = (searchValue, tableList, columns)=>{
  const copyList = cloneDeep(tableList);
  const filter = (value, index, item)=>{
    if (!value) {
      return false
    }
    const itemName = Object.keys(item)[index];
    // 不对数据中的id、key、_开头 做过滤
    if (itemName === 'id' || itemName === 'key' || itemName.indexOf('_') === 0) {
      return false;
    }
    // 不对未在columns中设置的列过滤
    if (columns && !columns.includes(itemName)) {
      return false;
    }
    const row = item;
    const sValue = value != null ? value.toString() : '';
    const sIndex = sValue.indexOf(searchValue);
    const flag = sIndex > -1;
    if (flag) {
      // console.log(itemName, ' : ', value)
      row[itemName] = (
        <span>
            {sValue.substr(0, sIndex)}
          <span className={styles.primaryColor}>{searchValue}</span>
          {sValue.substr(sIndex + searchValue.length)}
          </span>);
    }
    return flag
  }
  const data = copyList.filter(item=>
    (
      Object.values(item).filter((value, index)=>{ return filter(value, index, item) }) // eslint-disable-line
    ).length > 0)
  return data;
}

const { Search } = Input;
const { Group } = Input;
@connect(({global, loading})=>({
  global,
  loadingSuggest: loading.effects['global/oopSearchSuggest']
}), null, null, {withRef: true})
export default class OopSearch extends React.Component {
  state={
    showDropMenu: false,
    inputValueArr: [],
    searchOptionsDesc: [],
    inputValue: '',
    defaultValue: ''
  }
  componentWillUnmount() {
    if (this.props.moduleName) {
      this.props.dispatch({
        type: 'global/clearOopSearchGrid'
      })
    }
  }
  // 获取下拉菜单
  getSearchOptions = (query)=>{
    const { dispatch, moduleName } = this.props;
    const element = this.inputOSearch.input.input;
    const matchStr = getCursorBackToWhitespaceValue(element)
    // input如果有值
    if (query) {
      if (matchStr) {
        dispatch({
          type: 'global/oopSearchSuggest',
          payload: {
            data: matchStr,
            moduleName
          }
        });
      } else {
        dispatch({
          type: 'global/saveLogicData'
        })
      }
    } else {
      dispatch({
        type: 'global/showHistory'
      })
    }
  }
  // 根据input框触发最终查询
  handleButtonClick = ()=>{
    if (this.props.moduleName === undefined && this.props.onLoad === undefined) {
      return
    }
    // 如果显示下拉 那么不请求
    if (this.state.showDropMenu) {
      return
    }
    const pagination = {
      pageNo: 1,
      pageSize: 10
    }
    if (this.props.onLoad) {
      this.props.onLoad({
        pagination
      })
    } else {
      this.load({pagination})
    }
  }
  // 下拉框点击事件
  handleOptionSelect = (event, option)=>{
    // 阻止传播 和 默认行为
    event.preventDefault()
    event.stopPropagation()
    if (!option) {
      return
    }
    // 隐藏下拉菜单
    this.setState({
      showDropMenu: false
    })
    const optionLabel = option.label;
    const { desc } = option;
    const element = this.inputOSearch.input.input;
    const str = getCursorBackToWhitespaceValue(element) + getCursorForwardWhitespaceValue(element);
    console.log('=====================:光标当前值：', str);
    const { inputValueArr, searchOptionsDesc } = this.state;
    let i = inputValueArr.length;
    inputValueArr.forEach((value, index) => {
      if (value === str) {
        i = index
      }
    });
    inputValueArr[i] = optionLabel;
    // 处理tips
    if (inputValueArr.length === searchOptionsDesc.length) {
      searchOptionsDesc[i] = {
        id: option.id,
        col: option.col || option.id,
        label: optionLabel,
        text: desc || '',
        width: `${calculateLetterWidth(optionLabel, '14px')}px`,
        operate: option.operate || 'like',
        isTips: desc
      }
    } else {
      searchOptionsDesc.push({
        id: option.id,
        col: option.col || option.id,
        label: optionLabel,
        text: desc || '',
        width: `${calculateLetterWidth(optionLabel, '14px')}px`,
        table: option.table,
        operate: option.operate || 'like',
        isTips: desc
      })
    }
    this.setState({
      inputValueArr,
      inputValue: inputValueArr.join(' '),
      searchOptionsDesc: searchOptionsDesc || []
    })
    // 清空下拉
    this.clearSearchOption()
  }
  // input框点击 事件
  inputClick = (event)=>{
    const { moduleName } = this.props;
    if (moduleName === undefined) {
      event.stopPropagation;
      event.preventDefault();
      return
    }
    const { value } = event.currentTarget;
    // const matchStr = getCursorBackToWhitespaceValue(element);
    this.inputChangeOrClick(value);
  }
  // input框改变 事件
  inputChange = (event)=>{
    const { value } = event.currentTarget;
    this.setState({
      inputValue: value || '',
      inputValueArr: value ? value.split(' ') : [],
    })
    const { searchOptionsDesc } = this.state;
    if (value && searchOptionsDesc.length - this.state.inputValueArr.length === 1) {
      searchOptionsDesc.pop();
      this.setState({
        searchOptionsDesc
      })
    }
    if (!value) {
      this.setState({
        searchOptionsDesc: []
      })
    }
    this.inputChangeOrClick(value);
  }
  @Debounce(300)
  inputChangeOrClick(inputValue) {
    const { moduleName } = this.props;
    if (moduleName === undefined) {
      this.staticRetrievalData(inputValue);
      return
    }
    this.setState({
      showDropMenu: true
    })
    this.getSearchOptions(inputValue)
  }
  // 监听按键
  inputKeyDown = (event)=>{
    const isOpen = this.state.showDropMenu;
    if (isOpen) {
      const { keyCode } = event;
      switch (keyCode) {
        case 13:
          event.preventDefault();
          event.stopPropagation();
          this.handleOptionSelect(event,
            this.props.global.searchOptions[this.getCurrentPreActive()]);
          break
        case 38:
          event.preventDefault();
          this.setPreActive(false)
          break
        case 40:
          event.preventDefault();
          this.setPreActive(true)
          break
        case 37:
          this.inputChangeOrClick();
          break
        case 39:
          this.inputChangeOrClick();
          break
        default: 100;
      }
    }
  }
  getCurrentPreActive = ()=>{
    let i = 0;
    const { searchOptions } = this.props.global;
    searchOptions.forEach((value, index) =>{
      if (value.preActive === true) {
        i = index
        return false
      }
    })
    return i
  }
  // 下拉菜单的上一个(false)和下一个(true)
  setPreActive = (flag)=>{
    const { searchOptions } = this.props.global;
    if (searchOptions.length === 0) {
      return
    }
    let currentIndex = this.getCurrentPreActive();
    let current = null;
    searchOptions[currentIndex].preActive = false;
    if (flag) {
      currentIndex++;
      if (currentIndex === searchOptions.length) {
        [current] = searchOptions;
      }
    } else {
      currentIndex--;
      if (currentIndex < 0) {
        current = searchOptions[searchOptions.length - 1]
      }
    }
    if (current === null) {
      current = searchOptions[currentIndex];
    }
    current.preActive = true;
    this.forceUpdate()
  }
  handleMaskClick = ()=>{
    this.setState({
      showDropMenu: false
    })
  }
  // 清除后台查出来的model里的数据 和UI 无关
  clearSearchOption = ()=>{
    this.props.dispatch({
      type: 'global/clearSearchData'
    })
  }
  // 清除输入框的输入信息 UI相关
  clearSearchCondition = (callback)=>{
    this.setState({
      inputValue: '',
      inputValueArr: [],
      searchOptionsDesc: []
    }, ()=>{
      callback && callback();
    })
  }
  onMouseOver = (event)=>{
    console.log(event.currentTarget)
  }
  getRepParam = ()=>{
    const param = [];
    this.state.searchOptionsDesc.forEach((sod) => {
      param.push({
        key: sod.col,
        value: sod.label,
        operate: sod.operate,
        table: sod.table
      });
    });
    return param
  }
  getRestPathParam = ()=>{
    const {restPath} = this.props;
    return restPath
  }
  load = (param = {})=>{
    const { dispatch, moduleName, param: p } = this.props;
    if (moduleName) {
      const pagination = param.pagination ||
        { pageNo: 1, pageSize: 10, ...this.props.global.oopSearchGrid.pagination};
      const params = {
        ...pagination,
        ...param,
        req: JSON.stringify(this.getRepParam()),
        restPath: JSON.stringify(this.getRestPathParam()),
        moduleName,
        ...p
      }
      dispatch({type: 'global/oopSearchResult', payload: params, callback: (resp)=>{
        if (this.props.onLoadCallback) {
          this.props.onLoadCallback(resp)
        }
      }});
    }
  }

  staticRetrievalData(inputValue) {
    this.props.onInputChange && this.props.onInputChange(inputValue, (tableList, columns)=>{
      if (tableList === undefined) {
        console.error('error: source list cannot be undefined');
        return [];
      }
      if (!columns || columns.length === 0) {
        console.error('warn: It is possible to get inaccurate filtering results if \'columns\' is not set');
      }
      return filterTableList(inputValue, tableList, columns);
    })
  }
  // 获取Search组件的长度
  getSearchCmt = (props)=>{
    let searchWith = '90%';
    if (props.extra && props.extra.props) {
      const {style = {}} = props.extra.props;
      // 默认给百分之90的宽度
      if (style.width) {
        searchWith = (100 - parseFloat(style.width)).toString().concat('%');
      }
    } else {
      searchWith = '100%';
    }
    const search = (
      <Search
        style={{width: searchWith}}
        placeholder={props.placeholder}
        enterButton={props.enterButtonText}
        ref={(el)=>{ this.inputOSearch = el }}
        defaultValue={this.state.defaultValue}
        value={this.state.inputValue}
        onSearch={this.handleButtonClick}
        onClick={this.inputClick}
        onChange={this.inputChange}
        onKeyDown={this.inputKeyDown}
        onBlur={this.inputBlur} />);
    if (props.extra) {
      return (
        <Group compact>
        {props.extra}
        {search}
      </Group>);
    } else {
      return search;
    }
  }
  renderSuggestOption = (searchOptions)=>{
    const {loadingSuggest = false} = this.props;
    const {inputValue} = this.state;
    if (loadingSuggest) {
      return (
        <li className="ant-select-dropdown-menu-item">
          <a><Icon type="loading" /></a>
        </li>);
    }
    if (inputValue && searchOptions.length === 0) {
      return (
        <li className="ant-select-dropdown-menu-item">
          <a>没有符合的数据</a>
        </li>)
    }
    return searchOptions.map((option) => {
      const {label, matchStr = ''} = option;
      const i = label.indexOf(matchStr);
      const newLabel = (
      <span className={styles.name}>
        {label.substr(0, i)}
        <span className={styles.match}>{matchStr}</span>
        {label.substr(i + matchStr.length)}
      </span>);
      return (
        <li
          className={`ant-select-dropdown-menu-item ${(option.preActive ? styles.preActive : '')}`}
          key={option.id}
          onClick={event=>this.handleOptionSelect(event, option)}>
          <a>
            {newLabel}
            <span className={styles.desc}>{ option.desc}</span>
          </a>
        </li>
      );
    });
  }
  getInputValue = () =>{
    return this.state.inputValue;
  }
  render() {
    const {global: {searchOptions}, style} = this.props;
    return (
      <div className={styles.globalSearchWrapper} style={style}>
        <div className={styles.searchContainer}>
          <div className={styles.searchTips}>
            <ul>
              { this.state.searchOptionsDesc.map(tips=>
                (
                  <li key={tips.id}>
                    <Tooltip placement="bottom" title={tips.text}>
                    <span
                      className={tips.isTips ? styles.tips : ''}
                      style={{height: '12px', display: 'inline-block', whiteSpace: 'nowrap', width: tips.width}}
                    />
                    </Tooltip>
                  </li>
                )
              )}
            </ul>
          </div>
          { this.getSearchCmt(this.props) }
          {this.state.showDropMenu && (
            <div className={styles.dropDown}>
              <ul className="ant-menu ant-menu-light ant-menu-root ant-menu-vertical">
                {this.renderSuggestOption(searchOptions)}
              </ul>
            </div>)
          }
        </div>
        {this.state.showDropMenu &&
        (
          <div className={styles.mask} onClick={this.handleMaskClick} />
        )
        }
      </div>
    );
  }
}
