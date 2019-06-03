import React, {Fragment} from 'react';
import {Icon, Tooltip, message} from 'antd';
import {Controlled as CodeMirror} from 'react-codemirror2';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import styles from './UIDocDemoCode.less';

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
require('codemirror/mode/javascript/javascript.js');

export default class UIDocDemoCode extends React.PureComponent {
  state = {
    showCode: false,
    collapse: false,
    demoCode: ''
  }
  renderCode = ()=>{
    const {demoCode} = this.state;
    if (demoCode) {
      return (
        <div style={{position: 'relative'}}>
          <CodeMirror
            ref={ (el)=>{ this.codeMirror = el }}
            value={demoCode}
            options={{
              mode: {name: 'javascript', json: true},
              matchBrackets: true,
              lineWrapping: false,
              theme: 'material',
              readOnly: true,
              lineNumbers: true
            }}
          />
          <CopyToClipboard text={demoCode} onCopy={this.handleCopyCode}>
            <Tooltip placement="top" title="Copy Code">
            <span className={styles.codeOption}>
              <Icon type="copy" />
            </span>
            </Tooltip>
          </CopyToClipboard>
        </div>
      );
    } else {
      const {name, fileName} = this.props;
      import(`../UI${name}/${fileName}`).then((res)=>{
        const markdownBase64 = res.substring(res.indexOf('base64,') + 7, res.length);
        const source = decodeURIComponent(escape(atob(markdownBase64)));
        console.log(source);
        this.setState({
          demoCode: source
        })
      })
      return null;
    }
  }
  handleShowCode = ()=>{
    this.setState(({showCode})=>({
      showCode: !showCode
    }))
  }
  handleCopyCode = ()=>{
    message.success('代码复制成功!');
  }
  handleToggleCollapse = () =>{
    this.setState(({collapse})=>({
      collapse: !collapse
    }))
  }
  render() {
    const {title, desc, component = Fragment, width = '100%'} = this.props;
    const {showCode, collapse} = this.state;
    return (
      <div className={styles.container}>
        { collapse ? <div style={{borderTop: '1px dashed #ddd'}} /> :
          (
            <div className={styles.wrapper}>
              <div className={styles.componentwrapper} style={{width}}>
                {component}
              </div>
              <div className={styles.tools}>
                <span className={styles.title}>{title}</span>
                <div><p>{desc}</p></div>
                <span className={styles.toggleCode} onClick={this.handleShowCode}>
                {
                  showCode ? <Tooltip placement="top" title="Hide Code"><Icon type="eye-invisible" theme="twoTone" /></Tooltip>
                    : <Tooltip placement="top" title="Show Code"><Icon type="eye" theme="twoTone" /></Tooltip>
                }
                </span>
              </div>
              <div>
              {
                showCode ? this.renderCode() : null
              }
            </div>
            </div>)
        }
        <span className={styles.collapse} onClick={this.handleToggleCollapse}>
          <span style={{marginRight: 4, fontSize: 14}}>{title}</span>{collapse ? <Icon type="down" /> : <Icon type="up" /> }
        </span>
      </div>)
  }
}
