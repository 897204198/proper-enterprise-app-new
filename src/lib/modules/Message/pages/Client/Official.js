import React, { Fragment } from 'react';
import {connect} from 'dva';
import { Card, Button, Switch, Modal, Spin, Input, Form, Radio, Icon, Popover, Collapse, Checkbox, Popconfirm} from 'antd'
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';
import OopSearch from '../../../../components/OopSearch';
import OopTable from '../../../../components/OopTable';
// import OopModal from '../../../../components/OopModal';
import {inject} from '../../../../../framework/common/inject';
import styles from './Official.less';
// import ReactMarkdown from'react-markdown'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Panel } = Collapse;
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
    viewModalVisible: false
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
  batchDelete() {
    console.log(this);
  }
  onEdit(record) {
    console.log(record)
    this.setState({
      addOrEditModalTitle: '编辑',
      viewModalVisible: true
    });
  }
  onDelete(record) {
    console.log(record, this)
  }
  switch(checked) {
    console.log(checked, this)
  }
  handleViewModalVisible = (flag) => {
    this.setState({
      viewModalVisible: flag
    });
  };
  clearcon() {
    console.log(this)
  }
  render() {
    const officialGrid = this.props.global.oopSearchGrid;
    // const gridLoading = this.props.gridLoading;
    const { gridLoading } = this.props;
    // console.log(this.props)
    const { getFieldDecorator } = this.props.form;
    const { viewModalVisible, addOrEditModalTitle } = this.state;
    const userBasicInfo = {};
    const columns = [
      { title: '文案名称', dataIndex: 'name' },
      {
        title: '业务类别',
        dataIndex: 'type',
        filters: [
          { text: '消息', value: 'Joe' },
          { text: '通知', value: 'Jim' }
        ]
      },
      { title: '关键字', dataIndex: 'keyboards' },
      {
        title: '配置情况',
        dataIndex: 'set',
        render: (text) => {
          const { app, email, mes } = text;
          return (
            <div className={styles.seticon}>
              <Popover placement="bottom" content="点击进行APP配置">
                <a onClick={() => {}}>
                  <Icon
                    type="shake"
                    className={app === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
              <Popover placement="bottom" content="点击进行邮件配置">
                <a onClick={() => {}}>
                  <Icon
                    type="mail"
                    className={email === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
              <Popover placement="bottom" content="点击进行短信配置">
                <a onClick={() => {}}>
                  <Icon
                    type="message"
                    className={mes === false ? styles.grayicon : null}
                  />
                </a>
              </Popover>
            </div>
          );
        }
      },
      { title: '描述', dataIndex: 'des' },
      {
        title: '启/停用',
        dataIndex: 'switch',
        filters: [
          { text: '停用', value: 'Joe' },
          { text: '启用', value: 'Jim' }
        ],
        render: (text) => {
          return text ? (
            <Switch
              checkedChildren="启"
              unCheckedChildren="停"
              defaultChecked
              onChange={this.switch}
            />
          ) : (
              <Switch
                checkedChildren="启"
                unCheckedChildren="停"
                onChange={this.switch}
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
          <Checkbox onClick={checkChange} />
          <span>APP推送</span>
        </div>
      );
    };
    const mailCheck = () => {
      return (
        <div>
          <Checkbox onClick={checkChange} />
          <span>邮件</span>
        </div>
      );
    };
    const mesCheck = () => {
      return (
        <div>
          <Checkbox onClick={checkChange} />
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
    const checkChange = (e) => {
      e.stopPropagation();
    };
    const clearconfirm = () => {};
    const clearcancel = () => {};
    const confirmIcon = () => {
      return (
        <Icon type="close-circle" theme="filled" style={{ color: 'red' }} />
      );
    };
    return (
      <PageHeaderLayout
        content={
          <OopSearch
            placeholder="请输入"
            enterButtonText="搜索"
            moduleName="officialSearch"
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
          style={{ top: 20 }}
          width={800}
          centered
          onOk={() => this.handleViewModalVisible(false)}
          onCancel={() => this.handleViewModalVisible(false)}
        >
          <Spin spinning={false}>
            <Form>
              <div>
                {getFieldDecorator('id', {
                  initialValue: userBasicInfo.id
                })(<Input type="hidden" />)}
              </div>
              <FormItem {...formItemLayout} label="启/停用">
                {getFieldDecorator('enable', {
                  initialValue:
                    userBasicInfo.enable == null ? true : userBasicInfo.enable
                })(
                  <RadioGroup>
                    <Radio value={true}>启用</Radio>
                    <Radio value={false}>停用</Radio>
                  </RadioGroup>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="业务类别">
                {getFieldDecorator('type', {
                  initialValue: userBasicInfo.username,
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
                  initialValue: userBasicInfo.name,
                  rules: [
                    {
                      required: true,
                      message: '文案名称不能为空'
                    }
                  ]
                })(<Input placeholder="请输入文案名称" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="关键字">
                {getFieldDecorator('keyboards', {
                  initialValue: userBasicInfo.password,
                  rules: [
                    {
                      required: true,
                      message: '关键字不能为空'
                    }
                  ]
                })(<Input type="password" placeholder="请输入关键字" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('des', {
                  initialValue: userBasicInfo.password
                })(<TextArea rows={4} placeholder="请输入描述" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="文案标题模板">
                {getFieldDecorator('title', {
                  initialValue: userBasicInfo.email,
                  rules: [
                    {
                      required: true,
                      message: '文案标题模板不能为空'
                    }
                  ]
                })(<Input placeholder="请输入文案标题模板" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="文案内容模板">
                {getFieldDecorator('content', {
                  initialValue: userBasicInfo.phone,
                  rules: [
                    {
                      required: true,
                      message: '文案内容模板不能为空'
                    }
                  ]
                })(
                  <div className="a">
                    <TextArea rows={4} placeholder="请输入文案内容模板" />
                    {/* <Button onClick={this.clearcon()}>清空内容</Button> */}
                    <Popconfirm
                      title="清空内容将清空当前的文案标题及内容，是否确定清空？"
                      onConfirm={clearconfirm}
                      onCancel={clearcancel}
                      okText="确定"
                      cancelText="取消"
                      icon={confirmIcon()}
                    >
                      <Button>清空内容</Button>
                    </Popconfirm>
                  </div>
                )}
              </FormItem>
              <div className={styles.collapseParent}>
                <Collapse showArrow={false} defaultActiveKey={['1', '2', '3']}>
                  <Panel header={appCheck()} key="1">
                    <FormItem {...formItemLayout} label="文案标题模板">
                      {getFieldDecorator('apptitle', {
                        initialValue: userBasicInfo.email,
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
                        initialValue: userBasicInfo.phone,
                        rules: [
                          {
                            required: true,
                            message: '文案内容模板不能为空'
                          }
                        ]
                      })(
                        <Fragment>
                          <TextArea rows={4} placeholder="请输入文案内容模板" />
                          <Button>清空内容</Button>
                        </Fragment>
                      )}
                    </FormItem>
                  </Panel>
                  <Panel header={mailCheck()} key="2">
                    <FormItem {...formItemLayout} label="文案标题模板">
                      {getFieldDecorator('mailtitle', {
                        initialValue: userBasicInfo.email,
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
                        initialValue: userBasicInfo.phone,
                        rules: [
                          {
                            required: true,
                            message: '文案内容模板不能为空'
                          }
                        ]
                      })(
                        <div className={styles.mailbox}>
                          <div className={styles.clearfix}>
                            <TextArea
                              rows={4}
                              placeholder="请输入文案内容模板"
                            />
                            <div className={styles.markdown}>
                              {/* <ReactMarkdown source='# Proper-enterprise-app'/> */}
                            </div>
                          </div>
                          <Button>清空内容</Button>
                        </div>
                      )}
                    </FormItem>
                  </Panel>
                  <Panel header={mesCheck()} key="3">
                    <FormItem {...formItemLayout} label="文案内容模板">
                      {getFieldDecorator('mescon', {
                        initialValue: userBasicInfo.phone,
                        rules: [
                          {
                            required: true,
                            message: '文案内容模板不能为空'
                          }
                        ]
                      })(
                        <Fragment>
                          <TextArea rows={4} placeholder="请输入文案内容模板" />
                          <Button>清空内容</Button>
                        </Fragment>
                      )}
                    </FormItem>
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