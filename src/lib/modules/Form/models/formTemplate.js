import { queryFormTemplate, queryTemplateById, saveOrUpdateTemplate,
  deleteTemplate, updateTemplateFormDetails, queryTemplateByFormkeydefinition} from '../services/formTemplateS';

export default {
  namespace: 'formTemplate',
  state: {
    grid: {
      list: [],
      pagination: null
    },
    entity: {}
  },
  effects: {
    *fetch({ payload = {}, callback }, { call, put }) {
      const resp = yield call(queryFormTemplate, payload);
      yield put({
        type: 'saveGrid',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *fetchById({ payload, callback }, { call, put }) {
      const resp = yield call(queryTemplateById, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *saveOrUpdate({payload, callback}, {call, put}) {
      const resp = yield call(saveOrUpdateTemplate, payload);
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
    *remove({payload, callback}, {call}) {
      const resp = yield call(deleteTemplate, payload);
      if (callback) callback(resp)
    },
    *updateFormDetails({payload, callback}, {call}) {
      const resp = yield call(updateTemplateFormDetails, payload);
      if (callback) callback(resp)
    },
    *queryByFormkeydefinition({payload, callback}, {call}) {
      const resp = yield call(queryTemplateByFormkeydefinition, payload);
      if (callback) callback(resp)
    },
    *copyById({ payload, callback }, { call, put }) {
      const resp = yield call(queryTemplateById, payload);
      delete resp.result.id;
      delete resp.result._id;
      delete resp.result.formkeydefinition;
      resp.result.name = `${resp.result.name}_copy`;
      yield put({
        type: 'saveEntity',
        payload: resp
      })
      if (callback) callback(resp)
    },
  },

  reducers: {
    saveGrid(state, { payload}) {
      return {
        ...state,
        grid: {
          ...state.grid,
          list: payload.result
        }
      }
    },
    saveEntity(state, action) {
      return {
        ...state,
        entity: action.payload.result
      }
    },
    clearEntity(state) {
      return {
        ...state,
        entity: {}
      }
    },
    refreshTable(state, action) {
      return {
        ...state,
        grid: {
          list: action.payload,
          pagination: null
        }
      }
    }
  }
};
