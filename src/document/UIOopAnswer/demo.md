import React from 'react';
import OopAnswer from '@pea/components/OopAnswer';

export default class APP extends React.PureComponent {
  state= {}
  sendMes = (value) => {
    console.log(value)
  }
  render() {
    const mesArray = [
      {
        name: '赵四',
        time: '2018-04-01',
        mes: '时间佛甲方爱发科静安里看风景发夹',
        id: '111',
        owner: false
      },
      {
        name: '王五',
        time: '2018-04-01',
        mes: 'fajfkjafjs时间佛甲方安居客飞机咖啡机卡减肥挖康复科爱福家卡九分裤爱福家卡九分裤建安费按揭房卡减肥',
        id: '222',
        owner: true
      }
    ]
    return (
      <OopAnswer mesArray={mesArray} width="450px" height="200px" sendMes={this.sendMes} />
    )
  }
}