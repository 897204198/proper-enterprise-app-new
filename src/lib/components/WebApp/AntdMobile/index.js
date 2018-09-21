import React from 'react';
import { Form } from 'antd';
import List from 'antd-mobile/lib/list';
import 'antd-mobile/lib/list/style';
import InputItem from 'antd-mobile/lib/input-item';
import 'antd-mobile/lib/input-item/style';
import Toast from 'antd-mobile/lib/toast';
import 'antd-mobile/lib/toast/style';
import Button from 'antd-mobile/lib/button';
import 'antd-mobile/lib/button/style';
import WingBlank from 'antd-mobile/lib/wing-blank';
import 'antd-mobile/lib/wing-blank/style';
import Calendar from 'antd-mobile/lib/calendar';
import 'antd-mobile/lib/calendar/style';
import Picker from 'antd-mobile/lib/picker';
import 'antd-mobile/lib/picker/style';
import TextareaItem from 'antd-mobile/lib/textarea-item';
import 'antd-mobile/lib/textarea-item/style';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';

// 通过自定义 moneyKeyboardWrapProps 修复虚拟键盘滚动穿透问题
// https://github.com/ant-design/ant-design-mobile/issues/307
// https://github.com/ant-design/ant-design-mobile/issues/163
const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
let moneyKeyboardWrapProps;
if (isIPhone) {
  moneyKeyboardWrapProps = {
    onTouchStart: e => e.preventDefault(),
  };
}
const now = new Date();
const extra = {
  '2017/07/15': { info: 'Disable', disable: true },
};

extra[+new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5)] = { info: 'Disable', disable: true };
extra[+new Date(now.getFullYear(), now.getMonth(), now.getDate() + 6)] = { info: 'Disable', disable: true };
extra[+new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7)] = { info: 'Disable', disable: true };
extra[+new Date(now.getFullYear(), now.getMonth(), now.getDate() + 8)] = { info: 'Disable', disable: true };

Object.keys(extra).forEach((key) => {
  const info = extra[key];
  const date = new Date(key);
  if (!Number.isNaN(+date) && !extra[+date]) {
    extra[+date] = info;
  }
});

const typeData = [{label: '婚假'}, {label: '事件'}, {label: '产假'}, {label: '病假'}, {label: '调休'}]


@Form.create()
export default class H5NumberInputExample extends React.Component {
  originbodyScrollY = document.getElementsByTagName('body')[0].style.overflowY;
  state = {
    type: 'money',
    hasError: false,
    show: false
  }
  onChange = (value) => {
    if (value.replace(/\s/g, '').length < 11) {
      this.setState({
        hasError: true,
      });
    } else {
      this.setState({
        hasError: false,
      });
    }
  }
  onErrorClick = () => {
    if (this.state.hasError) {
      Toast.info('Please enter 11 digits');
    }
  }
  handleSubmit = ()=>{
    const { form } = this.props;
    console.log(form.getFieldsValue());
    form.validateFieldsAndScroll((err, fieldsValue) => {
      if (err) return;
      console.log(fieldsValue);
    });
  }
  onSelectHasDisableDate = (dates) => {
    console.warn('onSelectHasDisableDate', dates);
  }
  onConfirm = (startTime, endTime) => {
    document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY;
    this.setState({
      show: false,
    });
    setTimeout(()=>{
      if (this.props.onChange) {
        this.props.onChange({startTime, endTime})
      }
    }, 500)
  }

  onCancel = () => {
    document.getElementsByTagName('body')[0].style.overflowY = this.originbodyScrollY;
    this.setState({
      show: false,
      // startTime: undefined,
      // endTime: undefined,
    });
  }
  getDateExtra = date => extra[+date];
  render() {
    /**
     *           {form.getFieldDecorator('id', {
            initialValue: groupsBasicInfo.id,
          })(
            <Input type="hidden" />
          )}
     */
    const { getFieldDecorator } = this.props.form;
    const { type } = this.state;
    return (
      <div style={{width: '100%'}}>
        <List>
          {getFieldDecorator('datetime', {
            initialValue: '',
          })(
            <List.Item
              arrow="horizontal"
              onClick={() => {
                document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
                this.setState({
                  show: true,
                });
              }}
            >
              请假时间
            </List.Item>
          )}
          {getFieldDecorator('type', {
            initialValue: '',
          })(
            <Picker
              data={typeData}
             cols={1}
             className="forss">
              <List.Item arrow="horizontal">请假类型</List.Item>
            </Picker>
          )}
          {getFieldDecorator('hour', {
            initialValue: 100,
            rules: [{
              required: true
            }]
          })(
            <InputItem
              type={type}
              placeholder="精确到小时"
              clear
              moneyKeyboardWrapProps={moneyKeyboardWrapProps}
            >请假小时数(8h/d)</InputItem>
          )}
          {getFieldDecorator('remarks', {
            initialValue: '',
            rules: [{
              required: true
            }]
          })(
            <TextareaItem
              placeholder="请假事由"
              rows={5}
              count={100}
            />
          )}
          <WingBlank style={{marginTop: 12}}>
            <Button type="primary" onClick={this.handleSubmit}>提交</Button>
          </WingBlank>
        </List>
        <Calendar
          locale={zhCN}
          pickTime={true}
          showShortcut={true}
          visible={this.state.show}
          onCancel={this.onCancel}
          onConfirm={this.onConfirm}
          onSelectHasDisableDate={this.onSelectHasDisableDate}
          getDateExtra={this.getDateExtra}
          defaultDate={now}
          minDate={new Date(+now - 5184000000)}
          maxDate={new Date(+now + 31536000000)}
        />
      </div>
    );
  }
}
// const H5NumberInputExampleWrapper = createForm()(H5NumberInputExample);
// export default H5NumberInputExampleWrapper;
