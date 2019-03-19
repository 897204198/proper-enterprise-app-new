import React from 'react';
import {Card} from 'antd';
import Markdown from 'react-markdown';


export default class OopTable extends React.PureComponent {
  state = {
    markdown: null
  }
  componentDidMount() {
    const {pathname} = this.props.location;
    const {routerData} = this.props;
    const {name} = routerData[pathname];
    console.log(name);
    import(`@/lib/components/${name}/index.md`).then((res)=>{
      const markdownBase64 = res.substring(res.indexOf('base64,') + 7, res.length);
      const source = decodeURIComponent(escape(atob(markdownBase64)));
      console.log(source);
      this.setState({
        markdown: source
      })
    })
  }

  render() {
    return <Card><Markdown source={this.state.markdown} /></Card>
  }
}
