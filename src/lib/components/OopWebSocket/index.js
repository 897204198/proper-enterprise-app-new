import React from 'react';
import SockJsClient from 'react-stomp';
import {notification} from 'antd';
import { getCurrentUser, getApplicationContextUrl } from '@framework/utils/utils';


// 获取socket的路径
const getSocketUrl = ()=>{
  const peaDynamicRequestPrefix = window.localStorage.getItem('pea_dynamic_request_prefix');
  const socketContext = '/stomp';
  const token = window.localStorage.getItem('proper-auth-login-token');
  let url = '';
  if (peaDynamicRequestPrefix) {
    // TODO 如果动态配置了 后台的地址 这块就从本地host+/pep/stomp发起ws链接 然后从 proxy配置转发
    // url = `${peaDynamicRequestPrefix}${socketContext}?access_token=${token}`; 后台跨域无法 解决 所以只能从前台做代理
    url = `${location.protocol}//${location.host}${socketContext}?access_token=${token}`;
  } else {
    url = `${getApplicationContextUrl()}${socketContext}?access_token=${token}`;
  }
  console.log(url)
  return url;
}

const getUserId = ()=>{
  const token = window.localStorage.getItem('proper-auth-login-token');
  const user = getCurrentUser(token) || {};
  return user.id
}

export default class OopWebSocket extends React.PureComponent {
  constructor(props) {
    super(props);
    const {subscribe = []} = props;
    const topicOnMessageMap = {}
    const topics = subscribe.map((s)=>{
      const key = s.topics.toString();
      topicOnMessageMap[key] = s.onMessage;
      return key;
    })
    this.state = {
      topics,
      topicOnMessageMap
    }
  }
  onConnect = ()=>{
    console.log('ws connected');
    notification.success({
      message: '系统提示',
      description: 'websocket连接成功!',
    })
  }
  onDisconnect = ()=>{
    console.log('ws disconnected');
    notification.error({
      message: '系统提示',
      description: 'websocket已经断开!',
    })
    // this.setState({
    //   topics: [],
    //   topicOnMessageMap: {}
    // })
  }
  onError = ()=>{
    console.log('onError')
  }
  onMessage = (data, topic)=>{
    const {topicOnMessageMap} = this.state;
    if (topicOnMessageMap[topic]) {
      topicOnMessageMap[topic](data);
    }
  }
  // 暴露给外部的订阅方法
  subscribe = (subscribe)=>{
    const {topics, topicOnMessageMap} = this.state;
    const map = {
      ...topicOnMessageMap
    }
    const arr = [...topics]
    subscribe.forEach((it)=> {
      const {topics: newTopics = [], onMessage: onMessage = f=>f} = it;
      const key = newTopics.toString();
      arr.push(key);
      map[key] = onMessage // 如果key相同会覆盖原来的回调行为;
    })
    this.setState({
      topics: arr,
      topicOnMessageMap: map
    })
  }
  // 解除订阅的方法
  unsubscribe = (topic)=>{
    const key = topic.toString();
    const {topics, topicOnMessageMap} = this.state;
    const index = topics.indexOf(key);
    if (index > -1) {
      const map = {
        ...topicOnMessageMap
      }
      const arr = [...topics];
      arr.splice(index, 0);
      delete map[key];
      this.setState({
        topics: arr,
        topicOnMessageMap: map
      })
    }
  }
  disconnect = ()=>{
    if (this.sockJsClientRef.state.connected === true) {
      this.sockJsClientRef.disconnect()
    }
  }
  renderPage = ()=>{
    const {topics} = this.state;
    return (
    <SockJsClient
      url={getSocketUrl()}
      topics={topics}
      onMessage={ this.onMessage }
      onConnect={ this.onConnect}
      onDisconnect={ this.onDisconnect}
      autoReconnect={true}
      onError={this.onError}
      headers={{
        PEP_STOMP_TOKEN: window.localStorage.getItem('proper-auth-login-token'),
        PEP_STOMP_USER: getUserId(),
      }}
      ref={ (client) => { this.sockJsClientRef = client }} />)
  }
  render() {
    return this.renderPage();
  }
}
