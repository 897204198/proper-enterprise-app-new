import React from 'react';
import { Select } from 'antd';
import OopSearch from '@pea/components/OopSearch';

const { Option } = Select;

export default  class App extends React.Component {
  changeSearchType = (value) => {
   console.log(value);
  }
  oopSearchCallback = () => {
    console.log('默认load方法的回调函数');
  }
  render() {
    return (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            moduleName="authusergroups"
            onLoadCallback={this.oopSearchCallback}
            extra={
                <Select
                    defaultValue="all"
                    style={{ width: '10%' }}
                    onSelect={value => this.changeSearchType(value)} >
                    <Option value="all">全部</Option>
                    <Option value="checked">已绑定</Option>
                    <Option value="unchecked">未绑定</Option>
                </Select>
            }
            ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
        />
    );
  }
}
