import React, {createElement, PureComponent} from 'react';
import {Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider, Tooltip, Breadcrumb} from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import groupBy from 'lodash/groupBy';
import Debounce from 'lodash-decorators/debounce';
import { Link } from 'dva/router';
import { getApplicationContextUrl } from '@framework/utils/utils';
import { getMenuData } from '@framework/common/frameHelper';
import NoticeIcon from '../NoticeIcon';
import HeaderSearch from '../HeaderSearch';
import styles from './index.less';

const { Header } = Layout;
const specialPaths = ['/outerIframe', '/pupa'];

export default class GlobalHeader extends PureComponent {
  static contextTypes = {
    routes: PropTypes.array,
    params: PropTypes.object,
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };
  getBreadcrumbProps = () => {
    return {
      routes: this.props.routes || this.context.routes,
      params: this.props.params || this.context.params,
      routerLocation: this.props.location || this.context.location,
      breadcrumbNameMap: this.props.breadcrumbNameMap || this.context.breadcrumbNameMap,
    };
  };
  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = ({
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        })[newNotice.status];
        newNotice.extra = <Tag color={color} style={{ marginRight: 0 }}>{newNotice.extra}</Tag>;
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  }
  getAvatar = (avatar) => {
    if (!avatar) {
      return <Avatar size="small" className={styles.avatar} icon="user" />
    }
    const tokenFix = window.localStorage.getItem('proper-auth-login-token');
    const src = (avatar.indexOf('http') === 0 || avatar.indexOf('data:image/') === 0) ?
      avatar : `${getApplicationContextUrl()}/file/${avatar}?access_token=${tokenFix}`;
    return <Avatar size="small" className={styles.avatar} src={src} />;
  }
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  /**
   * 用menuData实现的Breadcrumb
   * @param routerLocation
   * @param breadcrumbNameMap
   * @returns {*}
   */
  conversionFromLocation = (routerLocation, breadcrumbNameMap) => {
    if (!routerLocation && !breadcrumbNameMap) {
      return null;
    }
    const extraBreadcrumbItems = [];
    const { linkElement = 'a' } = this.props;
    // Add crumbs from the first order menu
    const menuData = getMenuData();
    if (menuData.length) {
      const {pathname, search} = routerLocation;
      let path = pathname;
      if (specialPaths.includes(path)) {
        path = `${path}${search}`;
      }
      const menu = menuData.find((item) => {
        if (item.route === path) {
          return item;
        }
        return null;
      })
      if (menu) {
        // 最后一级
        extraBreadcrumbItems.unshift(
          <Breadcrumb.Item key="parent">
            {createElement('span', {to: '/' }, menu.name)}
          </Breadcrumb.Item>
        );
        let {parentId} = menu;
        while (parentId) {
          const menuParent = menuData.find((item) => { // eslint-disable-line
            if (item.id === parentId) {
              return item
            }
            return null;
          });
          if (menuParent) {
            // 倒数第二级
            extraBreadcrumbItems.unshift(
              <Breadcrumb.Item key="parent">
                {createElement('span', {to: '/' }, menuParent.name)}
              </Breadcrumb.Item>
            );
            const {parentId: pid} = menuParent;
            parentId = pid;
          } else {
            parentId = null;
          }
        }
      }
    }
    // 第一级根节点
    extraBreadcrumbItems.unshift(
      <Breadcrumb.Item key="home">
        {createElement(linkElement, {
          href: '#/' }, '首页')}
      </Breadcrumb.Item>
    );
    return (
      <Breadcrumb className={styles.breadcrumb}>
        {extraBreadcrumbItems}
      </Breadcrumb>
    );
  }
  renderBreadcrumb = ()=>{
    const { routerLocation, breadcrumbNameMap } = this.getBreadcrumbProps();
    if (routerLocation && routerLocation.pathname) {
      return this.conversionFromLocation(routerLocation, breadcrumbNameMap);
    }
  }
  render() {
    const {
      currentUser, collapsed, fetchingNotices, isMobile, logo,
      onNoticeVisibleChange, onMenuClick, onNoticeClear, onMainClick, onMsgClick
    } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
        <Menu.Item key="personalCenter"><Icon type="user" />个人中心</Menu.Item>
        <Menu.Item key="setting"><Icon type="setting" />设置</Menu.Item>
        {/* <Menu.Item key="triggerError"><Icon type="close-circle" />触发报错</Menu.Item> */}
        <Menu.Divider />
        <Menu.Item key="logout"><Icon type="logout" />退出登录</Menu.Item>
      </Menu>
    );
    const noticeData = this.getNoticeData();
    return (
      <Header className={styles.header}>
        {isMobile && (
          [
            (
              <Link to="/" className={styles.logo} key="logo">
                <img src={logo} alt="logo" width="32" />
              </Link>
            ),
            <Divider type="vertical" key="line" />,
          ]
        )}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div style={{display: 'inline-block'}}>
          {
            this.renderBreadcrumb()
          }
        </div>
        <div className={styles.right}>
          <HeaderSearch
            style={{display: 'none'}}
            className={`${styles.action} ${styles.search}`}
            placeholder="站内搜索"
            dataSource={['搜索提示一', '搜索提示二', '搜索提示三']}
            onSearch={(value) => {
              console.log('input', value); // eslint-disable-line
            }}
            onPressEnter={(value) => {
              console.log('enter', value); // eslint-disable-line
            }}
          />
          <div className={styles.action} onClick={onMainClick}>
            <Icon type="home" />
          </div>
          <div className={styles.action} onClick={onMsgClick} style={{display: 'inline-block'}}>
            <Tooltip title="webIM">
              <Icon type="message" theme="outlined" />
            </Tooltip>
          </div>
          <NoticeIcon
            className={styles.action}
            count={currentUser ? currentUser.notifyCount : 0}
            onItemClick={(item, tabProps) => {
              console.log(item, tabProps); // eslint-disable-line
            }}
            onClear={onNoticeClear}
            onPopupVisibleChange={onNoticeVisibleChange}
            loading={fetchingNotices}
            popupAlign={{ offset: [20, -16] }}
          >
            <NoticeIcon.Tab
              list={noticeData['通知']}
              title="通知"
              emptyText="你已查看所有通知"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['消息']}
              title="消息"
              emptyText="您已读完所有消息"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/sAuJeJzSKbUmHfBQRzmZ.svg"
            />
            <NoticeIcon.Tab
              list={noticeData['待办']}
              title="待办"
              emptyText="你已完成所有待办"
              emptyImage="https://gw.alipayobjects.com/zos/rmsportal/HsIsxMZiWKrNUavQUXqx.svg"
            />
          </NoticeIcon>
          {currentUser ? (currentUser.name ? (
            <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                {this.getAvatar(currentUser.avatar)}
                <span className={styles.name}>{currentUser.name}</span>
              </span>
            </Dropdown>
          ) : <Spin size="small" style={{ marginLeft: 8 }} />) : ''}
        </div>
      </Header>
    );
  }
}
