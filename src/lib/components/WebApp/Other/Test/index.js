import React from 'react';
import { Button } from 'antd';
import OopForm from '../../../OopForm';

export default class Test extends React.PureComponent {
  handleSumit = ()=>{
    // const form = this.oopForm.getForm();
    console.log(this.oopForm.getFormData())
  }
  render() {
    const formJson = [{
      label: '姓名',
      initialValue: '123',
      name: 'name',
      rules: [
        {required: true, message: '此项必填'}
      ],
      component: {
        name: 'Input',
      }
    }, {
      label: '年级(OopDict-RULE)',
      name: 'grade',
      initialValue: {id: 'pep_rule_user', enable: true, catalog: 'RULE', code: 'USER', name: '用户组规则', order: 0, dataDicType: 'SYSTEM', deft: true},
      component: {
        name: 'OopDict',
        props: {
          disabled: false,
          placeholder: '选择年级',
          catalog: 'RULE',
          multiple: false,
          // listData: [
          //   {catalog: 'grade', code: '1', label: '一年级'},
          //   {catalog: 'grade', code: '2', label: '二年级'},
          //   {catalog: 'grade', code: '3', label: '三年级'}
          // ],
        }
      }
    }, {
      label: '班级',
      name: 'class',
      component: {
        name: 'OopEnum',
        props: {
          dropDown: false,
          listData: [{label: '一年一班', value: '1'}, {label: '二年二班', value: '2'}, {label: '三年三班', value: '3'}],
        }
      }
    }, {
      label: '爱好',
      name: 'hobby',
      initialValue: ['1', '2'],
      component: {
        name: 'OopEnum',
        props: {
          dropDown: false,
          multiple: true,
          listData: [{label: '唱歌', value: '1'}, {label: '游泳', value: '2'}, {label: '篮球', value: '3'}],
        }
      }
    }, {
      label: '课程',
      name: 'subject',
      component: {
        name: 'OopEnum',
        props: {
          dropDown: true,
          multiple: true,
          listData: [{label: '数学', value: '1'}, {label: '语文', value: '2'}, {label: '英语', value: '3'}],
        }
      }
    }];
    const formConfig = {
      formTitle: 'OopForm组建测试',
      formJson
    }
    return (<div style={{width: '100%', paddingTop: 8}}>
      <OopForm {...formConfig} ref={(el)=>{ this.oopForm = el && el.getWrappedInstance() }} />
      <div style={{padding: '8px 16px'}}>
        <Button onClick={this.handleSumit} block={true} type="primary">确认</Button>
      </div>
    </div>)
  }
}
