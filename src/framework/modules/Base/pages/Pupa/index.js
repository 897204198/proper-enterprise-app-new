/**
 * @desc Pupa是一个提供“能够在页面上配置出一套增删改查及其他简单业务功能实现”的功能
 *  此页面只负责根据路由配置的code进行功能配置的查询
 *  CommonPage 提供对配置的解析
 */
import React from 'react';
import {connect} from 'dva';
import {Input, Spin, Tooltip, Popover, message} from 'antd';
import {routerRedux} from 'dva/router';
import {getParamObj} from '@framework/utils/utils';
import { getMenuData } from '@framework/common/frameHelper';
import styles from '@framework/index/index.less';
import CommonPage from './components/CommonPage';

const checkComponentName = ['Select', 'RadioGroup', 'CheckboxGroup',
  'OopSystemCurrent', 'DatePicker', 'OopDict',
  'OopGroupUserPicker', 'OopOrgEmpPicker', 'OopOrgPicker'];
const isReactObject = (component)=>{
  return component && component.$$typeof && component.$$typeof.toString() === 'Symbol(react.element)'
}


@connect(({ global}) => ({
  global,
}))
export default class Pupa extends React.PureComponent {
  state = {
    code: undefined,
    pageConfig: undefined
  }
  isFetching = false
  componentDidMount() {
    const {location: {pathname, search}} = this.props;
    // check auth
    if (getMenuData().map(it=>it.path).includes(`${pathname}${search}`)) {
      const {code} = getParamObj(search);
      this.init(code);
    } else {
      this.props.dispatch(routerRedux.push('/404'));
    }
  }
  componentWillReceiveProps(nextProps) {
    const {location: {search}} = nextProps;
    const {code} = getParamObj(search);
    if (code !== this.state.code) {
      this.init(code);
    }
  }
  init = (code)=>{
    if (code) {
      if (this.isFetching === false) {
        this.isFetching = true;
        this.props.dispatch({
          type: 'basePageCfg/fetchPageCfgByCode',
          payload: code,
          callback: (config)=>{
            this.isFetching = false;
            if (config) {
              if (config.enable === false) {
                message.error('该功能已停用');
                return
              }
              this.setState({
                code,
                pageConfig: config
              })
            } else {
              message.error('查询不到配置');
              this.setState({
                code,
                pageConfig: undefined
              })
            }
          }
        })
      }
    }
  }
  notifyCommonPageRender = (record)=>{
    this.commonPage.onView(record)
  }
  convertProperties = (props)=>{
    const {gridConfig: {columns = [], rowButtons = [], topButtons = [], props: tableProps = {}}, formConfig: {formJson = []}} = props;
    // 为表单 添加 ID
    if (formJson.length) {
      if (formJson.find(it=>it.name === 'id') === undefined) {
        formJson.unshift({name: 'id', component: ()=><Input type="hidden" />, wrapper: true})
      }
    }
    try {
      if (columns.length) {
        const cols = columns.filter(it=>it.enable === true);
        cols.forEach((it)=>{
          if (it.enable === true) {
            const formItem = formJson.find(item=>item.name === it.dataIndex);
            if (formItem && formItem.component) {
              if (checkComponentName.includes(formItem.component.name)) {
                it.dataIndex = `${it.dataIndex}_text`
              }
            }
            if (it.sorter === true) {
              it.sorter = (a, b) => {
                return a - b
              }
            } else if (it.sorter === false) {
              it.sorter = f=>f
            } else if (it.sorter === 'custom' && typeof it.sorterRule === 'string') {
              try {
                const fn = eval(it.sorterRule); // eslint-disable-line
                it.sorter = (a, b)=>{
                  return fn(a, b);
                }
              } catch (e) {
                message.error(`${it.dataIndex}列排序配置错误：${e.message}`);
                it.sorter = f=>f;
              }
            }
            if (it.render) {
              if (typeof it.render === 'string') {
                // it.dataIndex = `${it.dataIndex}_text`;
                try {
                  const fn = eval(it.render); // eslint-disable-line
                  it.render = (items, record)=>{
                    if (isReactObject(items)) {
                      return items;
                    }
                    try {
                      const rr = fn(items, record);
                      if (rr.includes('<')) {
                        return <span dangerouslySetInnerHTML={{__html: rr}} />;
                      }
                      return rr;
                    } catch (e) {
                      return <Tooltip placement="bottom" title={e.message}><span style={{color: 'red'}}>渲染异常</span></Tooltip>
                    }
                  }
                } catch (e) {
                  it.render = ()=>{
                    return <Tooltip placement="bottom" title={e.message}><span style={{color: 'red'}}>渲染异常</span></Tooltip>
                  }
                }
              }
            } else {
              it.render = (text)=> {
                if (text) {
                  if (isReactObject(text)) {
                    return text;
                  } else {
                    const string = text.toString();
                    if (it.hover) {
                      const style = {
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        width: `${it.width}px`
                      }
                      return (<Popover content={<div style={{whiteSpace: 'pre'}}>{string}</div>} trigger="hover">
                        <div style={style}>{string}</div>
                      </Popover>);
                    }
                    return string
                  }
                }
              }
            }
          }
        })
        const firstCol = cols[0];
        if (firstCol) {
          const {render: oldRender} = firstCol;
          firstCol.render = (text, record)=>{
            const value = oldRender ? oldRender(text, record) : text;
            return <div onClick={() => { this.notifyCommonPageRender(record) }} style={{textDecoration: 'underline', cursor: 'pointer'}}>{value}</div>;
          }
        }
        props.gridConfig.columns = cols;
      }
      if (rowButtons.length) {
        rowButtons.forEach((it)=>{
          if (it.display && typeof it.display === 'string') {
            it.display = eval(it.display); // eslint-disable-line
          }
        })
      }
      if (topButtons.length) {
        topButtons.forEach((it)=>{
          if (it.display && typeof it.display === 'string') {
            it.display = eval(it.display); // eslint-disable-line
          }
        })
      }
      const {tableInfoExtra} = tableProps;
      if (tableInfoExtra) {
        if (typeof tableInfoExtra === 'string') {
          tableProps.tableInfoExtra = eval(tableInfoExtra); // eslint-disable-line
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  renderPage = ()=>{
    const {pageConfig} = this.state;
    if (pageConfig === undefined || this.isFetching) {
      return <Spin size="large" className={styles.globalSpin} />;
    } else {
      if (pageConfig.gridConfig === undefined) { // eslint-disable-line
        message.error('gridConfig未配置');
        return <Spin size="large" className={styles.globalSpin} />;
      } else {
        this.convertProperties(pageConfig);
        console.log('pageConfig', pageConfig)
        return <CommonPage {...pageConfig} ref={(el)=>{ this.commonPage = el && el.getWrappedInstance() }} />
      }
    }
  }
  render() {
    return this.renderPage()
  }
}
