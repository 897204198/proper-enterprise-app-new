# Pupa项目中的实例

## `团队奖章管理` 以下为全部配置 
 
 **formConfig**
```
{
  formLayout: 'horizontal',
  formJson: [{
    label: '人员',
    key: 'OopOrgEmpPicker',
    component: {
      name: 'OopOrgEmpPicker',
      props: {
        placeholder: '请选择',
        multiple: true
      }
    },
    name: 'emp',
    relateBtn: ['create', 'edit'],
    rules: [],
  },
  {
    label: '奖章类型',
    key: 'RadioGroup',
    component: {
      name: 'RadioGroup',
      children: [{
        label: '金',
        value: 'A'
      },
      {
        label: '银',
        value: 'B'
      },
      {
        label: '铜',
        value: 'C'
      }]
    },
    name: 'type',
    relateBtn: ['create', 'edit'],
    rules: [{
      required: true,
      message: '此项为必填项'
    }],
    initialValue: 'C',
  },
  {
    label: '奖章数量',
    key: 'InputNumber_EfjkxTzPQy',
    component: {
      name: 'InputNumber'
    },
    name: 'medalNumber',
    relateBtn: ['create', 'edit'],
    initialValue: 1,
  },
  {
    label: '日期选择',
    key: 'DatePicker',
    component: {
      name: 'DatePicker',
      props: {
        showTime: {
          format: 'HH:mm'
        },
        format: 'YYYY-MM-DD HH:mm'
      }
    },
    name: 'date',
    relateBtn: ['create', 'edit'],
    rules: [{
      required: true,
      message: '此项为必填项'
    }],
    initialValue: '2019-07-03 08:00'
  },
  {
    label: '奖章来源',
    key: 'Input',
    component: {
      name: 'Input',
      props: {
        placeholder: '请输入奖章来源'
      }
    },
    name: 'path',
    relateBtn: ['create', 'edit'],
    rules: [{
      required: true,
      message: '此项为必填项'
    }],
  },
  {
    label: '合成历史',
    key: 'TextArea',
    component: {
      name: 'TextArea',
      props: {
        autosize: true
      }
    },
    name: 'detail',
    relateBtn: ['create', 'edit'],
    subscribe: [{
      name: 'type',
      publish: [{
        value: 'function(chanageValue, curValue) {
        return \'A,B\'.includes(chanageValue) && (curValue.length > 0)
      }',
        property: 'display'
      }]
    }],
    display: false,
    initialValue: '',
  },
  {
    label: '兑换状态',
    key: 'convert',
    name: 'convert',
    component: {
      name: 'RadioGroup',
      children: [{
        label: '未兑换',
        value: false
      },
      {
        label: '已兑换',
        value: true
      }]
    },
    relateBtn: ['create', 'edit'],
    subscribe: [{
      name: 'type',
      publish: [{
        value: 'A',
        property: 'display'
      }]
    }],
    display: false,
    initialValue: false,
  },
  {
    label: '兑换时间',
    key: 'DatePicker2',
    component: {
      name: 'DatePicker'
    },
    name: 'convertDate',
    relateBtn: ['create', 'edit'],
    subscribe: [{
      name: 'convert',
      publish: [{
        value: true,
        property: 'display'
      }]
    }],
    display: false,
  }]
}
```
 **gridConfig** 
```
{
  columns: [{
    title: '人员',
    dataIndex: 'emp',
    colIndex: '1',
    render: '(text) => {
  const value = text.map(item => item.name).join(\',\')
  return value
}',
    enable: true
  },
  {
    title: '奖章类型',
    dataIndex: 'type',
    colIndex: '2',
    render: '(text, record) => {
const colorMap = {
           A: \'#ffc300f7\',
           B: \'#b3a9a9\',
           C: \'#e86b35\'
}
const convert = record.type === \'A\' ? `(${record.convert_text})` : \'\'
 return `<i aria-label="图标: dollar" class="anticon anticon-dollar" style="vertical-align: bottom;font-size:20px;color: ${colorMap[record.type]}"><svg viewBox="64 64 896 896" class="" data-icon="dollar" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm47.7-395.2l-25.4-5.9V348.6c38 5.2 61.5 29 65.5 58.2.5 4 3.9 6.9 7.9 6.9h44.9c4.7 0 8.4-4.1 8-8.8-6.1-62.3-57.4-102.3-125.9-109.2V263c0-4.4-3.6-8-8-8h-28.1c-4.4 0-8 3.6-8 8v33c-70.8 6.9-126.2 46-126.2 119 0 67.6 49.8 100.2 102.1 112.7l24.7 6.3v142.7c-44.2-5.9-69-29.5-74.1-61.3-.6-3.8-4-6.6-7.9-6.6H363c-4.7 0-8.4 4-8 8.7 4.5 55 46.2 105.6 135.2 112.1V761c0 4.4 3.6 8 8 8h28.4c4.4 0 8-3.6 8-8.1l-.2-31.7c78.3-6.9 134.3-48.8 134.3-124-.1-69.4-44.2-100.4-109-116.4zm-68.6-16.2c-5.6-1.6-10.3-3.1-15-5-33.8-12.2-49.5-31.9-49.5-57.3 0-36.3 27.5-57 64.5-61.7v124zM534.3 677V543.3c3.1.9 5.9 1.6 8.8 2.2 47.3 14.4 63.2 34.4 63.2 65.1 0 39.1-29.4 62.6-72 66.4z"></path></svg></i> ${text} ${convert}`}',
    enable: true
  },
  {
    title: '奖章数量',
    dataIndex: 'medalNumber',
    colIndex: '3',
    enable: true
  },
  {
    title: '日期选择',
    dataIndex: 'date',
    colIndex: '4',
    sorter: '(a,b) => {return new Date(a.date) - new Date(b.date)}',
    hover: false,
    enable: true
  },
  {
    title: '奖章来源',
    dataIndex: 'path',
    enable: true
  },
  {
    title: '合成历史',
    dataIndex: 'detail',
    colIndex: '6',
    width: 300,
    hover: true,
    enable: true
  },
  {
    title: '兑换时间',
    dataIndex: 'convertDate',
    colIndex: '7',
    enable: false
  },
  {
    title: '兑换状态',
    dataIndex: 'convert',
    colIndex: '8',
    enable: false
  }],
  topButtons: [{
    text: '发起',
    name: 'start',
    position: 'top',
    type: 'primary',
    icon: 'branches',
    enable: true,
  default:
    true
  },
  {
    text: '新建',
    name: 'create',
    position: 'top',
    type: 'primary',
    icon: 'plus',
    enable: true,
  default:
    true,
    display: true
  },
  {
    text: '删除',
    name: 'batchDelete',
    position: 'top',
    type: 'default',
    icon: 'delete',
    display: 'items=>(items.length > 0)',
    enable: true,
  default:
    true
  },
  {
    text: '合并奖章',
    name: 'mergeMedal',
    position: 'top',
    type: 'primary',
    icon: 'file',
    restPath: '@pupaMedal/mergeMedal',
    confirm: '',
    display: true,
    enable: true,
  }],
  rowButtons: [{
    text: '编辑',
    name: 'edit',
    position: 'row',
    icon: 'edit',
    type: 'default',
    enable: true,
  default:
    true,
    display: true
  },
  {
    text: '删除',
    name: 'delete',
    position: 'row',
    icon: 'delete',
    type: 'default',
    enable: true,
  default:
    true,
    display: true
  }],
  props: {
    tableInfoExtra: ''
  }
}
```
 **modalConfig** 
```
{
  title: '',
  width: 800,
  footer: ['cancel', 'submit'],
  saveAfterClosable: true,
  maskClosable: false
}
```
