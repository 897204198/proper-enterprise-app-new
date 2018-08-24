import React, { PureComponent } from 'react';
import classNames from 'classnames';
import {connect} from 'dva';
import { Form, Modal, Input, Button, Select, Spin } from 'antd';
import {inject} from '../../../../framework/common/inject';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import OopTreeTable from '../../../components/OopTreeTable';
import OopModal from '../../../components/OopModal';
import { oopToast } from '../../../../framework/common/oopUtils';
import styles from './AppConfig.less';

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
            })(<Input placeholder="请输入编码" style={{width: 200}} />)}
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
  const { getFieldDecorator } = form;
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
            // rules: [
            //   {required: true, message: '应用数据不能为空'},
            //   {validator: validateJson}
            // ],
          })(
            <TextArea autosize placeholder="请输入应用数据" />
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
    treeMenuVisible: false,
    typeName: '',
    code: '',
    handleSelect: null,
    isCreate: true,
    warningWrapper: false,
    closeConfirmConfig: {
      visible: false
    },
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
    const code = (treeNode && treeNode.key === '-1' ? undefined : treeNode.key);
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
    console.log(entity)
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
          // obj[arr[0]] = arr[1];
          [, obj[arr[0]]] = arr;
        })
        value.data = obj;
      }
      value.appId = value.id;
      value.data === '' ? delete value.data : '';
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
        oopToast(res, '删除成功', '删除失败');
        this.onLoad();
      }
    });
  }
  onDeleteFromEdit = () => {
    // console.log(this.state.entity)
    const ids = this.state.entity.id
    console.log(ids)
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
  setVisible = (state) => {
    this.setState({
      treeMenuVisible: state,
    })
  }
  rightClick = (data) =>{
    const newData = {
      typeName: data.typeName,
      code: data.code,
    }
    this.setState({
      ...newData
    });
  }
  handlePopoverAddSub = (values) =>{
    this.treeListAdd(values)
    this.setState({
      treeMenuVisible: false,
      typeName: '',
      code: '',
      // sort: '',
    })
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
      treeMenuVisible: false,
      typeName: '',
      code: '',
      // sort: '',
    })
  }
  handlePopoverC = () =>{
    this.setState({
      treeMenuVisible: false,
    });
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
        oopToast(res, '添加成功', '添加失败');
        this.getTreeData()
        // this.onLoad();
        this.handleTableTreeNodeSelect()
      }
    })
  }
  render() {
    const {loading, systemAppConfig: { treeData },
      gridLoading, global: { size, oopSearchGrid } } = this.props;
    const { list = [] } = oopSearchGrid;
    list.forEach((item) => {
      const { data } = item;
      if (typeof data === 'object') {
        item.data = JSON.stringify(item.data, null, 2);
        item.data = item.data === '{}' ? '' : item.data
      }
    });
    const { tableTitle, entity, modalVisible, handleSelect,
      closeConfirmConfig, warningWrapper, warningField } = this.state;
    const columns = [
      {title: '应用名称', dataIndex: 'name'},
      {title: '应用图标', dataIndex: 'icon'},
      {title: '应用页', dataIndex: 'page'},
      {title: '应用数据', dataIndex: 'data', width: 300}
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
        name: 'add',
        onClick: (record) => {
          this.treeListAdd(record)
        },
        render: (
            <TreeForm
              onSubmit={(values)=>{ this.handlePopoverAddSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        icon: 'edit',
        text: '编辑',
        name: 'edit',
        onClick: (record) => {
          this.treeListEdit(record)
        },
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
        name: 'remove',
        onClick: (record) => {
          this.treeListDelete(record)
        },
      }
    ]
    return (
      <PageHeaderLayout wrapperClassName={styles.wrapper}>
        <OopTreeTable
          ref={(el)=>{ this.oopTreeTable = el }}
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
              menuVisible: (state)=>{ this.setVisible(state) },
              treeMenuVisible: this.state.treeMenuVisible,
              rightClick: (data)=>{
                this.rightClick(data)
              },
            },
            showLine: true,
            title: '应用类别',
            treeTitle: 'name',
            treeLoading: loading,
            treeData,
            treeKey: 'id',
            defaultSelectedKeys: ['-1'],
            treeRoot: {
              key: '-1',
              title: '全部',
            },
          }}
          size={size}
          onTableTreeNodeSelect={this.handleTableTreeNodeSelect}
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
      </PageHeaderLayout>
    )
  }
}
