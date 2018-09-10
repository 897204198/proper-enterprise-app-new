import React from 'react';
import { Modal, Card, Form, Spin, Input, Radio, Select, InputNumber, message } from 'antd';
import {connect} from 'dva';
import Debounce from 'lodash-decorators/debounce';
import OopFormDesigner from '../../../components/OopFormDesigner';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import { inject } from '../../../../framework/common/inject';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import { oopToast } from '../../../../framework/common/oopUtils';


const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { TextArea } = Input;
const { Option } = Select;
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
const TYPE_ENUM = [
  {label: '问卷', value: 'QUESTION'},
  {label: '工作流', value: 'WORKFLOW'},
]
const ModalFormBasic = Form.create()((props) => {
  const { form, loading, visible, title, onModalCancel,
    onModalSubmit, formBasic, checkFormkeydefinition, self } = props;
  const submitForm = ()=>{
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue)
      onModalSubmit(fieldsValue, form);
    });
  }
  const cancelForm = ()=>{
    onModalCancel(form)
  }

  const rule = {
    formkeydefinition: []
  };

  if (!formBasic.formkeydefinition) { // 新建状态
    rule.formkeydefinition = [{
      required: true,
      max: 20,
      pattern: /^[_0-9A-Za-z]+$/,
      message: '字段名称不能为空,且必须是"_"、数字或英文字符'
    }, {
      validator(rules, value, callback) {
        checkFormkeydefinition(rules, value, callback, self);
      }
    }];
  }
  return (
    <Modal title={title} visible={visible} onOk={submitForm} onCancel={cancelForm} maskClosable={false}>
      <Spin spinning={loading}>
        <Form>
          <div>
            {form.getFieldDecorator('id', {
              initialValue: formBasic.id,
            })(
              <Input type="hidden" />
            )}
          </div>
          <FormItem
            {...formItemLayout}
            label="名称"
          >
            {form.getFieldDecorator('name', {
              initialValue: formBasic.name,
              rules: [{ required: true, message: '名称不能为空' }],
            })(
              <Input placeholder="请输入名称" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="表单编码"
          >
            {form.getFieldDecorator('formkeydefinition', {
              initialValue: formBasic.formkeydefinition,
              rules: rule.formkeydefinition,
            })(
              <Input placeholder="请输入表单编码" disabled={!!formBasic.formkeydefinition} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="类型"
          >
            {form.getFieldDecorator('type', {
              initialValue: formBasic.type || 'QUESTION',
            })(<Select
                showSearch
                placeholder="请选择">
                <Option value="QUESTION">问卷</Option>
                <Option value="WORKFLOW">工作流</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="版本"
          >
            {form.getFieldDecorator('version', {
              initialValue: formBasic.version || 1.0
            })(
              <InputNumber placeholder="请输入版本" />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="描述"
          >
            {form.getFieldDecorator('description', {
              initialValue: formBasic.description
            })(
              <TextArea placeholder="请输入描述" autosize={{ minRows: 2, maxRows: 5 }} />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="状态"
          >
            {form.getFieldDecorator('enable', {
              initialValue: formBasic.enable == null ? true : formBasic.enable
            })(
              <RadioGroup>
                <Radio value={true}>启用</Radio>
                <Radio value={false}>停用</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <div style={{display: 'none'}}>
            {form.getFieldDecorator('formDetails', {
              initialValue: formBasic.formDetails
            })(
              <TextArea autosize={{ minRows: 2, maxRows: 5 }} disabled={true} />
            )}
          </div>
        </Form>
      </Spin>
    </Modal>
  )
});

@inject(['formTemplate', 'global'])
@connect(({ formTemplate, global, loading }) => ({
  formTemplate,
  global,
  loading: loading.models.formTemplate,
}))
export default class Template extends React.PureComponent {
  state = {
    title: '新建表单模板',
    formDesignerModalVisible: false,
    formBasicModalVisible: false,
    formDetails: {
      formJson: [],
      formLayout: 'horizontal'
    },
    list: []
  }
  currentRowRecordId = null;
  setFormDesignerModalVisible = (flag) =>{
    this.setState({formDesignerModalVisible: flag})
  }
  setFormBasicModalVisible = (flag) =>{
    this.setState({formBasicModalVisible: flag})
  }
  componentDidMount() {
    this.onLoad();
  }
  componentWillUnmount() {
    this.checkFormkeydefinition.cancel();
  }
  onLoad = ()=>{
    this.props.dispatch({
      type: 'formTemplate/fetch',
      callback: (resp)=>{
        this.setState({
          list: resp.result
        })
      }
    });
  }
  handleEdit = (record)=>{
    this.setState({
      title: '编辑表单模板'
    })
    this.setFormBasicModalVisible(true);
    this.props.dispatch({
      type: 'formTemplate/fetchById',
      payload: record.id
    });
  }
  handleRemove = (record)=>{
    this.props.dispatch({
      type: 'formTemplate/remove',
      payload: record.id,
      callback: (res)=>{
        oopToast(res, '删除成功', '删除失败');
        this.onLoad();
      }
    });
  }
  handleDesign = (record)=>{
    const { formDetails, id } = record;
    if (formDetails) {
      this.setState({
        formDetails: JSON.parse(formDetails)
      })
    }
    this.currentRowRecordId = id;
    this.setFormDesignerModalVisible(true);
  }
  handleCopy = (record)=>{
    this.setState({
      title: '复制表单模板'
    })
    this.setFormBasicModalVisible(true);
    this.props.dispatch({
      type: 'formTemplate/copyById',
      payload: record.id
    });
  }
  handleCreate = ()=>{
    this.setFormBasicModalVisible(true)
  }
  handleModalCancel = (form)=>{
    this.setFormBasicModalVisible(false);
    setTimeout(()=>{
      form.resetFields();
      this.props.dispatch({
        type: 'formTemplate/clearEntity'
      });
      this.setState({
        title: '新建表单模板'
      })
    }, 300)
  }
  handleModalSubmit = (values)=>{
    this.props.dispatch({
      type: 'formTemplate/saveOrUpdate',
      payload: values,
      callback: (res)=>{
        oopToast(res, '保存成功', '保存失败');
        // 保留分页
        const {pagination} = this.props.formTemplate.grid
        this.onLoad({ pagination });
        this.setFormBasicModalVisible(false);
      }
    });
  }
  handleFormDesignerModalSubmit = ()=>{
    const formDetails = this.oopFormDesigner.getFormConfig();
    if (formDetails.formJson.length) {
      const { formJson, ...otherProps } = formDetails;
      formJson.forEach((item)=>{
        if (item.initialValue && typeof item.initialValue === 'object') {
          if (item.initialValue.constructor.name === 'Moment') {
            const format = (item.component.props && item.component.props.format) || 'YYYY-MM-DD';
            item.initialValue = item.initialValue.format(format);
          }
        }
      });
      this.props.dispatch({
        type: 'formTemplate/updateFormDetails',
        payload: {
          formDetails: {
            ...otherProps,
            formJson: formJson.map(fj=>({...fj, active: false})),
          },
          id: this.currentRowRecordId
        },
        callback: (res)=>{
          oopToast(res, '保存成功', '保存失败');
          this.onLoad();
        }
      });
    } else {
      message.warning('请设计表单')
    }
  }
  handleFormDesignerModalCancel = ()=>{
    this.setFormDesignerModalVisible(false);
    this.currentRowRecordId = null;
    this.oopFormDesigner.resetForm();
    this.setState({
      formDetails: {
        formJson: [],
        formLayout: 'horizontal'
      }
    })
  }
  @Debounce(300)
  checkFormkeydefinition(rule, value, callback, me) {
    console.log(this)
    me.props.dispatch({
      type: 'formTemplate/queryByFormkeydefinition',
      payload: value,
      callback: (cb)=>{
        if (cb.result.length === 0) {
          callback();
        } else {
          callback('表单编码已存在');
        }
      }
    });
  }
  handleInputChange = (inputValue, filter)=>{
    const {formTemplate: {grid: {list}}} = this.props;
    const filterList = inputValue ? filter(list, ['name', 'description']) : list;
    this.setState({
      list: filterList
    })
  }
  render() {
    const {formTemplate: {entity}, loading, global: { size } } = this.props;
    const {list} = this.state;
    const columns = [
      {title: '名称', dataIndex: 'name'},
      {title: '表单编码', dataIndex: 'formkeydefinition'},
      {title: '类别', dataIndex: 'type', render: (text)=>{
        return TYPE_ENUM.filter(item=>item.value === text)[0].label
      }},
      {title: '版本', dataIndex: 'version'},
      {title: '描述说明', dataIndex: 'description'},
      {title: '状态', dataIndex: 'enable', render: (text)=>{
        return text ? '已启用' : '已禁用'
      }},
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: ()=>{ this.handleCreate() }
      },
    ];
    const rowButtons = [
      {
        text: '复制表单',
        name: 'copy',
        icon: 'copy',
        onClick: (record)=>{ this.handleCopy(record) }
      },
      {
        text: '设计表单',
        name: 'design',
        icon: 'layout',
        onClick: (record)=>{ this.handleDesign(record) }
      },
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record)=>{ this.handleEdit(record) }
      },
      {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record)=>{ this.handleRemove(record) }
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
            loading={loading}
            grid={{list}}
            columns={columns}
            rowButtons={rowButtons}
            topButtons={topButtons}
            checkable={false}
            size={size}
          />
        </Card>
        <ModalFormBasic
          visible={this.state.formBasicModalVisible}
          title={this.state.title}
          onModalCancel={this.handleModalCancel}
          onModalSubmit={this.handleModalSubmit}
          formBasic={entity}
          loading={loading}
          checkFormkeydefinition={this.checkFormkeydefinition}
          self={this}
        />
        <Modal
          visible={this.state.formDesignerModalVisible}
          width="90%"
          style={{top: '50px'}}
          onCancel={this.handleFormDesignerModalCancel}
          onOk={this.handleFormDesignerModalSubmit}
          okText="保存"
          maskClosable={false}
          destroyOnClose={true}>
          <OopFormDesigner
            ref={(el)=>{ this.oopFormDesigner = el }}
            formDetails={this.state.formDetails} />
        </Modal>
      </PageHeaderLayout>)
  }
}
