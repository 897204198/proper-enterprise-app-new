import React from 'react';
import { Form, Spin, Input, Popover, Modal } from 'antd';
import {connect} from 'dva';
import classNames from 'classnames';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import OopTreeTable from '../../../components/OopTreeTable';
import OopModal from '../../../components/OopModal';
import styles from '../../System/pages/Dictionary.less';
import commonStyle from '../../Auth/pages/User.less';

const { TextArea } = Input;
const FormItem = Form.Item;
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
/* 问题分类表单 */
const QuestionSubmitForm = Form.create()((props) => {
  const {loading = false, form, formInfo } = props;
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
        label="类别名称"
      >
        {form.getFieldDecorator('name', {
          initialValue: formInfo.name,
          rules: [{ required: true, message: '类别名称不能为空'},
                  { pattern: /^[\u4e00-\u9fa5]{2,5}$/, message: '类别名称长度只能为2~5个中文'}
                ]
        })(
          <Input placeholder="请输入问题类别名称长度2~5个字" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="类别图标"
      >
        {form.getFieldDecorator('icon', {
          initialValue: formInfo.icon,
          rules: [
            { required: true, message: '类别图标不能为空' }
          ]
        })(
          <Input placeholder="请输入类别图标对应字段名称" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="跳转页"
      >
        {form.getFieldDecorator('pageUrl', {
          initialValue: formInfo.pageUrl,
          rules: [{ required: true, message: '跳转页名称不能为空' }]
        })(
          <Input placeholder="请输入正确的跳转页名称" />
        )}
      </FormItem>
    </Form>
  </Spin>
  );
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
/**
 * 问题详情表单
 */
const QuestionDetailForm = Form.create({onValuesChange})((props) => {
  const { form, loading = false, formInfo = {}, warningField, warningWrapper } = props;
  return (
    <Spin spinning={loading}>
    <div>
      {form.getFieldDecorator('id', {
        initialValue: formInfo.id,
      })(
        <Input type="hidden" />
      )}
    </div>
    <Form
      className={classNames({[commonStyle.warningWrapper]: warningWrapper})}>
      <FormItem
        {...formItemLayout}
        label="问题名称"
        className={warningField && warningField.name && styles.hasWarning}
      >
        {form.getFieldDecorator('name', {
          initialValue: formInfo.name,
          rules: [{ required: true, message: '问题名称不能为空' }]
        })(
          <Input placeholder="请输入问题名称" />
        )}
      </FormItem>
      <FormItem
        {...formItemLayout}
        label="问题答案"
        className={warningField && warningField.answer && styles.hasWarning}
      >
        {form.getFieldDecorator('answer', {
          initialValue: formInfo.answer,
          rules: [{ required: true, message: '问题答案不能为空' }]
        })(
          <TextArea rows={8} placeholder="对提出的问题进行解答" />
        )}
      </FormItem>
    </Form>
  </Spin>
  )
});
@inject(['otherQuestion', 'global'])
@connect(({ otherQuestion, global, loading }) => ({
  otherQuestion,
  global,
  loading: loading.models.otherQuestion,
  typeSubmitLoading: loading.effects['otherQuestion/treeListAdd'],
  tableSubmitLoading: loading.effects['otherQuestion/postTable'],
  tableLoading: loading.effects['otherQuestion/tableData'],
  treeLoading: loading.effects['otherQuestion/treeData'],
}))
export default class Question extends React.PureComponent {
  state = {
    tableTitle: '全部',
    nowQestionTypeId: '', // 当前问题分类id 默认显示全部
    handleSelect: null, // 选中的树节点
    filterTableData: [],
    searchState: false, // 是否搜索
    editDisable: false,
    deleteDisable: false,
    addOrEditModalTitle: null,
    addOrEditTypeTitle: null,
    modalVisible: false,
    isCreate: true,
    warningWrapper: false,
    closeConfirmConfig: {
      visible: false
    },
    typeCloseConfirm: {
      visible: false
    },
    typeInfo: {},
    typeIsCreate: true,
    typeVisibel: false,
    warningField: {} // 检验表单内容变化
  }
  componentDidMount() {
    this.getTreeData();
    this.getTableData();
  }
  getTableData = () =>{
    const me = this;
    const param = {
      pageNo: 1,
      pageSize: 999,
      categoryId: this.state.nowQestionTypeId
    }
    me.props.dispatch({
      type: 'otherQuestion/tableData',
      payload: param,
      callback: ()=>{
        me.setState({
          searchState: false
        })
      }
    });
  }
  getTreeData = ()=> {
    this.props.dispatch({
      type: 'otherQuestion/treeData',
    });
  }
  /*
  * 树右键点击
  */
  rightClick = (data) =>{
    this.setState({
      handleSelect: data
    })
    // 默认添加项-不可以删除和编辑
    if (data.key === '-1') {
      this.setState({
        editDisable: true,
        deleteDisable: true,
      })
    } else {
      this.setState({
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
        type: 'otherQuestion/clearEntity'
      });
    }, 300)
  }
  handleEdit = (record) => {
    this.props.dispatch({
      type: 'otherQuestion/getEdit',
      payload: {
        id: record.id
      },
      callback: (res) => {
        this.setState({
          info: res,
        })
      }
    })
    this.setState({
      modalVisible: true,
      isCreate: false,
      addOrEditModalTitle: '编辑',
    })
  }
  deleteById = (record) => {
    const me = this
    this.props.dispatch({
      type: 'otherQuestion/remove',
      payload: record.id,
      callback: (res)=>{
        me.oopTreeTable.oopTable.clearSelection();
        oopToast(res, '删除成功', '删除失败');
        this.getTableData();
      }
    })
  }
  treeListAdd = (record) => {
    const { handleSelect } = this.state;
    const param = {
      ...record,
      sort: handleSelect.sort
    }
    this.props.dispatch({
      type: 'otherQuestion/treeListAdd',
      payload: param,
      callback: (res)=>{
        oopToast(res, '添加成功', '添加失败');
        this.setState({
          typeVisibel: false,
          tableTitle: '全部'
        }, ()=>{
          this.getTreeData();
          this.handleTableTreeNodeSelect();
        })
      }
    })
  }
  treeListEdit = (record) => {
    this.props.dispatch({
      type: 'otherQuestion/treeListEdit',
      payload: record,
      callback: (res)=>{
        oopToast(res, '修改成功', '修改失败');
        this.setState({
          typeVisibel: false
        }, ()=>{
          this.getTreeData();
          this.handleTableTreeNodeSelect();
        })
      }
    })
  }
  treeListDelete = () => {
    const { handleSelect } = this.state;
    this.props.dispatch({
      type: 'otherQuestion/treeListDelete',
      payload: handleSelect.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.setState({
          typeVisibel: false,
          nowQestionTypeId: '',
          tableTitle: '全部'
        }, ()=>{
          this.getTableData();
          this.getTreeData();
        })
      }
    })
  }
  handleModalCancel = () => {
    this.setModalVisible(false)
  }
  handlePutModal = (values)=>{
    const param = {
      name: values.name,
      answer: values.answer,
      id: values.id,
    }
    this.props.dispatch({
      type: 'otherQuestion/putTable',
      payload: param,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.clearInfo()
        this.handleModalCancel();
        this.getTableData();
        this.handleTableTreeNodeSelect()
      }
    });
  }
  handleModalSubmit = (values) => {
    const { nowQestionTypeId } = this.state;
    const paramPost = {
      name: values.name,
      answer: values.answer,
      id: nowQestionTypeId
    }
    this.props.dispatch({
      type: 'otherQuestion/postTable',
      payload: paramPost,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.clearInfo()
        this.handleModalCancel();
        this.getTableData()
        this.handleTableTreeNodeSelect()
      }
    });
  }
  handleCloseConfirmCancel = (warningWrapper) => {
    this.setState({
      warningWrapper
    })
    this.clearInfo()
  }
  setModalVisible = (flag) => {
    this.setState({
      modalVisible: flag
    });
  }
  clearTypeInfo = ()=>{
    this.setState({
      typeInfo: {}
    })
  }
  clearInfo = ()=>{
    this.setState({
      info: {}
    })
  }
  handleAddOrEditModalCancel = () =>{
    this.setModalVisible(false)
    setTimeout(() => {
      this.clearInfo();
      this.setState({
        closeConfirmConfig: {
          visible: false
        },
        warningWrapper: false,
      });
    }, 300);
  }
  onOk = () => {
    const form = this.basic.getForm();
    const {validateFieldsAndScroll} = form;
    validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      fieldsValue.id ? this.handlePutModal(fieldsValue) : this.handleModalSubmit(fieldsValue);
    });
  };
  onDeleteFromEdit = () => {
    const { info } = this.state;
    this.props.dispatch({
      type: 'otherQuestion/remove',
      payload: info.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.handleTableTreeNodeSelect()
        this.setState({
          modalVisible: false,
          info: {}
        });
        this.getTableData();
      }
    })
  }
  handleBasicChange = (warningField) => {
    const visible = Object.keys(warningField).length > 0;
    this.setState((prevState) => {
      return {
        closeConfirmConfig: {
          ...prevState.closeConfirmConfig,
          visible,
          info: {}
        },
        warningField
      }
    });
  };
  // 选中树节点（点击树列表）
  handleTableTreeNodeSelect = ()=>{
    const treeNode = this.oopTreeTable.getCurrentSelectTreeNode();
    if (treeNode.key) {
      this.setState({
        tableTitle: treeNode.key === '-1' ? '全部' : treeNode.name,
        nowQestionTypeId: treeNode.key === '-1' ? '' : treeNode.key,
      }, ()=>{
        this.getTableData()
      })
    }
  }
  // 批量删除规则
   deleteAll = (selectedRowKeys) => {
     Modal.confirm({
       title: '提示',
       content: `确定删除选中的${selectedRowKeys.length}条数据吗`,
       okText: '确认',
       cancelText: '取消',
       onOk: () => {
         this.props.dispatch({
           type: 'otherQuestion/removeAll',
           payload: {
             ids: selectedRowKeys.toString()
           },
           callback: (res) => {
             oopToast(res, '删除成功', '删除失败');
             // 清空选中项状态
             this.oopTreeTable.oopTable.clearSelection();
             // 刷新表格
             this.getTableData();
           }
         });
       }
     });
   }
  // 静态过滤表格数据
  filterTable = (inputValue, filter) => {
    const { otherQuestion: { tableData } } = this.props;
    const tableDataFinal = inputValue ? filter(tableData, ['name', 'answer', 'views', 'tread', 'awesome']) : tableData;
    this.setState({
      filterTableData: tableDataFinal,
      searchState: true,
    })
  }
  /* 提交问题类别表单 */
  handleOkQuestionType = (record)=>{
    this.props.dispatch({
      type: 'otherQuestion/treeListAdd',
      payload: record,
      callback: (res)=>{
        oopToast(res, '添加成功', '添加失败');
        this.getTreeData();
      }
    })
  }
  handleTreeListAdd = ()=>{
    this.setState({
      typeVisibel: true,
      typeIsCreate: true,
      addOrEditTypeTitle: '新建'
    })
  }
  handleTreeListEdit = ()=>{
    this.setState({
      typeVisibel: true,
      typeIsCreate: false,
      addOrEditTypeTitle: '编辑',
      typeInfo: this.state.handleSelect
    })
  }
  handleTreeListDelete = ()=>{
    const { otherQuestion: { treeData } } = this.props;
    if (treeData.length > 1) {
      Modal.confirm({
        title: '提示',
        content: '是否确认删除该问题分类',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.treeListDelete()
        }
      });
    } else {
      Modal.info({
        title: '至少要保留一个项目',
        okText: '知道了'
      });
    }
  }
  typenCancel = ()=>{
    this.setState({
      typeCloseConfirm: {
        visible: false
      },
      typeVisibel: false,
      typeInfo: {}
    })
  }
  /*
  * 提交问题分类表单
  */
  typeSubmit = () =>{
    const { typeIsCreate } = this.state;
    const questionType = this.questionType.getForm();
    if (questionType) {
      questionType.validateFieldsAndScroll((err, data) => {
        if (err) return;
        typeIsCreate ? this.treeListAdd(data) : this.treeListEdit(data);
      })
    }
  }
  onLoad = ()=>{}
  handleUserInfoFormChange = (warningField) => {
    const typeVisibel = Object.keys(warningField).length > 0;
    this.setState((prevState) => {
      return {
        typeCloseConfirm: {
          ...prevState.typeCloseConfirm,
          typeVisibel
        },
        warningField
      }
    });
  };
  render() {
    const {
      otherQuestion: { tableData,
        treeData
      },
      global: { size }, tableSubmitLoading, typeSubmitLoading, tableLoading, treeLoading
    } = this.props;
    const { tableTitle, deleteDisable, editDisable, addOrEditModalTitle, closeConfirmConfig, addOrEditTypeTitle,
      warningWrapper, warningField, info, searchState, filterTableData, typeInfo, typeIsCreate, typeVisibel, typeCloseConfirm
    } = this.state;
    const formatTreeData = treeData.map((item)=> {
      item.catalogName = item.name;
      return item;
    })
    const activeTableData = searchState ? filterTableData : tableData;
    const columns = [
      { title: '问题', dataIndex: 'name', width: 20,
        render: (text, record)=> {
          return (
        <Popover content={text}>
          <div onClick={()=>this.handleView(record)} style={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
        }
      },
      { title: '答案', dataIndex: 'answer', width: 140, render: (text)=> {
        return (
        <Popover content={text}>
          <div style={{width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {text}
          </div>
        </Popover>)
      }},
      { title: '浏览次数', dataIndex: 'views',
        sorter: (a, b) => a.views - b.views, },
      { title: '赞', dataIndex: 'awesome',
        sorter: (a, b) => a.awesome - b.awesome, },
      { title: '踩', dataIndex: 'tread',
        sorter: (a, b) => a.tread - b.tread, },
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate() },
        disabled: tableTitle === '全部'
      },
      {
        text: '批量删除',
        name: 'delete',
        icon: 'delete',
        onClick: (items)=>{ this.deleteAll(items) },
        display: items=>(items.length)
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => { this.handleEdit(record) },
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record) => { this.deleteById(record) },
      },
    ];
    const menuList = [
      {
        icon: 'folder-add',
        text: '新建',
        name: 'add',
        disabled: false,
        onClick: ()=>{
          this.handleTreeListAdd()
        },
      },
      {
        icon: 'edit',
        text: '编辑',
        name: 'edit',
        disabled: editDisable,
        onClick: () => {
          this.handleTreeListEdit()
        },
      },
      {
        icon: 'delete',
        text: '删除',
        name: 'remove',
        disabled: deleteDisable,
        onClick: (record) => {
          this.handleTreeListDelete(record)
        },
      }
    ];
    return (
      <PageHeaderLayout>
        <OopTreeTable
          ref={(el)=>{ el && (this.oopTreeTable = el) }}
          table={{
            title: `${tableTitle}`,
            grid: {list: activeTableData},
            columns,
            tableLoading,
            onLoad: this.onLoad,
            topButtons,
            rowButtons,
            oopSearch: {
              onInputChange: this.filterTable,
              placeholder: '请输入',
              enterButtonText: '搜索'
            },
            checkable: true
          }}
          tree={{
            onRightClickConfig: {
              menuList,
              rightClick: (data)=>{
                this.rightClick(data)
              },
            },
            title: '问题分类',
            treeLoading,
            treeData: formatTreeData,
            treeTitle: 'name',
            treeKey: 'id',
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
        {/* 问题详细表单 */}
        <OopModal
          title={`${addOrEditModalTitle}问题`}
          visible={this.state.modalVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleAddOrEditModalCancel}
          onOk={this.onOk}
          onDelete={this.onDeleteFromEdit}
          isCreate={this.state.isCreate}
          tabs={[
            {
              key: 'basic',
              title: '基本信息',
              main: true,
              content: <QuestionDetailForm
                ref={(el) => {
                  this.basic = el;
                }}
                formInfo={info}
                loading={tableSubmitLoading}
                warningWrapper={warningWrapper}
                warningField={warningField}
              />
            },
          ]}
        />
        {/* 问题分类表单 */}
        <OopModal
          width={800}
          loading={typeSubmitLoading}
          title={`${addOrEditTypeTitle}问题分类`}
          visible={typeVisibel}
          closeConfirm={typeCloseConfirm}
          destroyOnClose={true}
          isCreate={typeIsCreate}
          onCancel={this.typenCancel}
          onOk={this.typeSubmit}
          onDelete={this.treeListDelete}
          tabs={[
          {
            key: 'questionType',
            title: '基本信息',
            main: true,
            content:
            <QuestionSubmitForm
              ref={(el) => {
                this.questionType = el;
              }}
              formInfo={typeIsCreate ? {} : typeInfo}
              // loading={loading}
              warningWrapper={warningWrapper}
              warningField={warningField}
            />
            },
          ]}
        />
      </PageHeaderLayout>)
  }
}
