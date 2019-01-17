import React from 'react';
import { connect } from 'dva';
import { Input, Select, Form, Button, Col, Row, Card, Modal, List, Popover } from 'antd';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import OopTable from '../../../components/OopTable';
import styles from './Mongoshell.less';

const { Option } = Select;
const FormItem = Form.Item;
const CreateForm = Form.create()((props) => {
  const { form, handleSubmit, changeSearchType, searchType } = props;

  const formHandleSubmit = (e) => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (!err) {
        handleSubmit(values);
      }
    });
  }

  const changeSearch = (val) => {
    changeSearchType(val);
  }

  return (
    <Form onSubmit={formHandleSubmit}>
      <Row gutter={6}>
        <Col span={4}>
          <FormItem>
            {form.getFieldDecorator('type', {
              initialValue: searchType,
            })(
              <Select onSelect={value => changeSearch(value)} >
                <Option value="searchById">根据id查询</Option>
                <Option value="searchAdv">高级条件查询</Option>
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={6}>
          <FormItem>
            {form.getFieldDecorator('tableName', {
              rules: [
                { required: true, message: '表名不能为空' }
              ],
            })(
              <Input placeholder="请输入表名，例：hos_user_info" />
            )}
          </FormItem>
        </Col>
        <Col span={12}>
        {
          searchType === 'searchById' ? (
            <FormItem>
              {form.getFieldDecorator('id', {
                rules: [
                  { required: true, message: 'ID不能为空' },
                  { pattern: /^[0-9a-fA-F]{24}$/, message: 'ID字节长度为24位,且只能为0-9a-fA-F' }
                ],
              })(
                <Input placeholder="请输入ID，例：59915eaf19191fcffc24a300" />
              )}
            </FormItem>
          ) : (
            <Row gutter={6}>
              <Col span={5}>
                <FormItem>
                  {form.getFieldDecorator('limit', {
                  })(
                    <Input placeholder="请输入limit" />
                  )}
                </FormItem>
              </Col>
              <Col span={5}>
                <FormItem>
                  {form.getFieldDecorator('sort', {
                  })(
                    <Input placeholder="请输入sort" />
                  )}
                </FormItem>
              </Col>
              <Col span={14}>
                <FormItem>
                  {form.getFieldDecorator('query', {
                    rules: [
                      { required: true, message: '查询语句不能为空' }
                    ],
                    initialValue: '{}'
                  })(
                    <Input placeholder="请输入查询语句" />
                  )}
                </FormItem>
              </Col>
            </Row>
          )
        }
        </Col>
        <Col span={2}>
          <FormItem>
            <Button type="primary" htmlType="submit" style={{width: '100%'}}>查询</Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
});

@inject(['devtoolsMongoshell', 'global'])
@connect(({ devtoolsMongoshell, global, loading }) => ({
  devtoolsMongoshell,
  global,
  loading: loading.models.devtoolsMongoshell
}))
export default class Mongoshell extends React.Component {
  state = {
    viewVisible: false,
    info: {},
    searchType: 'searchById',
    data: [],
    columns: []
  }

  changeSearchType = (value) => {
    this.setState({
      searchType: value
    })
  }

  handleSubmit = (value) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsMongoshell/fetch',
      payload: value,
      callback: (res) => {
        const columns = [];
        if (res[0] && Object.keys(res[0]).length) {
          for (const key of Object.keys(res[0])) {
            if (!(res[0][key] instanceof Object)) {
              columns.push({
                title: key, width: 180, dataIndex: key, key, render: (
                  text => (text ? (
                    <span>
                      {text.toString()}
                    </span>
                  ) : null)
                )
              })
            }
          }
          columns[0].render = (
            (text, record) => (
              <span
                  onClick={() => this.handleView(record)}
                  style={{textDecoration: 'underline', cursor: 'pointer'}}>
                  {text}
              </span>
            )
          );
          columns[0].fixed = 'left';
          columns[0].width = 150;
        }
        self.setState({
          data: res,
          columns
        });
      }
    });
  }

  handleView = (record) => {
    this.setState({
      viewVisible: true,
      info: record
    });
  }

  // 关闭基本信息
  handleViewModalVisible = (flag) => {
    this.setState({
      viewVisible: flag
    });
  }
  caculateWidth = (columns)=>{
    if (columns.length === 0) {
      return 0
    }
    return columns.map(it=>it.width).filter(it=>it !== undefined).reduce((prevResult, item)=>{
      const result = prevResult + item;
      return result;
    });
  }
  render() {
    const { global: {size}, loading} = this.props;
    const { searchType, data, columns, viewVisible, info } = this.state;
    const newInfo = {
      ...info
    }
    if (Object.keys(newInfo).length > 0) {
      newInfo._id = JSON.stringify(newInfo._id);
    }
    return (
      <PageHeaderLayout content={
        <CreateForm
          handleSubmit={this.handleSubmit}
          changeSearchType={this.changeSearchType}
          searchType={searchType}
        />
      }>
        <Card>
          <OopTable
            loading={loading}
            columns={columns}
            grid={{list: data}}
            size={size}
            rowKey={record=>(record._id ? record._id.$oid : 'null')}
            checkable={false}
            scroll={{ x: this.caculateWidth(columns), y: 468 }}
          />
        </Card>
        <Modal
          width="800px"
          title="mongo shell GUI"
          visible={viewVisible}
          footer={<Button type="primary" onClick={()=>this.handleViewModalVisible(false)}>确定</Button>}
          onCancel={()=>this.handleViewModalVisible(false)}
          style={{
            top: 20
          }}
        >
          <div>
            <List
              className={styles.mongoshellList}
              itemLayout="horizontal"
              split={false}
              size="small"
              dataSource={Object.keys(newInfo)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item}
                  />
                  <Popover content={newInfo[item].toString()}>
                  <div>{newInfo[item].toString()}</div>
                  </Popover>
                </List.Item>
              )}
            />
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
