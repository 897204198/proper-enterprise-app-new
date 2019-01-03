import React, { PureComponent, Fragment } from 'react';
import {Modal, Button, Icon, Popconfirm } from 'antd';
import styles from './FormModal.less';

const { confirm } = Modal;


export default class formModal extends PureComponent {
  state = {
    activeKey: null
  }

  componentDidUpdate() {
    const containers = document.getElementsByClassName(styles.oopTabContainer);
    if (containers.length > 0) {
      this.modalbody = containers[0].parentNode;
      if (this.modalbody.getAttribute('scrollEvent') !== '1') {
        this.modalbody.addEventListener('scroll', this.handleScroll, false);
        this.modalbody.setAttribute('scrollEvent', '1');
      }
    }
  }

  handleCloseConfirmCancel = () => {
    const {closeConfirmCancel} = this.props;
    closeConfirmCancel(true);
    const activeKey = this.props.tabs.find(it => 'main' in it).key;
    this.setState({
      activeKey
    });
    const containers = document.getElementsByClassName(styles.oopTabContainer);
    const curContainer = Array.from(containers).find(item=>item.getAttribute('name') === activeKey);
    const scrollHeight = this.calculateScrollHeight(curContainer);
    this.scrollModalBody(curContainer, scrollHeight);
  }

  handleScroll = () => {
    const key = this.state.activeKey ? this.state.activeKey : this.props.tabs.find(it => 'main' in it).key;
    const activeKey = this.getCurrentAnchor(50, 0);
    if (activeKey !== key) {
      this.setState({
        activeKey
      });

      if (this.props.onTabChange) {
        if (!this.checkedBatch ||
          (this.checkedBatch && this.checkedBatch.indexOf(activeKey) === -1)) {
          this.props.onTabChange(activeKey);
          this.onBatchAnchorCheck(activeKey);
        }
      }
    }
  }

  getInitProps = ()=>{
    const { props } = this;
    const { loading, buttonType } = props;
    const onOk = ()=>{
      props.onOk && props.onOk()
    }
    // const onCancel = ()=>{
    //   props.onCancel && props.onCancel();
    // };
    const onClear = ()=>{
      props.onClear && props.onClear()
    };
    const footer = (
      <Fragment>
        <Popconfirm
          title="清除配置后所有配置信息将被清空是否确定清除？"
          icon={<Icon type="exclamation-circle" theme="outlined" style={{color: 'red'}} />}
          onConfirm={onClear}>
          {
            buttonType ? <Button style={{float: 'left'}}>{buttonType}</Button> : ''
          }
        </Popconfirm>
        <Fragment>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button type="primary" onClick={onOk} loading={loading}>保存</Button>
        </Fragment>
      </Fragment>
    )

    const _props = {
      title: 'Title',
      footer,
      tabs: [],
      destroyOnClose: true,
      ...props
    }
    return _props;
  }
  // 计算滚动的高度
  calculateScrollHeight = (currentElement)=>{
    let height = 0;
    let prevEl = currentElement.previousElementSibling;
    while (prevEl) {
      height += prevEl.offsetHeight;
      prevEl = prevEl.previousElementSibling;
    }
    return height;
  }
  // modalbody滚动到相应位置
  scrollModalBody = (currentElement, height)=>{
    const mbody = currentElement.parentNode;
    if (mbody) {
      mbody.scrollTo({top: height})
    }
  }
  onBatchAnchorCheck = (key) => {
    if (!this.checkedBatch) {
      this.checkedBatch = [];
    }
    this.checkedBatch.push(key);
  }

  handleCancel = () => {
    const self = this;
    const { closeConfirm, closeConfirmCancel, onCancel, tabs } = this.props;
    const { activeKey } = this.state;
    if (closeConfirm.visible) {
      confirm({
        title: '信息存在改动，是否关闭？',
        // content: '信息存在改动，是否关闭？',
        onOk() {
          onCancel && onCancel();
        },
        onCancel() {
          closeConfirmCancel(true);
          const {key} = tabs.find(it => Object.prototype.hasOwnProperty.call(it, 'main'));
          if (key !== activeKey) {
            self.setState({
              activeKey: key
            });
            const containers = document.getElementsByClassName(styles.oopTabContainer);
            const curContainer = Array.from(containers).find(item=>item.getAttribute('name') === key);
            const scrollHeight = self.calculateScrollHeight(curContainer);
            self.scrollModalBody(curContainer, scrollHeight);
          }
        },
      });
    } else {
      onCancel && onCancel();
    }
  }
  render() {
    const props = this.getInitProps()
    const modalStyle = {
      top: 20,
      height: 'calc(100vh - 32px)',
      overflow: 'hidden',
      borderRadius: 5
    };
    return (
        <Modal
          ref={ (el)=>{ this.formModal = el }}
          {...props}
          width={1000}
          style={modalStyle}
          className={styles.formContainer}
          destroyOnClose={true}
          onCancel={this.handleCancel}
          >
          {props.content}
        </Modal>)
  }
}
