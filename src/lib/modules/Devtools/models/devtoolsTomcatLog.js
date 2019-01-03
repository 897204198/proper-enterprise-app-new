import { queryLog } from '../services/devtoolsTomcatLogS';

// 数据转化成json
// function transJson(arr) {
//   const allStatisticsData = [];
//   for (let n = 0; n < arr.length; n++) {
//     allStatisticsData.push(JSON.parse(arr[n]));
//   }
//   return allStatisticsData;
// }

export default {
  namespace: 'devtoolsTomcatLog',
  state: {
  },
  effects: {
    *fetch({ payload, callback }, { call }) {
      const response = yield call(queryLog, payload);
      const { data } = response.result;
      const logs = [];
      for (let n = 0; n < data.length; n++) {
        const log = data[n];
        if (logs.length > 1 && logs[logs.length - 1].clz === log.clz
          && logs[logs.length - 1].msg === log.msg) {
          if (logs[logs.length - 1].times < 9) {
            logs[logs.length - 1].times++;
          }
        } else {
          log.tmAfter = log.tm.substring(0, 19);
          if (log.clz.length > 45) {
            log.clzAfter = log.clz.substring(log.clz.length - 45, log.clz.length);
          }
          log.msgAfter = log.msg.replace(new RegExp(/\r\n/g), '<br>');
          log.msgAfter = log.msgAfter.replace(new RegExp(/\t/g), '&nbsp;&nbsp;&nbsp;&nbsp;');
          log.msgAfter = `[${log.tm}]&nbsp;${log.clzAfter}&nbsp;-&nbsp;${log.msgAfter}`;
          log.times = 1;
          logs.push(log);
          if (logs.length > 3000 && !payload.overflowLock) {
            logs.shift();
          }
        }
      }
      if (callback) callback(logs);
    },
  },
  reducers: {
  }
}
