/* eslint-disable*/
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
  const {loading, visible, title, onModalCancel, onModalSubmit, formEntity} = props;
  const submitForm = ()=>{
    const form = this.oopForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onModalSubmit(fieldsValue, form);
    });
  }
  const cancelForm = ()=>{
    const form = this.oopForm.getForm()
    onModalCancel(form)
  }
  const footer = (
    <Fragment>
      <Button onClick={cancelForm}>取消</Button>
      <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
    </Fragment>);
  const formConfig = {formJson: [{name: 'id', component: {name: 'Input', props: {type: 'hidden'}}, wrapper: true},{label: '入院途径', key: 'Input', component: {name: 'Input'}, name: 'HbgaH8FhIs'},{label: '多选框', key: 'CheckboxGroup', component: {name: 'CheckboxGroup', children: [{label: 'A', value: 'A'},{label: 'B', value: 'B'},{label: 'C', value: 'C'},{label: 'D', value: 'D'}]}, name: 'uIYihadNFg'},{label: '数字输入框', key: 'InputNumber', component: {name: 'InputNumber'}, name: 'gqBRnY3K43'},{label: '选择器', key: 'Select', component: {name: 'Select', children: [{label: 'A', value: 'A'},{label: 'B', value: 'B'},{label: 'C', value: 'C'},{label: 'D', value: 'D'}]}, name: 'cHxQmucH8x'},{label: '日期选择', key: 'DatePicker', component: {name: 'DatePicker'}, name: 'YMLVOtWnUJ'}], formLayout: 'horizontal'}
  return (
    <Modal title={title} visible={visible} footer={footer} onCancel={cancelForm}>
      <Spin spinning={loading}>
        <OopForm {...formConfig} ref={(el)=>{ this.oopForm = el && el.getWrappedInstance() }} defaultValue={formEntity} />
      </Spin>
    </Modal>
  )
});

@inject(['interfaceHospital', 'global'])
@connect(({ interfaceHospital, global, loading }) => ({
  interfaceHospital,
  global,
  loading: loading.models.interfaceHospital,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Manager extends React.PureComponent {
  state = {
    modalFormVisible: false,
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = (param = {})=>{
    const {pagination, condition} = param;
    // this.oopSearch.load({
    //  pagination
    // });
    this.props.dispatch({
      type: 'interfaceHospital/fetch',
      payload: {
        pagination,
        ...condition
      }
    });
  }
  handleCreate = ()=>{
    this.setModalFormVisible(true);
  }
  handleEdit = (record)=>{
    this.props.dispatch({
      type: 'interfaceHospital/fetchById',
      payload: record.id,
    });
    this.setModalFormVisible(true);
  }
  handleRemove = (record)=>{
    this.props.dispatch({
      type: 'interfaceHospital/remove',
      payload: record.id,
      callback: (res)=>{
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
          type: 'interfaceHospital/batchRemove',
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
  handleModalCancel = (form)=>{
    this.setModalFormVisible(false);
    setTimeout(()=>{
      form.resetFields();
      this.props.dispatch({
        type: 'interfaceHospital/clearEntity'
      });
    }, 300)
  }
  handleModalSubmit = (values)=>{
    this.props.dispatch({
      type: 'interfaceHospital/saveOrUpdate',
      payload: values,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.onLoad();
      }
    });
  }
  setModalFormVisible = (flag) =>{
    this.setState({modalFormVisible: flag})
  }
  render() {
    const {interfaceHospital: {entity, list}, loading,
      global: { oopSearchGrid, size }, gridLoading } = this.props;
    const { columns } = {columns: [{title: '入院途径', dataIndex: 'HbgaH8FhIs'},{title: '多选框', dataIndex: 'uIYihadNFg'},{title: '数字输入框', dataIndex: 'gqBRnY3K43'},{title: '选择器', dataIndex: 'cHxQmucH8x'},{title: '日期选择', dataIndex: 'YMLVOtWnUJ'}]};
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
          moduleName="interfacehospital"
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={loading === undefined ? gridLoading : loading}
            grid={{list} || oopSearchGrid}
            columns={columns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <ModalForm
          visible={this.state.modalFormVisible}
          title={entity.id ? '编辑' : '新建'}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={this.handleModalSubmit}
          formEntity={entity}
          loading={!!loading}
        />
      </PageHeaderLayout>)
  }
}
