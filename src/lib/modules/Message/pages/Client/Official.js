import React from 'react';
import { connect } from 'dva';
import { Card, Button, Switch, Modal, Spin, Input, Form, Radio, Icon, Collapse, Checkbox, Popover } from 'antd'
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';
import OopSearch from '../../../../components/OopSearch';
import OopTable from '../../../../components/OopTable';
import { inject } from '../../../../../framework/common/inject';
import { oopToast } from '../../../../../framework/common/oopUtils';
import styles from './Official.less';
// import ReactMarkdown from'react-markdown'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Panel } = Collapse;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const isInArray = (arr, value) => {
  if (arr.indexOf && typeof (arr.indexOf) === 'function') {
    const index = arr.indexOf(value);
    if (index >= 0) {
      return true;
    }
  }
  return false;
}
@Form.create()
@inject(['messageOfficial', 'global'])
@connect(({ messageOfficial, global, loading }) => ({
  messageOfficial,
  global,
  loading: loading.models.messageOfficial,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Official extends React.PureComponent {
  state = {
    addOrEditModalTitle: null,
    // modalVisible: false,
    isCreate: true,
    viewModalVisible: false
    // collapseName: ['push', 'mail', 'sms']
  };
  componentDidMount() {
    this.onLoad();
  }
  // 查询方法 加载所有数据
  onLoad = (param = {}) => {
    const { pagination } = param;
    const params = {
      pagination,
      ...param,
      userEnable: 'ALL'
    };
    this.oopSearch.load(params);
  };
  oopSearchCallback = () => {
    this.props.dispatch({
      type: 'messageOfficial/filterList'
    })
  }
  onCreate() {
    this.setState({
      addOrEditModalTitle: '新建',
      viewModalVisible: true,
      isCreate: true,
      push: true,
      mail: true,
      sms: true,
    });
    this.props.dispatch({
      type: 'messageOfficial/clear'
    })
  }
  batchDelete = (item) => {
    this.props.dispatch({
      type: 'messageOfficial/delInfo',
      payload: item,
      callback: (res) => {
        oopToast(res, '删除成功');
        this.onLoad();
      }
    })
  }
  onEdit = (record) => {
    this.setState({
      addOrEditModalTitle: '编辑',
      viewModalVisible: true,
      isCreate: false
    });
    this.props.dispatch({
      type: 'messageOfficial/getInfo',
      payload: record.id
    });
  }
  onDelete = (record) => {
    const ids = []
    ids.push(record.id)
    this.batchDelete(ids)
  }
  switchEnable = (value) => {
    value.enable = !value.enable
    this.props.dispatch({
      type: 'messageOfficial/putInfo',
      payload: value,
      callback: (res) => {
        oopToast(res, '启用/停用成功');
        this.onLoad();
      }
    })
  }
  handleViewModalVisible = (flag) => {
    this.setState({
      viewModalVisible: flag
    });
  };
  onSubmitForm = () => {
    const { push, mail, sms } = this.state
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const officialDetail = {}
      officialDetail.id = null
      officialDetail.enable = values.enable
      officialDetail.code = values.code
      officialDetail.name = values.name
      officialDetail.description = values.description
      officialDetail.catalog = values.catalog
      officialDetail.details = []
      officialDetail.id = values.id
      if (push) {
        const pushInfo = {}
        pushInfo.title = values.apptitle
        pushInfo.template = values.appcon
        pushInfo.type = 'push'
        officialDetail.details.push(pushInfo)
      }
      if (mail) {
        const mailInfo = {}
        mailInfo.title = values.mailtitle
        mailInfo.template = values.mailcon
        mailInfo.type = 'mail'
        officialDetail.details.push(mailInfo)
      }
      if (sms) {
        const smsInfo = {}
        smsInfo.template = values.mescon
        smsInfo.type = 'sms'
        officialDetail.details.push(smsInfo)
      }
      if (this.state.isCreate) {
        this.props.dispatch({
          type: 'messageOfficial/postInfo',
          payload: officialDetail,
          callback: (res) => {
            this.setState({
              viewModalVisible: false
            })
            oopToast(res, '保存成功')
            this.onLoad();
          }
        })
      } else {
        this.props.dispatch({
          type: 'messageOfficial/putInfo',
          payload: officialDetail,
          callback: (res) => {
            this.setState({
              viewModalVisible: false
            })
            oopToast(res, '保存成功')
            this.onLoad();
          }
        })
      }
    });
  }
  handleDelete = () => {
  }
  clearcon = () => {
  }
  panelChange = (key) => {
    const arr = ['push', 'mail', 'sms']
    for (let i = 0; i < arr.length; i++) {
      if (isInArray(key, arr[i])) {
        this.setState({
          [arr[i]]: true
        })
      } else {
        this.setState({
          [arr[i]]: false
        })
      }
    }
  }
  clearData = (...values) => {
    for (let i = 0; i < values.length; i++) {
      this.props.form.setFieldsValue(values[i])
    }
  }
  render() {
    const officialGrid = this.props.global.oopSearchGrid;
    // const gridLoading = this.props.gridLoading;
    const { editItem = {}, filterList = [] } = this.props.messageOfficial
    const { gridLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { viewModalVisible, addOrEditModalTitle, push, mail, sms} = this.state
    // const collapseName = ['push', 'mail', 'sms'];
    let pushObj = {}
    let mailObj = {}
    let smsObj = {}
    if (editItem.details) {
      for (const item of editItem.details) {
        if (item.type === 'push') {
          pushObj = Object.assign(pushObj, item)
        }
        if (item.type === 'mail') {
          mailObj = Object.assign(mailObj, item)
        }
        if (item.type === 'sms') {
          smsObj = Object.assign(smsObj, item)
        }
      }
    }
    // const collapseName = []
    // for (const item of editItem.details) {
    //   collapseName.push(item.type)
    // }
    const filterArray = []
    for (const item of filterList) {
      const child = {}
      child.text = item.name
      child.value = item.code
      filterArray.push(child)
    }
    const columns = [
      { title: '文案名称', dataIndex: 'name' },
      {
        title: '业务类别',
        dataIndex: 'catalog',
        filters: filterArray
      },
      { title: '关键字', dataIndex: 'code' },
      {
        title: '配置情况',
        dataIndex: 'set',
        render: (text, record) => {
          let pushState = false
          let mailState = false
          let smsState = false
          for (const item of record.details) {
            if (item.type === 'push') {
              pushState = true
            }
            if (item.type === 'mail') {
              mailState = true
            }
            if (item.type === 'sms') {
              smsState = true
            }
          }
          // const { app, email, mes } = text;
          return (
            <div className={styles.seticon}>
              <Popover placement="bottom" content="点击进行APP配置">
                <a onClick={() => {}}>
                  <Icon
                    type="shake"
                    className={pushState === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
              <Popover placement="bottom" content="点击进行邮件配置">
                <a onClick={() => {}}>
                  <Icon
                    type="mail"
                    className={mailState === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
              <Popover placement="bottom" content="点击进行短信配置">
                <a onClick={() => {}}>
                  <Icon
                    type="message"
                    className={smsState === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
            </div>
          );
        }
      },
      { title: '描述', dataIndex: 'description' },
      {
        title: '启/停用',
        dataIndex: 'enable',
        filters: [
          { text: '停用', value: false },
          { text: '启用', value: true }
        ],
        render: (text, record) => {
          return text ? (
            <Switch
              checkedChildren="启"
              unCheckedChildren="停"
              defaultChecked
              onChange={() => { this.switchEnable(record) }}
            />
          ) : (
              <Switch
                checkedChildren="启"
                unCheckedChildren="停"
                onChange={() => { this.switchEnable(record) }}
              />
          );
        }
      }
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: () => {
          this.onCreate();
        }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '确认删除吗？',
        onClick: (items) => {
          this.batchDelete(items);
        },
        display: items => items.length
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => {
          this.onEdit(record);
        },
        display: record => !record.superuser
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '确认删除吗？',
        onClick: (record) => {
          this.onDelete(record)
          // this.batchDelete(record);
        },
        display: record => !record.superuser
      }
    ];
    const appCheck = () => {
      return (
        <div>
          <Checkbox onClick={checkChange} checked={push} />
          <span>APP推送</span>
        </div>
      );
    };
    const mailCheck = () => {
      return (
        <div>
          <Checkbox onClick={checkChange} checked={mail} />
          <span>邮件</span>
        </div>
      );
    };
    const mesCheck = () => {
      return (
        <div>
          <Checkbox onClick={checkChange} checked={sms} />
          <span>短信</span>
        </div>
      );
    };
    const modalhead = () => {
      return (
        <span style={{ display: 'flex' }}>
          <Icon type="bars" style={{ fontSize: '22px' }} />
          <span
            style={{ fontSize: '16px', marginLeft: '8px' }}
          >{`${addOrEditModalTitle}文案信息`}</span>
        </span>
      );
    };
    const checkChange = () => {
      // e.stopPropagation();
    };
    // const clearconfirm = () => {};
    // const clearcancel = () => {};
    // const confirmIcon = () => {
    //   return (
    //     <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
    //   );
    // };
    return (
      <PageHeaderLayout
        content={
          <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            moduleName="templates"
            onLoadCallback={this.oopSearchCallback}
            ref={(el) => {
              this.oopSearch = el && el.getWrappedInstance();
            }}
          />
        }
      >
        <Card bordered={false}>
          <OopTable
            grid={officialGrid}
            columns={columns}
            loading={gridLoading}
            onLoad={this.onLoad}
            size="small"
            topButtons={topButtons}
            rowButtons={rowButtons}
            ref={(el) => {
              this.oopTable = el;
            }}
          />
        </Card>
        <Modal
          // title={`${addOrEditModalTitle}文案信息`}
          title={modalhead()}
          visible={viewModalVisible}
          destroyOnClose={true}
          width={800}
          className={styles.modalbox}
          centered
          onOk={() => this.onSubmitForm()}
          onCancel={() => this.handleViewModalVisible(false)}
        >
          <Spin spinning={false}>
            <Form>
              <div>
                {getFieldDecorator('id', {
                  initialValue: editItem.id
                })(<Input type="hidden" />)}
              </div>
              <FormItem {...formItemLayout} label="启/停用">
                {getFieldDecorator('enable', {
                  initialValue:
                  editItem.enable == null ? false : editItem.enable
                })(
                  <RadioGroup>
                    <Radio value={true}>启用</Radio>
                    <Radio value={false}>停用</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="业务类别">
                {getFieldDecorator('catalog', {
                  initialValue: editItem.catalog,
                  rules: [
                    {
                      required: true,
                      message: '业务类别不能为空'
                    }
                  ]
                })(<Input placeholder="请输入业务类别" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="文案名称">
                {getFieldDecorator('name', {
                  initialValue: editItem.name,
                  rules: [
                    {
                      required: true,
                      message: '文案名称不能为空'
                    }
                  ]
                })(<Input placeholder="请输入文案名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="关键字">
                {getFieldDecorator('code', {
                  initialValue: editItem.code,
                  rules: [
                    {
                      required: true,
                      message: '关键字不能为空'
                    }
                  ]
                })(<Input placeholder="请输入关键字" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('description', {
                  initialValue: editItem.description
                })(<TextArea rows={4} placeholder="请输入描述" />)}
              </FormItem>
              <div className={styles.collapseParent}>
                <Collapse showArrow={false} defaultActiveKey={['push', 'mail', 'sms']} onChange={this.panelChange}>
                  <Panel header={appCheck()} key="push">
                    {
                      push ? (
                        <div>
                          <FormItem {...formItemLayout} label="文案标题模板">
                            {getFieldDecorator('apptitle', {
                              initialValue: pushObj.title,
                              rules: [
                                {
                                  required: true,
                                  message: '文案标题模板不能为空'
                                }
                              ]
                            })(<Input placeholder="请输入文案标题模板" />)}
                          </FormItem>
                          <FormItem {...formItemLayout} label="文案内容模板">
                            {getFieldDecorator('appcon', {
                              initialValue: pushObj.template,
                              rules: [
                                {
                                  required: true,
                                  message: '文案内容模板不能为空'
                                }
                              ]
                            })(
                              <TextArea rows={4} placeholder="请输入文案内容模板" />
                            )}
                            <Button onClick={() => { this.clearData('apptitle', 'appcon') }}>清空内容</Button>
                          </FormItem>
                        </div>
                      ) : (
                          <div />
                        )
                    }
                  </Panel>
                  <Panel header={mailCheck()} key="mail">
                    {
                      mail ? (
                        <div>
                          <FormItem {...formItemLayout} label="文案标题模板">
                            {getFieldDecorator('mailtitle', {
                              initialValue: mailObj.title,
                              rules: [
                                {
                                  required: true,
                                  message: '文案标题模板不能为空'
                                }
                              ]
                            })(<Input placeholder="请输入文案标题模板" />)}
                          </FormItem>
                          <FormItem {...formItemLayout} label="文案内容模板">
                            {getFieldDecorator('mailcon', {
                              initialValue: mailObj.template,
                              rules: [
                                {
                                  required: true,
                                  message: '文案内容模板不能为空'
                                }
                              ]
                            })(
                              <TextArea
                                rows={4}
                                placeholder="请输入文案内容模板"
                              />
                            )}
                            <Button onClick={() => { this.clearData('mailcon', 'mailtitle') }}>清空内容</Button>
                          </FormItem>
                        </div>
                      ) : (
                          <div />
                        )
                    }
                  </Panel>
                  <Panel header={mesCheck()} key="sms">
                    {
                      sms ? (
                        <FormItem {...formItemLayout} label="文案内容模板">
                          {getFieldDecorator('mescon', {
                            initialValue: smsObj.template,
                            rules: [
                              {
                                required: true,
                                message: '文案内容模板不能为空'
                              }
                            ]
                          })(
                            <TextArea rows={4} placeholder="请输入文案内容模板" />
                          )}
                          <Button onClick={() => { this.clearData('mescon') }}>清空内容</Button>
                        </FormItem>
                      ) : (
                          <div />
                        )
                    }
                  </Panel>
                </Collapse>
              </div>
            </Form>
          </Spin>
        </Modal>
      </PageHeaderLayout>
    );
  }
}