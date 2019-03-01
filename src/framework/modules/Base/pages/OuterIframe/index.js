import React, {PureComponent} from 'react';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {getParamObj} from '@framework/utils/utils';
import IframeLoader from './components/IframeLoader';

// /home/home/proxyUrl?resourceId=430bc3b2-0e73-44f0-b48a-0eedf7ac62ee&mycustdlgid=894bd2f6-f165-4ea7-9ca6-87cd84f3ee68

export default class OuterIframe extends PureComponent {
  state = {
  }
  componentWillMount() {
  }
  componentDidMount() {
  }
  onIframeLoad = (event)=>{
    console.log(event, 'IframeLoaded');
  }
  render() {
    const { location: { search } } = this.props;
    const { resourceId} = getParamObj(search);
    const { title = 'title', url = `http://172.168.1.125:8080/home/home/proxyUrl?resourceId=${resourceId}` } = {};
    return (
      <PageHeaderLayout stampe={(new Date().getTime())}>
          <IframeLoader
            onLoad={this.onIframeLoad}
            title={title}
            src={url} />
      </PageHeaderLayout>);
  }
}
