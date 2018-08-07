// 系统默认的路由配置 无需从menuData生成的路由
const routers = {
  '/': {// 默认系统主页面布局路由
    component: ()=>import('../framework/layouts/BasicLayout')
  },
  '/base': {// 默认系统登陆注册页面路由
    component: ()=>import('../framework/layouts/UserLayout')
  },
  '/base/login': {
    component: ()=>import('../framework/modules/Base/pages/Login')
  },
  '/base/register': {
    component: ()=>import('../framework/modules/Base/pages/Register')
  },
  '/base/register-result': {
    component: ()=>import('../framework/modules/Base/pages/RegisterResult')
  },
  '/webapp': {
    component: ()=>import('../framework/layouts/WebAppLayout')
  },
  '/webapp/workflow': {
    component: ()=>import('../lib/components/WebApp/Workflow'),
    main: true
  },
  '/webapp/workflowMainPop': {
    component: ()=>import('../lib/components/WebApp/WorkflowMainPop')
  },
  '/main': {
    component: ()=>import('../framework/modules/Base/pages/Main')
  },
  '/personal-center': {
    component: ()=>import('../framework/modules/Base/pages/PersonalCenter')
  },
};
export default routers
