import React from 'react';
import { Button } from 'antd';
import OopForm from '@pea/components/OopForm';

const dateFormat = 'YYYY-MM-DD'

export default class App extends React.Component {
  formJson = [
    {
      label: '上传报销单',
      key: 'fileId',
      component: {
        name: 'OopUpload',
        props: {
          buttonText: '上传图片',
          accept: 'image/*',
          listType: 'picture',
          type: ['.jpg', '.jpeg', '.png', '.gif', '.bmp']
        }
      },
      name: 'fileId',
      rules: [{
        required: true,
        message: '请上传图片'
      }],
    },
    {
      label: '账单日',
      key: 'bill',
      component: {
        name: 'DatePicker',
        props: {
          format: dateFormat,
          onChange: (e) => {
            console.log(e)
          }
        }
      },
      name: 'bill',
      initialValue: '2019-03-25',
      rules: [{
        required: true,
        message: '请选择账单日'
      }],
    },
    {
      label: '报销人',
      key: 'OopSystemCurrent',
      component: {
        name: 'OopSystemCurrent',
        props: {
          url: '/auth/current/user',
          showPropName: 'name',
          code: 'currentLoginUser'
        }
      },
      name: 'name'
    },
    {
      label: '部门',
      key: 'OopSystemCurrent',
      component: {
        name: 'OopSystemCurrent',
        props: {
          url: '/hr/organization/current',
          showPropName: 'name',
          code: 'currentDept',
          editable: false
        }
      },
      name: 'organization'
    },
    {
      label: '申请时间',
      key: 'OopSystemCurrent',
      component: {
        name: 'OopSystemCurrent',
        props: {
          url: '/sys/current/date',
          code: 'currentSysDate',
          editable: false
        }
      },
      name: 'reimbursementDate'
    },
    {
      label: '使用汇率',
      key: 'useRate',
      component: {
        name: 'Input',
        props: {
          onChange: (e) => {
            console.log(e)
          }
        }
      },
      name: 'useRate',
      initialValue: 6.987,
      rules: [{
        required: true,
        message: '只可为非负数字'
      }],
    },
    {
      label: '美元金额($)',
      key: 'dollar',
      component: {
        name: 'Input',
        props: {
          type: 'number',
          onChange: (e) => {
            console.log(e)
          }
        }
      },
      name: 'dollar',
      initialValue: 25,
      rules: [{
        required: true,
        message: '不能为空或负数'
      }],
    },
    {
      label: '人民币金额(￥)',
      key: 'amount',
      component: {
        name: 'Input',
        props: {
          disabled: true
        }
      },
      name: 'amount',
      initialValue: 190,
    },
    {
      label: '单据',
      key: 'receipt',
      component: {
        name: 'Input',
        props: {
          type: 'number'
        }
      },
      name: 'receipt',
      initialValue: 1,
      rules: [{
        required: true,
        message: '不能为空或负数'
      }],
    },
    {
      label: '用途',
      key: 'usage',
      component: {
        name: 'TextArea',
        autosize: true
      },
      name: 'usage',
      initialValue: '费用报销',
      rules: [{
        required: true,
        message: '为必填项'
      }],
    },
    {
      key: 'submit',
      wrapperCol: {
        sm: {
          span: 16,
          offset: 8,
        },
      },
      component: () => {
        return <Button size="large" type="primary" onClick={this.onSubmit}>发起</Button>
      },
      name: 'submit',
    }
  ]
  state = {}
  onSubmit = () => {
    const oopForm = this.oopForm.wrappedInstance;
    const form = oopForm.getForm();
    form.validateFields((error) => {
      if (error) {
        oopForm.showValidErr(error);
        return
      }
      const params = form.getFieldsValue()
      console.log(params)
    })
  }
  render() {
    return (
      <OopForm
        formJson={formJson}
        formTitle="报销单"
        formLayout="horizontal"
        ref={(el)=>{ this.oopForm = el && el.getWrappedInstance() }}
      />
    )
  }
}
