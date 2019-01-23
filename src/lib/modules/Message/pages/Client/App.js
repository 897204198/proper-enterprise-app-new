import React, { Fragment } from 'react';
import { Card, Row, Col, Divider, Icon, Popconfirm, Badge, Input, Button, Popover, message } from 'antd'
import {connect} from 'dva';
import {inject} from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import AppConfForm from '../Forms/AppConfForm';
import MailConfForm from '../Forms/MailConfForm';
import MessageConfForm from '../Forms/MessageConfForm';
import FormModal from '../Forms/components/FormModal';
import icon from '../../assets/icon@30x30.png'
import styles from './App.less'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16},
  },
};
const Appset = (props) => {
  const { appInfo = {} } = props;
  return (
  <div className={styles.topbox}>
    <div className={styles.leftbox}>
      <div className={styles.title}>
        <img src={icon} alt="icon" />
        <span>{appInfo.appName}</span>
      </div>
      <div className={styles.officeinfo}>
        <div>
            <Badge
              status={appInfo.enable ? 'processing' : 'default'}
              text={appInfo.enable ? '已启用' : '未启用'} />
        </div>
        <div>
          <span>应用编码:</span>
          <span className={styles.con}>{appInfo.appKey}</span>
        </div>
        <div>
          <span>token设置:</span>
          <span className={styles.con}>{subtoken(appInfo.appToken)}</span>
        </div>
      </div>
      <div className={styles.officeDes}>
        <span>描述:</span>
        <span className={styles.con}>{appInfo.appDesc}</span>
      </div>
    </div>
    {/* <div className={styles.rightbox}>
      <img src={iconBig} alt="bigicon" />
    </div> */}
  </div>
  )
}
const ClearInfo = (props) => {
  const { conf, delfun} = props
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
    <Popconfirm title={title} okText="确定" cancelText="取消" icon={confirmIcon} onConfirm={() => delfun(conf)}>
      <Icon type="close-circle" />
      <span>清除配置</span>
    </Popconfirm>
  )
}
const subtoken = (token = '') => {
  return `${token.substring(0, 5)}*********`
}
@inject(['messageApp', 'global'])
@connect(({messageApp, global, loading}) => ({
  messageApp,
  global,
  loading: loading.models.messageApp,
  gridLoading: loading.effects['global/oopSearchResult']
}))

export default class App extends React.PureComponent {
  state = {
    addOrEditModalTitle: '编辑配置',
    modalVisible: false,
    warningWrapper: false,
    warningField: {},
    tokenCode: '',
    closeConfirmConfig: {
      visible: false
    },
    action: '',
    confs: '',
    curForm: 'appConfForm', // 当前加载form
  }
  componentDidMount() {
    this.onLoad()
  }
  onLoad = ()=> {
    this.props.dispatch({
      type: 'messageApp/getToken',
      callback: (res, ret) => {
        this.props.dispatch({
          type: 'messageApp/getAppInfo',
          payload: {
            token: res,
            url: ret
          },
          callback: (response) => {
            // console.log(response)
            if (response.status === 401) {
              this.props.dispatch({
                type: 'messageApp/clearToken'
              })
              message.error('Token值错误')
            } else {
              this.props.dispatch({
                type: 'messageApp/getConf',
                payload: {
                  token: res,
                  url: ret
                }
              })
            }
          }
        });
      }
    })
  }
  onEdit = (name, url, conf) => {
    this.setState({
      modalVisible: true,
      curForm: name,
      action: url,
      confs: conf
    })
    // this.props.dispatch({
    //   type: `messageApp/${url}`,
    //   payload: record
    // });
  }
  handleAddOrEditModalCancel = () => {
    this.handleModalVisible(false)
  }
  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }
  handleSubmit = () => {
    let formData = {}
    const me = this
    if (this.form.getForm) {
      formData = this.form.getForm();
      if (formData) {
        formData.validateFieldsAndScroll((err, data) => {
          if (err) return;
          const opt = {
            data
          }
          me.submitData(opt)
        });
      }
    } else {
      formData = this.form.getFormDatas();
      if (formData) {
        const opt = {
          data: formData
        }
        me.submitData(opt)
      }
    }
  }
  submitData = (params) => {
    const { isSuccess, sUrl, appInfo} = this.props.messageApp
    if (appInfo[this.state.confs]) {
      this.props.dispatch({
        type: `messageApp/fetch${this.state.action}`,
        payload: {
          data: params.data,
          token: isSuccess,
          url: sUrl
        },
        callback: (res) => {
          oopToast(res, '修改成功')
          this.handleAddOrEditModalCancel()
          this.onLoad()
        }
      })
    } else {
      this.props.dispatch({
        type: `messageApp/add${this.state.action}`,
        payload: {
          data: params.data,
          token: isSuccess,
          url: sUrl
        },
        callback: (res) => {
          oopToast(res, '添加成功')
          this.handleAddOrEditModalCancel()
          this.onLoad()
        }
      })
    }
  }
  deleteConf = () => {
    const { isSuccess, sUrl } = this.props.messageApp
    this.props.dispatch({
      type: `messageApp/del${this.state.action}`,
      payload: {
        token: isSuccess,
        url: sUrl
      },
      callback: (res) => {
        oopToast(res, '删除成功')
        this.onLoad()
      }
    })
  }
  deleteConfig = (params) => {
    const { isSuccess, sUrl } = this.props.messageApp
    this.props.dispatch({
      type: `messageApp/del${params}`,
      payload: {
        token: isSuccess,
        url: sUrl
      },
      callback: (res) => {
        oopToast(res, '删除成功')
        this.onLoad()
      }
    })
  }
  tokenValue = (e) => {
    this.setState({
      tokenCode: e.target.value
    })
  }
  setToken = () => {
    this.props.dispatch({
      type: 'messageApp/setToken',
      payload: this.state.tokenCode,
      callback: () => {
        this.onLoad()
      }
    })
  }
  appPage() {
    // console.log(this.props.messageApp)
    const { appInfo } = this.props.messageApp
    const { pushInfo = {}, mailInfo = {}, smsInfo = {}, isSuccess } = this.props.messageApp
    const packName = {}
    if (JSON.stringify(pushInfo) !== '{}') {
      for (const item in pushInfo) {
        if (pushInfo[item]) {
          packName.name = pushInfo[item].pushPackage
        }
      }
    }
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
                    status={ appInfo.havePushConf ? 'processing' : 'default' }
                    text={ appInfo.havePushConf ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>包名:</span>
                  <span className={styles.marginLeft}>{packName.name}</span>
                </div>
                <div className={styles.setType}>
                <Col md={24} lg={14}>
                  <span>配置情况:</span>
                  <a>
                    <Icon
                      type="android"
                      theme="outlined"
                      className={ pushInfo.huaweiConf || pushInfo.xiaomiConf ? styles.marginLight : styles.marginDark} />
                  </a>
                  <a>
                    <Icon
                      type="apple"
                      theme="outlined"
                      className={ pushInfo.iosConf ? styles.marginLight : styles.marginDark} />
                  </a>
                </Col>
                <Col md={24} lg={10}>
                  <div />
                </Col>
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span onClick={() => this.onEdit('appConfForm', 'AppConf', 'havePushConf')}>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                    <ClearInfo type="app" conf="AppConf" delfun={this.deleteConfig} />
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
                    status={ appInfo.haveEmailConf ? 'processing' : 'default' }
                    text={ appInfo.haveEmailConf ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>服务地址:</span>
                  <Popover placement="topLeft" content={mailInfo.mailServerHost} arrowPointAtCenter>
                    <span className={styles.marginLeft}>
                    { typeof (mailInfo.mailServerHost) === 'string' && (mailInfo.mailServerHost).length > 5 ? `${(mailInfo.mailServerHost).substring(0, 5)}...` : mailInfo.mailServerHost}
                    </span>
                  </Popover>
                  {/* <span className={styles.marginLeft}>{mailInfo.mailServerHost}</span> */}
                </div>
                <div className={styles.setType}>
                {/* <Row gutter={24}> */}
                  <Col md={24} lg={8}>
                    <div className={styles.leftbox}>
                      <span>端口:</span>
                      <span className={styles.marginLeft}>{mailInfo.mailServerPort}</span>
                    </div>
                  </Col>
                  <Col md={24} lg={16}>
                    <div className={styles.rightbox}>
                      <span>默认发送人:</span>
                      <Popover placement="topLeft" content={mailInfo.mailServerDefaultFrom} arrowPointAtCenter>
                        <span className={styles.marginLeft}>
                        { typeof (mailInfo.mailServerDefaultFrom) === 'string' && (mailInfo.mailServerDefaultFrom).length > 5 ? `${(mailInfo.mailServerDefaultFrom).substring(0, 5)}...` : mailInfo.mailServerDefaultFrom}
                        </span>
                      </Popover>
                      {/* <span className={styles.marginLeft}>{mailInfo.mailServerDefaultFrom}</span> */}
                    </div>
                  </Col>
                {/* </Row> */}
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span onClick={() => this.onEdit('mailConfForm', 'MailConf', 'haveEmailConf')}>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                  <ClearInfo type="mail" conf="MailConf" delfun={this.deleteConfig} />
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
                    status={ appInfo.haveSMSConf ? 'processing' : 'default' }
                    text={ appInfo.haveSMSConf ? '已配置' : '未配置' } />
                </div>
                <div className={styles.des}>
                  <span>服务地址:</span>
                  <Popover placement="topLeft" content={smsInfo.smsUrl} arrowPointAtCenter>
                    <span className={styles.marginLeft}>
                    { typeof (smsInfo.smsUrl) === 'string' && (smsInfo.smsUrl).length > 15 ? `${(smsInfo.smsUrl).substring(0, 15)}...` : smsInfo.smsUrl}
                    </span>
                  </Popover>
                </div>
                <div className={styles.setType}>
                <Col md={24} lg={14}>
                  <div className={styles.leftbox}>
                    <span>管理员账号:</span>
                    <Popover placement="topLeft" content={smsInfo.userId} arrowPointAtCenter>
                      <span className={styles.marginLeft}>
                      { typeof (smsInfo.userId) === 'string' && (smsInfo.userId).length > 5 ? `${(smsInfo.userId).substring(0, 5)}...` : smsInfo.userId}
                      </span>
                    </Popover>
                    {/* <span className={styles.marginLeft}>{smsInfo.userId}</span> */}
                  </div>
                </Col>
                <Col md={24} lg={10}>
                  <div className={styles.rightbox}>
                    <span>字符集:</span>
                    <Popover placement="topLeft" content={smsInfo.smsCharset} arrowPointAtCenter>
                      <span className={styles.marginLeft}>
                      { typeof (smsInfo.smsCharset) === 'string' && (smsInfo.smsCharset).length > 4 ? `${(smsInfo.smsCharset).substring(0, 4)}...` : smsInfo.smsCharset}
                      </span>
                    </Popover>
                    {/* <span className={styles.marginLeft}>{smsInfo.smsCharset}</span> */}
                  </div>
                </Col>
                </div>
                <div className={styles.footerSet}>
                  <div className={styles.footItem}>
                    <Icon type="edit" />
                    <span onClick={() => this.onEdit('messageConfForm', 'SmsConf', 'haveSMSConf')}>编辑配置</span>
                  </div>
                  <Divider type="vertical" className={styles.divider} />
                  <div className={styles.footItem}>
                    <ClearInfo type="message" conf="SmsConf" delfun={this.deleteConfig} />
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
              <Input placeholder="请输入Token值" className={styles.tokenInput} onChange={this.tokenValue} />
              <Button type="primary" block className={styles.tokenButton} onClick={this.setToken}>确认</Button>
            </Card>
          </div>
        </PageHeaderLayout>
      )
    }
  }
  render() {
    const { addOrEditModalTitle, modalVisible, curForm, warningWrapper, warningField, closeConfirmConfig } = this.state
    const { pushInfo = {}, mailInfo = {}, smsInfo = {}, loading, isSuccess, sUrl } = this.props.messageApp
    const upObj = {
      action: `${sUrl}/notice/server/config/file?access_token=${isSuccess}`,
      downloadUrl: sUrl,
      downloadToken: isSuccess
    }
    const forms = {
      appConfForm: {
        key: 'appConf',
        content: <AppConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={false}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={pushInfo}
          warningField={warningField}
          loading={!!loading}
          uploadOption={upObj}
          downloadToken={isSuccess}
          conductValuesChange={this.handleUserInfoFormChange} />
      },
      mailConfForm: {
        key: 'mailConf',
        content: <MailConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={false}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={mailInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      },
      messageConfForm: {
        key: 'messageConf',
        content: <MessageConfForm
          ref={(el) => {
            if (el) this.form = el;
          }}
          isCreate={false}
          warningWrapper={warningWrapper}
          formItemLayout={formItemLayout}
          appBasicInfo={smsInfo}
          warningField={warningField}
          loading={!!loading}
          conductValuesChange={this.handleUserInfoFormChange} />
      }
    }
    return (
      <Fragment>
        {this.appPage()}
        <FormModal
          title={addOrEditModalTitle}
          visible={modalVisible}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={() => this.handleSubmit()}
          onDelete={this.handleDelete}
          onCheck={this.handleCheck}
          onClear={this.deleteConf}
          isCreate={false}
          loading={!!loading}
          buttonType="清空配置"
          content={forms[curForm].content}
        />
      </Fragment>
    )
  }
}
