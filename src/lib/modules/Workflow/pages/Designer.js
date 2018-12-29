import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Card, Icon, Badge, List, Tooltip, Checkbox, Dropdown,
  Menu, Upload, Modal, Popconfirm, Form, Input, message } from 'antd';
import cookie from 'react-cookies'
import { inject } from '@framework/common/inject';
import { getApplicationContextUrl } from '@framework/utils/utils';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import Ellipsis from '@framework/components/Ellipsis';
import {prefix} from '@/config/config';
import styles from './Designer.less';

const FormItem = Form.Item;
const { TextArea } = Input;
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

const CreateForm = Form.create()((props) => {
  const { form } = props;

  return (
    <Form>
      <FormItem
        {...formItemLayout}
        label="名称"
      >
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: '名称不能为空' }],
        })(
          <Input placeholder="请输入名称" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="关键字"
      >
        {form.getFieldDecorator('key', {
          rules: [
            { required: true, message: '关键字不能为空' }
          ],
        })(
          <Input placeholder="请输入关键字" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="描述"
      >
        {form.getFieldDecorator('description', {
        })(
          <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
        )}
      </FormItem>
    </Form>
  )
});

const CreateModal = (props) => {
  const { viewVisible, createOk, createCancel } = props;
  const okHandle = () => {
    const form = this.CreateForm.getForm();
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      createOk(false, fieldsValue);
    });
  };
  return (
    <Modal
      title="新建工作流"
      visible={viewVisible}
      onOk={okHandle}
      onCancel={() => createCancel(false)}
      maskClosable={false}
      destroyOnClose={true}
    >
      <CreateForm ref={(el)=>{ this.CreateForm = el; }} />
    </Modal>
  );
};

@inject(['workflowDesigner'])
@connect(({ workflowDesigner, global, loading }) => ({
  workflowDesigner,
  global,
  loading: loading.models.workflowDesigner
}))
@Form.create()
export default class Designer extends PureComponent {
  state = {
    lists: [],
    buttonSize: 'default',
    showUploadList: false,
    deleteLists: [],
    viewVisible: false
  };

  componentDidMount() {
    console.log(cookie)
    cookie.remove('X-PEP-TOKEN', { path: '/' });
    // 在flowable的前端页面里获取表单的属性 需要的请求前缀
    cookie.save('X-PEP-TOKEN', window.localStorage.getItem('proper-auth-login-token'), { path: '/' });
    window.localStorage.setItem('pea_workflow_dynamic_request_prefix', prefix);
    this.props.dispatch({
      type: 'workflowDesigner/fetch',
      payload: {
        modelType: '0',
        sort: 'modifiedDesc'
      }
    });
  }
  componentWillUnmount() {
    cookie.remove('X-PEP-TOKEN', { path: '/' });
  }
  // 查询
  handleSearch = (value) => {
    this.props.dispatch({
      type: 'workflowDesigner/fetch',
      payload: {
        filter: value,
        modelType: '0',
        sort: 'modifiedDesc'
      }
    });
  }

  // 全选
  checkAll = () => {
    if (this.state.lists.length === this.state.deleteLists.length) {
      for (let i = 0; i < this.state.lists.length; i++) {
        this.state.lists[i].isChecked = false;
      }
      this.state.deleteLists = [];
    } else {
      this.state.deleteLists = [];
      for (let i = 0; i < this.state.lists.length; i++) {
        this.state.lists[i].isChecked = true;
        this.state.deleteLists.push(this.state.lists[i].id);
      }
    }
    this.props.dispatch({
      type: 'workflowDesigner/checkAll',
      payload: this.state.lists,
      callback: () => {
        this.setState({
          lists: this.props.workflowDesigner.changeList
        })
      }
    });
  }

  checkboxChange = (e, item) => {
    const isChecked = e.target.checked;
    // 渲染页面使用
    for (let i = 0; i < this.state.lists.length; i++) {
      if (this.state.lists[i].id === item.id) {
        this.state.lists[i].isChecked = isChecked;
      }
    }
    this.props.dispatch({
      type: 'workflowDesigner/checkItem',
      payload: this.state.lists,
      callback: () => {
        this.setState({
          lists: this.props.workflowDesigner.changeList
        })
      }
    });

    let isInList = false;

    let index;
    for (let i = 0; i < this.state.deleteLists.length; i++) {
      if (item.id === this.state.deleteLists[i]) {
        index = i;
        isInList = true;
      }
    }
    if (!isChecked && isInList) {
      this.state.deleteLists = [
        ...this.state.deleteLists.slice(0, index),
        ...this.state.deleteLists.slice(index + 1, this.state.deleteLists.length)
      ]
    } else if (isChecked && !isInList) {
      this.state.deleteLists.push(item.id);
    }
  }

  // 删除数组中的某个元素
  arrayRemove = (arr, val) => {
    let index;
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === val) {
        index = i;
      }
    }
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  // 删除单个元素
  deleteItem = (id) => {
    this.props.dispatch({
      type: 'workflowDesigner/remove',
      payload: id,
      callback: () => {
        this.refresh();
        this.state.deleteLists = this.arrayRemove(this.state.deleteLists, id);
      }
    });
  }

  menuClick = ({ key }, item) => {
    switch (key) {
      case 'item_0':
        console.log(item);
        break;
      case 'item_1':
        console.log(item);
        break;
      case 'item_2':
        console.log(item);
        break;
      case 'item_3':
        console.log(item);
        break;
      default:
        break;
    }
  }

  // 删除选中的所有元素
  deleteAll = () => {
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${this.state.deleteLists.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        for (let i = 0; i < this.state.deleteLists.length; i++) {
          this.deleteItem(this.state.deleteLists[i]);
        }
      }
    });
  }

  // 跳转到activiti
  goActivity = (id) => {
    window.location = `workflow/index.html#/editor/${id}`;
  }

  // 打开新建窗口
  create = (flag) => {
    this.setState({
      viewVisible: flag,
    });
  }

  // 新建确认
  createOk = (flag, fields) => {
    this.setState({
      viewVisible: flag,
    });
    const params = { ...fields, modelType: 0 };
    this.props.dispatch({
      type: 'workflowDesigner/create',
      payload: params,
      callback: () => {
        if (this.props.workflowDesigner.newId == null) {
          message.error('关键字重复');
        } else {
          this.goActivity(this.props.workflowDesigner.newId);
        }
      }
    });
  }

  // 新建取消
  createCancel = (flag) => {
    this.setState({
      viewVisible: flag,
    });
  }

  // 导出
  exportActivity = (id) => {
    window.location = `workflow/service/app/rest/models/${id}/bpmn20?version=${Date.now()}`;
  }

  // 刷新
  refresh = () => {
    this.props.dispatch({
      type: 'workflowDesigner/fetch',
      payload: {
        modelType: '0',
        sort: 'modifiedDesc'
      }
    });
  }

  // 导入
  uploadChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 导入成功`);
      this.refresh();
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 导入失败`);
    }
  }

  // 部署
  repository = (item) => {
    this.props.dispatch({
      type: 'workflowDesigner/repository',
      payload: item.id,
      callback: () => {
        // this.refresh();
        for (let i = 0; i < this.state.lists.length; i++) {
          if (this.state.lists[i].id === this.props.workflowDesigner.deployData.id) {
            this.state.lists[i].deploymentTime =
              this.props.workflowDesigner.deployData.deploymentTime;
            this.state.lists[i].status.name = '已部署';
            this.state.lists[i].status.code = 'DEPLOYED';
            this.state.lists[i].processVersion =
              this.props.workflowDesigner.deployData.processVersion;
          }
        }
        this.props.dispatch({
          type: 'workflowDesigner/checkItem',
          payload: this.state.lists,
          callback: () => {
            this.setState({
              lists: this.props.workflowDesigner.changeList
            })
          }
        });
      }
    });
  }

  render() {
    const { workflowDesigner: { data }, loading, global: {size} } = this.props;
    const { deleteLists, buttonSize, showUploadList, viewVisible } = this.state;
    this.state.lists = data.data;
    const itemMenu = [
      {key: 'item_0', type: 'lock', content: '权限'},
      {key: 'item_1', type: 'file-text', content: '复制'},
      {key: 'item_2', type: 'right-circle-o', content: '发起'},
      {key: 'item_3', type: 'swap', content: '移动'}
    ];

    const uploadParams = {
      action: `${getApplicationContextUrl()}/workflow/service/app/rest/import-process-model`,
      accept: 'text/xml',
    }

    return (
      <PageHeaderLayout content={
        <div>
          <Input.Search
            style={{marginBottom: '16px'}}
            onSearch={value => this.handleSearch(value)}
            enterButton="搜索"
            size={size}
            placeholder="请输入流程名称"
          />
          <Button className={styles.headerButton} icon="plus" type="primary" size={buttonSize} onClick={() => this.create(true)}>
            新建
          </Button>
          <span style={{float: 'right'}}>
            <Upload {...uploadParams} showUploadList={showUploadList} onChange={this.uploadChange}>
              <Button className={styles.headerButton} icon="select" size={buttonSize}>
                导入
              </Button>
            </Upload>
          </span>
          <Button className={styles.headerButton} icon={deleteLists.length ? 'check-square' : 'check-square-o'} size={buttonSize} onClick={() => this.checkAll()}>
            全选
          </Button>
          {deleteLists.length > 0 ? <Button icon="delete" size={buttonSize} type="danger" onClick={() => this.deleteAll()}>批量删除</Button> : null}
        </div>
      }>
        <div>
          <div>
            <List
              loading={loading}
              grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
              dataSource={this.state.lists}
              renderItem={item => (
                <List.Item key={item.id} className={styles.contolFontSize}>
                  <Card
                    hoverable
                    className={styles.cardContent}
                    cover={
                      <div
                        style={{ background: `url(${item.sourceExtraUrl}) 50% 50% / contain no-repeat` }}
                      />
                    }
                    actions={
                      [
                        <Tooltip placement="bottom" title="部署" onClick={() => this.repository(item)}>
                          <Icon type="api" />
                        </Tooltip>,
                        <Tooltip placement="bottom" title="导出">
                          <Icon type="download" onClick={() => this.exportActivity(item.id)} />
                        </Tooltip>,
                        <Tooltip placement="bottom" title="删除">
                          <Popconfirm title="确定删除选中的数据吗" onConfirm={() => this.deleteItem(item.id)}>
                            <Icon type="delete" />
                          </Popconfirm>
                        </Tooltip>,
                        <Dropdown
                          overlay={
                            <Menu onClick={value => this.menuClick(value, item)}>
                              {
                                itemMenu.map(it => (
                                  <Menu.Item key={it.key}>
                                    <a><Icon type={it.type} /> {it.content}</a>
                                  </Menu.Item>
                                ))
                              }
                              {/* <Menu.Item key="item_4">
                                <Popconfirm title="确定删除选中的数据吗"
                                  onConfirm={() => this.deleteItem(item.id)}>
                                  <a><Icon type="delete" /> 删除</a>
                                </Popconfirm>
                              </Menu.Item> */}
                            </Menu>
                          }
                          placement="topCenter">
                          <Icon type="ellipsis" />
                        </Dropdown>
                      ]
                    }
                  >
                    <Card.Meta
                      description={(
                        <div>
                          <Checkbox
                            checked={item.isChecked}
                            className={styles.checkboxPosition}
                            onChange={value => this.checkboxChange(value, item)}
                          />
                          <Ellipsis className={styles.item} lines={1}>
                            <Tooltip placement="bottom" title="编辑">
                              <a onClick={() => this.goActivity(item.id)} style={{textDecoration: 'underline', cursor: 'pointer'}}>
                                <span>流程名称 : {item.name}</span>
                              </a>
                            </Tooltip>
                            <div style={{color: '#333', cursor: 'text'}}>流程定义ID : {item.key}</div>
                          </Ellipsis>
                          <Ellipsis className={styles.item} lines={4}>
                            <Badge
                              status={ item.status ? (item.status.code === 'UN_DEPLOYED' ? 'default' : (item.status.code === 'DEPLOYED' ? 'success' : (item.status.code === '2' ? 'processing' : 'error'))) : 'default' }
                              text={ item.status ? item.status.name : '未部署' }
                              className={styles.status} />
                            <Ellipsis className={styles.item} lines={1}>
                              版本号: { item.processVersion }
                            </Ellipsis>
                            <Ellipsis className={styles.item} lines={1}>
                              部署时间: { item.deploymentTime }
                            </Ellipsis>
                            <Ellipsis className={styles.item} lines={1}>
                              最后更新: { item.lastUpdated }
                            </Ellipsis>
                            <Ellipsis className={styles.item} lines={1}>
                              创建时间: { item.created }
                            </Ellipsis>
                        </Ellipsis>
                        </div>
                      )}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </div>
        </div>
        <CreateModal
          createOk={this.createOk}
          createCancel={this.createCancel}
          viewVisible={viewVisible}
        />
      </PageHeaderLayout>
    );
  }
}
