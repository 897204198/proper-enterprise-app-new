import React, {PureComponent} from 'react';
import {Spin} from 'antd';

// /home/home/proxyUrl?resourceId=430bc3b2-0e73-44f0-b48a-0eedf7ac62ee&mycustdlgid=894bd2f6-f165-4ea7-9ca6-87cd84f3ee68
const defaultStyle = {
  height: 'calc(100vh - 88px)',
  width: '100%',
  overflowX: 'hidden',
  overflowY: 'auto',
  border: 0,
  margin: 0,
  padding: 0
}

export default class IframeLoader extends PureComponent {
  constructor(props) {
    super(props);
    const { src, loading = true} = this.props;
    this.state = {
      src,
      loading
    }
  }
  componentWillMount() {
  }
  componentDidMount() {
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.src !== this.state.src) {
      this.setState({
        src: nextProps.src,
        loading: true
      })
    }
  }
  onIframeLoad = (event)=>{
    this.setState({
      loading: false
    });
    this.props.onLoad && this.props.onLoad(event);
  }
  onIframeError = (event)=>{
    console.log(event)
  }
  render() {
    const { title, name, style } = this.props;
    const { src } = this.state;
    return (
      <Spin spinning={this.state.loading}>
        <iframe
          style={{
            ...defaultStyle,
            ...style
          }}
          name={name}
          onLoad={this.onIframeLoad}
          onError={this.onIframeError}
          title={title}
          src={src} />
      </Spin>);
  }
}
