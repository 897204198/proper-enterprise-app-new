import React from 'react';
import OopSearch from '@pea/components/OopSearch';

export default  class App extends React.Component {
  filterSome = () => {
   console.log('some change');
  }
  render() {
    return (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            onInputChange={this.filterSome}
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    );
  }
}
