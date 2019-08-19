import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Button, Input, Modal, Form, Spin, Col, Row, List, Avatar, Radio, DatePicker, Badge } from 'antd';
import moment from 'moment';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import DescriptionList from '@framework/components/DescriptionList';
import OopSearch from '../../../components/OopSearch';
import OopTable from '../../../components/OopTable';
import styles from './Notice.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const { Description } = DescriptionList;
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
const InfoForm = Form.create()((props) => {
  const { form, loading, formInfo, nowInfoType } = props;
  const timeNow = { startValue: null, endValue: null };

  const disabledStartDate = (startValue) => {
    const endValue = form.getFieldValue('endTime');
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }
  const disabledEndDate = (endValue) => {
    const startValue = form.getFieldValue('beginTime');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  const startChange = (value) => {
    timeNow.startValue = value;
  }
  const endChange = (value) => {
    timeNow.endValue = value;
  }
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
          label="信息类型"
        >
          {form.getFieldDecorator('infoType', {
            initialValue: nowInfoType,
            rules: [{ required: true, message: '公告类型不能为空' }]
          })(
            <Input placeholder="请输入公告信息类型" disabled={true} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="通知标题"
        >
          {form.getFieldDecorator('title', {
            initialValue: formInfo.title,
            rules: [{ required: true, message: '通知标题不能为空' }]
          })(
            <Input placeholder="请输入通知标题" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="开始时间"
        >
          {form.getFieldDecorator('beginTime', {
            initialValue: formInfo.beginTime ? moment(formInfo.beginTime) : null,
          })(
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="开始时间"
              onChange={startChange}
              disabledDate={disabledStartDate}
            />

          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="结束时间"
        >
          {form.getFieldDecorator('endTime', {
            initialValue: formInfo.endTime ? moment(formInfo.endTime) : null,
          })(
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="结束时间"
              onChange={endChange}
              disabledDate={disabledEndDate}
            />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="通知内容"
        >
          {form.getFieldDecorator('info', {
            initialValue: formInfo.info
          })(
            <TextArea placeholder="请输入通知内容" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="通知状态"
        >
          {form.getFieldDecorator('infoStatus', {
            initialValue: formInfo.infoStatus ? formInfo.infoStatus : false,
          })(
            <RadioGroup>
              <Radio value={true}>启用</Radio>
              <Radio value={false}>停用</Radio>
            </RadioGroup>
          )}
        </FormItem>
      </Form>
    </Spin>
  )
});

const CreateForm = (props) => {
  const { form, modalVisible, submitForm, closeForm, loading,
    formInfo, nowInfoType } = props;
  const temp = {};
  const handleCancel = () => {
    const customForm = temp.infoForm.getForm();
    closeForm(customForm);
  };
  const handleOk = () => {
    const customForm = temp.infoForm.getForm();
    customForm.validateFields((err, fieldsValue) => {
      if (err) return;
      submitForm(form, fieldsValue);
    });
  };
  const footer = (
    <Fragment>
      <Button onClick={handleCancel}>取消</Button>
      <Button type="primary" onClick={handleOk} loading={loading}>保存</Button>
    </Fragment>
  );
  return (
    <Modal
      visible={modalVisible}
      destroyOnClose={true}
      title="通知信息"
      onCancel={handleCancel}
      footer={footer}
      maskClosable={false}
    >
      <InfoForm
        ref={(el) => { temp.infoForm = el }}
        loading={loading}
        nowInfoType={nowInfoType}
        formInfo={formInfo}
      />
    </Modal>
  );
};

@inject(['notice', 'global'])
@connect(({ notice, global, loading }) => ({
  notice,
  global,
  loading: loading.models.notice,
  listLoading: loading.effects['notice/noticeList'],
  typeLoading: loading.effects['notice/noticeType'],
}))
export default class Notice extends PureComponent {
  state = {
    modalVisible: false,
    formInfo: {},
    nowInfoType: null,
    list: [],
    pagination: undefined
  }
  componentDidMount() {
    this.infoType();
  }
  // 获取左侧列表
  infoType = () => {
    this.props.dispatch({
      type: 'notice/noticeType',
      callback: (res) => {
        if (res.status === 'ok') {
          this.setState({
            nowInfoType: res.result[0].infoType
          })
          // 获取对应列表
          this.refresh();
        }
      }
    })
  }
  // 获取列表
  refresh = () => {
    const { nowInfoType } = this.state;
    this.props.dispatch({
      type: 'notice/noticeList',
      payload: { infoType: nowInfoType, title: ''},
      callback: (res) => {
        console.log(res)
        const list = res.result.data;
        this.translateData(res, list);
        this.setState({ list })
      }
    })
  }
  translateData = (res, list)=>{
    const flag = true;
    for (const item of list) {
      item.infoStatus === flag ? item.infoStatusDes = '已启用' : item.infoStatusDes = '已停用';
    }
  }
  // 左侧目录切换列表
  handleTabList(params) {
    this.setState({
      nowInfoType: params,
      pagination: { pageNo: 1 }
    }, () => {
      this.setState({
        pagination: undefined
      })
      this.refresh();
    })
  }
  // 打开新建层
  handleCreate = () => {
    this.setState({
      modalVisible: true
    });
  }
  // 空值变换
  isNull = (item) => {
    const me = this;
    if (item !== null) {
      return me.formatDate(item);
    }
    if (item == null) {
      return '';
    }
  }
  // 格式化moment数据
  formatDate = (time) => {
    return moment(time._d).format('YYYY-MM-DD HH:mm:ss')
  }
  // 提交表单
  submitForm = (form, fields) => {
    const me = this;
    const params = fields;
    me.props.dispatch({
      type: 'notice/submitOrUpdate',
      payload: {
        id: params.id,
        beginTime: me.isNull(params.beginTime),
        endTime: me.isNull(params.endTime),
        info: params.info,
        infoStatus: params.infoStatus,
        infoType: params.infoType,
        title: params.title
      },
      callback: (res) => {
        oopToast(res, '保存成功', '保存失败');
        me.refresh();
        me.closeForm(form);
      }
    });
  }
  // 查看基本信息
  handleView = (record) => {
    const formInfo = record;
    const text = formInfo.infoStatus;
    formInfo.enableLabel = text === true ? '已启用' : '已停用';
    formInfo.badge = text === true ? 'processing' : 'default';
    this.setState({
      viewVisible: true,
      formInfo
    })
  }
  // 关闭form
  closeForm = () => {
    this.setState({
      modalVisible: false,
      formInfo: {}
    });
  }
  // 关闭查看通知设置
  closeViewModal = () => {
    this.setState({
      viewVisible: false,
      formInfo: {}
    });
  }
  // 编辑信息
  handleEdit = (record) => {
    this.setState({
      modalVisible: true,
      formInfo: record
    });
  }

  // 删除单项通知
  handleRemove = (record) => {
    const me = this;
    me.props.dispatch({
      type: 'notice/removeNoticeInfo',
      payload: {
        id: record.id
      },
      callback: (res) => {
        oopToast(res, '删除成功', '删除失败');
        if (me.oopTable) {
          me.oopTable.clearSelection();
          me.refresh();
        }
      }
    });
  }
  filterTable = (inputValue, filter) => {
    const { notice: { noticeList } } = this.props;
    this.setState({
      list: inputValue ? filter(noticeList, ['title', 'info', 'beginTime', 'endTime']) : noticeList
    })
  }
  render() {
    const { loading, global: { size }, listLoading, typeLoading, notice: { menusType } } = this.props;
    const { modalVisible, viewVisible, formInfo, nowInfoType, list, pagination } = this.state;
    const columns = [
      {
        title: '通知标题', dataIndex: 'title', key: 'title',
        render: (text, record) =>(
          <span
            onClick={() =>
            this.handleView(record)}
            style={{ textDecoration: 'underline', cursor: 'pointer' }}>
            {record.infoStatus === true ? (<a>{text}</a>) : text}
              </span>
        )
      },
      {
        title: '通知内容', dataIndex: 'info', key: 'info', render: text => (
          text && text.length > 10 ?
            (<span>{text.substr(0, 10)}...</span>) : (<span>{text}</span>)
        )
      },
      { title: '开始时间', dataIndex: 'beginTime', key: 'beginTime' },
      { title: '结束时间', dataIndex: 'endTime', key: 'endTime' },
      {
        title: '状态', dataIndex: 'infoStatusDes', key: 'infoStatusDes',
        render: text => (
          <Fragment>
            {text}
          </Fragment>
        )
      }
    ];
    const topButtons = [
      {
        text: '新建',
        name: 'create',
        type: 'primary',
        icon: 'plus',
        onClick: () => {
          this.handleCreate(nowInfoType)
        }
      }
    ];
    const rowButtons = [
      {
        text: '编辑',
        name: 'edit',
        icon: 'edit',
        onClick: (record) => {
          this.handleEdit(record)
        }
      }, {
        text: '删除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要删除此条信息',
        onClick: (record) => { this.handleRemove(record) }
      }

    ]
    return (
      <PageHeaderLayout >
        <Row gutter={16}>
          <Col span={18} push={6}>
            <Card bordered={false} title="通知列表">
              <OopSearch
                style={{marginBottom: 16}}
                placeholder="请输入"
                enterButtonText="搜索"
                onInputChange={this.filterTable}
                ref={(el) => { this.oopSearch = el && el.getWrappedInstance() }}
              />
              <OopTable
                grid={{ list, pagination }}
                checkable={false}
                columns={columns}
                loading={listLoading}
                size={size}
                topButtons={topButtons}
                rowButtons={rowButtons}
                pagination={pagination || undefined}
                ref={(el) => { this.oopTable = el }}
              />
            </Card>
          </Col>
          <Col span={6} pull={18}>
            <Card title="通知类型" bordered={false} style={{ minWidth: 120 }}>
              <List
                size={size}
                itemLayout="horizontal"
                loading={typeLoading}
                dataSource={menusType}
                className={styles.listItemHoverColor}
                renderItem={menusData => (
                  <List.Item
                    className={nowInfoType === menusData.infoType ? styles.listItemClickColor : ''}
                    onClick={() => {
                      this.handleTabList(menusData.infoType)
                    }} >
                    <List.Item.Meta
                      avatar={<Avatar icon="bell" />}
                      title={menusData.infoType}
                      description={<div> {menusData.infoDescribe}</div>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
        <CreateForm
          modalVisible={modalVisible}
          loading={!!loading}
          submitForm={this.submitForm}
          closeForm={this.closeForm}
          formInfo={formInfo}
          nowInfoType={nowInfoType}
        />
        <Modal
          visible={viewVisible}
          title="通知信息"
          destroyOnClose={true}
          onCancel={() => this.closeViewModal()}
          footer={<Button type="primary" onClick={() => this.closeViewModal()}>确定</Button>}
        >
          <DescriptionList size="small" col="1">
            <Description term="通知类型">
              {formInfo.infoType}
            </Description>
            <Description term="通知标题">
              {formInfo.title}
            </Description>
            <Description term="开始时间">
              {formInfo.beginTime}
            </Description>
            <Description term="结束时间">
              {formInfo.endTime}
            </Description>
            <Description term="通知内容">
              {formInfo.info}
            </Description>
            <p>
              <Badge status={formInfo.badge} text={formInfo.enableLabel} />
            </p>
          </DescriptionList>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
