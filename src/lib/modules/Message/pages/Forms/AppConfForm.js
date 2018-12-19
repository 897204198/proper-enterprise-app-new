import React from 'react';
import { Col, Collapse, Form, Input, Spin, Checkbox, Radio } from 'antd';
import classNames from 'classnames';
import styles from '../Server/Manage.less';
import OopUpload from '../../../../components/OopUpload/index'
/* eslint no-loop-func: [0] */
const FormItem = Form.Item;
const { Panel } = Collapse;
const RadioGroup = Radio.Group;
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

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};
const PackageConfForm = Form.create()((props) => {
  const {form, appBasicInfo, warningField, warningWrapper} = props;
  const pushPackageValue = appBasicInfo.huaweiConf || appBasicInfo.iosConf || appBasicInfo.xiaomiConf || {pushPackage: ''}
  const {getFieldDecorator} = form;
  return (
    <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
      <FormItem
          {...formItemLayout}
          label="包名"
          className={warningField && warningField.pushPackage && styles.hasWarning}
        >
          {getFieldDecorator('pushPackage', {
            initialValue: pushPackageValue.pushPackage,
            rules: [{
              required: true, message: '包名不能为空',
            }]
          })(
            <Input placeholder="请输入包名, 长度50个字, 不能包含中文" />
          )}
        </FormItem>
    </Form>
  )
})
const HwConfForm = Form.create()((props) => {
  const {form, appBasicInfo, warningField, warningWrapper, checkChange, checked, renderCheckbox } = props;
  const huaweiConf = appBasicInfo.huaweiConf || {appId: '', appSecret: ''}
  const {getFieldDecorator} = form;
  const checkboxProps = {
    checked,
    name: 'huaweiConf',
    headerName: '华为',
    onCheckChange: checkChange
  }
  return (
    <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
      <FormItem className={styles.appConfForm} >
          <Col span={18} offset={3}>
            <Collapse bordered={false} activeKey={checked ? ['1'] : []}>
              <Panel header={renderCheckbox(checkboxProps)} key="1" style={customPanelStyle}>
                <FormItem
                  {...formItemLayout}
                  label="APP ID"
                  extra="开发者联盟给应用分配的唯一标识,登录华为开发者联盟网站,应用服务详情界面中查找"
                  className={warningField && warningField.appId && styles.hasWarning}>
                  {
                    getFieldDecorator('appId', {
                      initialValue: huaweiConf.appId,
                      rules: [{
                        required: true, message: '请输入正确的AppId',
                      }],
                    })(
                      <Input placeholder="请输入AppId, 长度50个字, 不能包含中文" />
                    )
                  }
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label="APP Secret"
                  extra="PUSH服务端发送消息需要,登录华为开发者联盟网站,移动应用详情页面中查找"
                  className={warningField && warningField.appSecret && styles.hasWarning}>
                  {
                    getFieldDecorator('appSecret', {
                      initialValue: huaweiConf.appSecret,
                      rules: [{
                        required: true, message: '请输入正确的APP Secret',
                      }],
                    })(
                      <Input placeholder="请输入AppSecret, 长度50个字, 不能包含中文" />
                    )
                  }
                </FormItem>
              </Panel>
            </Collapse>
        </Col>
      </FormItem>
    </Form>
  )
})
const XmConfForm = Form.create()((props) => {
  const {form, appBasicInfo, warningField, warningWrapper, checkChange, checked, renderCheckbox } = props;
  const xiaomiConf = appBasicInfo.xiaomiConf || {appSecret: ''}
  const {getFieldDecorator} = form;
  const checkboxProps = {
    checked,
    name: 'xiaomiConf',
    headerName: '小米',
    onCheckChange: checkChange
  }
  return (
    <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
      <FormItem className={styles.appConfForm} >
          <Col span={18} offset={3}>
            <Collapse bordered={false} activeKey={checked ? ['1'] : []}>
              <Panel header={renderCheckbox(checkboxProps)} key="1" style={customPanelStyle}>
                <FormItem
                  {...formItemLayout}
                  label="APP Secret"
                  extra="PUSH服务端发送消息需要,登录小米开发者网站,应用详情页面中查找"
                  className={warningField && warningField.appSecret && styles.hasWarning}>
                  {
                    getFieldDecorator('appSecret', {
                      initialValue: xiaomiConf.appSecret,
                      rules: [{
                        required: true, message: '请输入正确的APP Secret',
                      }],
                    })(
                      <Input placeholder="请输入AppSecret, 长度50个字, 不能包含中文" />
                    )
                  }
                </FormItem>
              </Panel>
            </Collapse>
        </Col>
      </FormItem>
    </Form>
  )
})
const IosConfForm = Form.create()((props) => {
  const {form, appBasicInfo, warningField, warningWrapper, checkChange, fileChange, checked, renderCheckbox, uploadOption } = props;
  const iosConf = appBasicInfo.iosConf || {certPassword: '', certificateId: []}
  const { getFieldDecorator } = form;
  const checkboxProps = {
    checked,
    name: 'iosConf',
    headerName: 'IOS',
    onCheckChange: checkChange
  }
  return (
    <Form className={classNames({[styles.warningWrapper]: warningWrapper})}>
      <FormItem className={styles.appConfForm} >
          <Col span={18} offset={3}>
            <Collapse bordered={false} activeKey={checked ? ['1'] : []}>
            <Panel header={renderCheckbox(checkboxProps)} key="1" style={customPanelStyle}>
              <FormItem
                {...formItemLayout}
                label="Keystore Password"
                className={warningField && warningField.certPassword && styles.hasWarning}>
                {
                  getFieldDecorator('certPassword', {
                    initialValue: iosConf.certPassword,
                    rules: [{
                      required: true, message: '请输入正确的Password',
                    }],
                  })(
                    <Input placeholder="请输入p12证书文件密码, 长度20个字, 不能包含中文" />
                  )
                }
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="IOS证书文件"
                className={warningField && warningField.certificateId && styles.hasWarning}>
                {
                  getFieldDecorator('certificateId', {
                    initialValue: iosConf.certificateId.length !== 0 ? [{
                      id: iosConf.certificateId,
                      name: iosConf.certificateName
                    }] : '',
                    rules: [{
                      required: true, message: '请上传证书',
                    }],
                  })(
                      <OopUpload
                      listType="text"
                      onChange={fileChange}
                      maxFiles={1}
                      type={['.p12']}
                      size={200 / 1024}
                      {...uploadOption}
                    />
                  )
                }
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="推送环境"
              >
                {getFieldDecorator('pushProfile', {
                  initialValue: iosConf.pushProfile || 'PRODUCTION'
                })(
                  <RadioGroup>
                    <Radio value="DEV">开发版</Radio>
                    <Radio value="PRODUCTION">正式版</Radio>
                  </RadioGroup>
                )}
              </FormItem>
            </Panel>
          </Collapse>
        </Col>
      </FormItem>
    </Form>
  )
})
export default class AppConfForm extends React.PureComponent {
  constructor(props) {
    super(props);
    const { huaweiConf, xiaomiConf, iosConf } = this.props.appBasicInfo
    this.state = {
      checkStatus: {
        huaweiConf: huaweiConf !== null,
        xiaomiConf: xiaomiConf !== null,
        iosConf: iosConf !== null
      }
    }
    this.handleFileChange = this.handleFileChange.bind(this);
  }
  componentWillReceiveProps() {
    const { appBasicInfo } = this.props
    for (const key in appBasicInfo) {
      if (appBasicInfo[key] === null) {
        const obj = { [key]: false}
        this.setState({ checkStatus: Object.assign(this.state.checkStatus, obj)})
      }
    }
  }
  handleFileChange = (data) => {
    const { setFieldsValue } = this.iosConf
    const id = data.length === 0 ? '' : data[0].id
    setFieldsValue({
      certificateId: id
    })
  }
  handleCheckChange = (name, value) => {
    this.setState({
      checkStatus: {
        ...this.state.checkStatus,
        [name]: value
      }
    })
  }
  renderCheckbox = (props) => {
    const { headerName, name, checked } = props
    const onChange = (e) => {
      this.handleCheckChange(name, e.target.checked)
    }
    return (
      <Checkbox
        checked={checked}
        onChange={onChange}
      >
        {headerName}
      </Checkbox>
    )
  }
  getFormDatas = () => {
    const { huaweiConf, xiaomiConf, iosConf} = this.state.checkStatus
    let flag = true
    if (huaweiConf || xiaomiConf || iosConf) {
      const defaultDatas = {
        huaweiConf: null,
        xiaomiConf: null,
        iosConf: null
      }
      const newDatas = {}
      const appConfDatas = {}
      const packageValue = {}
      const packageFormValue = this.packageForm.getForm()
      packageFormValue.validateFieldsAndScroll((err, data) => {
        if (err) return
        Object.assign(packageValue, data)
      })
      for (const key in this.state.checkStatus) {
        if (this.state.checkStatus[key]) {
          const form = this[key].getForm()
          form.validateFieldsAndScroll((err, data) => {
            if (err) {
              flag = false
              return
            }
            data.pushPackage = packageValue.pushPackage || null
            if (Array.isArray(data.certificateId)) {
              data.certificateId = data.certificateId[0].id
            }
            appConfDatas[key] = data
            Object.assign(newDatas, appConfDatas)
          })
        }
      }
      if (flag) {
        return Object.assign(defaultDatas, newDatas)
      }
    }
  }
  render() {
    const { loading } = this.props;
    const { checkStatus: { huaweiConf, xiaomiConf, iosConf } } = this.state
    return (
      <Spin spinning={loading}>
        <PackageConfForm
          ref={(el) => {
            this.packageForm = el
          }}
          {...this.props} />
        <HwConfForm
          ref={(el) => {
            this.huaweiConf = el;
          }}
          checked={huaweiConf}
          renderCheckbox={this.renderCheckbox}
          {...this.props} />
        <XmConfForm
          ref={(el) => {
            this.xiaomiConf = el;
          }}
          checked={xiaomiConf}
          renderCheckbox={this.renderCheckbox}
          {...this.props} />
        <IosConfForm
          ref={(el) => {
            this.iosConf = el;
          }}
          checked={iosConf}
          renderCheckbox={this.renderCheckbox}
          fileChange={this.handleFileChange}
          {...this.props} />
      </Spin>
    );
  }
}

