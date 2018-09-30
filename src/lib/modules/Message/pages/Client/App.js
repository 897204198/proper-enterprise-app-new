import React, { Fragment } from 'react';
import { Card, Row, Col, Divider, Icon, Popconfirm, Badge, Input, Button } from 'antd'
import {connect} from 'dva';
import {inject} from '../../../../../framework/common/inject';
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';
import icon from '../../../../../assets/icon.png'
import iconBig from '../../../../../assets/iconBig.png'
import styles from './App.less'

const Appset = (props) => {
  const { appInfo = {} } = props;
  return (
  <div className={styles.topbox}>
    <div className={styles.leftbox}>
      <div className={styles.title}>
        <img src={icon} alt="icon" />
        <span>掌上协同办公</span>
      </div>
      <div className={styles.officeinfo}>
        <div>
            <Badge
              status={appInfo.able ? 'processing' : 'default'}
              text={appInfo.able ? '已启用' : '未启用'} />
        </div>
        <div>
          <span>应用编码:</span>
          <span className={styles.con}>{appInfo.code}</span>
        </div>
        <div>
          <span>token设置:</span>
          <span className={styles.con}>{appInfo.token}</span>
        </div>
      </div>
      <div className={styles.officeDes}>
        <span>描述:</span>
        <span className={styles.con}>{appInfo.des}</span>
      </div>
    </div>
    <div className={styles.rightbox}>
      <img src={iconBig} alt="bigicon" />
    </div>
  </div>
  )
}
const ClearInfo = () => {
  const title = (
    <div>
      <div>清除配置后所有配置信息将</div>
      <div>被清空是否确定清除？</div>
    </div>
  )
  const confirmIcon = (
    <Icon
      type="close-circle"
      theme="filled"
      style={{ color: 'red' }}
    />
  )
  return (
    <Popconfirm title={title} okText="确定" cancelText="取消" icon={confirmIcon}>
      <Icon type="close-circle" />
      <span>清除配置</span>
    </Popconfirm>
  )
}
@inject(['messageApp', 'global'])
@connect(({messageApp, global, loading}) => ({
  messageApp,
  global,
  loading: loading.models.messageApp,
  gridLoading: loading.effects['global/oopSearchResult']
}))

export default class App extends React.PureComponent {
  state = {}
  componentDidMount() {
    this.onLoad()
  }
  onLoad = ()=> {
    this.props.dispatch({
      type: 'messageApp/fetch'
    });
  }
  appPage() {
    // console.log(this.props.messageApp)
    const { appInfo } = this.props.messageApp
    const { appInfo: {app = {}, mail = {}, message = {}, isSuccess} } = this.props.messageApp
    if (isSuccess) {
      return (
        <PageHeaderLayout content={<Appset appInfo = {appInfo} />}>
          <div className={styles.cardbox}>
        <Row gutter={24}>
          <Col span={8}>
            <Card className={styles.card}>
              <div className={styles.typeItem}>
                <div className={styles.itemtop}>
                  <a>
                    <Icon type="shake" />
                  </a>
                  <span>APP推送</span>
                </div>
                <div className={styles.setInfo}>
                  <Badge
                    status={ app.able ? 'processing' : 'default' }
                    text={ app.able ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>包名:</span>
                  <span className={styles.marginLeft}>{app.name}</span>
                </div>
                <div className={styles.setType}>
                  <span>配置情况:</span>
                  <Icon
                    type="android"
                    theme="outlined"
                    className={ app.and ? styles.marginLight : styles.marginDark} />
                  <Icon
                    type="apple"
                    theme="outlined"
                    className={ app.ios ? styles.marginLight : styles.marginDark} />
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                    <ClearInfo type="app" />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.card}>
              <div className={styles.typeItem}>
                <div className={styles.itemtop}>
                  <a>
                    <Icon type="mail" />
                  </a>
                  <span>邮件</span>
                </div>
                <div className={styles.setInfo}>
                  <Badge
                    status={ mail.able ? 'processing' : 'default' }
                    text={ mail.able ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>服务地址:</span>
                  <span className={styles.marginLeft}>{mail.adr}</span>
                </div>
                <div className={styles.setType}>
                  <div className={styles.leftbox}>
                    <span>端口:</span>
                    <span className={styles.marginLeft}>{mail.port}</span>
                  </div>
                  <div className={styles.rightbox}>
                    <span>默认发送人:</span>
                    <span className={styles.marginLeft}>{mail.sender}</span>
                  </div>
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                  <ClearInfo type="mail" />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card className={styles.card}>
              <div className={styles.typeItem}>
                <div className={styles.itemtop}>
                  <a>
                    <Icon type="message" />
                  </a>
                  <span>短信</span>
                </div>
                <div className={styles.setInfo}>
                  <Badge
                    status={ message.able ? 'processing' : 'default' }
                    text={ message.able ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>服务地址:</span>
                  <span className={styles.marginLeft}>{message.adr}</span>
                </div>
                <div className={styles.setType}>
                  <div className={styles.leftbox}>
                    <span>管理员账号:</span>
                    <span className={styles.marginLeft}>{message.account}</span>
                  </div>
                  <div className={styles.rightbox}>
                    <span>字符集:</span>
                    <span className={styles.marginLeft}>{message.code}</span>
                  </div>
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                    <ClearInfo type="message" />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        </div>
        </PageHeaderLayout>
      )
    } else {
      return (
        <PageHeaderLayout>
          <div className={styles.tokenCard}>
            <Card>
              <div className={styles.tokenTitle}>Token设置</div>
              <Input placeholder="请输入Token值" className={styles.tokenInput} />
              <Button type="primary" block className={styles.tokenButton}>确认</Button>
            </Card>
          </div>
        </PageHeaderLayout>
      )
    }
  }
  render() {
    return (
      <Fragment>
        {this.appPage()}
      </Fragment>
    )
  }
}
