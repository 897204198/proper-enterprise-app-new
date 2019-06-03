import React from 'react';
import OopCollapse from '@pea/components/OopCollapse';
import UIDocument from '../components/UIDocument';

const panelList = [
  {
    header: '上班儿',
    key: '1',
    content: <p>上什么班儿</p>,
    showArrow: true
  },
  {
    header: '上学',
    key: '2',
    content: <p>上什么学</p>,
    showArrow: false,
    disabled: true
  }
]
export default class App extends React.Component {
  state = {
  }
  componentDidMount() {
  }
  onChange = (e) => {
    console.log(e)
  }
  render() {
    const component = (
      <OopCollapse panelList={panelList} horizontal={true} onChange={this.onChange} defaultActiveKey={['1']} />
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '一个简单的OopCollapse用法'}
    ]
    return (<UIDocument name="OopCollapse" option={option} />)
  }
}