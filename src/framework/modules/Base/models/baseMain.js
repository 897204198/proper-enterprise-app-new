const fakeChartData2 = {
  visitData:
    [
      {x: '2018-02-07', y: 7},
      {x: '2018-02-08', y: 5},
      {x: '2018-02-09', y: 4},
      {x: '2018-02-10', y: 2},
      {x: '2018-02-11', y: 4},
      {x: '2018-02-12', y: 7},
      {x: '2018-02-13', y: 5},
      {x: '2018-02-14', y: 6},
      {x: '2018-02-15', y: 5},
      {x: '2018-02-16', y: 9},
      {x: '2018-02-17', y: 6},
      {x: '2018-02-18', y: 3},
      {x: '2018-02-19', y: 1},
      {x: '2018-02-20', y: 5},
      {x: '2018-02-21', y: 3},
      {x: '2018-02-22', y: 6},
      {x: '2018-02-23', y: 5}
    ],
  visitData2:
    [
      {x: '2018-02-07', y: 1},
      {x: '2018-02-08', y: 6},
      {x: '2018-02-09', y: 4},
      {x: '2018-02-10', y: 8},
      {x: '2018-02-11', y: 3},
      {x: '2018-02-12', y: 7},
      {x: '2018-02-13', y: 2}
    ],
  salesData:
    [
      {x: '1月', y: 582},
      {x: '2月', y: 419},
      {x: '3月', y: 720},
      {x: '4月', y: 520},
      {x: '5月', y: 239},
      {x: '6月', y: 882},
      {x: '7月', y: 954},
      {x: '8月', y: 648},
      {x: '9月', y: 1173},
      {x: '10月', y: 319},
      {x: '11月', y: 1158},
      {x: '12月', y: 444}
    ],
  searchData:
    [
      {index: 1, keyword: '搜索关键词-0', count: 659, range: 62, status: 0},
      {index: 2, keyword: '搜索关键词-1', count: 53, range: 77, status: 1},
      {index: 3, keyword: '搜索关键词-2', count: 781, range: 28, status: 1},
      {index: 4, keyword: '搜索关键词-3', count: 895, range: 10, status: 1},
      {index: 5, keyword: '搜索关键词-4', count: 337, range: 33, status: 1},
      {index: 6, keyword: '搜索关键词-5', count: 409, range: 58, status: 1},
      {index: 7, keyword: '搜索关键词-6', count: 617, range: 89, status: 1},
      {index: 8, keyword: '搜索关键词-7', count: 836, range: 46, status: 1},
      {index: 9, keyword: '搜索关键词-8', count: 511, range: 34, status: 1},
      {index: 10, keyword: '搜索关键词-9', count: 386, range: 5, status: 1},
      {index: 11, keyword: '搜索关键词-10', count: 91, range: 8, status: 1},
      {index: 12, keyword: '搜索关键词-11', count: 577, range: 41, status: 0},
      {index: 13, keyword: '搜索关键词-12', count: 637, range: 98, status: 0},
      {index: 14, keyword: '搜索关键词-13', count: 826, range: 37, status: 1},
      {index: 15, keyword: '搜索关键词-14', count: 578, range: 73, status: 1},
      {index: 16, keyword: '搜索关键词-15', count: 837, range: 34, status: 1},
      {index: 17, keyword: '搜索关键词-16', count: 572, range: 64, status: 0},
      {index: 18, keyword: '搜索关键词-17', count: 725, range: 14, status: 1},
      {index: 19, keyword: '搜索关键词-18', count: 500, range: 13, status: 1},
      {index: 20, keyword: '搜索关键词-19', count: 433, range: 10, status: 0},
      {index: 21, keyword: '搜索关键词-20', count: 204, range: 21, status: 1},
      {index: 22, keyword: '搜索关键词-21', count: 339, range: 43, status: 0},
      {index: 23, keyword: '搜索关键词-22', count: 960, range: 1, status: 0},
      {index: 24, keyword: '搜索关键词-23', count: 321, range: 10, status: 0},
      {index: 25, keyword: '搜索关键词-24', count: 375, range: 31, status: 1},
      {index: 26, keyword: '搜索关键词-25', count: 249, range: 55, status: 1},
      {index: 27, keyword: '搜索关键词-26', count: 98, range: 86, status: 1},
      {index: 28, keyword: '搜索关键词-27', count: 233, range: 87, status: 0},
      {index: 29, keyword: '搜索关键词-28', count: 538, range: 15, status: 0},
      {index: 30, keyword: '搜索关键词-29', count: 213, range: 17, status: 1},
      {index: 31, keyword: '搜索关键词-30', count: 692, range: 65, status: 0},
      {index: 32, keyword: '搜索关键词-31', count: 541, range: 20, status: 0},
      {index: 33, keyword: '搜索关键词-32', count: 920, range: 95, status: 1},
      {index: 34, keyword: '搜索关键词-33', count: 366, range: 70, status: 1},
      {index: 35, keyword: '搜索关键词-34', count: 285, range: 70, status: 1},
      {index: 36, keyword: '搜索关键词-35', count: 326, range: 76, status: 1},
      {index: 37, keyword: '搜索关键词-36', count: 723, range: 43, status: 0},
      {index: 38, keyword: '搜索关键词-37', count: 826, range: 31, status: 0},
      {index: 39, keyword: '搜索关键词-38', count: 946, range: 78, status: 0},
      {index: 40, keyword: '搜索关键词-39', count: 70, range: 77, status: 0},
      {index: 41, keyword: '搜索关键词-40', count: 326, range: 43, status: 1},
      {index: 42, keyword: '搜索关键词-41', count: 309, range: 0, status: 0},
      {index: 43, keyword: '搜索关键词-42', count: 131, range: 28, status: 0},
      {index: 44, keyword: '搜索关键词-43', count: 305, range: 48, status: 1},
      {index: 45, keyword: '搜索关键词-44', count: 609, range: 48, status: 1},
      {index: 46, keyword: '搜索关键词-45', count: 98, range: 44, status: 0},
      {index: 47, keyword: '搜索关键词-46', count: 10, range: 45, status: 1},
      {index: 48, keyword: '搜索关键词-47', count: 831, range: 66, status: 0},
      {index: 49, keyword: '搜索关键词-48', count: 163, range: 96, status: 1},
      {index: 50, keyword: '搜索关键词-49', count: 965, range: 63, status: 0}
    ],
  offlineData:
    [
      {name: '门店0', cvr: 0.8},
      {name: '门店1', cvr: 0.4},
      {name: '门店2', cvr: 0.3},
      {name: '门店3', cvr: 0.1},
      {name: '门店4', cvr: 0.4},
      {name: '门店5', cvr: 0.9},
      {name: '门店6', cvr: 0.2},
      {name: '门店7', cvr: 0.8},
      {name: '门店8', cvr: 0.1},
      {name: '门店9', cvr: 0.7}
    ],
  offlineChartData:
    [
      {x: 1517987838575, y1: 52, y2: 79},
      {x: 1517989638575, y1: 81, y2: 97},
      {x: 1517991438575, y1: 49, y2: 70},
      {x: 1517993238575, y1: 27, y2: 19},
      {x: 1517995038575, y1: 53, y2: 31},
      {x: 1517996838575, y1: 36, y2: 52},
      {x: 1517998638575, y1: 53, y2: 109},
      {x: 1518000438575, y1: 47, y2: 69},
      {x: 1518002238575, y1: 11, y2: 24},
      {x: 1518004038575, y1: 107, y2: 72},
      {x: 1518005838575, y1: 14, y2: 39},
      {x: 1518007638575, y1: 13, y2: 24},
      {x: 1518009438575, y1: 17, y2: 39},
      {x: 1518011238575, y1: 104, y2: 66},
      {x: 1518013038575, y1: 40, y2: 59},
      {x: 1518014838575, y1: 60, y2: 22},
      {x: 1518016638575, y1: 45, y2: 102},
      {x: 1518018438575, y1: 71, y2: 28},
      {x: 1518020238575, y1: 86, y2: 52},
      {x: 1518022038575, y1: 75, y2: 33}
    ],
  salesTypeData:
    [
      {x: '家用电器', y: 4544},
      {x: '食用酒水', y: 3321},
      {x: '个护健康', y: 3113},
      {x: '服饰箱包', y: 2341},
      {x: '母婴产品', y: 1231},
      {x: '其他', y: 1231}
    ],
  salesTypeDataOnline:
    [
      {x: '家用电器', y: 244},
      {x: '食用酒水', y: 321},
      {x: '个护健康', y: 311},
      {x: '服饰箱包', y: 41},
      {x: '母婴产品', y: 121},
      {x: '其他', y: 111}
    ],
  salesTypeDataOffline:
    [
      {x: '家用电器', y: 99},
      {x: '个护健康', y: 188},
      {x: '服饰箱包', y: 344},
      {x: '母婴产品', y: 255},
      {x: '其他', y: 65}
    ],
  radarData:
    [
      {name: '个人', label: '引用', value: 10},
      {name: '个人', label: '口碑', value: 8},
      {name: '个人', label: '产量', value: 4},
      {name: '个人', label: '贡献', value: 5},
      {name: '个人', label: '热度', value: 7},
      {name: '团队', label: '引用', value: 3},
      {name: '团队', label: '口碑', value: 9},
      {name: '团队', label: '产量', value: 6},
      {name: '团队', label: '贡献', value: 3},
      {name: '团队', label: '热度', value: 1},
      {name: '部门', label: '引用', value: 4},
      {name: '部门', label: '口碑', value: 1},
      {name: '部门', label: '产量', value: 6},
      {name: '部门', label: '贡献', value: 5},
      {name: '部门', label: '热度', value: 7}
    ]
}
export default {
  namespace: 'baseMain',

  state: {
    visitData: [],
    visitData2: [],
    salesData: [],
    searchData: [],
    offlineData: [],
    offlineChartData: [],
    salesTypeData: [],
    salesTypeDataOnline: [],
    salesTypeDataOffline: [],
    radarData: [],
    loading: false,
  },

  effects: {
    *fetch(_, { put }) {
      const response = fakeChartData2;
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchSalesData(_, { put }) {
      const response = fakeChartData2;
      yield put({
        type: 'save',
        payload: {
          salesData: response.salesData,
        },
      });
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clear() {
      return {
        visitData: [],
        visitData2: [],
        salesData: [],
        searchData: [],
        offlineData: [],
        offlineChartData: [],
        salesTypeData: [],
        salesTypeDataOnline: [],
        salesTypeDataOffline: [],
        radarData: [],
      };
    },
  },
};
