import React, { Fragment } from 'react';
import {Tag, Button, Tooltip, Modal} from 'antd';
import OopModal from '../OopModal';
import OopTreeTable from '../OopTreeTable';
import styles from './index.less';

export default class OopTabTableModal extends React.PureComponent {
  constructor(props) {
    super(props);
    const { defaultSelected = [] } = props;
    this.state = {
      modalVisible: false,
      tableCfg: {
        data: [],
        title: '',
      },
      selectedRecord: [...defaultSelected],
    };
  }

  componentWillReceiveProps(nextProps) {
    const {tableCfg: tableCfgState} = this.state;
    const {tableCfg} = nextProps;
    const state = {
      tableCfg: {
        ...tableCfgState,
        data: tableCfg.data,
      }
    }
    if (nextProps.defaultSelected.length) {
      state.selectedRecord = [...nextProps.defaultSelected];
    }
    this.setState({
      ...state
    });
  }

  handleButtonClick = (e) => {
    const {buttonCfg} = this.props;
    if (!this.btnEle) {
      this.btnEle = e.target;
    }

    this.setState({
      modalVisible: true
    }, () => {
      if (buttonCfg.onClick) {
        buttonCfg.onClick();
      }
    });
  }

  handleModalCancel = () => {
    this.setState({
      modalVisible: false,
    });
    const {onCancel} = this.props;
    const {selectedRecord} = this.state;
    if (onCancel) {
      onCancel(selectedRecord);
    }
  }

  handleModalOk = () => {
    const {onChange, onOk} = this.props;
    const {selectedRecord} = this.state;
    this.setState({
      modalVisible: false,
    });
    if (onChange) {
      onChange(selectedRecord);
    }
    if (onOk) {
      onOk(selectedRecord);
    }
  }

  handleTableSearch = (inputValue, filter) => {
    const { tableCfg: {data, filterColums} } = this.props;
    const { tableCfg } = this.state;
    const filterList = inputValue ? filter(data, filterColums) : data;
    this.setState({
      tableCfg: {
        ...tableCfg,
        data: filterList,
      }
    });
  }

  handleTableSelect = (record, selected, selectedRows, nativeEvent, multiple) => {
    const { selectedRecord } = this.state;
    if (selected) {
      if (multiple) {
        this.setState({
          selectedRecord: [...selectedRecord, record]
        });
      } else {
        this.setState({
          selectedRecord: [record]
        });
      }
    } else {
      this.setState({
        selectedRecord: selectedRecord.filter((item) => {
          return item.id !== record.id;
        })
      });
    }
  }

  handleTableSelectAll = (selected, selectedRows, changeRows) => {
    const { selectedRecord } = this.state;
    if (selected) {
      this.setState({
        selectedRecord: [...selectedRecord, ...changeRows]
      });
    } else {
      const changeRowIds = changeRows.map((item) => {
        return item.id;
      });
      this.setState({
        selectedRecord: selectedRecord.filter((item) => {
          return changeRowIds.indexOf(item.id) === -1
        })
      });
    }
  }

  handleTagClose = (record) => {
    const { selectedRecord } = this.state;
    this.setState({
      selectedRecord: selectedRecord.filter((item) => {
        return item.id !== record.id;
      })
    });
  }

  handleModalClosed = () => {
    this.btnEle.blur();
  }

  handleTableLoad = ()=>{
    const {tableCfg} = this.props;
    if (tableCfg.onLoad) {
      const currentSelectTreeNode = this.oopTreeTable.getCurrentSelectTreeNode();
      if (currentSelectTreeNode) {
        if (currentSelectTreeNode.name) {
          this.setState({
            tableCfg: {
              ...tableCfg,
              title: currentSelectTreeNode.name
            }
          }, ()=>{
            if (currentSelectTreeNode.key) {
              tableCfg.onLoad(currentSelectTreeNode.key);
            }
          });
        }
      }
    }
  }

  handleTreeNodeSelect = ()=>{
    this.handleTableLoad();
    return false;
  }
  clearAll = ()=>{
    Modal.confirm({
      title: '提示',
      content: `确定删除选中的${this.state.selectedRecord.length}条数据吗`,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.setState({
          selectedRecord: []
        })
      }
    });
  }
  render() {
    const {
      buttonCfg = {
        icon: 'user',
        text: '',
      },
      treeCfg = {
        dataSource: [],
        defaultSelectedKeys: []
      },
      // size,
      tableCfg = {
        data: [],
        title: '',
        total: 0
      },
      modalTitle = '',
      multiple = true
    } = this.props;
    const {
      modalVisible,
      tableCfg: tableCfgState,
      selectedRecord,
    } = this.state;
    const selectedRowKeys = selectedRecord.map((item) => { return item.id });
    const selectedRowNames = selectedRecord.map((item) => { return item.name }).join(',');

    const tableTitle = tableCfgState.title ? tableCfgState.title : tableCfg.title;

    return (
      <Fragment>
        <Tooltip title={selectedRowNames.length ? selectedRowNames : '点击选择'}>
          <Button
            icon={buttonCfg.icon}
            disabled={buttonCfg.disabled}
            onClick={this.handleButtonClick}
            className={styles.btn}
            ref={(el)=>{ this.btn = el }}>{selectedRowNames.length ? selectedRowNames : buttonCfg.text}
          </Button>
        </Tooltip>
        <OopModal
          style={{top: 20}}
          afterClose={this.handleModalClosed}
          destroyOnClose={true}
          closeConfirm={{
            visible: false
          }}
          onCancel={this.handleModalCancel}
          onOk={this.handleModalOk}
          title={modalTitle}
          visible={modalVisible}
          wrapClassName={styles.assignModal}
          tabs={[{key: 'basic', main: true, content: (<div>
            <div className={styles.tableInfo}>
              <div style={{minWidth: 80}}>已选择(<span className={styles.primaryColor}>{this.state.selectedRecord.length}</span>):</div>
              <div style={{lineHeight: 2, minHeight: 28}}>
                {selectedRecord.map((item) => {
                  return (
                    <Tag
                      key={item.id}
                      closable
                      onClose={(e) => {
                        this.handleTagClose(item, e);
                      }}>{item.name}</Tag>
                  )
                })}
                {selectedRecord.length ? (<Tag onClick={this.clearAll}>清空选择</Tag>) : null}
              </div>
            </div>
            <OopTreeTable
              ref={(el)=>{ el && (this.oopTreeTable = el) }}
              table={{
                columns: tableCfg.columns,
                dataDefaultSelectedRowKeys: selectedRowKeys,
                grid: {list: tableCfgState.data},
                gridLoading: tableCfg.loading,
                onLoad: f=>f,
                oopSearch: {
                  placeholder: '请输入',
                  enterButtonText: '搜索',
                  onInputChange: this.handleTableSearch
                },
                _onSelect: this.handleTableSelect,
                _onSelectAll: this.handleTableSelectAll,
                size: 'small',
                title: tableTitle
              }}
              tree={{
                className: styles.tree,
                defaultSelectedKeys: treeCfg.defaultSelectedKeys,
                title: treeCfg.title,
                treeLoading: treeCfg.loading,
                treeData: treeCfg.dataSource,
                treeTitle: 'name',
                treeKey: 'id',
              }}
              onTreeNodeSelect={this.handleTreeNodeSelect}
              multiple={multiple}
              // size={size}
            />
          </div>)}]}
        />
      </Fragment>
    );
  }
}
