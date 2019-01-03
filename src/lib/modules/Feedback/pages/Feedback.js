import React, { Fragment } from 'react';
import { Input, Select, List, Card, Spin, Modal, Button, Popover, message } from 'antd';
import { connect } from 'dva';
import InfiniteScroll from 'react-infinite-scroller';
import { inject } from '@framework/common/inject';
import PageHeaderLayout from '@framework/components/PageHeaderLayout';
import { oopToast } from '@framework/common/oopUtils';
import Ellipsis from '@framework/components/Ellipsis/index';
import { getApplicationContextUrl } from '@framework/utils/utils';
import styles from './index.less';
import OopPreview from '../../../components/OopPreview';

const { Option } = Select;
const { TextArea } = Input;

@inject(['feedback', 'global'])
@connect(({ feedback, global, loading }) => ({
  feedback,
  global,
  loading: loading.models.feedback
}))
export default class Feedback extends React.Component {
  state = {
    query: '',
    pageNo: 1,
    pageSize: 18,
    searchType: '0',
    loading: false,
    hasMore: true,
    data: [],
    itemArray: [],
    viewVisible: false,
    userId: '',
    feedbackContent: '',
    feedbackStatus: '',
    btnColor: 'primary',
    visibleBtn: true,
    preView: false,
    imgUrl: '',
    tokenFix: window.localStorage.getItem('proper-auth-login-token')
  }

  componentDidMount() {
    this.refresh({}, 'init');
  }

  refresh = (params, flag) => {
    if (flag === 'init') {
      this.setState({
        pageNo: 1,
        loading: false,
        hasMore: true,
      })
    }
    this.props.dispatch({
      type: 'feedback/fetch',
      payload: {
        query: params.query ? params.query : this.state.query,
        feedbackStatus: params.searchType ? params.searchType : this.state.searchType,
        pageNo: params.pageNo ? params.pageNo : this.state.pageNo,
        pageSize: this.state.pageSize,
      },
      callback: (res) => {
        let resData = [];
        if (flag === 'init') {
          resData = res;
        } else {
          resData = this.state.data.concat(res);
        }
        this.setState({
          data: resData,
          loading: false,
        });
      }
    });
  }

  handleOnchange = (val) => {
    const { value } = val.target;
    this.setState({
      query: value
    });
  }

  handleSearch = (val) => {
    this.setState({
      query: val
    });
    this.refresh({
      query: val,
      pageNo: 1,
      loading: false,
      hasMore: true,
    }, 'init');
  }

  changeSearchType = (val) => {
    this.setState({
      searchType: val
    }, ()=>{
      this.handleSearch('');
    });
  }

  handleInfiniteOnLoad = () => {
    let page = this.state.pageNo;
    page += 1;
    this.setState({
      loading: true,
      pageNo: page
    });
    if (this.props.feedback.list.length < this.state.pageSize) {
      this.setState({
        hasMore: false,
        loading: false,
      });
      return;
    }
    this.refresh({});
  }

  handleView = (item) => {
    const self = this;
    this.props.dispatch({
      type: 'feedback/fetchByUserId',
      payload: {userId: item.userId},
      callback: (res) => {
        self.setState({
          viewVisible: true,
          itemArray: res,
          userId: item.userId,
          feedbackStatus: item.statusCode,
          btnColor: (item.statusCode === '0' ? 'danger' : 'primary'),
          visibleBtn: item.statusCode !== '2'
        });
        setTimeout(() => {
          const div = document.querySelector('.feedbackModal .ant-modal-body');
          div.children[0].children[0].scrollTop = div.children[0].children[0].scrollHeight;
        }, 50);
      }
    });
  }

  // 关闭
  handleViewModalVisible = (flag) => {
    this.setState({
      viewVisible: flag
    });
  }

  // 关闭此问题
  closeFeedback = () => {
    const self = this;
    this.props.dispatch({
      type: 'feedback/close',
      payload: {userId: this.state.userId},
      callback: (res) => {
        oopToast(res, '关闭问题成功');
        self.refresh({}, 'init');
        this.handleViewModalVisible(false);
      }
    });
  }

  // 提交
  handleSubmit = () => {
    const self = this;
    if (this.state.feedbackContent !== '') {
      this.props.dispatch({
        type: 'feedback/update',
        payload: {userId: this.state.userId, feedback: this.state.feedbackContent},
        callback: (res) => {
          oopToast(res, '保存成功');
          self.refresh({}, 'init');
          this.handleViewModalVisible(false);
        }
      });
    } else {
      message.error('反馈内容不能为空');
    }
  }

  handleTextChange = (val) => {
    const { value } = val.target;
    this.setState({
      feedbackContent: value
    })
  }

  // 预览图片
  preViewPic = (flag, id) => {
    this.setState({
      preView: flag,
      imgUrl: flag ? `${getApplicationContextUrl()}/file/${id}?access_token=${this.state.tokenFix}` : ''
    });
  }

  render() {
    const { global: {size}, loading } = this.props;
    const { data, itemArray, viewVisible, btnColor, feedbackStatus,
      visibleBtn, preView, imgUrl, tokenFix } = this.state;

    return (
      <PageHeaderLayout content={
        <Input.Group compact>
          <Select size={size} defaultValue="0" style={{ width: '12%' }} onSelect={value => this.changeSearchType(value)} >
            <Option value="-1">全部</Option>
            <Option value="0">未反馈</Option>
            <Option value="1">已反馈</Option>
            <Option value="2">已关闭</Option>
          </Select>
          <Input.Search
            style={{marginBottom: '16px', width: '88%'}}
            onChange={value => this.handleOnchange(value)}
            onSearch={value => this.handleSearch(value)}
            enterButton="搜索"
            size={size} />
        </Input.Group>
      }>
        <div className={styles.feedbackInfiniteContainer}>
          <InfiniteScroll
            initialLoad={false}
            pageStart={0}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!this.state.loading && this.state.hasMore}
          >
            <List
              loading={loading}
              grid={{ gutter: 24, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 3 }}
              dataSource={data}
              renderItem={item => (
                <List.Item>
                  <Card
                    onDoubleClick={() => this.handleView(item)}
                    bordered={false}
                    className={item.statusCode === '0' ? styles.redColor : styles.defaultColor}
                    title={item.userName.substr(0, 11)}
                    extra={<Fragment>
                      <span>
                        {item.feedBackDocuments[item.feedBackDocuments.length - 1].netType}
                      </span>
                      <span className={styles.mobileModel}>
                        <Popover content={item.feedBackDocuments[item.feedBackDocuments.length - 1].mobileModel}>
                          <span>{item.feedBackDocuments[item.feedBackDocuments.length - 1].mobileModel}</span>
                        </Popover>
                      </span>
                      <span style={{marginLeft: 12}}>
                        {item.feedBackDocuments[item.feedBackDocuments.length - 1].appVersion}
                      </span>
                    </Fragment>}>
                    <Ellipsis lines={2}>
                      { item.feedBackDocuments[item.feedBackDocuments.length - 1] ?
                        (item.feedBackDocuments[item.feedBackDocuments.length - 1].feedback ?
                        item.feedBackDocuments[item.feedBackDocuments.length - 1].feedback :
                        (item.feedBackDocuments[item.feedBackDocuments.length - 1].opinion ?
                          item.feedBackDocuments[item.feedBackDocuments.length - 1].opinion :
                          (
                            <img
                              style={{height: 50, cursor: 'pointer'}}
                              alt=""
                              onClick={() =>
                                // eslint-disable-next-line
                                this.preViewPic(true, item.feedBackDocuments[item.feedBackDocuments.length - 1].pictureId)
                              }
                              src={`${getApplicationContextUrl()}/file/${item.feedBackDocuments[item.feedBackDocuments.length - 1].pictureId}?access_token=${tokenFix}`} />
                          )
                          )) : ''}
                    </Ellipsis>
                    <span style={{position: 'absolute', bottom: '16px', left: '16px'}}>
                      {item.userTel ? item.userTel.substr(0, 11) : ''}
                    </span>
                    <span style={{position: 'absolute', bottom: '16px', right: '16px'}}>
                      {item.feedBackDocuments[item.feedBackDocuments.length - 1] ?
                        (item.feedBackDocuments[item.feedBackDocuments.length - 1].opinionTime ?
                          item.feedBackDocuments[item.feedBackDocuments.length - 1].opinionTime :
                          item.feedBackDocuments[item.feedBackDocuments.length - 1].feedbackTime) : ''}
                    </span>
                  </Card>
                </List.Item>
              )}
            >
              {this.state.loading && this.state.hasMore && (
                <div className={styles.loadingContainer}>
                  <Spin />
                </div>
              )}
            </List>
          </InfiniteScroll>
        </div>
        <Modal
          wrapClassName="feedbackModal"
          title="意见反馈"
          maskClosable={false}
          visible={viewVisible}
          destroyOnClose={true}
          bodyStyle={{padding: 0}}
          width={400}
          onCancel={()=>this.handleViewModalVisible(false)}
          cancelText="关闭此问题"
          onOk={this.handleSubmit}
          footer={
            <div>
              {visibleBtn ? <Button onClick={()=>this.closeFeedback()}>关闭此问题</Button> : ''}
              <Button
                type={btnColor}
                onClick={()=>this.handleSubmit()}>
                提交
              </Button>
            </div>
          }
        >
          <div>
            <div style={{height: '350px', overflow: 'hidden', overflowY: 'auto', padding: '24px', }}>
              {itemArray.map(item => (
                <div key={item.opinion || item.pictureId || item.feedback }>
                  { (item.opinion || item.pictureId) ? (
                  <div>
                    <div style={{fontSize: '12px', marginLeft: '5px'}}>{item.userName} {item.opinionTime}</div>
                    {item.opinion ? (
                      <div style={{
                        position: 'relative',
                        width: '55%',
                        background: '#fff',
                        border: '1px solid #bbbbbb',
                        borderRadius: '5px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all'}}>
                        <div style={{
                          position: 'absolute',
                          top: '25%',
                          left: '-10px',
                          width: '0',
                          height: '0',
                          fontSize: '0',
                          borderTop: '6px solid transparent',
                          borderRight: '9px solid #bbb',
                          borderBottom: '6px solid transparent'
                        }} /><div style={{
                          position: 'absolute',
                          top: '25%',
                          left: '-8px',
                          width: '0',
                          height: '0',
                          fontSize: '0',
                          borderTop: '6px solid transparent',
                          borderRight: '9px solid #fff',
                          borderBottom: '6px solid transparent',
                          zIndex: 11
                        }} />
                        {item.opinion}
                      </div>
                    ) : (
                      <img
                        style={{width: 46, marginTop: 10, cursor: 'pointer'}}
                        alt=""
                        onClick={() => this.preViewPic(true, item.pictureId)}
                        src={`${getApplicationContextUrl()}/file/${item.pictureId}?access_token=${tokenFix}`} />
                    )}
                  </div>) : (<div />)}
                  <div style={{width: '55%', float: 'right', margin: '5px 0'}}>
                    {item.feedback ? (<div style={{fontSize: '12px', marginLeft: '5px'}}>{item.feedbackTime} 管理员</div>) : null }
                    {item.feedback ? (
                      <div
                        style={{
                        position: 'relative',
                        width: '100%',
                        color: '#fff',
                        float: 'right',
                        borderRadius: '5px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        wordWrap: 'break-word',
                        wordBreak: 'break-all'}}
                        className={ feedbackStatus === '0' ? styles.redBg : styles.primaryBg }>
                        <div
                        style={{
                          position: 'absolute',
                          top: '30%',
                          right: '-16px',
                          width: '0',
                          height: '0',
                          fontSize: '0',
                          border: 'solid 8px',
                          borderTopColor: 'transparent',
                          borderRightColor: 'transparent',
                          borderBottomColor: 'transparent',
                        }}
                        className={ feedbackStatus === '0' ? styles.redBorderLeftColor : styles.primaryBorderLeftColor } />
                        {item.feedback}
                      </div>
                    ) : null}
                  </div>
                  <div style={{clear: 'both'}} />
                </div>
              ))}
            </div>
            <div style={{padding: 16, borderTop: '1px solid #e8e8e8'}}>
              <TextArea
                onChange={value => this.handleTextChange(value)} />
            </div>
          </div>
        </Modal>
        {preView ? (
          <OopPreview
            visible={preView}
            onCancel={() => this.preViewPic(false)}
            img={{
              src: imgUrl,
              alt: '头像'
            }}
          />
        ) : ''}
      </PageHeaderLayout>
    );
  }
}
