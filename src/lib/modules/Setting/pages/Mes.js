import React from 'react';
import { Breadcrumb, Tabs, Card, List, Select } from 'antd'
import {connect} from 'dva';
import {inject} from '../../../../framework/common/inject';
import styles from './Mes.less'

const {TabPane} = Tabs;
const {Option} = Select;
const tabChange = () => {

}
const children = (

  [<Option key="app" value="app">APP推送</Option>,
  <Option key="mail" value="mail">邮件</Option>,
  <Option key="message" value="message">短信</Option>]
)
const handleChange = () => {

}
@inject(['settingMes', 'global'])
@connect(({settingMes, global, loading}) => ({
  settingMes,
  global,
  loading: loading.models.settingMes,
  gridLoading: loading.effects['global/oopSearchResult']
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
              <List header="新消息通知">
                <List.Item>
                  <div className={styles.itemBox}>
                    <div className={styles.leftbox}>
                      <div className={styles.type}>系统通知:</div>
                      <div className={styles.des}>请选择相应的推送方式</div>
                    </div>
                    <div className={styles.rightbox}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="请选择通知方式"
                      allowClear={true}
                      onChange={handleChange}
                    >
                      {children}
                    </Select>
                    </div>
                  </div>
                </List.Item>
                <List.Item>
                  <div className={styles.itemBox}>
                    <div className={styles.leftbox}>
                      <div className={styles.type}>流程通知:</div>
                      <div className={styles.des}>请选择相应的推送方式</div>
                    </div>
                    <div className={styles.rightbox}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="请选择通知方式"
                      allowClear={true}
                      onChange={handleChange}
                    >
                      {children}
                    </Select>
                    </div>
                  </div>
                </List.Item>
                <List.Item>
                  <div className={styles.itemBox}>
                    <div className={styles.leftbox}>
                      <div className={styles.type}>其他通知:</div>
                      <div className={styles.des}>请选择相应的推送方式</div>
                    </div>
                    <div className={styles.rightbox}>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="请选择通知方式"
                      allowClear={true}
                      onChange={handleChange}
                    >
                      {children}
                    </Select>
                    </div>
                  </div>
                </List.Item>
              </List>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    )
  }
}