import React from 'react';
import { Button } from 'antd';

export const isJson = (str) => {
  if (typeof str === 'string') {
    try {
      const strObj = JSON.parse(str);
      if (typeof strObj === 'object' && strObj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      return false
    }
  }
}
export const makeRandomId = () => {
  return Math.random().toString(36).substring(2)
}
export const filterDefault = (arr, defaultBtnArr) => {
  for (let i = 0; i < defaultBtnArr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[j].name === defaultBtnArr[i]) {
        arr[j].default = true
      }
    }
  }
  return arr
}
export const checkRepeat = (arr, field, param) => {
  if (param) {
    const tempArr = arr.filter(item => ((item[field] === param[field]) && (item._id !== param._id)))
    if (tempArr.length > 0) return true;
    return false;
  } else {
    const hash = {};
    for (let i = 0; i < arr.length; i++) {
      if (hash[arr[i][field]]) {
        return true
      }
      hash[arr[i][field]] = true;
    }
    return false
  }
}
export const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;
  return result;
};
export const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
export const makeDefaultButtons = (relaWf) => {
  const startBtn = {
    _id: makeRandomId(),
    text: '发起',
    name: 'start',
    position: 'top',
    type: 'primary',
    icon: 'branches',
    enable: true,
    default: true
  }
  const defaultButtons = [
    {
      _id: makeRandomId(),
      text: '新建',
      name: 'create',
      position: 'top',
      type: 'primary',
      icon: 'plus',
      enable: true,
      default: true
    },
    {
      _id: makeRandomId(),
      text: '删除',
      name: 'batchDelete',
      position: 'top',
      type: 'default',
      icon: 'delete',
      display: 'items=>(items.length > 0)',
      enable: true,
      default: true
    },
    {
      _id: makeRandomId(),
      text: '导入',
      name: 'upload',
      position: 'top',
      type: 'default',
      icon: 'upload',
      enable: false,
      default: true
    },
    {
      _id: makeRandomId(),
      text: '导出',
      name: 'export',
      position: 'top',
      type: 'default',
      icon: 'download',
      enable: false,
      default: true
    },
    {
      _id: makeRandomId(),
      text: '编辑',
      name: 'edit',
      position: 'row',
      icon: 'edit',
      type: 'default',
      enable: true,
      default: true
    },
    {
      _id: makeRandomId(),
      text: '删除',
      name: 'delete',
      position: 'row',
      icon: 'delete',
      type: 'default',
      enable: true,
      confirm: '确定删除此项吗',
      default: true
    }
  ]
  return relaWf ? [startBtn, ...defaultButtons] : defaultButtons
}
export const makeCreateFormConfig = (formEntity, checkCode, checkTableName, workflowSelection) => {
  const me = this
  const rule = {};
  if (!formEntity.code && !formEntity.tableName) {
    rule.checkCodeRepeat = [{
      required: true,
      max: 20,
      pattern: /^[_0-9A-Za-z]+$/,
      message: '字段名称不能为空,且必须是"_"、数字或英文字符'
    }, {
      validator(rules, value, callback) {
        checkCode(rules, value, callback, me);
      }
    }];
    rule.checkTableNameRepeat = [{
      required: true,
      max: 20,
      pattern: /^[_0-9A-Za-z]+$/,
      message: '字段名称不能为空,且必须是"_"、数字或英文字符'
    }, {
      validator(rules, value, callback) {
        checkTableName(rules, value, callback, me);
      }
    }];
  }
  return {
    formLayout: 'horizontal',
    formJson: [
      {
        name: 'id',
        component: {
          name: 'Input',
          props: {type: 'hidden'}
        },
        initialValue: formEntity.id || undefined,
        wrapper: true
      },
      {
        label: '功能名',
        key: 'functionName',
        name: 'functionName',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入功能名',
          }
        },
        initialValue: formEntity.functionName || '',
        rules: [{
          required: true,
          message: '此项为必填项'
        }]
      },
      {
        label: '表名',
        key: 'tableName',
        name: 'tableName',
        component: {
          name: 'Input',
          props: {
            addonBefore: 'PEP_PUPA_',
            placeholder: '请输入表名',
            disabled: !!formEntity.tableName
          }
        },
        initialValue: formEntity.tableName ? formEntity.tableName.replace('PEP_PUPA_', '') : '',
        rules: rule.checkTableNameRepeat
      },
      {
        label: '编码',
        key: 'code',
        name: 'code',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入编码',
            disabled: !!formEntity.code
          }
        },
        initialValue: formEntity.code || undefined,
        rules: rule.checkCodeRepeat
      },
      {
        label: '关联流程',
        key: 'relaWf',
        name: 'relaWf',
        component: {
          name: 'Switch',
          props: {
            checkedChildren: '是',
            unCheckedChildren: '否'
          }
        },
        initialValue: formEntity.relaWf || undefined,
        valuePropName: 'checked'
      },
      {
        label: '选择流程',
        key: 'wfKey',
        name: 'wfKey',
        display: false,
        component: {
          name: 'Select',
          props: {
            placeholder: '请选择流程',
            showSearch: true
          },
          children: workflowSelection,
        },
        rules: [{
          required: true,
          message: '此项为必填项'
        }],
        initialValue: formEntity.wfKey || undefined,
        subscribe: [{
          name: 'relaWf',
          publish: [{
            value: true,
            property: 'display'
          }]
        }],
      },
      {
        label: '备注',
        key: 'note',
        name: 'note',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '请输入备注',
            autosize: true
          }
        },
        initialValue: formEntity.note || '',
      },
      {
        label: '启/停用',
        key: 'enable',
        name: 'enable',
        component: {
          name: 'Switch',
          props: {
            checkedChildren: '启',
            unCheckedChildren: '停'
          }
        },
        valuePropName: 'checked',
        initialValue: formEntity.enable || false,
      }
    ]
  }
}
export const makeTableInfoCfgConfig = (entity = {}, gridConfig = {}, submit) => {
  const { columns = [] } = gridConfig
  const CTandLT = [
    {label: '创建时间', value: 'CT'},
    {label: '修改时间', value: 'LT'},
  ]
  const list = [...CTandLT, ...columns.map((item) => {
    return {
      label: item.title,
      value: item.dataIndex
    }
  })]
  return {
    formLayoutConfig: {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 16},
      },
    },
    formJson: [
      {
        label: '列表信息扩展',
        key: 'tableInfoExtra',
        name: 'tableInfoExtra',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '请输入扩展内容',
            autosize: true,
          },
        },
        extra: '列表扩展信息将展示在表格的上部',
        initialValue: entity.tableInfoExtra || ''
      },
      {
        label: '显示序号',
        key: 'order',
        name: 'order',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '否',
            value: false
          }, {
            label: '是',
            value: true
          }],
        },
        extra: '列表每条数据前是否显示序号',
        initialValue: entity.order || false,
      },
      {
        label: '列表排序',
        key: 'rank',
        name: 'rank',
        component: {
          name: 'Select',
          props: { placeholder: '请选择排序字段', style: {width: 240} },
          children: list,
        },
        extra: '按选定字段排序',
        initialValue: entity.rank || 'CT',
      },
      {
        label: '升降序',
        key: 'rankRule',
        name: 'rankRule',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '升序',
            value: 'asc'
          }, {
            label: '降序',
            value: 'desc'
          }],
        },
        initialValue: entity.rankRule || 'desc',
        subscribe: [{
          name: 'rank',
          publish: [{
            value(chanageValue) {
              return !!chanageValue
            },
            property: 'display'
          }]
        }],
      },
      {
        key: 'submitBtn',
        component: () => {
          return (
            <div>
              <Button type="primary" onClick={submit} style={{marginLeft: '20%'}}>保存</Button>
            </div>
          )
        },
        formItemLayout: {
          wrapperCol: {
            xs: {span: 24},
            sm: {span: 20},
          },
        }
      }
    ]
  }
}
export const makeTableCfgConfig = (formEntity) => {
  return {
    columnsNum: 2,
    formLayoutConfig: {
      labelCol: {
        xs: {span: 24},
        sm: {span: 4},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
      },
    },
    formJson: [
      {
        name: '_id',
        component: {
          name: 'Input',
          props: {type: 'hidden'}
        },
        wrapper: true
      },
      {
        name: 'syncTag',
        component: {
          name: 'Input',
          props: {
            type: 'hidden',
          }
        },
        wrapper: true
      },
      {
        label: '列名',
        key: 'title',
        name: 'title',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入列名',
          }
        },
        initialValue: formEntity.title || '',
        rules: [{
          required: true,
          message: '此项为必填项'
        }]
      },
      {
        label: '字段名',
        key: 'dataIndex',
        name: 'dataIndex',
        component: {
          name: 'Input',
          props: {
            placeholder: '请输入字段名'
          }
        },
        initialValue: formEntity.dataIndex || '',
        rules: [{
          required: true,
          message: '此项为必填项'
        }]
      },
      {
        label: '列宽',
        key: 'width',
        name: 'width',
        component: {
          name: 'InputNumber',
          props: {
            placeholder: '请输入字段名',
          }
        },
        initialValue: formEntity.width || '',
        rules: [{
          required: false,
          message: '此项为必填项'
        }],
        subscribe: [{
          name: 'hover',
          publish: [{
            value(chanageValue) {
              return chanageValue === true
            },
            property: 'rules[0].required'
          }]
        }],
      },
      {
        label: '排序',
        key: 'sorter',
        name: 'sorter',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '否',
            value: false
          }, {
            label: '是',
            value: true
          }, {
            label: '自定义',
            value: 'custom'
          }],
        },
        initialValue: formEntity.sorter || false,
      },
      // {
      //   label: '筛选',
      //   key: 'filter',
      //   name: 'filter',
      //   component: {
      //     name: 'TextArea',
      //     props: {
      //       placeholder: '请输入筛选规则',
      //       autosize: true
      //     }
      //   },
      //   initialValue: formEntity.filter || '',
      // },
      {
        label: '自定义渲染',
        key: 'render',
        name: 'render',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '例：(text) => {return <span style={{color: "red"}}>{text}</span>}',
            autosize: true
          }
        },
        initialValue: formEntity.render || '',
      },
      {
        label: '排序规则',
        key: 'sorterRule',
        name: 'sorterRule',
        component: {
          name: 'TextArea',
          props: {
            placeholder: '例：(a, b) => { return a - b }',
            autosize: true
          }
        },
        rules: [{
          required: true,
          message: '请输入排序规则'
        }],
        initialValue: formEntity.sorterRule || '',
        subscribe: [{
          name: 'sorter',
          publish: [{
            value(chanageValue) {
              return chanageValue === 'custom'
            },
            property: 'display'
          }]
        }],
      },
      {
        label: '鼠标悬停提示',
        key: 'hover',
        name: 'hover',
        component: {
          name: 'RadioGroup',
          children: [{
            label: '关闭',
            value: false
          }, {
            label: '开启',
            value: true
          }],
        },
        initialValue: formEntity.hover || false,
      },
    ]
  }
}