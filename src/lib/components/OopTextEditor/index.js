import React, { Component } from 'react';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css'
import styles from './index.less';

export default class OopTextEditor extends Component {
  constructor(props) {
    super(props);
    const { value = null } = props;
    this.state = {
      value
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.value !== this.state.value) {
      this.setState({
        value: nextProps.value
      })
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.value !== nextState.value;
  }

  handleChange = (value)=>{
    const htmlStr = value.toHTML();
    this.setState({
      value: htmlStr
    })
    const {onChange} = this.props;
    if (onChange) {
      onChange(htmlStr);
    }
  }
  render() {
    const { ...otherProps } = this.props;
    const { value } = this.state;
    return (
        <BraftEditor
          contentStyle={{height: 300, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.1)'}}
          {
            ...otherProps
          }
          className={styles.oopTextEditorContainer}
          value={BraftEditor.createEditorState(value)}
          onChange={this.handleChange}

        />
    )
  }
}
