import { stringify } from 'qs';
import request from '../../../../framework/utils/request';

// 将时间转换成mongo的objectId
const tranObjectId = (date) => {
  let time = parseInt(date.getTime() / 1000, 10);
  time = time.toString(16);
  time += new Array(17).join('0');
  return time;
};

export async function queryLog(sql) {
  const now = new Date();
  const tmStart = new Date(now.getTime() - sql.intervalTime);
  const tmEnd = now;
  let query = '{';
  query += `lv: {$in: ${sql.type}}, `;
  if (sql.startTime !== '' && sql.endTime !== '') {
    query += `tm: {$gte: "${sql.startTime}.000", $lte: "${sql.endTime}.000"}`;
  } else {
    query += `_id: {$gte: ObjectId("${tranObjectId(tmStart)}"), $lte: ObjectId("${tranObjectId(tmEnd)}")}`;
  }
  if (sql.text && sql.text.length > 0) {
    query += `, $or: [{clz: /'${sql.text}'/}, {msg: /'${sql.text}'/}]`;
  }
  query += '}';
  const params = {
    query,
    sort: '{tm: 1}'
  };
  return request(`/msc/LOGS?${stringify(params)}`);
}
