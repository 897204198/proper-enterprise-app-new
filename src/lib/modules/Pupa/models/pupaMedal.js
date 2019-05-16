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
    paths += `${indent ? '    -' : ''}日期：${item.date}   类型：${item.type_text}  来源：${item.path}\r\n`
    if (item.detailCollect) {
      paths += mergeDetail(item.detailCollect, true)
    }
    return null
  })
  return paths
}
const mergeMedal = (arr, from, to, num) => {
  const fromArr = arr.filter(item => item.type === from)
  const elseArr = arr.filter(item => item.type !== from)
  const times = parseInt(fromArr.length / num, 10)
  const toArr = []
  if (times > 0) {
    for (let j = 0; j < times; j++) {
      const spliceArr = fromArr.splice(0, num)
      const obj = {
        emp: spliceArr[0].emp,
        date: new Date(),
        date_text: moment().format('YYYY-MM-DD'),
        type: to,
        type_text: medalMap[to],
        path: '徽章合成',
        detailCollect: spliceArr,
        detail: mergeDetail(spliceArr, false)
      }
      toArr.push(obj)
    }
  }
  return [...toArr, ...fromArr, ...elseArr]
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
      for (let i = 0; i < members.length; i++) {
        const memberArr = result.filter(item => item.emp[0].id === members[i])
        c2b = mergeMedal(memberArr, 'C', 'B', 5)
        b2a = mergeMedal(c2b, 'B', 'A', 3)
      }
      let saveSuccess = true
      for (let j = 0; j < b2a.length; j++) {
        const res = yield call(saveOrUpdate, b2a[j])
        if (res.status === 'error') {
          saveSuccess = false
        }
      }
      if (!saveSuccess) {
        if (callback) callback({status: 'error'})
      } else {
        const ids = resp.result.map(item => item.id)
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
        if (callback) callback({status: 'ok'})
      }
    },
  },
  reducers: {

  }
};
