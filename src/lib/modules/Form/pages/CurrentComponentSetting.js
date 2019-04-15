import React, {Fragment} from 'react';
import { Modal, Card, Form, Spin, Button } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {inject} from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '../../../components/OopSearch';
import OopForm from '../../../components/OopForm';
import OopTable from '../../../components/OopTable';

const ModalForm = Form.create()((props) => {
  const { loading, visible, title, onModalCancel, onModalSubmit, formEntity, self } = props;
  const submitForm = ()=>{
    const form = self.oopForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onModalSubmit(fieldsValue);
    });
  }
  const cancelForm = ()=>{
    onModalCancel()
  }
  const footer = (
    <Fragment>
      <Button onClick={cancelForm}>取消</Button>
      <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
    </Fragment>);
  const formConfig = {
    formJson: [{
      name: 'id',
      component: {name: 'Input', props: {type: 'hidden'}},
      wrapper: true
    }, {
      label: '名称',
      key: 'Input',
      component: {name: 'Input', props: {placeholder: '下拉的查询项名称'}},
      name: 'name',
      rules: [{required: true, message: '此项为必填项'}]
    }, {
      label: '编码',
      key: 'Input',
      component: {name: 'Input', props: {placeholder: '唯一的编码'}},
      name: 'code',
      rules: [{required: true, message: '此项为必填项'}]
    }, {
      label: 'URL',
      key: 'Input',
      component: {name: 'Input', props: {placeholder: '请求数据的URL'}},
      name: 'url',
      rules: [{required: true, message: '此项为必填项'}]
    }, {
      label: '回显的属性值',
      key: 'Input',
      component: {name: 'Input', props: {placeholder: '回填到页面的值'}},
      name: 'showPropName'
    }, {
      label: '是否可编辑',
      key: 'Select',
      component: {name: 'Select', children: [{label: '是', value: 1}, {label: '否', value: 0}]},
      name: 'editable',
      initialValue: 0
    }, {
      label: '排序',
      key: 'InputNumber',
      component: {name: 'InputNumber', props: {placeholder: '排序'}},
      name: 'sort'
    }], formLayout: 'horizontal'
  }
  return (
    <Modal title={title} visible={visible} footer={footer} onCancel={cancelForm} maskClosable={false}>
      <Spin spinning={loading}>
        <OopForm {...formConfig} ref={(el)=>{ self.oopForm = el && el.getWrappedInstance() }} defaultValue={formEntity} />
      </Spin>
    </Modal>
  )
});

@inject(['formCurrentComponentSetting', 'global'])
@connect(({ formCurrentComponentSetting, global, loading }) => ({
  formCurrentComponentSetting,
  global,
  loading: loading.models.formCurrentComponentSetting,
}))
export default class CurrentComponentSetting extends React.PureComponent {
  state = {
    modalFormVisible: false,
    list: []
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = ()=>{
    this.props.dispatch({
      type: 'formCurrentComponentSetting/fetch',
      callback: (resp)=>{
        this.setState({
          list: resp.result
        })
      }
    });
  }
  handleCreate = ()=>{
    this.setModalFormVisible(true);
  }
  handleEdit = (record)=>{
    this.props.dispatch({
      type: 'formCurrentComponentSetting/fetchById',
      payload: record.id,
    });
    this.setModalFormVisible(true);
  }
  handleRemove = (record)=>{
    const me = this;
    this.props.dispatch({
      type: 'formCurrentComponentSetting/remove',
      payload: record.id,
      callback: (res)=>{
        me.oopTable.clearSelection()
        oopToast(res, '删除成功', '删除失败');
        this.onLoad();
      }
    });
  }
  handleBatchRemove = (items) => {
    const me = this;
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${items.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        me.props.dispatch({
          type: 'formCurrentComponentSetting/batchRemove',
          payload: {ids: items.toString()},
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  handleModalCancel = ()=>{
    console.log(this)
    const form = this.oopForm.getForm();
    this.setModalFormVisible(false);
    setTimeout(()=>{
      form.resetFields();
      this.props.dispatch({
        type: 'formCurrentComponentSetting/clearEntity'
      });
    }, 300)
  }
  handleModalSubmit = (values)=>{
    this.props.dispatch({
      type: 'formCurrentComponentSetting/saveOrUpdate',
      payload: values,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.handleModalCancel();
        this.onLoad();
      }
    });
  }
  setModalFormVisible = (flag) =>{
    this.setState({modalFormVisible: flag})
  }
  handleInputChange = (inputValue, filter)=>{
    const {formCurrentComponentSetting: {list}} = this.props;
    const filterList = inputValue ? filter(list, ['name', 'code', 'url', 'showPropName']) : list;
    this.setState({
      list: filterList
    })
  }
  render() {
    const {formCurrentComponentSetting: {entity}, loading,
      global: { size } } = this.props;
    const {list} = this.state;
    const {columns} = {
      columns: [
        {title: '名称', dataIndex: 'name'},
        {title: '编码', dataIndex: 'code'},
        {title: 'URL', dataIndex: 'url'},
        {title: '回显的属性值', dataIndex: 'showPropName'},
        {title: '是否可编', dataIndex: 'editable', render: (text)=>{
          if (text === 1) {
            return '是';
          } else if (text === 0) {
            return '否';
          } else {
            return '';
          }
        }},
        {title: '排序', dataIndex: 'sort'}
      ]
    };
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate() }
      },
      {
        text: '删除',
        name: 'batchDelete',
        icon: 'delete',
        display: items=>(items.length > 0),
        onClick: (items)=>{ this.handleBatchRemove(items) }
      },
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit(record) },
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record)=>{ this.handleRemove(record) },
      },
    ];
    return (
      <PageHeaderLayout content={
        <OopSearch
          placeholder="请输入"
          enterButtonText="搜索"
          onInputChange={this.handleInputChange}
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={!!loading}
            grid={{list}}
            columns={columns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <ModalForm
          self={this}
          visible={this.state.modalFormVisible}
          title={entity.id ? '编辑' : '新建'}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={this.handleModalSubmit}
          formEntity={entity}
          loading={!!loading}
        />
      </PageHeaderLayout>);
  }
}
