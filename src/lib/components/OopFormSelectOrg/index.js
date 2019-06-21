import React from 'react';
import {Button} from 'antd';
import OopSelectOrg from '../OopSelectOrg';
import styles from './index.less';

export default class OopFormSelectOrg extends React.PureComponent {
  constructor(props) {
    super(props);
    const { value = [], disabled = false } = props;
    this.state = {
      selected: [...value],
      disabled,
      visibleModal: false
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value.length) {
      this.setState({
        selected: [...nextProps.value],
        disabled: nextProps.disabled
      })
    }
  }
  handleClick = () => {
    this.setState({
      visibleModal: true
    })
  }
  selectGroup = (value) => {
    if (value !== '') {
      this.setState({
        selected: value,
        visibleModal: false
      })
      const {onChange} = this.props;
      if (onChange) {
        onChange(value);
      }
    } else {
      this.setState({
        visibleModal: false
      })
    }
  }
  renderChildren = (props, extra) => {
    const {children} = props;
    if (children) {
      if (typeof children === 'function') {
        return children(extra);
      } else {
        return children;
      }
    }
    if (extra) {
      return extra
    }
  }
  render() {
    const { visibleModal, selected, disabled } = this.state
    const selectedNames = selected.map((item) => { return item.name }).join(',');

    const extra = (
      <div>
        <Button
          onClick={() => this.handleClick()}
          disabled={disabled}
          className={disabled ? styles.disabledBtn : styles.btn}
        >
          {selectedNames.length ? selectedNames : '请选择'}
        </Button>
        {
          visibleModal ? <OopSelectOrg onChange={this.selectGroup} value={selected} open={visibleModal} /> : null
        }
      </div>
    )
    return (
      this.renderChildren(this.props, extra)
    )
  }
}