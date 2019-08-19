import React from 'react';
import {Card} from 'antd';
import Markdown from 'react-markdown';


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      source: props.source
    }
  }
  componentDidMount() {
    // const {name} = this.props;
    import('./advance.md').then((res)=>{
      const markdownBase64 = res.substring(res.indexOf('base64,') + 7, res.length);
      const source = decodeURIComponent(escape(atob(markdownBase64)));
      this.setState({
        source
      })
    })
  }

  render() {
    const {source} = this.state;
    const component = (
      <Card><Markdown source={source} /></Card>
    )
    return component;
  }
}
