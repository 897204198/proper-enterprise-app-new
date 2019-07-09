import React, {Fragment} from 'react';
import { Modal, Card, Form, Spin, Button, Alert } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import {inject} from '@framework/common/inject';
import { oopToast } from '@framework/common/oopUtils';
import OopSearch from '../../../components/OopSearch';
import OopForm from '../../../components/OopForm';
import OopTable from '../../../components/OopTable';

const ModalForm = Form.create()((props) => {
  const {loading, visible, title, onModalCancel, onModalSubmit, formEntity, filters} = props;
  const temp = {};
  const submitForm = ()=>{
    const form = temp.oopForm.getForm()
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onModalSubmit(fieldsValue, form);
    });
  }
  const cancelForm = ()=>{
    const form = temp.oopForm.getForm()
    onModalCancel(form)
  }
  const footer = (
    <Fragment>
      <Button onClick={cancelForm}>取消</Button>
      <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
    </Fragment>);
  const formConfig = {
    formJson: [
      {
        name: 'id',
        component: { name: 'Input', props: { type: 'hidden' } },
        wrapper: true
      },
      {
        label: '规则编码',
        component: {
          name: 'Input',
          props: { placeholder: '请输入规则编码' }
        },
        name: 'code',
        rules: [{ required: true, message: '此项为必填项' }]
      },
      {
        label: '规则名称',
        component: {
          name: 'Input',
          props: { placeholder: '请输入规则名称' }
        },
        name: 'name',
        rules: [{ required: true, message: '此项为必填项' }]
      },
      {
        label: '规则分类',
        component: {
          name: 'Select',
          props: { placeholder: '请选择规则分类' },
          children: filters,
        },
        name: 'type',
        rules: [{ required: true, message: '此项为必填项' }]
      },
      {
        label: '规则排序',
        component: {
          name: 'InputNumber',
          props: { placeholder: '请输入规则排序' }
        },
        name: 'sort',
        rules: [{ required: true, message: '此项为必填项' }]
      }
    ],
    formLayout: 'horizontal'
  };
  return (
    <Modal title={title} visible={visible} footer={footer} onCancel={cancelForm}>
    <Alert message="约定：规则的实现bean名称 应为规则code+AuthRuleImpl 否则规则工厂无法根据code找到对应规则的解析方式" type="warning" showIcon />
      <Spin spinning={loading}>
        <OopForm {...formConfig} ref={(el)=>{ temp.oopForm = el && el.getWrappedInstance() }} defaultValue={formEntity} />
      </Spin>
    </Modal>
  )
});

@inject(['authRule', 'global'])
@connect(({ authRule, global, loading }) => ({
  authRule,
  global,
  loading: loading.models.authRule,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Rule extends React.PureComponent {
  state = {
    modalFormVisible: false,
  }
  componentDidMount() {
    this.onLoad();
    this.loadDictData('RULE');
  }
  onLoad = (param = {})=>{
    const {pagination, type} = param;
    // console.log(JSON.parse(type))
    if (!type) {
      this.oopSearch.load({
        pagination,
        // type: {
        //   catalog: '',
        //   code: ''
        // }
      });
    } else {
      this.oopSearch.load({
        pagination,
        type: JSON.parse(type).code
      });
    }
    // this.props.dispatch({
    //   type: 'authRule/fetch',
    //   payload: {
    //     pagination,
    //     ...condition
    //   }
    // });
  }
  loadDictData = (dictCatalog, name)=>{
    this.setState({
      [name]: true
    })
    this.props.dispatch({
      type: 'authRule/findDictData',
      payload: {
        catalog: dictCatalog
      },
      callback: ()=>{
        this.setState({
          [name]: false
        })
      }
    })
  }
  handleCreate = ()=>{
    this.setModalFormVisible(true);
  }
  handleEdit = (record)=>{
    this.props.dispatch({
      type: 'authRule/fetchById',
      payload: record.id,
    });
    this.setModalFormVisible(true);
  }
  handleRemove = (record)=>{
    this.props.dispatch({
      type: 'authRule/batchRemove',
      payload: {ids: record.id.toString()},
      callback: (res) => {
        this.oopTable.clearSelection()
        oopToast(res, '删除成功', '删除失败');
        this.onLoad()
      }
    });
    // console.log('record', record.id.toString())
    // this.handleBatchRemove(record.id)
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
          type: 'authRule/batchRemove',
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
        type: 'authRule/clearEntity'
      });
    }, 300)
  }
  handleModalSubmit = (values)=>{
    // console.log(values)
    values.type = JSON.parse(values.type);
    this.props.dispatch({
      type: 'authRule/saveOrUpdate',
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
    const {authRule: {entity, RULE = []}, loading,
      global: { oopSearchGrid, size }, gridLoading } = this.props;
    const { columns } = {
      columns: [
        { title: '规则编码', dataIndex: 'code' },
        { title: '规则名称', dataIndex: 'name' },
        {
          title: '规则分类',
          dataIndex: 'type',
          filters: RULE,
          filterMultiple: false,
          render: (record) => {
            for (let i = 0; i < RULE.length; i++) {
              if (record.code === JSON.parse(RULE[i].value).code) {
                return RULE[i].text
              }
            }
          }
        },
        { title: '规则排序', dataIndex: 'sort' }
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
          moduleName="auth-rule"
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={loading === undefined ? gridLoading : loading}
            grid={oopSearchGrid}
            columns={columns}
            onLoad={this.onLoad}
            rowButtons={rowButtons}
            topButtons={topButtons}
            size={size}
            ref={(el)=>{ this.oopTable = el }}
          />
        </Card>
        <ModalForm
          visible={this.state.modalFormVisible}
          title={entity.id ? '编辑规则' : '新建规则'}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={this.handleModalSubmit}
          formEntity={entity}
          filters={RULE}
          loading={!!loading}
        />
      </PageHeaderLayout>)
  }
}
