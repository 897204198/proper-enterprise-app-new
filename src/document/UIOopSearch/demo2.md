import React from 'react';
import OopSearch from '@pea/components/OopSearch';

export default  class App extends React.Component {
  mySearch = () => {
    console.log('这里写自定义的搜索接口');
  }
  render() {
    return (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            onLoad={this.mySearch}
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    );
  }
}
