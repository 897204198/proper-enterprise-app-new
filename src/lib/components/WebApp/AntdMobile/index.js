import React from 'react';
import { Form } from 'antd';
import {TextareaItem, Picker, Calendar, DatePicker, WingBlank, InputItem, List, Button, Toast } from 'antd-mobile';
import zhCN from 'antd-mobile/lib/calendar/locale/zh_CN';
import zhCN2 from 'antd-mobile/lib/date-picker/locale/zh_CN';

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

const typeData = [{key: 1, label: '婚假', value: 1}, {key: 2, label: '事件', value: 2}, {key: 3, label: '产假', value: 3}]


@Form.create()
export default class H5NumberInputExample extends React.Component {
  originbodyScrollY = document.getElementsByTagName('body')[0].style.overflowY;
  state = {
    type: 1,
    hasError: false,
    show: false,
    datetime2: new Date(Date.now())
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
    const comList = [getFieldDecorator('datetime2', {
      initialValue: this.state.datetime2,
    })(
      <DatePicker locale={zhCN2}>
        <List.Item arrow="horizontal">Datetime</List.Item>
      </DatePicker>
    ), getFieldDecorator('datetime', {
      initialValue: '',
    })(
      <div>
        <List.Item
          arrow="horizontal"
          onClick={() => {
            document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
            this.setState({
              show: true,
            });
          }}
        >
          <span style={{color: 'red'}}>*</span>请假时间
        </List.Item>
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
    ), getFieldDecorator('type', {
      initialValue: this.state.type,
    })(
      <Picker
        data={typeData}
        cols={1}
        onChange={v => this.setState({ type: v })}
        className="forss">
        <List.Item arrow="horizontal">请假类型</List.Item>
      </Picker>
    ), getFieldDecorator('hour', {
      initialValue: 100,
      rules: [{
        required: true
      }]
    })(
      <InputItem
        type="number"
        placeholder="精确到小时"
        clear
        moneyKeyboardWrapProps={moneyKeyboardWrapProps}
      >请假小时数(8h/d)</InputItem>
    ), getFieldDecorator('remarks', {
      initialValue: '',
      rules: [{
        required: true
      }]
    })(
      <TextareaItem
        title="请假事由"
        rows={5}
        count={100}
      />
    )];
    return (
      <div style={{width: '100%'}}>
        <List>
          {comList}
          <WingBlank style={{marginTop: 12}}>
            <Button type="primary" onClick={this.handleSubmit}>提交</Button>
          </WingBlank>
        </List>
      </div>
    );
  }
}
