import React, {Fragment, PureComponent} from 'react';
import {Spin, Input } from 'antd';
import {connect} from 'dva/index';
import moment from 'moment';
import DescriptionList from '../../../framework/components/DescriptionList';
import {inject} from '../../../framework/common/inject';
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
      code: value.code || null
    };
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if (nextProps.code !== this.state.code) {
      if (nextProps.url && nextProps.OopSystemCurrent$model[nextProps.url]) {
        const value = nextProps.OopSystemCurrent$model[nextProps.url];
        const state = this.getValue(value, nextProps.showPropName, nextProps.code);
        this.setState({...state});
      }
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
          const state = this.getValue(resp.result, this.props.showPropName, this.props.code);
          this.triggerChange(state);
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
  render() {
    const {global: {size}, label, loading} = this.props;
    return (
      <div className={styles.container} style={{marginTop: 0}}>
        <Spin spinning={!!loading}>
          <DescriptionList col="1" size={size}>
            <div>
              <Fragment>
                <Input type="hidden" value={this.state.id} />
                <Input type="hidden" value={this.state.text} />
                <Input type="hidden" value={this.state.code} />
              </Fragment>
              <Description term={label}>{(typeof this.state.text) === 'number' ? moment(this.state.text).format('YYYY-MM-DD HH:mm:ss') : this.state.text}</Description>
            </div>
          </DescriptionList>
        </Spin>
      </div>);
  }
}
