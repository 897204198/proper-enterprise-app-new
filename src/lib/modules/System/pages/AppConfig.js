import React, { PureComponent } from 'react';
import classNames from 'classnames';
import {connect} from 'dva';
import { Form, Modal, Input, Button, Select, Spin, Popover } from 'antd';
import {inject} from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import DescriptionList from '@framework/components/DescriptionList';
import { oopToast } from '@framework/common/oopUtils';
import OopTreeTable from '../../../components/OopTreeTable';
import OopModal from '../../../components/OopModal';
import styles from './AppConfig.less';

const { Description } = DescriptionList;
const { Option } = Select;
const { TextArea } = Input;
const FormItem = Form.Item;
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

const TreeForm = Form.create()((props) => {
  const { form } = props;
  const handleSubmit = (e) => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        props.onSubmit(values)
      }
    });
  }
  const handlePopoverC = () => {
    props.onCancel();
  }
  return (
    <Form key="form" style={{ backgroundColor: '#fff', border: '1px solid #e8e8e8', padding: 15, borderRadius: 5, width: 300}}>
          <FormItem { ...formItemLayout } key="1" label="名称">
            {form.getFieldDecorator('typeName', {
              initialValue: props.typeName,
              rules: [
                { required: true, whitespace: true, message: '名称不能为空', }
              ]
            })(<Input placeholder="请输入字名称" style={{width: 200}} />)}
          </FormItem>
          <FormItem {...formItemLayout} key="2" label="编码">
            {form.getFieldDecorator('code', {
              initialValue: props.code,
              rules: [
                { required: true, whitespace: true, pattern: /^(?![0-9]+$)[^ \u4e00-\u9fa5]+$/, message: '不能为空，且不能为纯数字', },
              ]
            })(<Input disabled={props.code && true} placeholder="请输入编码" style={{width: 200}} />)}
          </FormItem>
          <FormItem key="5" style={{marginBottom: 0}}>
            {/* <Button type="primary" htmlType="submit" size="small"> */}
            <Button style={{float: 'right'}} key="p" size="small" type="primary" onClick={handleSubmit} className="login-form-button">
              确认
            </Button>
            <Button key="s" style={{float: 'right', marginRight: 10}} size="small" onClick={handlePopoverC}>取消</Button>
          </FormItem>
    </Form>
  )
});
function onValuesChange(props, changedValues, allValues) {
  const { funcBasicInfo, conductValuesChange } = props;
  if (conductValuesChange) {
    const warningField = {};
    for (const k in allValues) {
      if (Object.keys(funcBasicInfo).length === 0) {
        if (allValues[k]) {
          warningField[k] = {hasChanged: true, prevValue: allValues[k]};
        }
      } else if (Object.prototype.hasOwnProperty.call(funcBasicInfo, k) &&
      allValues[k] !== funcBasicInfo[k]) {
        warningField[k] = {hasChanged: true, prevValue: funcBasicInfo[k]};
      }
    }
    conductValuesChange(warningField);
  }
}
const FuncBasicInfoForm = Form.create({onValuesChange})((props) => {
  const { form, loading, warningWrapper, entity, treeData, selectValue } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const handleConfirmJson = (rule, value, callback) => {
    try {
      if (value !== '' && value && value != null) {
        JSON.parse(getFieldValue('data'))
      }
    } catch (err) {
      callback('输入JSON格式错误')
    }
    callback()
  }
  return (
    <Spin spinning={loading}>
      <Form key="form" className={ classNames({[styles.warningWrapper]: warningWrapper})} style={{marginTop: 24}}>
        <div>
          {getFieldDecorator('id', {
            initialValue: entity.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="应用类别"
        >
          {getFieldDecorator('code', {
            initialValue: selectValue ? selectValue.code : entity.code,
            rules: [{
              required: true, message: '应用类别必选',
            }],
          })(
            <Select placeholder="请选择应用类别">
              {treeData.map(item => (
                <Option value={item.code} key={item.code}>{item.typeName}</Option>
              ))}
            </Select>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用名称"
        >
          {getFieldDecorator('name', {
            initialValue: entity.name,
            rules: [{
              required: true, message: '应用名称不能为空',
            }],
          })(
            <Input placeholder="请输入应用名称" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用图标"
        >
          {getFieldDecorator('icon', {
            initialValue: entity.icon,
            rules: [{
              required: true, message: '应用图标不能为空',
            }],
          })(
            <Input placeholder="请输入应用图标" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用页"
        >
          {getFieldDecorator('page', {
            initialValue: entity.page,
            rules: [{
              required: true, message: '应用页不能为空',
            }],
          })(
            <Input placeholder="请输入应用页" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用扩展"
        >
          {getFieldDecorator('style', {
            initialValue: entity.style,
          })(
            <Input placeholder="请输入应用扩展" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="应用数据"
          extra='请输入应用数据，格式如下：{"questionnaireNo":"qnnre1","url":"https://icmp2.propersoft.cn/icmp/web/#/webapp/workflow"}'
        >
          {getFieldDecorator('data', {
            initialValue: entity.data,
            rules: [{
              required: false, message: '输入的格式错误',
            }, {
              validator: handleConfirmJson
            }],
          })(
            <TextArea autosize={{ minRows: 5 }} placeholder="请输入应用数据" />
          )}
        </FormItem>
      </Form>
    </Spin>
  )
});

@inject(['systemAppConfig', 'global'])
@connect(({systemAppConfig, global, loading}) => ({
  systemAppConfig,
  global,
  loading: loading.models.systemAppConfig,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class AppConfig extends PureComponent {
  state = {
    tableTitle: '全部',
    entity: {},
    modalVisible: false,
    typeName: '',
    code: '',
    handleSelect: null,
    isCreate: true,
    warningWrapper: false,
    closeConfirmConfig: {
      visible: false
    },
    visible: false,
    info: {},
    deleteDisable: false,
    editDisable: false,
  }
  componentDidMount() {
    this.getTreeData();
    this.onLoad();
  }

  // 获取应用类别tree数据
  getTreeData = () => {
    this.props.dispatch({
      type: 'systemAppConfig/fetchTreeData'
    });
  }

  // 获取应用列表数据
  onLoad = (param = {})=>{
    const treeNode = this.oopTreeTable.getCurrentSelectTreeNode();
    const code = (treeNode && treeNode.key === '-1' ? undefined : treeNode.code);
    const {pagination} = param;
    this.oopTreeTable.oopSearch.load({
      pagination,
      code
    });
  }

  // tree组件select事件
  handleTableTreeNodeSelect = ()=>{
    this.oopTreeTable.oopSearch.setState({
      inputValue: ''
    });
    const treeNode = this.oopTreeTable.getCurrentSelectTreeNode();
    if (treeNode.key === '-1') {
      this.setState({
        handleSelect: null,
        tableTitle: treeNode.typeName || '全部'
      });
    } else {
      this.setState({
        handleSelect: treeNode,
        tableTitle: treeNode.typeName || '全部'
      });
    }
  }
  // 新建或编辑应用配置
  createOrEditApp = (entity) => {
    if (entity) {
      this.setState({
        entity,
        modalVisible: true,
        isCreate: false,
      });
    } else {
      this.setState({
        isCreate: true,
        modalVisible: true,
        entity: {}
      });
    }
  }
  // 关闭Modal层
  handleModalCancel = () => {
    this.setState({
      entity: {},
      modalVisible: false
    });
    setTimeout(() => {
      this.setState({
        closeConfirmConfig: {visible: false},
        warningWrapper: false,
      });
      // this.props.dispatch({
      //   type: 'authFunc/clear'
      // });
    }, 300);
  }
  // 提交应用数据
  handleModalSubmit = () => {
    const form = this.basic.getForm();
    const {validateFieldsAndScroll} = form;
    validateFieldsAndScroll((err, value) => {
      if (err) return;
      const reg = /\s|"|'/g
      if (value.data) {
        value.data = value.data.replace(reg, '')
        const dataArr = value.data.substring(1, value.data.length - 1).split(',');
        const obj = {};
        dataArr.forEach((item)=>{
          const arr = item.replace(':', ',').split(',');
          [, obj[arr[0]]] = arr;
        })
        value.data = obj;
      }
      value.appId = value.id;
      value.data === '' ? value.data = {} : '';
      delete value.id;
      this.props.dispatch({
        type: 'systemAppConfig/saveOrUpdate',
        payload: value,
        callback: (res)=>{
          oopToast(res, '保存成功', '保存失败');
          this.handleModalCancel();
          this.onLoad();
        }
      });
    });
  }

  // 删除应用配置
  deleteApp = (record, items) => {
    record = items.map((item)=>{
      return item.id
    })
    const ids = Array.isArray(record) ? record.join(',') : record.id;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.props.dispatch({
          type: 'systemAppConfig/deleteApp',
          payload: {ids},
          callback: (res) => {
            oopToast(res, '删除成功', '删除失败');
            this.oopTreeTable.oopTable.clearSelection();
            this.onLoad();
          }
        });
      }
    });
  }
  deleteAppRow = (record) => {
    const ids = record.id;
    this.props.dispatch({
      type: 'systemAppConfig/deleteApp',
      payload: {ids},
      callback: (res) => {
        this.oopTreeTable.oopTable.clearSelection();
        oopToast(res, '删除成功', '删除失败');
        this.onLoad();
      }
    });
  }
  onDeleteFromEdit = () => {
    const ids = this.state.entity.id
    this.props.dispatch({
      type: 'systemAppConfig/deleteApp',
      payload: {ids},
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.handleTableTreeNodeSelect()
        this.onLoad();
        this.setState({
          modalVisible: false
        });
      }
    })
  }
  rightClick = (data) =>{
    const newData = {
      typeName: data.typeName,
      code: data.code,
    }
    // this.setState({
    //   ...newData
    // });
    if (data.key === '-1') {
      this.setState({
        ...newData,
        editDisable: true,
        deleteDisable: true,
      })
    } else {
      this.setState({
        ...newData,
        editDisable: false,
        deleteDisable: false,
      })
    }
  }
  handlePopoverAddSub = (values) =>{
    this.treeListAdd(values)
    this.setState({
      typeName: '',
      code: '',
      // sort: '',
    })
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  handlePopoverEditSub = (values) => {
    const {code, typeName} = values;
    const param = [{
      code
    },
    {
      typeName
    }]
    this.treeListEdit(param)
    this.setState({
      typeName: '',
      code: '',
    })
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  handlePopoverC = () =>{
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  treeListDelete = (record) => {
    this.props.dispatch({
      type: 'systemAppConfig/treeListDelete',
      payload: record,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.getTreeData()
        this.onLoad();
      }
    })
  }
  treeListEdit = (record) => {
    this.props.dispatch({
      type: 'systemAppConfig/treeListEdit',
      payload: record,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.getTreeData()
        // this.onLoad();
      }
    })
  }
  treeListAdd = (record) => {
    this.props.dispatch({
      type: 'systemAppConfig/treeListAdd',
      payload: record,
      callback: (res)=>{
        oopToast(res, '添加成功');
        this.getTreeData()
        // this.onLoad();
        this.handleTableTreeNodeSelect()
      }
    })
  }
  handleView = (record) => {
    this.setState({
      visible: true,
      info: record
    });
  }
  handleClose = () => {
    this.setState({
      visible: false,
      info: {}
    });
  }
  render() {
    const {loading, systemAppConfig: { treeData },
      gridLoading, global: { size, oopSearchGrid } } = this.props;
    const { list = [] } = oopSearchGrid;
    list.forEach((item) => {
      const { data } = item;
      if (typeof data === 'object') {
        item.data = JSON.stringify(item.data);
        item.data = item.data === '{}' ? '' : item.data
      }
    });
    const { visible, info, tableTitle, entity, modalVisible, handleSelect,
      closeConfirmConfig, warningWrapper, warningField, deleteDisable, editDisable } = this.state;
    const columns = [
      {title: '应用名称', dataIndex: 'name', width: 80, render: (text, record)=>(
        <Popover content={text}>
          <div
            onClick={()=>this.handleView(record)}
            style={{textDecoration: 'underline', cursor: 'pointer', width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {text}
        </div>
      </Popover>
      )},
      // {title: '应用图标', dataIndex: 'icon'},
      { title: '应用图标', dataIndex: 'icon', width: 80, render: (text)=> {
        return (
        <Popover content={text}>
          <div style={{width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      } },
      // {title: '应用页', dataIndex: 'page'},
      { title: '应用页', dataIndex: 'page', width: 80, render: (text)=> {
        return (
        <Popover content={text}>
          <div style={{width: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      } },
      {title: '应用数据', dataIndex: 'data', width: 300, render: (text)=> {
        return (
        <Popover content={text}>
          <div className="useData" style={{width: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      }
      }
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.createOrEditApp() }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items, record)=>{ this.deleteApp(items, record) },
        display: items=>(items.length),
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.createOrEditApp(record) },
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此行',
        onClick: (record)=>{ this.deleteAppRow(record) },
      },
    ];
    const menuList = [
      {
        icon: 'folder-add',
        text: '增加',
        disabled: false,
        name: 'add',
        render: (
            <TreeForm
              onSubmit={(values)=>{ this.handlePopoverAddSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        icon: 'edit',
        text: '编辑',
        disabled: editDisable,
        name: 'edit',
        render: (
              <TreeForm
              // catalogType={this.state.propoverValueType}
              typeName={this.state.typeName}
              code={this.state.code}
              // sort={this.state.sort}
              onSubmit={(values)=>{ this.handlePopoverEditSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        confirm: '确认删除这条信息吗？',
        icon: 'delete',
        text: '删除',
        disabled: deleteDisable,
        name: 'remove',
        onClick: (record) => {
          this.treeListDelete(record)
        },
      }
    ]
    return (
      <PageHeaderLayout wrapperClassName={styles.wrapper}>
        <OopTreeTable
          ref={(el)=>{ el && (this.oopTreeTable = el) }}
          table={{
            title: `${tableTitle}应用配置`,
            grid: oopSearchGrid,
            // rowKey: 'appId',
            columns,
            gridLoading,
            onLoad: this.onLoad,
            topButtons,
            rowButtons,
            oopSearch: {
              moduleName: 'systemappconfig',
              placeholder: '请输入',
              enterButtonText: '搜索'
            }
          }}
          tree={{
            onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
              top: 150
            },
            title: '应用管理',
            treeLoading: loading,
            treeData,
            treeKey: 'id',
            treeTitle: 'typeName',
            treeRoot: {
              key: '-1',
              title: '全部',
            },
            defaultSelectedKeys: ['-1'],
            defaultExpandedKeys: ['-1'],
          }}
          size={size}
          onTreeNodeSelect={this.handleTableTreeNodeSelect}
        />
        <OopModal
          title={entity.id ? '编辑应用配置' : '新建应用配置'}
          visible={modalVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleModalCancel}
          onOk={this.handleModalSubmit}
          onDelete={this.onDeleteFromEdit}
          isCreate={this.state.isCreate}
          loading={!!loading}
          tabs={[
            {
              key: 'basic',
              title: '基本信息',
              tips: (<div>新建时，需要<a>填写完基本信息的必填项并保存</a>后，滚动页面或点击左上角的导航来完善其他信息</div>),
              main: true,
              content: <FuncBasicInfoForm
                ref={(el) => {
                  this.basic = el;
                }}
                entity={entity}
                treeData={treeData}
                warningWrapper={warningWrapper}
                warningField={warningField}
                loading={loading}
                selectValue={handleSelect}
              />
            },
          ]}
        />
        <Modal
          visible={visible}
          title="应用配置"
          onCancel={()=>this.handleClose()}
          footer={<Button type="primary" onClick={()=>this.handleClose()}>确定</Button>}
        >
          <DescriptionList size={size} col="1">
            <Description term="应用名称">
              {info.name}
            </Description>
            <Description term="应用图标">
              {info.icon}
            </Description>
            <Description term="应用页">
              {info.page}
            </Description>
            <Description term="应用扩展">
              {info.style}
            </Description>
            <Description term="应用数据">
              <div className="useData" style={{width: 400}}>
                  {info.data}
              </div>
            </Description>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>
    )
  }
}
