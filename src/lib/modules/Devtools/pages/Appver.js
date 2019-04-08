import React from 'react';
import { connect } from 'dva';
import { Card, Form, Modal, Spin, Input, Button, List, Icon, Popconfirm, Tooltip, Badge, Popover, Tabs, Radio } from 'antd';
import QRCode from 'qrcode.react';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import styles from './Appver.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TabPane } = Tabs;
const RadioGroup = Radio.Group;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const CreateForm = Form.create()((props) => {
  const { form, formVisible, loading, closeForm, submitForm, submitAndPublish,
    verInfo, handleRemove } = props;

  // 取消
  const handleCancel = () => {
    closeForm(form);
  }

  const handleDelte = () => {
    handleRemove(verInfo);
  }

  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      submitForm(form, fieldsValue);
    });
  };

  const okAndPublish = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      submitAndPublish(form, fieldsValue);
    });
  }

  return (
    <Modal
      width={650}
      visible={formVisible}
      onCancel={handleCancel}
      destroyOnClose={true}
      title="APP版本信息管理"
      footer={
        <div>
          {
            verInfo.ver ? (
              <Popconfirm
                title="您确定要删除吗？"
                onConfirm={handleDelte}>
                <Button style={{float: 'left'}}>删除</Button>
              </Popconfirm>
            ) : null
          }
          <Button onClick={handleCancel}>取消</Button>
          <Button
            type="primary"
            onClick={okHandle}>
            保存
          </Button>
          {
            !verInfo.ver ? (
              <Button
                type="primary"
                onClick={okAndPublish}>
                保存并发布
              </Button>
            ) : null
          }
        </div>
      }
    >
      <Spin spinning={loading}>
        <Form>
          <div>
            {form.getFieldDecorator('id', {
              initialValue: verInfo.id,
            })(
              <Input type="hidden" />
            )}
          </div>
          <FormItem
            {...formItemLayout}
            label="版本号"
          >
            {form.getFieldDecorator('ver', {
              initialValue: verInfo.ver,
              rules: [
                { required: true, message: '版本号不能为空' },
                { pattern: /^[0-9]*$/, message: '版本号只能为数字'}
              ],
            })(
              <Input placeholder="请输入版本号" disabled={verInfo.ver != null} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="android下载链接"
          >
            {form.getFieldDecorator('androidUrl', {
              initialValue: verInfo.androidUrl,
              rules: [
                { required: true, message: '下载链接不能为空' },
                { pattern: /^http:\/\/|https:\/\/[A-Za-z0-9]+.[A-Za-z0-9]+[=?%\-&_~`@[\]':+!]*([^<>""])*$/, message: 'url地址格式不正确'}
              ],
            })(
              <Input placeholder="请输入android下载链接" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="ios下载链接"
          >
            {form.getFieldDecorator('iosUrl', {
              initialValue: verInfo.iosUrl,
            })(
              <Input placeholder="请输入ios下载链接" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="版本内容"
          >
            {form.getFieldDecorator('note', {
              initialValue: verInfo.note,
              rules: [{ required: true, message: '版本内容不能为空' }],
            })(
              <TextArea placeholder="请输入版本内容" autosize={{ minRows: 4, maxRows: 8 }} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="强制更新"
          >
            {form.getFieldDecorator('forceUpdate', {
              initialValue: verInfo.forceUpdate || false,
            })(
              <RadioGroup>
                <Radio value={true}>启用</Radio>
                <Radio value={false}>停用</Radio>
              </RadioGroup>
            )}
          </FormItem>
        </Form>
      </Spin>
    </Modal>
  );
});

@inject(['devtoolsAppver', 'global'])
@connect(({ devtoolsAppver, global, loading }) => ({
  devtoolsAppver,
  global,
  loading: loading.models.devtoolsAppver,
}))
export default class Appver extends React.Component {
  state = {
    lastedVer: '',
    // 是否显示form表单
    formVisible: false,
    list: []
  }

  componentDidMount() {
    this.refresh();
    this.getLastedVer();
  }

  getLastedVer = () => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsAppver/getLastedVer',
      callback: (res) => {
        self.setState({
          lastedVer: res.ver
        })
      }
    })
  }

  refresh = () => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsAppver/fetch',
      callback: (res)=>{
        self.setState({
          list: res
        })
      }
    })
  }

  // 删除单项
  handleRemove = (ids) => {
    let idsArray = [];
    if (ids instanceof Array) {
      idsArray = ids;
    } else {
      idsArray.push(ids.ver);
    }
    this.props.dispatch({
      type: 'devtoolsAppver/remove',
      payload: { ver: idsArray.toString() },
      callback: (res) => {
        oopToast(res, '删除成功');
        this.getLastedVer();
        this.refresh();
      }
    });
  }

  // 发布
  handlePublish = (record) => {
    this.props.dispatch({
      type: 'devtoolsAppver/publish',
      payload: {
        ver: record.ver
      },
      callback: (res) => {
        oopToast(res, '发布成功');
        this.refresh();
        this.getLastedVer();
      }
    });
  }

  // 新建功能
  handleCreate = (flag) => {
    this.setState({
      formVisible: flag
    });
  }

  // 编辑功能
  handleEdit = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsAppver/fetchByVer',
      payload: record.ver,
      callback(res) {
        self.props.dispatch({
          type: 'devtoolsAppver/saveVerInfo',
          payload: res
        });
        self.setState({
          formVisible: true,
        });
      }
    });
  }

  // 关闭form
  closeForm = (form) => {
    this.setState({
      formVisible: false
    });
    setTimeout(() => {
      form.resetFields();
      this.props.dispatch({
        type: 'devtoolsAppver/clear'
      });
    }, 300);
  }

  // 保存并发布
  submitAndPublish = (form, fields) => {
    const self = this;
    const params = fields;
    this.props.dispatch({
      type: 'devtoolsAppver/publish',
      payload: params,
      callback: (res) => {
        oopToast(res, '保存并发布成功');
        self.refresh();
        this.getLastedVer();
        self.closeForm(form);
      }
    });
  }

  // 提交form
  submitForm = (form, fields) => {
    const self = this;
    const params = fields;
    this.props.dispatch({
      type: 'devtoolsAppver/createOrUpdate',
      payload: params,
      callback: (res) => {
        oopToast(res, '保存成功');
        self.refresh();
        this.getLastedVer();
        self.closeForm(form);
      }
    });
  }
  // show qrcode
  showQrCode = (item)=>{
    return (
      <Tabs defaultActiveKey="1" size="small" style={{width: 200}}>
        <TabPane tab={<span><Icon type="apple" />苹果</span>} key="1" style={{display: 'flex', justifyContent: 'center'}}>
          {item.iosUrl ? <QRCode value={item.iosUrl} /> : null}
        </TabPane>
        <TabPane tab={<span><Icon type="android" />安卓</span>} key="2" style={{display: 'flex', justifyContent: 'center'}} forceRender={true}>
          {item.androidUrl ? <QRCode value={item.androidUrl} /> : null}
        </TabPane>
      </Tabs>
    );
  }
  render() {
    const { loading,
      global: { size },
      devtoolsAppver: { verInfo } } = this.props;

    const { lastedVer, formVisible, list } = this.state;

    return (
      <PageHeaderLayout content={
        <div>
          <Button type="primary" icon="plus" size={size} onClick={() => this.handleCreate(true)}>
            新建
          </Button>
        </div>
      }>
        <Card bordered={false}>
          <List
            loading={loading}
            split={false}
            dataSource={list}
            className={styles.appverList}
            pagination={{
              pageSize: 5,
            }}
            renderItem={item => (
              <List.Item key={item.id}>
                <div className={styles.listContentItem}>
                  <div className={styles.listContentItemLeft}>
                    <div className={lastedVer === item.ver ? styles.activeDot : styles.dot} />
                    <p className={lastedVer === item.ver ? styles.activeListP : styles.listP}>
                      {lastedVer === item.ver ? <Badge status="processing" /> : <span />}
                      <Icon type="tag-o" /><span>{item.ver}</span>
                    </p>
                    {(item.released && (item.publisher || item.publishTime)) ? (
                      <p className={lastedVer === item.ver ? styles.activeListP : styles.listP}>
                        {item.publisher} {item.publishTime}
                      </p>
                    ) : null}
                    <p className={styles.listP}>
                      {
                        (item.released != null && !item.released) ? (
                          <Popconfirm
                            title="您确定进行此次版本发布吗？"
                            onConfirm={() => this.handlePublish(item)}>
                            <Tooltip placement="bottom" title="发布">
                              <a>
                                <Icon type="cloud-upload-o" />
                              </a>
                            </Tooltip>
                          </Popconfirm>
                        ) : null
                      }
                      <Tooltip placement="bottom" title="编辑">
                        <a style={{margin: '0 10px'}}>
                          <Icon onClick={() => this.handleEdit(item)} type="edit" />
                        </a>
                      </Tooltip>
                      <Popconfirm
                        title="您确定要删除吗？"
                        onConfirm={() => this.handleRemove(item)}>
                        <Tooltip placement="bottom" title="删除">
                          <a>
                            <Icon type="delete" />
                          </a>
                        </Tooltip>
                      </Popconfirm>
                    </p>
                  </div>
                  <div className={styles.listContentItemRight}>
                    <p className={styles.listPTitle}>
                      v{item.ver}
                    </p>
                    <div className={styles.listDiv}>
                      <div className={styles.listDivLeft}><Icon type="apple-o" /><a href={item.iosUrl} target="_blank" rel="noopener noreferrer" >下载链接</a></div>
                      <div className={styles.listDivLeft}><Icon type="android-o" /><a href={item.androidUrl} target="_blank" rel="noopener noreferrer" >下载链接</a></div>
                      <div className={styles.listDivLeft}>
                        <Popover
                          content={this.showQrCode(item)}
                          title="手机扫描二维码"
                          getPopupContainer={triggerNode=>triggerNode.parentNode}
                        >
                          <Icon type="qrcode" />
                          <a>二维码</a>
                        </Popover>
                      </div>
                    </div>
                    <div className={styles.listDiv} style={{marginBottom: '32px'}}>
                      <div className={styles.listDivLeft}>更新内容</div>
                      <div
                        className={styles.wordBreak}
                        dangerouslySetInnerHTML={{ __html: item.note }} />
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
        <CreateForm
          formVisible={formVisible}
          loading={!!loading}
          closeForm={this.closeForm}
          submitForm={this.submitForm}
          submitAndPublish={this.submitAndPublish}
          handleRemove={this.handleRemove}
          verInfo={verInfo}
        />
      </PageHeaderLayout>
    );
  }
}
