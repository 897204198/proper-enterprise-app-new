import React from 'react';
import OopSearch from '@pea/components/OopSearch';
import { Select } from 'antd';
import UIDocument from '../components/UIDocument';

const { Option } = Select;

export default class OopSearchUIDOC extends React.PureComponent {
  changeSearchType = (value) => {
    console.log(value);
  }
  filterSome = () => {
    console.log('some change');
  }
  mySearch = () => {
    console.log('这里写自定义的搜索接口');
  }
  oopSearchCallback = () => {
    console.log('默认load方法的回调函数');
  }
  render() {
    /*
        配置统一的搜索接口
     */
    const component = (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            moduleName="authusergroups"
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    )
    /*
        配置自定义的搜索接口
     */
    const component2 = (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            onLoad={this.mySearch}
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    )
    /*
        实现静态搜索
     */
    const component3 = (
        <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            onInputChange={this.filterSome}
            ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
    )
    /*
        扩展搜索框和回调
     */
    const component4 = (
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
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '一个简单的OopSearch用法'},
      {component: component2, fileName: 'demo2.md', title: '基本用法2', desc: '一个简单的OopSearch配置搜索接口'},
      {component: component3, fileName: 'demo3.md', title: '基本用法3', desc: '一个简单的OopSearch实现静态搜索的用法'},
      {component: component4, fileName: 'demo4.md', title: '高级用法', desc: '一个高级的OopSearch用法'},
    ]
    return (<UIDocument name="OopSearch" option={option} />)
  }
}
