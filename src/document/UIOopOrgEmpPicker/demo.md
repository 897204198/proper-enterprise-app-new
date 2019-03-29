import React from 'react';
import OopOrgEmpPicker from '@pea/components/OopOrgEmpPicker/index';

const data = [
  {
    id: 1,
    name: '张三',
    disabled: true // 设置disabled属性为true，当前人员为选中状态，不可取消
  },
  {
    id: 2,
    name: '李四'
  }
]
export default class App extends React.Component {
  state = {}
  render() {
    return (<OopOrgEmpPicker value={data} />)
  }
}