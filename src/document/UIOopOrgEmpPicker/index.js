import React from 'react';
import OopOrgEmpPicker from '@pea/components/OopOrgEmpPicker/index';
import UIDocument from '../components/UIDocument';

const data = [
  {
    id: 1,
    name: '张三',
    disabled: true
  },
  {
    id: 2,
    name: '李四'
  }
]
export default class App extends React.Component {
  state = {}
  render() {
    const component = (
      <OopOrgEmpPicker value={data} />
    )
    const component2 = (
      <OopOrgEmpPicker multiple={false} />
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: 'OopOrgEmpPicker多选(默认)'},
      {component: component2, fileName: 'demo2.md', title: '基本用法', desc: 'OopOrgEmpPicker单选'},
    ]
    return (<UIDocument name="OopOrgEmpPicker" option={option} />)
  }
}