import React, {Fragment, PureComponent} from 'react';
import {Spin, Input, Button } from 'antd';
import {connect} from 'dva/index';
import moment from 'moment';
import DescriptionList from '@framework/components/DescriptionList';
import {inject} from '@framework/common/inject';
import styles from './index.less';

const {Description} = DescriptionList;

@inject(['OopSystemCurrent$model', 'global'])
@connect(({ OopSystemCurrent$model, global, loading }) => ({
  OopSystemCurrent$model,
  loading: loading.effects['OopSystemCurrent$model/fetch'],
  global,
}))
export default class OopSystemCurrent extends PureComponent {
  constructor(props) {
    super(props);
    const value = props.value || {};
    this.state = {
      id: value.id || null,
      text: value.text || null,
      code: value.code || null,
      edit: false
    };
  }
  componentWillReceiveProps(nextProps) {
    // console.log('state', this.state);
    // Should be a controlled component.
    // if (nextProps.code !== this.state.code) {
    //   if (nextProps.url && nextProps.OopSystemCurrent$model[nextProps.url]) {
    //     const value = nextProps.OopSystemCurrent$model[nextProps.url];
    //     const state = this.getValue(value, nextProps.showPropName, nextProps.code);
    //     this.setState({...state});
    //   }
    // }
    if (nextProps.value) {
      this.setState({...nextProps.value});
    }
  }
  componentDidMount() {
    const { url } = this.props;
    // 如果是一个code 那么不发送请求
    if (url && this.props.code !== this.state.code) {
      this.props.dispatch({
        type: 'OopSystemCurrent$model/fetch',
        payload: url,
        callback: (resp)=>{
          const {id, code, text} = this.state;
          if (id === null && code === null && text === null) {
            const state = this.getValue(resp.result, this.props.showPropName, this.props.code);
            this.triggerChange(state);
          }
        }
      })
    }
  }
  triggerChange = (changedValue) => {
    // Should provide an event to pass value to Form.
    if (this.props.onChange) {
      this.props.onChange(changedValue);
    }
  }
  renderResult = ()=>{
    const {OopSystemCurrent$model, showPropName, url, value} = this.props;
    // 如果有value从value读取值
    if (value && value.text) {
      return value.text
    }
    const entity = OopSystemCurrent$model[url];
    if (entity) {
      if (typeof showPropName === 'undefined') {
        return entity.data;
      } else {
        return entity.data[showPropName];
      }
    }
  }
  getValue = (result, showPropName, code)=>{
    if (result) {
      if (typeof showPropName === 'undefined') {
        return {id: result.id, text: result.data, code};
      } else {
        return {id: result.id, text: result.data ? result.data[showPropName] : result.id, code};
      }
    }
  }
  showText = ()=>{
    const {editable, disabled} = this.props;
    const {text, edit} = this.state;
    const result = (typeof text) === 'number' ? moment(text).format('YYYY-MM-DD HH:mm:ss') : text;
    if (disabled) {
      return result;
    }
    const confirm = ()=>{
      const {value} = this.currentComEditInput.input;
      if (!value) {
        this.setState({
          edit: false
        })
      } else {
        this.setState({
          text: value,
          edit: false
        }, ()=>{
          const state = {
            ...this.state
          }
          delete state.edit;
          this.triggerChange(state);
        })
      }
    }
    const cancel = ()=>{
      this.setState({
        edit: false
      })
    }
    const editClick = ()=>{
      this.setState({
        edit: true
      })
    }
    if (edit) {
      return (
        <div className={styles.editWrapper}>
          <Input defaultValue={text} style={{width: '208px'}} ref={ (el)=>{ this.currentComEditInput = el } } />
          <Button type="primary" onClick={confirm}>确定</Button><Button onClick={cancel}>取消</Button>
        </div>)
    }
    if (editable === true) {
      return (<div><span>{result}</span><a style={{marginLeft: 8}} onClick={editClick}>编辑</a></div>)
    }
    return result;
  }
  renderChildren = (props)=>{
    const {children} = props;
    if (children) {
      if (typeof children === 'function') {
        return children(props);
      } else {
        return children;
      }
    }
  }
  render() {
    const {global: {size}, label, loading, children} = this.props;
    const component = (
      <Spin spinning={!!loading}>
        <div className={styles.container} style={{marginTop: 0}}>
          <DescriptionList col="1" size={size} style={{width: '100%'}}>
            <div>
              <Fragment>
                <Input type="hidden" value={this.state.id} />
                <Input type="hidden" value={this.state.text} />
                <Input type="hidden" value={this.state.code} />
              </Fragment>
              <Description term={label} style={{display: 'flex', justifyContent: 'space-between'}}>{this.showText()}</Description>
            </div>
          </DescriptionList>
        </div>
      </Spin>);
    // 兼容移动端
    if (typeof children === 'function') {
      return children(component);
    }
    return component;
  }
}
