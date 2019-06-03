import React from 'react';
import UIDocument from '../components/UIDocument';

export default class App extends React.Component {
  state = {}
  onSubmit = () => {
  }
  render() {
    const component = (
      <div>看下面就行</div>
    )
    const option = [
      {component, fileName: 'demo.md', title: '基本用法', desc: '基础Pupa用法'},
    ]
    return (<UIDocument name="Pupa" option={option} />)
  }
}