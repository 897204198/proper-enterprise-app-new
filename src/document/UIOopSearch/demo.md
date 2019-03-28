import React from 'react';
import OopSearch from '@pea/components/OopSearch';

export default class App extends React.Component {
    
  render() {
  
    return (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            moduleName="authusergroups"
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    );
  }
}