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
