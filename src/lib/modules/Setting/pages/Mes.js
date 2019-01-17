import React from 'react';
import { Breadcrumb, Tabs, Card, List, Select } from 'antd'
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import styles from './Mes.less'

const {TabPane} = Tabs;
const {Option} = Select;
const tabChange = () => {

}
const children = (

  [<Option key="push" value="push">APP推送</Option>,
  <Option key="email" value="email">邮件</Option>,
  <Option key="sms" value="sms">短信</Option>]
)
const ListItem = (props)=> {
  const { list, changeList } = props
  const listItems = list.map((item) => {
    return (
      <List.Item key={item.catalog}>
        <div className={styles.itemBox}>
          <div className={styles.leftbox}>
            <div className={styles.type}>{item.name}:</div>
            <div className={styles.des}>请选择相应的推送方式</div>
          </div>
          <div className={styles.rightbox}>
          <Select
            mode="multiple"
            // style={{ width: '100%' }}
            placeholder="请选择通知方式"
            allowClear={true}
            defaultValue={item.noticeChannel}
            onChange={changeList.bind(this, item)}
          >
            {children}
          </Select>
          </div>
        </div>
      </List.Item>
    )
  })
  return (
    <List header="新消息通知">
      {listItems}
    </List>
  )
}
// const handleChange = (item, value) => {
//   console.log(item)
//   console.log(value)
// }
@inject(['settingMes', 'global'])
@connect(({settingMes, global, loading}) => ({
  settingMes,
  global,
  loading: loading.models.settingMes
  // gridLoading: loading.effects['global/oopSearchResult']
}))

export default class Mes extends React.PureComponent {
  state = {}
  componentDidMount() {
    this.onLoad()
  }
  onLoad() {
    this.props.dispatch({
      type: 'settingMes/fetch'
    });
  }
  changeList = (item, value)=>{
    item.noticeChannel = value
    this.props.dispatch({
      type: 'settingMes/update',
      payload: item,
      callback(res) {
        oopToast(res, '推送方式配置成功')
      }
    })
  }
  // preLocation = ()=> {
  //   this.props.history.goBack();
  // }
  preLocation() {
    this.props.history.goBack();
  }
  render() {
    // const { sys = {}, overflow = {}, other={} } = this.props.settingMes.mesList
    return (
      <div className={styles.wrapper}>
        <Breadcrumb>
          <Breadcrumb.Item><a onClick={this.preLocation.bind(this)}>返回上级页面</a></Breadcrumb.Item>
          <Breadcrumb.Item>设置</Breadcrumb.Item>
        </Breadcrumb>
        <Card>
          <Tabs defaultActiveKey="mes" tabPosition="left" onChange={tabChange}>
            <TabPane tab="新消息通知" key="mes">
              <ListItem list={this.props.settingMes.mesList} changeList={this.changeList} />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    )
  }
}