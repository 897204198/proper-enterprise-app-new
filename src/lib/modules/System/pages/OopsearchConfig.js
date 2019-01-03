import React, {Fragment} from 'react';
import { Modal, Card, Form, Input, Button } from 'antd';
import {connect} from 'dva';
import { inject } from '../../../../framework/common/inject';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import { oopToast } from '../../../../framework/common/oopUtils';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import DescriptionList from '../../../../framework/components/DescriptionList';

const { Description } = DescriptionList;
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
const ModalForm = Form.create()((props) => {
  const { form, loading, visible, title, onModalCancel, onModalSubmit, formEntity} = props;
  const submitForm = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onModalSubmit(fieldsValue, form);
    });
  }
  const cancelForm = () => {
    onModalCancel(form)
  }
  const footer = (
    <Fragment>
      <Button onClick={cancelForm}>取消</Button>
      <Button type="primary" onClick={submitForm} loading={loading}>保存</Button>
    </Fragment>);
  return (
    <Modal
      title={title}
      visible={visible}
      footer={footer}
      onCancel={cancelForm}
      maskClosable={false}
      destroyOnClose={true}
    >
      <Form>
        <div>
          {form.getFieldDecorator('id', {
            initialValue: formEntity.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="模块名称"
        >
          {form.getFieldDecorator('moduleName', {
            initialValue: formEntity.moduleName,
            rules: [{ required: true, whitespace: true, pattern: /^[A-Za-z]+$/, message: '模块名称不能为空,且必须是英文字符' }],
          })(
            <Input placeholder="请输入模块名称 如：authusers" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="URL"
          extra="模块请求跳转的业务url"
        >
          {form.getFieldDecorator('url', {
            initialValue: formEntity.url,
            rules: [{ required: true, whitespace: true, pattern: /^[A-Za-z/]+$/, message: 'url不能为空,且必须是英文字符或"/"' }],
          })(
            <Input placeholder="请输入url 如：/authusers" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="表名称"
          extra="查询使用到的表名"
        >
          {form.getFieldDecorator('tableName', {
            initialValue: formEntity.tableName,
            rules: [{ required: true, whitespace: true, pattern: /^[A-Za-z_]+$/, message: '表名不能为空,且必须是英文字符或"_"' }],
          })(
            <Input placeholder="请输入表名称 如：pep_auth_users" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="字段名称"
          extra="查询的字段名"
        >
          {form.getFieldDecorator('searchColumn', {
            initialValue: formEntity.searchColumn,
            rules: [{ required: true, whitespace: true, pattern: /^[_0-9A-Za-z]+$/, message: '字段名称不能为空,且必须是"_"、数字或英文字符' }],
          })(
            <Input placeholder="请输入字段名称 如：userName" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="别名"
          extra="查询字段别名(为了区分多表同名字段设置)，该字段内容即为RESTFul接口调用的参数名称。"
        >
          {form.getFieldDecorator('columnAlias', {
            initialValue: formEntity.columnAlias,
            rules: [{ required: true, whitespace: true, pattern: /^[A-Za-z]+$/, message: '别名不能为空,且必须是英文字符' }],
          })(
            <Input placeholder="请输入别名 如：authusersUserId" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="描述"
          extra="查询字段的描述(在输入框输入内容后下方显示数据中的描述内容)"
        >
          {form.getFieldDecorator('columnDesc', {
            initialValue: formEntity.columnDesc,
            rules: [{ required: true, whitespace: true, message: '描述不能为空' }],
          })(
            <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
          )}
        </FormItem>
      </Form>
    </Modal>
  )
});

@inject(['systemOopsearchConfig', 'global'])
@connect(({ systemOopsearchConfig, global, loading }) => ({
  systemOopsearchConfig,
  global,
  loading: loading.models.systemOopsearchConfig,
  gridLoading: loading.effects['global/oopSearchResult']
}))
export default class Config extends React.PureComponent {
  state = {
    modalFormVisible: false,
    entity: {},
    visible: false,
    info: {}
  }
  componentDidMount() {
    this.onLoad();
  }
  onLoad = (param = {}) => {
    this.oopSearch.load(param);
  }
  handleCreate = () => {
    this.setModalFormVisible(true);
  }
  handleEdit = (record) => {
    this.setState({
      entity: record
    });
    this.setModalFormVisible(true);
  }
  handleRemove = (record) => {
    this.props.dispatch({
      type: 'systemOopsearchConfig/remove',
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
          type: 'systemOopsearchConfig/remove',
          payload: items.toString(),
          callback(res) {
            me.oopTable.clearSelection()
            oopToast(res, '删除成功', '删除失败');
            me.onLoad()
          }
        })
      }
    });
  }
  handleModalCancel = (form) => {
    this.setModalFormVisible(false);
    setTimeout(()=>{
      form.resetFields();
    }, 300)
  }
  handleModalSubmit = (values, form) => {
    this.props.dispatch({
      type: 'systemOopsearchConfig/saveOrUpdate',
      payload: values,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        this.handleModalCancel(form);
        this.onLoad();
      }
    });
  }
  setModalFormVisible = (flag) => {
    if (!flag) {
      this.setState({
        modalFormVisible: false,
        entity: {}
      });
    } else {
      this.setState({modalFormVisible: flag});
    }
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
    const { loading, global: { oopSearchGrid, size }, gridLoading } = this.props;
    const { modalFormVisible, entity, visible, info } = this.state;
    const columns = [
      {title: '模块名称', dataIndex: 'moduleName', render: (text, record)=>(
        <span
          onClick={()=>this.handleView(record)}
          style={{textDecoration: 'underline', cursor: 'pointer'}}>
          {text}
        </span>
      )},
      {title: 'URL', dataIndex: 'url'},
      {title: '表名称', dataIndex: 'tableName'},
      {title: '字段名称', dataIndex: 'searchColumn'},
      {title: '别名', dataIndex: 'columnAlias'},
      {title: '描述', dataIndex: 'columnDesc'},
    ];
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
          moduleName="systemconfig"
          ref={(el)=>{ this.oopSearch = el && el.getWrappedInstance() }}
        />
      }>
        <Card bordered={false}>
          <OopTable
            loading={gridLoading}
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
          visible={modalFormVisible}
          title={entity.id ? '编辑oopsearch配置' : '新建oopsearch配置'}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={this.handleModalSubmit}
          formEntity={entity}
          loading={!!loading}
        />
        <Modal
          visible={visible}
          title="oopsearch配置"
          onCancel={()=>this.handleClose()}
          footer={<Button type="primary" onClick={()=>this.handleClose()}>确定</Button>}
        >
          <DescriptionList size={size} col="1">
            <Description term="模块名称">
              {info.moduleName}
            </Description>
            <Description term="URL">
              {info.url}
            </Description>
            <Description term="表名称">
              {info.tableName}
            </Description>
            <Description term="字段名称">
              {info.searchColumn}
            </Description>
            <Description term="别名">
              {info.columnAlias}
            </Description>
            <Description term="描述">
              {info.columnDesc}
            </Description>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>)
  }
}
