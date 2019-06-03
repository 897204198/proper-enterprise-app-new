import moment from 'moment';
import { fetch, saveOrUpdate, removeAll } from '../services/pupaMedalS';

const medalMap = {
  A: '金',
  B: '银',
  C: '铜'
}
const filterMembers = (arr) => {
  const res = [];
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i].emp[0].id]) {
      obj[arr[i].emp[0].id] = 1;
      res.push(arr[i].emp[0].id);
    }
  }
  return res;
}
const mergeDetail = (arr, indent = false) => {
  if (!arr.length) return ''
  let paths = ''
  arr.map((item) => {
    paths += `${indent ? '    -' : ''}${item.date_text}/${item.type_text}/${item.path}\r\n`
    if (item.detailCollect) {
      paths += mergeDetail(item.detailCollect, true)
    }
    return null
  })
  return paths
}
const mergeMedal = (arr, from, to, num) => {
  let fromArr = arr.filter(item => item.type === from)
  for (let i = 0; i < fromArr.length; i++) {
    if (fromArr[i].medalNumber > 1) {
      const obj = {...fromArr[i]}
      const { medalNumber } = fromArr[i]
      obj.medalNumber = 1
      delete obj.id
      delete obj._id
      fromArr.splice(i, 1)
      fromArr = [...fromArr, ...new Array(medalNumber).fill(obj)]
    }
  }
  const elseArr = arr.filter(item => item.type !== from)
  const times = parseInt(fromArr.length / num, 10)
  const toArr = []
  if (times > 0) {
    for (let j = 0; j < times; j++) {
      const spliceArr = fromArr.splice(0, num)
      const conver = {}
      if (to === 'A') {
        conver.convert = false
        conver.convert_text = '未兑换'
      }
      const obj = {
        emp: spliceArr[0].emp,
        date: moment().format('YYYY-MM-DD'),
        date_text: moment().format('YYYY-MM-DD'),
        type: to,
        type_text: medalMap[to],
        path: '奖章合成',
        medalNumber: 1,
        detailCollect: spliceArr,
        detail: mergeDetail(spliceArr, false),
        ...conver
      }
      toArr.push(obj)
    }
    return [...toArr, ...fromArr, ...elseArr]
  }
  return arr
}
export default {
  namespace: 'pupaMedal',
  state: {
  },
  effects: {
    *mergeMedal({callback}, { call }) {
      const resp = yield call(fetch);
      const { result } = resp
      if (!result.length) return
      let c2b = []
      let b2a = []
      const members = filterMembers(result)
      let saveSuccess = true
      for (let i = 0; i < members.length; i++) {
        const memberArr = result.filter(item => item.emp[0].id === members[i])
        c2b = mergeMedal(memberArr, 'C', 'B', 5)
        b2a = mergeMedal(c2b, 'B', 'A', 3)
        for (let j = 0; j < b2a.length; j++) {
          const res = yield call(saveOrUpdate, b2a[j])
          if (res.status === 'error') {
            saveSuccess = false
          }
        }
        if (!saveSuccess) {
          if (callback) callback({status: 'error'})
        } else {
          const ids = memberArr.map(item => item.id)
          b2a.map((item) => {
            if (item.id && ids.indexOf(item.id) !== -1) {
              const index = ids.findIndex((value) => {
                return value === item.id
              })
              ids.splice(index, 1)
            }
            return null
          })
          yield call(removeAll, {ids: ids.join(',')})
        }
      }
      if (saveSuccess) {
        if (callback) callback({status: 'ok'})
      }
    },
  },
  reducers: {

  }
};
