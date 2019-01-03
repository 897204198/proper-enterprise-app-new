import React from 'react';
import { connect } from 'dva';
import { Input, Select, Card, DatePicker, Icon, Tooltip, Spin } from 'antd';
import { inject } from '../../../../framework/common/inject';
import PageHeaderLayout from '../../../../framework/components/PageHeaderLayout';
import styles from './TomcatLog.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

@inject(['devtoolsTomcatLog', 'global'])
@connect(({ devtoolsTomcatLog, global, loading }) => ({
  devtoolsTomcatLog,
  global,
  loading: loading.models.devtoolsTomcatLog
}))
export default class TomcatLog extends React.Component {
  state = {
    type: '["ERROR"]',
    startTime: '',
    endTime: '',
    lockColor: '#1890ff',
    updateColor: '#1890ff',
    intervalTime: 5000,
    logs: [],
    timer: null,
    autoUpdate: true,
    overflowLock: false
  }

  componentDidMount() {
    this.firstLoad();
    if (this.state.autoUpdate && this.state.startTime === '' && this.state.endTime === '') {
      this.refresh();
    }
  }

  componentWillUnmount() {
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  }

  refresh = () => {
    this.state.timer = setInterval(() => {
      this.firstLoad();
    }, this.state.intervalTime);
  }

  firstLoad = () => {
    const self = this;
    const params = {
      type: this.state.type,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      intervalTime: this.state.intervalTime,
      overflowLock: this.state.overflowLock
    }
    this.props.dispatch({
      type: 'devtoolsTomcatLog/fetch',
      payload: params,
      callback: (res) => {
        const logsList = this.state.logs;
        for (let i = 0; i < res.length; i++) {
          logsList.push(res[i]);
        }
        self.setState({
          logs: logsList
        });
        self.scrollToEnd();
      }
    })
  }

  changeSearchType = (value) => {
    if (value === 'ERROR') {
      this.setState({
        type: '["ERROR"]'
      })
    } else if (value === 'WARN') {
      this.setState({
        type: '["WARN", "ERROR"]'
      })
    } else if (value === 'INFO') {
      this.setState({
        type: '["INFO", "WARN", "ERROR"]'
      })
    } else if (value === 'DEBUG') {
      this.setState({
        type: '["DEBUG", "INFO", "WARN", "ERROR"]'
      })
    }
  }

  datePickerChange = (value, dateString) => {
    this.setState({
      startTime: dateString[0],
      endTime: dateString[1]
    })
  }

  handleSearch = (value) => {
    const self = this;
    const params = {
      text: value,
      type: this.state.type,
      startTime: this.state.startTime,
      endTime: this.state.endTime,
      intervalTime: this.state.intervalTime
    }
    this.props.dispatch({
      type: 'devtoolsTomcatLog/fetch',
      payload: params,
      callback: (res) => {
        self.setState({
          logs: res
        });
        this.scrollToEnd();
        if (params.startTime !== '' && params.endTime !== '' && this.state.timer) {
          clearInterval(this.state.timer);
        }
      }
    })
  }

  clearLogs = () => {
    this.setState({
      logs: []
    })
  }

  // 滚动到最底
  scrollToEnd = () => {
    if (!this.state.overflowLock) {
      setTimeout(() => {
        const div = document.querySelector('.tomcatCardContent');
        div.scrollTop = div.scrollHeight;
      }, 50);
    }
  }

  lockScroll = () => {
    this.state.overflowLock = !this.state.overflowLock;
    if (this.state.overflowLock) {
      this.setState({
        lockColor: '#ccc'
      })
    } else {
      this.setState({
        lockColor: '#1890ff'
      })
    }
  }

  updateLogs = () => {
    this.state.autoUpdate = !this.state.autoUpdate;
    if (this.state.autoUpdate) {
      this.refresh();
      this.setState({
        updateColor: '#1890ff'
      });
    } else {
      if (this.state.timer) {
        clearInterval(this.state.timer);
      }
      this.setState({
        updateColor: '#ccc'
      });
    }
  }

  render() {
    const { global: {size}, loading } = this.props;
    const { logs, lockColor, updateColor } = this.state;

    const wrapperHeight = document.getElementById('root').clientHeight

    const cardHeight = wrapperHeight - 291;
    const cardBodyHeight = cardHeight - 57;

    return (
      <PageHeaderLayout content={
        <Input.Group compact>
          <Select size={size} defaultValue="ERROR" style={{ width: '12%' }} onSelect={value => this.changeSearchType(value)} >
            <Option value="ERROR">ERROR</Option>
            <Option value="WARN">WARN</Option>
            <Option value="INFO">INFO</Option>
            <Option value="DEBUG">DEBUG</Option>
          </Select>
          <RangePicker
            style={{ width: '40%' }}
            size={size}
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['请选择开始时间', '请选择结束时间']}
            onChange={this.datePickerChange} />
          <Input.Search
            style={{marginBottom: '16px', width: '48%'}}
            onSearch={value => this.handleSearch(value)}
            enterButton="搜索"
            size={size} />
        </Input.Group>
      }>
        <Card
          title="tomcat日志"
          className={styles.tomcatCard}
          extra={
            <div>
              <Tooltip placement="bottom" title="自动更新">
                <Icon
                  type="download"
                  onClick={this.updateLogs}
                  style={{marginRight: '15px', cursor: 'pointer', color: updateColor, fontSize: '16px'}} />
              </Tooltip>
              <Tooltip placement="bottom" title="锁定滚动条">
                <Icon
                  type="unlock"
                  onClick={this.lockScroll}
                  style={{marginRight: '15px', cursor: 'pointer', color: lockColor, fontSize: '16px'}} />
              </Tooltip>
              <Tooltip placement="bottom" title="清空日志">
                <Icon
                  type="delete"
                  onClick={this.clearLogs}
                  style={{cursor: 'pointer', fontSize: '16px'}} />
              </Tooltip>
            </div>
          }
          style={{ height: cardHeight, overflow: 'hidden' }}>
          <Spin spinning={loading}>
            <div className="tomcatCardContent" style={{overflowY: 'scroll', height: cardBodyHeight}}>
              <div style={{padding: '16px 24px'}}>
                {
                  logs.map(item => (
                    <div key={item._id.$oid} style={{display: 'flex', flexDirection: 'row', marginBottom: '10px'}}>
                      <div className="logLeft">
                      <span className="logEcho">
                      {
                        item.times > 1 ? (
                          <span className="logEchoTimes">{item.times}</span>
                        ) : null
                      }
                      </span>
                        <span
                          style={{color: item.lv === 'DEBUG' ? '#00a65a' :
                              (item.lv === 'INFO' ? '#3c8dbc' :
                                (item.lv === 'WARN' ? '#f39c12' : '#dd4b39')),
                            border: '1px solid',
                            borderColor: item.lv === 'DEBUG' ? '#00a65a' :
                              (item.lv === 'INFO' ? '#3c8dbc' :
                                (item.lv === 'WARN' ? '#f39c12' : '#dd4b39')),
                            borderRadius: '5px', padding: '2px 8px'}}>{item.lv}</span>
                      </div>
                      <div className="logRight">
                        <span dangerouslySetInnerHTML={{ __html: item.msgAfter }} />
                      </div>
                    </div>
                  ))
                }
                {
                  logs.length === 0 ? (<div className={styles.emptyPlaceHolder}>好像没能查到日志哦</div>) : null
                }
              </div>
            </div>
          </Spin>
        </Card>
      </PageHeaderLayout>
    );
  }
}
