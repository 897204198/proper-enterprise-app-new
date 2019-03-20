import React, {PureComponent} from 'react';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {getParamObj} from '@framework/utils/utils';
// import {transServerUrl} from '@/config/config';
// import cookie from 'react-cookies';
import IframeLoader from './components/IframeLoader';

// /home/home/proxyUrl?resourceId=430bc3b2-0e73-44f0-b48a-0eedf7ac62ee&mycustdlgid=894bd2f6-f165-4ea7-9ca6-87cd84f3ee68

export default class OuterIframe extends PureComponent {
  state = {
  }
  token = window.localStorage.getItem('proper-auth-login-token')
  componentWillMount() {
    // cookie.remove('X-PEP-TOKEN');
    // // 在flowable的前端页面里获取表单的属性 需要的请求前缀
    // cookie.save('X-PEP-TOKEN',
    //   this.token,
    //   { path: '/'}
    // );
  }
  componentWillUnmount() {
    // cookie.remove('X-PEP-TOKEN');
  }
  onIframeLoad = (event)=>{
    console.log(event, 'IframeLoaded');
  }
  render() {
    const { location: { search } } = this.props;
    const { resourceId} = getParamObj(search);
    const { title = 'title' // ,url = `/home/home/proxyUrl?resourceId=${resourceId}&access_token=${this.token}`
    } = {};
    const url = `/iframe.html?resourceId=${resourceId}&access_token=${this.token}`;

    return (
      <PageHeaderLayout stampe={(new Date().getTime())}>
          <IframeLoader
            onLoad={this.onIframeLoad}
            title={title}
            src={url} />
      </PageHeaderLayout>);
  }
}
