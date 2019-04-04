/**
 *  OuterIframe组件 为icmp中的2.5功能提供支撑
 *  1.支持自定义页面作为嵌入的html
 *  2.支持直接传入地址 例如 http://www.baidu.com
 */
import React, {PureComponent} from 'react';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {htmlWebpackPlugin} from '@/config/config';
import IframeLoader from './components/IframeLoader';

const hwp = htmlWebpackPlugin ? htmlWebpackPlugin.find(it=>it.outerIframe) : null;

export default class OuterIframe extends PureComponent {
  state = {
  }
  componentWillMount() {
  }
  componentWillUnmount() {
  }
  onIframeLoad = ()=>{
    console.log('IframeLoaded');
  }
  render() {
    const { location: { search }, title = '', name = '' } = this.props;
    let url = search;
    if (hwp && hwp.filename) {
      url = `${hwp.filename}${search}`;
    } else {
      url = decodeURIComponent(url.replace('?', ''))
    }
    return (
      <PageHeaderLayout stampe={(new Date().getTime())}>
          <IframeLoader
            name={name}
            onLoad={this.onIframeLoad}
            title={title}
            src={url} />
      </PageHeaderLayout>);
  }
}
