import React from 'react';
import Markdown from 'react-markdown';

const {decodeURIComponent, escape, atob} = window;

export default class UIDocDetails extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      source: props.source
    }
  }
  componentDidMount() {
    const {name} = this.props;
    import(`@/lib/components/${name}/index.md`).then((res)=>{
      const markdownBase64 = res.substring(res.indexOf('base64,') + 7, res.length);
      const source = decodeURIComponent(escape(atob(markdownBase64)));
      this.setState({
        source
      })
    })
  }

  render() {
    const {source} = this.state;
    return (
      <div>
        <Markdown source={source} />
      </div>)
  }
}
