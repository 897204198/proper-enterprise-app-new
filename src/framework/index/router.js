import React from 'react';
import { Router, Route, Switch, Redirect } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import dynamic from 'dva/dynamic';
import { getRouterData } from '../common/frameHelper'
import styles from './index.less';

moment.locale('zh-cn');

dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});
export default ({ history })=>{
  const routerData = getRouterData();
  const UserLayout = routerData['/base'].component
  const BasicLayout = routerData['/'].component
  const WebappLayout = routerData['/webapp'].component
  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route path="/webapp" component={WebappLayout} />
          <Route path="/base" component={UserLayout} />
          <Route path="/" component={BasicLayout} />
          <Redirect to="/" />
        </Switch>
      </Router>
    </LocaleProvider>
  );
};
