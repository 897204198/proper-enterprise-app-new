import React from 'react';
import { connect } from 'dva';
import { Card, Modal, Button, Input, Popconfirm, List, Icon, Checkbox } from 'antd';
import PageHeaderLayout from '../../../../../framework/components/PageHeaderLayout';
import { inject } from '../../../../../framework/common/inject';
import { oopToast } from '../../../../../framework/common/oopUtils';
import CacheTable from './CacheTable';
import styles from './index.less';

@inject(['devtoolsCache', 'global'])
@connect(({devtoolsCache, global, loading}) => ({
  devtoolsCache,
  global,
  loading: loading.models.devtoolsCache
}))
export default class Cache extends React.Component {
  state = {
    viewVisible: false,
    dataList: [],
    cacheList: [],
    deleteLists: [],
    listContent: '',
    listContentVisible: false,
    cacheName: '',
    listName: ''
  }

  componentDidMount() {
    this.refresh();
  }

  refresh = () => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/fetch',
      callback: (res) => {
        self.setState({
          dataList: res
        })
        for (let i = 0; i < res.length; i++) {
          this.refreshList(res[i]);
        }
      }
    });
  }

  refreshList = (param) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/fetchByCacheNameArray',
      payload: {name: param.name},
      callback: (res) => {
        for (let i = 0; i < self.state.dataList.length; i++) {
          if (self.state.dataList[i].name === param.name) {
            self.state.dataList[i].list = res;
          }
        }
        self.setState({
          dataList: self.state.dataList
        })
      }
    })
  }

  searchCache = (val, data, keyName) => {
    if (val && val !== '') {
      const newList = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].name.toLowerCase().indexOf(val.toLowerCase()) !== -1) {
          newList.push(data[i]);
        }
      }
      this.setState({
        [keyName]: newList,
        listContentVisible: false
      });
    } else {
      this.setState({
        [keyName]: data,
        listContentVisible: false
      });
    }
  }

  batchDelete = () => {
    let names = '';
    for (let i = 0; i < this.state.deleteLists.length; i++) {
      names += `${this.state.deleteLists[i]},`;
    }
    const self = this;
    Modal.confirm({
      title: '提示',
      content: `确定清除选中的${this.state.deleteLists.length}条缓存吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        self.props.dispatch({
          type: 'devtoolsCache/deleteCaches',
          payload: {names},
          callback: (res) => {
            oopToast(res, '清除成功');
            self.refresh();
          }
        })
      }
    });
  }

  // 关闭基本信息
  handleViewModalVisible = (flag) => {
    this.setState({
      viewVisible: flag,
      listContentVisible: false
    });
  }

  // 查看基本信息
  handleView = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/fetchByCacheName',
      payload: {name: record.name},
      callback: (res) => {
        self.setState({
          viewVisible: true,
          cacheList: res,
          cacheName: record.name
        })
      }
    })
  }

  rowDelete = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/deleteCache',
      payload: {name: record.name},
      callback: (res) => {
        oopToast(res, '清除成功');
        self.refresh();
      }
    })
  }

  listBatchDelete = (ids, items) => {
    const self = this;
    let names = '';
    for (let i = 0; i < items.length; i++) {
      names += `${items[i].name},`;
    }
    this.props.dispatch({
      type: 'devtoolsCache/deleteCache',
      payload: {name: this.state.cacheName, keys: {keys: names}},
      callback: (res) => {
        self.oopTable.clearSelection();
        oopToast(res, '清除成功');
        self.refresh();
      }
    })
  }

  listRowDelete = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/deleteCacheListItem',
      payload: {name: this.state.cacheName, key: record.name},
      callback: (res) => {
        oopToast(res, '清除成功');
        self.refresh();
      }
    })
  }

  checkContent = (record) => {
    const self = this;
    this.props.dispatch({
      type: 'devtoolsCache/fetchByCacheNameListName',
      payload: {cacheName: this.state.cacheName, listName: record.name},
      callback: (res) => {
        self.setState({
          listName: record.name,
          listContent: res,
          listContentVisible: true
        });
      }
    })
  }

  // 全选
  checkAll = () => {
    const self = this;
    if (this.state.dataList.length === this.state.deleteLists.length) {
      for (let i = 0; i < this.state.dataList.length; i++) {
        this.state.dataList[i].isChecked = false;
      }
      this.state.deleteLists = [];
    } else {
      this.state.deleteLists = [];
      for (let i = 0; i < this.state.dataList.length; i++) {
        this.state.dataList[i].isChecked = true;
        this.state.deleteLists.push(this.state.dataList[i].name);
      }
    }
    this.props.dispatch({
      type: 'devtoolsCache/checkAll',
      payload: this.state.dataList,
      callback: (res) => {
        self.setState({
          lists: res
        })
      }
    });
  }

  checkboxChange = (e, item) => {
    const self = this;
    const isChecked = e.target.checked;
    // 渲染页面使用
    for (let i = 0; i < this.state.dataList.length; i++) {
      if (this.state.dataList[i].name === item.name) {
        this.state.dataList[i].isChecked = isChecked;
      }
    }
    this.props.dispatch({
      type: 'devtoolsCache/checkItem',
      payload: this.state.dataList,
      callback: (res) => {
        self.setState({
          dataList: res
        })
      }
    });

    let isInList = false;

    let index;
    for (let i = 0; i < this.state.deleteLists.length; i++) {
      if (item.name === this.state.deleteLists[i]) {
        index = i;
        isInList = true;
      }
    }
    if (!isChecked && isInList) {
      this.state.deleteLists = [
        ...this.state.deleteLists.slice(0, index),
        ...this.state.deleteLists.slice(index + 1, this.state.deleteLists.length)
      ]
    } else if (isChecked && !isInList) {
      this.state.deleteLists.push(item.name);
    }
  }

  render() {
    const { global: {size}, loading,
      devtoolsCache: { oriCacheList, oriList }} = this.props;
    const { viewVisible, dataList, cacheList,
      listContentVisible, listName, listContent } = this.state;

    const listColumns = [
      { title: '模块名称', dataIndex: 'name', key: 'name', render: text => (
        <span>
          {text && text.length > 30 ?
          (<span>{text.substr(0, 30)}...</span>) : (<span>{text}</span>)}
        </span>
      )}
    ];

    const listTopButtons = [
      {
        text: '清除',
        name: 'delete',
        icon: 'delete',
        size,
        onClick: (ids, items)=>{ this.listBatchDelete(ids, items) },
        display: items=>(items.length),
      }
    ];

    const listRowButtons = [
      {
        text: '查看',
        name: 'file-text',
        icon: 'file-text',
        onClick: (record)=>{ this.checkContent(record) }
      },
      {
        text: '清除',
        name: 'delete',
        icon: 'delete',
        confirm: '是否要清除此条信息',
        onClick: (record)=>{ this.listRowDelete(record) }
      },
    ]

    return (
      <PageHeaderLayout content={
        <div>
          <Input.Search
              placeholder="请输入要查询的内容"
              style={{marginBottom: '5px'}}
              enterButton
              size={size}
              onSearch={value => this.searchCache(value, oriCacheList, 'dataList')} />
          <Button style={{margin: '8px 8px 0 0'}} icon="check-square-o" size="small" onClick={() => this.checkAll()}>
            全选
          </Button>
          <Button style={{margin: '8px 8px 0 0'}} icon="delete" size="small" onClick={() => this.batchDelete()}>
            批量清除缓存
          </Button>
        </div>
      }>
        <List
          itemLayout="vertical"
          size={size}
          pagination={{
            total: dataList.length,
            pageSize: 12,
          }}
          dataSource={dataList}
          loading={loading}
          grid={{ gutter: 24, lg: 3, md: 2, sm: 1, xs: 1 }}
          renderItem={item => (
            <List.Item key={item.id}>
              <Card
                bodyStyle={{height: '240px', overflow: 'hidden'}}
                className={styles.cacheCard}
                onDoubleClick={() => this.handleView(item)}
                bordered={false}
                title={<span style={{marginLeft: '8px'}}>{item.name}</span>}
                extra={
                  <Popconfirm
                    title="是否要清除此模块下的缓存"
                    onConfirm={()=>this.rowDelete(item)}>
                    {
                      <a>
                        <Icon type="delete" />
                      </a>
                    }
                  </Popconfirm>
                }>
                <Checkbox
                  checked={item.isChecked}
                  className={styles.checkboxPosition}
                  onChange={value => this.checkboxChange(value, item)}
                />
                {
                  item.list.map((it, index) => (
                    it && it.length > 20 ?
                      (<p key={it}>{index + 1}. {it.substr(0, 20)}...</p>) :
                        (<p key={it}>{index + 1}. {it}</p>)
                  ))
                }
              </Card>
            </List.Item>
          )}
        />
        <Modal
          title="缓存管理"
          width={650}
          destroyOnClose={true}
          visible={viewVisible}
          footer={<Button type="primary" onClick={()=>this.handleViewModalVisible(false)}>确定</Button>}
          onCancel={()=>this.handleViewModalVisible(false)}
        >
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <Input.Search
              placeholder="请输入要查询的内容"
              style={{marginBottom: '5px'}}
              enterButton
              size={size}
              onSearch={value => this.searchCache(value, oriList, 'cacheList')} />
          </div>
          <div>
            <CacheTable
              grid={cacheList}
              columns={listColumns}
              loading={loading}
              size={size}
              rowButtons={listRowButtons}
              topButtons={listTopButtons}
              ref={(el)=>{ this.oopTable = el }} />
            {
              listContentVisible ? (
                <Card title={listName}>
                  <p>{listContent}</p>
                </Card>
              ) : null
            }
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
