import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Spin, Row, Col, Button, Card, Icon, Badge, List, Tooltip, Upload, Modal, Popconfirm, Form, Input, message, TreeSelect } from 'antd';
import cookie from 'react-cookies'
import { inject } from '@framework/common/inject';
import { getApplicationContextUrl } from '@framework/utils/utils';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import Ellipsis from '@framework/components/Ellipsis';
import { oopToast } from '@framework/common/oopUtils';
import { prefix } from '@/config/config';
import OopModal from '../../../components/OopModal';
import OopTree from '../../../components/OopTree';
import styles from './Designer.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { TreeNode } = TreeSelect;
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
  const temp = {};
  const okHandle = () => {
    const form = temp.CreateForm.getForm();
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
      <CreateForm ref={(el)=>{ temp.CreateForm = el; }} />
    </Modal>
  );
};

/* 修改分类 */
const InfoChangeForm = Form.create()((props) => {
  const { loading = false, form, formInfo, treeData } = props;
  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
           <TreeNode title={item.name} value={item.code} key={item.id} dataRef={item} disabled={item.code === 'ROOT'}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode title={item.name} value={item.code} key={item.id} dataRef={item} disabled={item.code === 'ROOT'} />
      );
    });
  }
  return (
    <Spin spinning={loading}>
    <div>
      {form.getFieldDecorator('modelId', {
        initialValue: formInfo.id,
      })(
        <Input type="hidden" />
      )}
    </div>
     <Form id="designer_type_form">
     <FormItem
        {...formItemLayout}
        label="当前流程名称"
      >
        {form.getFieldDecorator('name', {
          initialValue: formInfo.name,
          rules: [{ required: true, message: '类别名称不能为空'}]
        })(
          <Input placeholder="请输入类别名称" disabled />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="流程分类"
      >
        {form.getFieldDecorator('workflowCategory', {
          initialValue: formInfo.workflowCategory != null ? formInfo.workflowCategory.name : null,
          rules: [{ required: true, message: '流程分类不能为空' }],
        })(
          <TreeSelect
            showSearch
            style={{ width: '100%' }}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="请选择分类"
            allowClear
            treeDefaultExpandAll
            searchPlaceholder="请输入想要搜索的类别名称"
            treeNodeFilterProp= "title"
            getPopupContainer={() => document.getElementById('designer_type_form')}
          >
            {
              renderTreeNodes(treeData)
            }
          </TreeSelect>
        )}
      </FormItem>
    </Form>
  </Spin>
  );
})
/* 流程定义 */
const InfoSubmitForm = Form.create()((props) => {
  const {loading = false, form, formInfo, parentName, isTop, isCreate } = props;
  return (
    <Spin spinning={loading}>
    <div>
      {form.getFieldDecorator('id', {
        initialValue: formInfo.id,
      })(
        <Input type="hidden" />
      )}
    </div>
     <Form>
      <FormItem
            {...formItemLayout}
            label="所属分类"
          >
          {form.getFieldDecorator('parentName', {
            initialValue: isTop ? '流程分类' : parentName,
            rules: [{ required: true, message: '所属分类名称不能为空' }]
          })(
            <Input placeholder="请输入所属分类名称" disabled />
          )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="类别名称"
      >
        {form.getFieldDecorator('name', {
          initialValue: formInfo.name,
          rules: [{ required: true, message: '类别名称不能为空'}]
        })(
          <Input placeholder="请输入类别名称" />
        )}
      </FormItem>
      <FormItem
          {...formItemLayout}
          label="类别编码"
        >
          {form.getFieldDecorator('code', {
            initialValue: formInfo.code,
            rules: [
              { required: true, message: '类别编码不能为空' },
            ]
          })(
            <Input placeholder="请输入类别编码" disabled={ !isCreate } />
          )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="当前排序"
      >
        {form.getFieldDecorator('sort', {
          initialValue: formInfo.sort,
          rules: [
            { required: true, message: '排序不能为空' },
            { pattern: new RegExp(/^[0-9]\d*$/, 'g'), message: '排序只能是数值'}
          ]
        })(
          <Input placeholder="请输入排序对应数值" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="描述"
      >
        {form.getFieldDecorator('description', {
          initialValue: formInfo.description,
        })(
          <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
        )}
      </FormItem>
    </Form>
  </Spin>
  );
});


@inject(['workflowDesigner'])
@connect(({ workflowDesigner, global, loading }) => ({
  workflowDesigner,
  global,
  loading: loading.models.workflowDesigner,
  treeLoading: loading.effects['workflowDesigner/fetchTreeData'],
  submitLoading: loading.effects['workflowDesigner/addTree'],
  typeSubmitLoading: loading.effects['workflowDesigner/editTree'],
}))
@Form.create()
export default class Designer extends PureComponent {
  state = {
    lists: [],
    buttonSize: 'default',
    showUploadList: false,
    editDisable: false,
    deleteDisable: false,
    handleSelect: null,
    viewVisible: false,
    typeVisible: false,
    typeIsCreate: true,
    typeCloseConfirm: {
      visible: false
    },
    // 单条分类数据
    typeInfo: {},
    // 流程分类描述
    listTitle: '流程分类',
    nowTreeCode: 'ROOT',
    // 流程详细数据
    workInfo: {},
    // 流程分类修改modal
    changeVisible: false,
    // 当前父节点标题
    nowParentName: '流程分类',
    // 当前节点名称
    nowTypeName: null,
  };

  componentDidMount() {
    // console.log(cookie)
    cookie.remove('X-PEP-TOKEN', { path: '/' });
    // 在flowable的前端页面里获取表单的属性 需要的请求前缀
    cookie.save('X-PEP-TOKEN', window.localStorage.getItem('proper-auth-login-token'), { path: '/' });
    window.localStorage.setItem('pea_workflow_dynamic_request_prefix', prefix);
    /* 获取分类列表 */
    this.getTreeData();
    this.refresh(this.state.nowTreeCode);
  }
  componentWillUnmount() {
    cookie.remove('X-PEP-TOKEN', { path: '/' });
  }
  // 查询
  handleSearch = (value) => {
    const haveRoot = {
      filter: value,
      modelType: '0',
      sort: 'modifiedDesc',
    }
    const unHaveRoot = {
      filter: value,
      modelType: '0',
      sort: 'modifiedDesc',
      workflowCategoryCode: this.state.nowTreeCode,
    }
    this.props.dispatch({
      type: 'workflowDesigner/fetch',
      payload: this.state.nowTreeCode !== 'ROOT' ? unHaveRoot : haveRoot
    });
  }

  // 删除单个元素
  deleteItem = (id) => {
    this.props.dispatch({
      type: 'workflowDesigner/remove',
      payload: id,
      callback: (res) => {
        this.refresh(this.state.nowTreeCode);
        oopToast(res, '删除成功');
      }
    });
  }
  /* 修改流程表单状态 */
  changeNowTypeCode = (item) => {
    this.setState({
      workInfo: item,
      changeVisible: true,
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
          /* 默认添加当前流程分类 */
          const defaultType = {
            modelId: this.props.workflowDesigner.newId,
            workflowCategory: this.state.nowTreeCode
          }
          this.changeWorkType(defaultType);
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
    window.location = `workflow/app/rest/models/${id}/bpmn20?version=${Date.now()}`;
  }
  // 刷新
  refresh = (root) => {
    const common = {
      modelType: '0',
      sort: 'modifiedDesc',
    }
    const params = {
      ...common,
      workflowCategoryCode: root,
    }
    this.props.dispatch({
      type: 'workflowDesigner/fetch',
      payload: root !== 'ROOT' ? params : common,
    });
  }

  // 导入
  uploadChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 导入成功`);
      this.refresh(this.state.nowTreeCode);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 导入失败`);
    }
  }

  // 部署
  repository = (item) => {
    this.props.dispatch({
      type: 'workflowDesigner/repository',
      payload: item.id,
      callback: (res) => {
        oopToast(res, '部署成功');
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
  /*
  * 树右键点击
  */
  rightClick = (data) =>{
    this.setState({
      handleSelect: data
    });
    /* 根节点不可以编辑和删除 */
    if (data.key === 'root') {
      this.setState({
        editDisable: true,
        deleteDisable: true,
        isTop: true,
      })
    } else if (!data.children) {
      /* 父级节点中子节点为空时才可删除 */
      this.setState({
        editDisable: false,
        deleteDisable: false,
        isTop: false,
      })
    } else {
      this.setState({
        editDisable: false,
        deleteDisable: true,
        isTop: false,
      })
    }
  }

  /* 新建流程分类  */
  handleTreeListAdd = ()=>{
    const { handleSelect } = this.state;
    this.setState({
      typeIsCreate: true,
      typeVisible: true,
      nowParentName: handleSelect.parentName,
      addOrEditTypeTitle: '新建',
      nowTypeName: handleSelect.name,
    })
  }
  /*  编辑流程分类 */
  handleTreeListEdit = ()=>{
    const { handleSelect } = this.state;
    this.setState({
      typeIsCreate: false,
      typeVisible: true,
      addOrEditTypeTitle: '编辑',
      nowParentName: handleSelect.parentName,
      typeInfo: handleSelect
    })
  }
  /* 删除该节点 */
  handleTreeListDelete = () => {
    const { handleSelect: {code, name}, nowTreeCode, lists } = this.state;
    const common = {
      modelType: '0',
      sort: 'modifiedDesc',
    }
    const params = {
      ...common,
      workflowCategoryCode: code,
    }
    let newList = lists;
    Modal.confirm({
      title: '提示',
      content: `是否确认删除分类 - "${name}"`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        if (code !== nowTreeCode) {
          this.props.dispatch({
            type: 'workflowDesigner/fetchList',
            payload: code !== 'ROOT' ? params : common,
            callback: (res)=>{
              newList = res;
            }
          })
        }
        setTimeout(()=>{
          if (newList.length > 0) {
            message.info(`[${name}]分类下有流程数据不可以删除！`);
          } else {
            this.treeListDelete();
          }
        }, 1000);
      }
    });
  }
  treeListDelete = () => {
    const { handleSelect } = this.state;
    this.props.dispatch({
      type: 'workflowDesigner/removeTreeById',
      payload: handleSelect.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.setState({
          typeVisible: false,
        }, ()=>{
          this.getTreeData();
          /* 刷新流程列表 */
          this.setState({
            listTitle: '流程分类',
          })
          this.refresh('ROOT');
        })
      }
    })
  }
  /* 选中树节点 */
  handleOnSelect = (selectedKeys, info) => {
    this.setState({
      listTitle: info.title,
      nowTreeCode: info.code,
    }, ()=>{
      /* 更新右侧流程列表 */
      this.refresh(this.state.nowTreeCode);
    })
  }
  // 取消类别&分类的表单
  typenCancel = ()=>{
    this.setState({
      typeCloseConfirm: {
        visible: false
      },
      typeVisible: false,
      changeVisible: false,
      workInfo: {},
      typeInfo: {}
    })
  }
  /*
  * 提交分类表单
  */
  typeSubmit = () =>{
    const { typeIsCreate, handleSelect } = this.state;
    const flowType = this.flowType.getForm();
    if (flowType) {
      flowType.validateFieldsAndScroll((err, data) => {
        if (err) return;
        const params = {
          ...data,
          parentId: handleSelect.id,
        }
        typeIsCreate ? this.treeListAdd(params) : this.treeListEdit(params);
      })
    }
  }
  /*
    修改当前流程的分类
  */
  typeChangeSubmit = () =>{
    const changeType = this.changeType.getForm();
    if (changeType) {
      changeType.validateFieldsAndScroll((err, data) => {
        if (err) return;
        this.changeWorkType(data);
      })
    }
  }
  /* 分类列表 */
  getTreeData = () => {
    this.props.dispatch({
      type: 'workflowDesigner/fetchTreeData',
    });
  }
  /*  添加分类树节点  */
  treeListAdd = (record) => {
    this.props.dispatch({
      type: 'workflowDesigner/addTree',
      payload: record,
      callback: (res)=>{
        oopToast(res, '添加成功');
        this.setState({
          typeVisible: false,
        }, ()=>{
          this.getTreeData();
        })
      }
    })
  }
  /* 编辑分类节点 */
  treeListEdit = (record) => {
    this.props.dispatch({
      type: 'workflowDesigner/editTree',
      payload: record,
      callback: (res)=>{
        oopToast(res, '修改成功');
        this.setState({
          typeVisible: false
        }, ()=>{
          this.getTreeData();
        })
      }
    })
  }
  /*
    修改流程分类
  */
  changeWorkType = (params)=> {
    this.props.dispatch({
      type: 'workflowDesigner/changeWorkType',
      payload: params,
      callback: (res)=>{
        oopToast(res, '修改成功', '修改失败');
        this.setState({
          changeVisible: false
        }, ()=>{
          this.refresh(this.state.nowTreeCode);
        })
      }
    })
  }

  render() {
    const { workflowDesigner: { data, treeData }, loading, treeLoading, typeSubmitLoading, submitLoading } = this.props;
    const { buttonSize, showUploadList, viewVisible, editDisable, isTop, listTitle, typeVisible, workInfo,
      deleteDisable, addOrEditTypeTitle, changeVisible, typeIsCreate, typeInfo, typeCloseConfirm, nowParentName, nowTypeName, nowTreeCode } = this.state;
    this.state.lists = data.data;
    const formatTreeData = treeData;
    const treeConfig = {
      title: '流程分类列表',
      treeLoading,
      treeData: formatTreeData,
      treeTitle: 'name',
      treeKey: 'id',
      defaultSelectedKeys: ['root'],
      defaultExpandedKeys: ['root'],
    }
    const menuList = [
      {
        icon: 'folder-add',
        text: '新建',
        name: 'add',
        disabled: false,
        onClick: ()=>{
          this.handleTreeListAdd();
        }
      },
      {
        icon: 'edit',
        text: '编辑',
        name: 'edit',
        disabled: editDisable,
        onClick: () => {
          this.handleTreeListEdit();
        },
      },
      {
        icon: 'delete',
        text: '删除',
        name: 'remove',
        disabled: deleteDisable,
        onClick: () => {
          this.handleTreeListDelete();
        },
      }
    ];

    const token = window.localStorage.getItem('proper-auth-login-token');

    const uploadParams = {
      action: `${getApplicationContextUrl()}/workflow/service/app/rest/import-process-model?access_token=${token}`,
      accept: 'text/xml',
      onSuccess: (res)=>{
        const params = {
          modelId: res.id,
          workflowCategory: this.state.nowTreeCode,
        }
        /* 添加分类 */
        this.changeWorkType(params);
      }
    }

    return (
      <PageHeaderLayout>
        <Row gutter={16}>
          <Col span={18} push={6}>
            <Card bordered={false} title={listTitle}>
            <div style={{ marginBottom: 20 }}>
                <Input.Search
                  style={{marginBottom: '16px'}}
                  onSearch={value => this.handleSearch(value)}
                  enterButton="搜索"
                  placeholder="请输入流程名称"
                />
                <Button
                  className={styles.headerButton}
                  icon="plus"
                  type="primary"
                  size={buttonSize}
                  onClick={() => this.create(true)}
                  disabled={nowTreeCode === 'ROOT'}> 新建</Button>
                <span style={{float: 'right'}}>
                  <Upload {...uploadParams} showUploadList={showUploadList} onChange={this.uploadChange}>
                    <Button className={styles.headerButton} icon="select" size={buttonSize} disabled={nowTreeCode === 'ROOT'}>
                      导入
                    </Button>
                  </Upload>
                </span>
            </div>
              <List
                  loading={loading}
                  grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
                  dataSource={this.state.lists}
                  rowKey="id"
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
                            <Tooltip placement="bottom" title="修改流程分类" onClick={() => this.changeNowTypeCode(item)}>
                              <Icon type="edit" />
                            </Tooltip>,
                            <Tooltip placement="bottom" title="删除">
                              <Popconfirm title="确定删除选中的数据吗" onConfirm={() => this.deleteItem(item.id)}>
                                <Icon type="delete" />
                              </Popconfirm>
                            </Tooltip>,
                            // <Dropdown
                            //   overlay={
                            //     <Menu onClick={value => this.menuClick(value, item)}>
                            //       {
                            //         itemMenu.map(it => (
                            //           <Menu.Item key={it.key}>
                            //             <a><Icon type={it.type} /> {it.content}</a>
                            //           </Menu.Item>
                            //         ))
                            //       }
                            //       <Menu.Item key="item_4">
                            //         <Popconfirm title="确定删除选中的数据吗"
                            //           onConfirm={() => this.deleteItem(item.id)}>
                            //           <a><Icon type="delete" /> 删除</a>
                            //         </Popconfirm>
                            //       </Menu.Item>
                            //     </Menu>
                            //   }
                            //   placement="topCenter">
                            //   <Icon type="ellipsis" />
                            // </Dropdown>
                          ]
                        }
                      >
                        <Card.Meta
                          description={(
                            <div>
                              <Ellipsis className={styles.item} lines={1}>
                                <Tooltip placement="bottom" title="编辑">
                                  <a onClick={() => this.goActivity(item.id)} style={{textDecoration: 'underline', cursor: 'pointer'}}>
                                    <span>流程名称 : {item.name}</span>
                                  </a>
                                </Tooltip>
                                <div style={{color: '#333', cursor: 'text'}}>流程分类 : {item.workflowCategory ? item.workflowCategory.name : null }</div>
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
            </Card>
          </Col>
          <Col span={6} pull={18} >
          <Card bordered={false} title={treeConfig.title}>
            <Spin spinning={treeLoading}>
              <OopTree
                onTreeNodeSelect={this.handleOnSelect}
                onRightClickConfig={{
                  menuList,
                  rightClick: (item)=>{
                    this.rightClick(item)
                  },
                }}
                {...treeConfig}
                ref={(el)=>{ el && (this.oopTree = el) }}
              />
            </Spin>
          </Card>
        </Col>
        </Row>
      {/* 新建流程表单 */}
      <CreateModal
          createOk={this.createOk}
          createCancel={this.createCancel}
          viewVisible={viewVisible}
        />
      {/* 流程分类表单 */}
      <OopModal
          width={600}
          loading={submitLoading}
          title={`${addOrEditTypeTitle}流程分类`}
          visible={typeVisible}
          closeConfirm={typeCloseConfirm}
          destroyOnClose={true}
          isCreate={typeIsCreate}
          onCancel={this.typenCancel}
          onOk={this.typeSubmit}
          onDelete={this.treeListDelete}
          tabs={[
          {
            key: 'flowType',
            title: '基本信息',
            main: true,
            content:
            <InfoSubmitForm
              ref={(el) => {
                this.flowType = el;
              }}
              formInfo={typeIsCreate ? {} : typeInfo}
              parentName={typeIsCreate ? nowTypeName : nowParentName}
              isTop={isTop}
              isCreate={typeIsCreate}
            />
            },
          ]}
        />
       {/* 编辑流程分类表单 */}
       <OopModal
          width={600}
          loading={typeSubmitLoading}
          title= "编辑流程分类"
          visible={changeVisible}
          closeConfirm={typeCloseConfirm}
          destroyOnClose={true}
          isCreate={false}
          onCancel={this.typenCancel}
          onOk={this.typeChangeSubmit}
          tabs={[
          {
            key: 'changeType',
            title: '基本信息',
            main: true,
            content:
            <InfoChangeForm
              ref={(el) => {
                this.changeType = el;
              }}
              formInfo={workInfo}
              treeData={formatTreeData}
            />
            },
          ]}
        />
      </PageHeaderLayout>
    );
  }
}
