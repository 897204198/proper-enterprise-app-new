import React from 'react';
import OopUpload from '@pea/components/OopUpload/index';

export default class App extends React.Component {
  state = {}
  render() {
    return (
      <OopUpload
        dragable={true}
        wrapperStyles={{marginBottom: '20px'}}
        ref={(up) => { this.OopUpload = up }}
        >
        <div style={{margin: '20px auto', fontSize: '20px'}}>
          拖拽文件至此上传
        </div>
      </OopUpload>
    )
  }
}