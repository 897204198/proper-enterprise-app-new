import React from 'react';
import { connect } from 'dva';
import { Card, Button, Switch, Modal, Spin, Input, Form, Radio, Icon, Collapse, Checkbox } from 'antd'
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
    // list: [],
    push: true,
    mail: true,
    sms: true,
    viewModalVisible: false,
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
  onCreate() {
    this.setState({
      addOrEditModalTitle: '新建',
      viewModalVisible: true
    });
  }
  batchDelete = () => {

  }
  onEdit() {
    this.setState({
      addOrEditModalTitle: '编辑',
      viewModalVisible: true
    });
  }
  onDelete = () => {
  }
  switchEnable = (value) => {
    this.props.dispatch({
      type: 'messageOfficial/putInfo',
      payload: value,
      callback: (res) => {
        oopToast(res, '保存成功');
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
      this.props.dispatch({
        type: 'messageOfficial/putInfo',
        payload: officialDetail,
        callback: (res) => {
          this.setState({
            viewModalVisible: false
          })
          oopToast(res, '推送方式配置成功')
        }
      })
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
    const { gridLoading } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { viewModalVisible, addOrEditModalTitle, push, mail, sms } = this.state;
    const officialInfo = {};
    const columns = [
      { title: '文案名称', dataIndex: 'name' },
      {
        title: '业务类别',
        dataIndex: 'catalog',
        filters: [
          { text: '消息', value: 'Joe' },
          { text: '通知', value: 'Jim' }
        ]
      },
      { title: '关键字', dataIndex: 'code' },
      {
        title: '配置情况',
        dataIndex: 'set',
        render: () => {
          // const { app, email, mes } = text;
          // return (
          //   <div className={styles.seticon}>
          //     <Popover placement="bottom" content="点击进行APP配置">
          //       <a onClick={() => {}}>
          //         <Icon
          //           type="shake"
          //           className={app === false ? styles.grayicon : null}
          //         />
          //       </a>
          //     </Popover>
          //     <Popover placement="bottom" content="点击进行邮件配置">
          //       <a onClick={() => {}}>
          //         <Icon
          //           type="mail"
          //           className={email === false ? styles.grayicon : null}
          //         />
          //       </a>
          //     </Popover>
          //     <Popover placement="bottom" content="点击进行短信配置">
          //       <a onClick={() => {}}>
          //         <Icon
          //           type="message"
          //           className={mes === false ? styles.grayicon : null}
          //         />
          //       </a>
          //     </Popover>
          //   </div>
          // );
        }
      },
      { title: '描述', dataIndex: 'description' },
      {
        title: '启/停用',
        dataIndex: 'enable',
        filters: [
          { text: '停用', value: 'Joe' },
          { text: '启用', value: 'Jim' }
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
                onChange={this.switchEnable}
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
          this.onDelete(record);
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
            onLoad={this.refresh}
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
                  initialValue: officialInfo.id
                })(<Input type="hidden" />)}
              </div>
              <FormItem {...formItemLayout} label="启/停用">
                {getFieldDecorator('enable', {
                  initialValue:
                    officialInfo.enable == null ? true : officialInfo.enable
                })(
                  <RadioGroup>
                    <Radio value={true}>启用</Radio>
                    <Radio value={false}>停用</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="业务类别">
                {getFieldDecorator('catalog', {
                  initialValue: officialInfo.catalog,
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
                  initialValue: officialInfo.name,
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
                  initialValue: officialInfo.code,
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
                  initialValue: officialInfo.description
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
                              initialValue: officialInfo.apptitle,
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
                              initialValue: officialInfo.appcon,
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
                              initialValue: officialInfo.mailtitle,
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
                              initialValue: officialInfo.mailcon,
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
                            initialValue: officialInfo.mescon,
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