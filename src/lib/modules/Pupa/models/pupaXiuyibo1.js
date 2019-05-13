/* eslint-disable*/
export default {
  namespace: 'pupaXiuyibo1',
  state: {
  },
  effects: {
    *tongji({ payload = {}, tableName, callback}, { call, put }) {
      console.log(payload, tableName)
      setTimeout(()=>{
        if (callback) callback([1,2,3])
      }, 300)
    },
  },

  reducers: {
  }
};
