import React, {Fragment} from 'react';
import classNames from 'classnames';
import {Modal, Form, Spin, Input, Button, Radio, InputNumber, Select, Popover } from 'antd';
import {connect} from 'dva';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import DescriptionList from '@framework/components/DescriptionList';
import OopTreeTable from '../../../components/OopTreeTable';
import OopModal from '../../../components/OopModal';
import styles from './Dictionary.less';

const { Description } = DescriptionList;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
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
const TreeForm = Form.create()((props) => {
  const { form, child, parentId, parentName } = props;
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
          {
            child && (
              <Fragment>
                <FormItem { ...formItemLayout } key="6" label="父级">
                  {parentName}
                </FormItem>
                <div>
                  {form.getFieldDecorator('parentId', {
                    initialValue: parentId
                  })(<Input type="hidden" />)}
                </div>
              </Fragment>
            )
          }
          <FormItem { ...formItemLayout } key="1" label="名称">
            {form.getFieldDecorator('catalogName', {
              initialValue: props.catalogName,
              rules: [
                { required: true, whitespace: true, message: '名称不能为空', }
              ]
            })(<Input placeholder="请输入字典项内容" style={{width: 200}} />)}
          </FormItem>
          <FormItem {...formItemLayout} key="2" label="编码">
            {form.getFieldDecorator('catalogCode', {
              initialValue: props.catalogCode,
              rules: [
                { required: true, whitespace: true, pattern: /^(?![0-9]+$)[^ \u4e00-\u9fa5]+$/, message: '不能为空，且不能为纯数字', },
              ]
            })(<Input placeholder="请输入字典编码" style={{width: 200}} />)}
          </FormItem>
          {props.catalogType ? (
          <FormItem {...formItemLayout} key="3" label="类型">
            {form.getFieldDecorator('catalogType', {
              initialValue: props.catalogType,
              rules: [
                { required: true, whitespace: true, pattern: /^[^ \u4e00-\u9fa5]+$/, message: '类型不能为空，且为非汉字', },
              ]
            })(
              <Select disabled={true} getPopupContainer={()=>document.querySelector('.ant-form')} style={{ width: '200' }} placeholder="请选择类型">
                <Select.Option key="b" value="BUSINESS">BUSINESS</Select.Option>
                <Select.Option key="s" value="SYSTEM">SYSTEM</Select.Option>
              </Select>
            )
            }
          </FormItem>) :
          (
          <FormItem {...formItemLayout} key="3" label="类型">
            {form.getFieldDecorator('catalogType', {
              initialValue: props.catalogType,
              rules: [
                { required: true, whitespace: true, pattern: /^[^ \u4e00-\u9fa5]+$/, message: '类型不能为空，且为非汉字', },
              ]
            })(
              <Select getPopupContainer={()=>document.querySelector('.ant-form')} style={{ width: '200' }} placeholder="请选择类型">
                <Select.Option key="b" value="BUSINESS">BUSINESS</Select.Option>
                <Select.Option key="s" value="SYSTEM">SYSTEM</Select.Option>
              </Select>
            )
            }
        </FormItem>)
        }
          <FormItem {...formItemLayout} key="4" label="排序">
            {form.getFieldDecorator('sort', {
              initialValue: props.sort,
              rules: [
                { required: true, whitespace: true, pattern: /^[^ \u4e00-\u9fa5]+$/, message: '排序不能为空', },
              ]
            })(<InputNumber min={0} max={100} />)}
          </FormItem>
          <FormItem key="5" style={{marginBottom: 0}}>
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
  const { form, formEntity, selectData, selectValue, warningWrapper, loading } = props;
  return (
    <Spin spinning={loading}>
        <Form key="form" className={ classNames({[styles.warningWrapper]: warningWrapper})} style={{marginTop: 24}}>
              <div>
            {form.getFieldDecorator('id', {
              initialValue: formEntity.id
            })(<Input type="hidden" />)}
          </div>
          <FormItem {...formItemLayout} label="字典项">
            {form.getFieldDecorator('catalog', {
              initialValue: selectValue && (selectValue && Object.keys(selectValue).length !== 0) ? selectValue.catalogCode : formEntity.catalog,
              rules: [
                { required: true, whitespace: true, message: '字典项不能为空', }
              ]
            })(
            <Select placeholder="请选择字典项内容">
              {selectData.map((item)=>{
                return (
                <Select.Option key={item.id} value={item.catalogCode}>{item.catalogName}</Select.Option>
                  )
              })}
          </Select>
            )
            }
          </FormItem>
          <FormItem {...formItemLayout} label="字典编码">
            {form.getFieldDecorator('code', {
              initialValue: formEntity.code,
              rules: [
                { required: true, whitespace: true, pattern: /^[^ \u4e00-\u9fa5]+$/, message: '字典编码不能为空，且为非汉字', },
              ]
            })(<Input placeholder="请输入字典编码" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="字典值">
            {form.getFieldDecorator('name', {
              initialValue: formEntity.name,
              rules: [
                { required: true, whitespace: true, pattern: /^[^ ]+$/, message: '字典值不能为空，且不可以有空格' }
              ]
            })(<Input placeholder="请输入字典值" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="排序">
            {form.getFieldDecorator('order', {
              initialValue: formEntity.order,
              rules: [
                { required: true, message: '排序不可以为空' },
                { whitespace: true, message: '排序只可以为 1 ~ 9999 范围的数字', pattern: /^([1-9]\d{0,3})$/ }
              ]
            })(<InputNumber style={{ paddingLeft: 10}} min={0} max={9999} />)}
          </FormItem>
          <FormItem {...formItemLayout} label="是否默认">
            {form.getFieldDecorator('deft', {
              initialValue: formEntity.deft != null ? formEntity.deft : true,
            })(<RadioGroup>
                <Radio value={true}>是</Radio>
                <Radio value={false}>否</Radio>
            </RadioGroup>)}
          </FormItem>
    </Form>
  </Spin>
  )
});
@inject(['systemDictionary', 'global'])
@connect(({ systemDictionary, global, loading }) => ({
  systemDictionary,
  global,
  loading: loading.models.systemDictionary,
  gridLoading: loading.effects['systemDictionary/getTableData'],
  treeLoading: loading.effects['systemDictionary/getTreeData'],
}))
export default class Dictionary extends React.PureComponent {
  state = {
    tableTitle: '所有',
    visible: false,
    info: {},
    id: null,
    catalogName: '',
    catalogCode: '',
    catalogType: '',
    sort: '',
    handleSelect: null,
    deBugTableData: [],
    filterTableData: [],
    searchState: false,
    editDisable: false,
    deleteDisable: false,
    addOrEditModalTitle: null,
    modalVisible: false,
    isCreate: true,
    warningWrapper: false,
    closeConfirmConfig: {
      visible: false
    },
  }
  componentDidMount() {
    this.getTreeData();
    this.tableInit();
  }
  tableInit = (pagination) =>{
    const param = {
      dataDicType: '',
      pageSize: 999
    }
    if (pagination) {
      param.pageNo = pagination.pageNo;
    } else {
      param.pageNo = 1;
    }
    this.props.dispatch({
      type: 'systemDictionary/getTableData',
      payload: param,
      callback: (res)=>{
        this.setState({
          deBugTableData: res
        })
      }
    });
  }
  getTreeData = ()=> {
    this.props.dispatch({
      type: 'systemDictionary/getTreeData',
    });
  }
  onLoad = ()=>{}
  handlePopoverEditSub = (values) =>{
    const {catalogName, catalogCode, catalogType, sort} = values;
    const {id} = this.state;
    const param = [{
      catalogCode,
      catalogName,
      catalogType,
      sort
    }, id]
    this.treeListEdit(param)
    this.setState({
      catalogName: '',
      catalogCode: '',
      catalogType: '',
      sort: '',
    })
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  handlePopoverAddSub = (values) =>{
    this.treeListAdd(values)
    this.setState({
      catalogName: '',
      catalogCode: '',
      catalogType: '',
      sort: '',
    })
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  handlePopoverC = () =>{
    this.oopTreeTable.oopTree.handleClosePopover()
  }
  rightClick = (data) =>{
    const newData = {
      catalogName: data.catalogName,
      catalogCode: data.catalogCode,
      catalogType: data.catalogType,
      sort: data.sort,
      id: data.id,
      parentName: (data.parent && data.parent.catalogName) || null
    }
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
  handleCreate = ()=>{
    this.setState({
      modalVisible: true,
      addOrEditModalTitle: '新建',
      isCreate: true
    });
    setTimeout(()=>{
      this.props.dispatch({
        type: 'systemDictionary/clearEntity'
      });
    }, 300)
  }
  handleEdit = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/fetchById',
      payload: record.id,
    });
    this.setState({
      modalVisible: true,
      isCreate: false,
      addOrEditModalTitle: '编辑',
    })
  }
  deleteById = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/remove',
      payload: record.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.handleTableTreeNodeSelect()
      }
    })
  }
  treeListAdd = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/treeListAdd',
      payload: record,
      callback: (res)=>{
        oopToast(res, '添加成功', '添加失败');
        this.getTreeData();
        this.handleTableTreeNodeSelect();
      }
    })
  }
  treeListEdit = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/treeListEdit',
      payload: record,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.getTreeData();
      }
    })
  }
  treeListDelete = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/treeListDelete',
      payload: record.dataRef.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.getTreeData();
      }
    })
  }
  treeListEdit = (record) => {
    this.props.dispatch({
      type: 'systemDictionary/treeListEdit',
      payload: record,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.getTreeData();
      }
    })
  }
  // treeListDelete = (record) => {
  //   this.props.dispatch({
  //     type: 'systemDictionary/treeListDelete',
  //     payload: record.id,
  //     callback: (res)=>{
  //       oopToast(res, '删除成功', '删除失败');
  //       this.getTreeData();
  //     }
  //   })
  // }
  handleModalCancel = () => {
    this.setModalVisible(false)
    setTimeout(()=>{
      this.props.dispatch({
        type: 'systemDictionary/clearEntity'
      });
    }, 300)
  }
  handleModalSubmit = (values, form) => {
    Object.assign(values, { dataDicType: 'BUSINESS' });
    this.props.dispatch({
      type: 'systemDictionary/saveOrUpdate',
      payload: values,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.handleModalCancel(form);
        this.handleTableTreeNodeSelect()
      }
    });
  }
  handleCloseConfirmCancel = (warningWrapper) => {
    this.setState({
      warningWrapper
    })
  }
  setModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }
  handleAddOrEditModalCancel = () =>{
    this.setModalVisible(false)
    setTimeout(() => {
      this.setState({
        closeConfirmConfig: {
          visible: false
        },
        warningWrapper: false,
      });
      this.props.dispatch({
        type: 'authFunc/clear'
      });
    }, 300);
  }
  onOk = () => {
    const form = this.basic.getForm();
    const {validateFieldsAndScroll} = form;
    validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      this.handleModalSubmit(fieldsValue);
    });
  };
  onDeleteFromEdit = () => {
    const {systemDictionary: {entity: {id}}} = this.props;
    this.props.dispatch({
      type: 'systemDictionary/remove',
      payload: id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.handleTableTreeNodeSelect()
        this.setState({
          modalVisible: false
        });
      }
    })
  }
  handleBasicChange = (warningField) => {
    const visible = Object.keys(warningField).length > 0;
    this.setState((prevState) => {
      return {
        closeConfirmConfig: {
          ...prevState.closeConfirmConfig,
          visible
        },
        warningField
      }
    });
  };
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
  handleTableTreeNodeSelect = ()=>{
    const treeNode = this.oopTreeTable.getCurrentSelectTreeNode();
    if (treeNode.key === '-1') {
      this.setState({
        tableTitle: treeNode.catalogName || treeNode.title || '所有',
        handleSelect: null,
      })
      this.tableInit()
    } else {
      this.setState({
        tableTitle: treeNode.catalogName || treeNode.title || '所有',
        handleSelect: treeNode,
      })
      this.props.dispatch({
        type: 'systemDictionary/getTableData',
        payload: treeNode.catalogCode,
        callback: (res)=>{
          this.setState({
            deBugTableData: res,
            searchState: false
          })
        }
      });
    }
  }
  filterTable = (inputValue, filter) => {
    const tableDataFinal = inputValue ? filter(this.state.deBugTableData, ['catalog', 'code', 'name']) : this.state.deBugTableData;
    this.setState({
      filterTableData: tableDataFinal,
      searchState: true,
    })
  }
  render() {
    const {systemDictionary: {entity, treeData },
      global: { size }, gridLoading, treeLoading, loading } = this.props;
    const { visible, info, tableTitle, handleSelect, deBugTableData, filterTableData, searchState,
      deleteDisable, editDisable, addOrEditModalTitle, closeConfirmConfig, warningWrapper, warningField } = this.state;
    const activeTableData = searchState ? filterTableData : deBugTableData;
    const columns = [
      { title: '字典项', dataIndex: 'catalog', width: 20, render: (text, record)=> {
        return (
        <Popover content={text}>
          <div onClick={()=>this.handleView(record)} style={{textDecoration: 'underline', cursor: 'pointer', width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      }
      },
      { title: '字典编码', dataIndex: 'code', render: (text)=> {
        return (
        <Popover content={text}>
          <div style={{width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      }},
      { title: '字典值', dataIndex: 'name', render: (text)=> {
        return (
        <Popover content={text}>
          <div style={{width: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      } },
      { title: '排序', dataIndex: 'order', width: 60 },
      { title: '是否默认', dataIndex: 'deft', width: 100, render: text => (
        <Fragment>
          {text === true ? '是' : '否'}
        </Fragment>
      ) },
      { title: '系统字典', dataIndex: 'dataDicType', width: 100, render: text => (
          <Fragment>
            {text === 'SYSTEM' ? '是' : '否'}
          </Fragment>
      ) }
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate() }
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => { this.handleEdit(record) },
        display: record=>(record.dataDicType !== 'SYSTEM'),
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record) => { this.deleteById(record) },
        display: record=>(record.dataDicType !== 'SYSTEM'),
      },
    ];
    const menuList = [
      {
        icon: 'folder-add',
        text: '增加同级',
        name: 'add',
        disabled: false,
        render: (
            <TreeForm
              onSubmit={(values)=>{ this.handlePopoverAddSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        icon: 'folder-add',
        text: '增加下级',
        name: 'addChild',
        disabled: false,
        render: (
            <TreeForm
              child={true}
              parentId={this.state.id}
              parentName={this.state.catalogName}
              onSubmit={(values)=>{ this.handlePopoverAddSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        icon: 'edit',
        text: '编辑',
        name: 'edit',
        disabled: editDisable,
        render: (
              <TreeForm
              child={this.state.parentName !== null}
              catalogType={this.state.catalogType}
              catalogName={this.state.catalogName}
              catalogCode={this.state.catalogCode}
              sort={this.state.sort}
              parentId={this.state.parentId}
              parentName={this.state.parentName}
              onSubmit={(values)=>{ this.handlePopoverEditSub(values) }}
              onCancel={()=>{ this.handlePopoverC() }}
            />)
      },
      {
        confirm: '确认删除这条信息吗？',
        icon: 'delete',
        text: '删除',
        name: 'remove',
        disabled: deleteDisable,
        onClick: (record) => {
          this.treeListDelete(record)
        },
      }
    ]
    return (
      <PageHeaderLayout>
        <OopTreeTable
          ref={(el)=>{ el && (this.oopTreeTable = el) }}
          table={{
            title: `${tableTitle}数据字典`,
            grid: {list: activeTableData},
            columns,
            gridLoading,
            onLoad: this.onLoad,
            topButtons,
            rowButtons,
            oopSearch: {
              onInputChange: this.filterTable,
              placeholder: '请输入',
              enterButtonText: '搜索'
            },
            checkable: false
          }}
          tree={{
            onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
              top: 150
            },
            title: '数据字典项',
            treeLoading,
            treeData,
            treeTitle: 'catalogName',
            treeKey: 'id',
            treeRoot: {
              key: '-1',
              title: '所有',
            },
            defaultSelectedKeys: ['-1'],
            defaultExpandedKeys: ['-1'],
          }}
          size={size}
          onTreeNodeSelect={this.handleTableTreeNodeSelect}
        />
        <OopModal
          title={`${addOrEditModalTitle}功能`}
          visible={this.state.modalVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.onOk}
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
                formEntity={entity}
                selectData={treeData}
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
          title="数据字典配置"
          onCancel={()=>this.handleClose()}
          footer={<Button type="primary" onClick={()=>this.handleClose()}>确定</Button>}
        >
          <DescriptionList size={size} col="1">
            <Description term="字典项">
              {info.catalog}
            </Description>
            <Description term="字典编码">
              {info.code}
            </Description>
            <Description term="字典值">
              {info.name}
            </Description>
            <Description term="排序">
              {info.order}
            </Description>
            <Description term="是否默认">
              {info.deft === true ? '是' : '否'}
            </Description>
            <Description term="系统字典">
              {info.dataDicType === 'SYSTEM' ? '是' : '否'}
            </Description>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>)
  }
}

