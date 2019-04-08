import React, {Fragment} from 'react';
import { Form, Input, Spin, Button } from 'antd';
import OopModal from '@pea/components/OopModal';
import UIDocument from '../components/UIDocument';

const FormItem = Form.Item;
const { TextArea } = Input;
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
  const { form, loading, funcBasicInfo } = props;
  const { getFieldDecorator, getFieldValue } = form;
  const handleConfirmJson = (rule, value, callback) => {
    try {
      if (value !== '') {
        JSON.parse(getFieldValue('data'))
      }
    } catch (err) {
      callback('输入JSON格式错误')
    }
    callback()
  }
  return (
    <Spin spinning={loading}>
      <Form key="form" style={{marginTop: 24}}>
        <div>
          {getFieldDecorator('id', {
            initialValue: funcBasicInfo.id,
          })(
            <Input type="hidden" />
          )}
        </div>
        <FormItem
          {...formItemLayout}
          label="应用名称"
        >
          {getFieldDecorator('name', {
            initialValue: funcBasicInfo.name,
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
            initialValue: funcBasicInfo.icon,
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
            initialValue: funcBasicInfo.page,
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
            initialValue: funcBasicInfo.style,
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
            initialValue: funcBasicInfo.data,
            rules: [{
              required: false, message: '输入的格式错误',
            }, {
              validator: handleConfirmJson
            }],
          })(
            <TextArea autosize={{ minRows: 5 }} placeholder="请输入应用数据" />
          )}
        </FormItem>
      </Form>
    </Spin>
  )
});

export default class OopModalUIDOC extends React.PureComponent {
  state = {
    modalVisible: false,
    closeConfirmConfig: {
      visible: false
    },
    warningField: {},
    warningWrapper: false,
    funcBasicInfo: {
      icon: './assets/images/application.png',
      name: '问卷调查',
      page: 'examList',
      // eslint-disable-next-line no-useless-escape
      data: '{\"questionnaireNo\":\"qnnre1\",\"url\":\"/#/webapp/exam-list\"}',
    },
  }
  componentDidMount() {}
  handleCloseConfirmCancel = () => {
    console.log('handleCloseConfirmCancel')
  }
  handleModalCancel = () => {
    console.log('handleModalCancel')
    this.setState({
      modalVisible: false,
      closeConfirmConfig: {
        visible: false
      },
      warningField: {}
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
  showModel = () => {
    this.setState({
      modalVisible: true
    })
  }
  handleModalSubmit = () => {
    console.log('handleModalSubmit')
  }
  onDeleteFromEdit = () => {
    console.log('onDeleteFromEdit')
  }
  render() {
    const {modalVisible, closeConfirmConfig, warningWrapper, warningField, funcBasicInfo} = this.state
    const component = (
      <Fragment>
        <Button onClick={()=> { this.showModel() }}>打开OopModal</Button>
        <OopModal
          title="ModelName"
          visible={modalVisible}
          destroyOnClose={true}
          width={800}
          closeConfirm={closeConfirmConfig}
          closeConfirmCancel={this.handleCloseConfirmCancel}
          onCancel={this.handleModalCancel}
          onOk={this.handleModalSubmit}
          onDelete={this.onDeleteFromEdit}
          // isCreate={this.state.isCreate}
          // loading={!!loading}
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
                funcBasicInfo={funcBasicInfo}
                warningWrapper={warningWrapper}
                warningField={warningField}
                loading={false}
                conductValuesChange={this.handleBasicChange}
              />
            },
          ]}
        />
      </Fragment>
    )
    const option = [
      {component, fileName: 'demo.md', title: '简单用法', desc: 'OopModel的简单用法'},
    ]
    return (<UIDocument name="OopModal" option={option} />)
  }
}