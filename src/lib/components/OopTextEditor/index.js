import React, {PureComponent} from 'react';
import Debounce from 'lodash-decorators/debounce';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css'
import styles from './index.less';

export default class OopTextEditor extends PureComponent {
  constructor(props) {
    super(props);
    const { value = null } = props;
    this.state = {
      editorState: BraftEditor.createEditorState(value)
    };
  }
  componentWillReceiveProps(nextProps) {
    const { editorState } = this.state;
    if (nextProps.value && nextProps.value !== editorState.toHTML()) {
      this.setState({
        editorState: BraftEditor.createEditorState(nextProps.value)
      })
    }
  }
  handleChange = (editorState)=>{
    this.handleChangeDebounce(editorState)
  }

  @Debounce(300)
  handleChangeDebounce(editorState) {
    const htmlStr = editorState.toHTML();
    if (htmlStr !== this.state.editorState.toHTML()) {
      this.setState({
        editorState
      }, ()=>{
        const {onChange} = this.props;
        if (onChange) {
          onChange(htmlStr);
        }
      });
    }
  }
  componentWillUnmount() {
    this.handleChangeDebounce.cancel();
  }

  render() {
    const { ...otherProps } = this.props;
    const { editorState } = this.state;
    return (
      <div className={styles.oopTextEditorContainer}>
        <BraftEditor
          contentStyle={{height: 300, boxShadow: 'inset 0 1px 3px rgba(0,0,0,.1)'}}
          {
            ...otherProps
          }
          value={editorState}
          onChange={this.handleChange}
        />
      </div>
    )
  }
}
