// 系统默认的路由配置 无需从menuData生成的路由
const routers = {
  '/': {// 默认系统主页面布局路由
    component: ()=>import('@framework/layouts/BasicLayout')
  },
  '/base': {// 默认系统登陆注册页面路由
    component: ()=>import('@framework/layouts/UserLayout')
  },
  '/setting': {
    component: ()=>import('@pea/modules/Setting/pages/Mes')
  },
  '/base/login': {
    component: ()=>import('@framework/modules/Base/pages/Login')
  },
  '/base/register': {
    component: ()=>import('@framework/modules/Base/pages/Register')
  },
  '/base/register-result': {
    component: ()=>import('@framework/modules/Base/pages/RegisterResult')
  },
  '/webapp': {
    component: ()=>import('@framework/layouts/WebAppLayout')
  },
  '/webapp/workflow/todo': {
    component: ()=>import('@pea/components/WebApp/Workflow/ToDo'),
    main: true
  },
  '/webapp/workflow/launch': {
    component: ()=>import('@pea/components/WebApp/Workflow/Launch')
  },
  '/webapp/workflow/history': {
    component: ()=>import('@pea/components/WebApp/Workflow/History')
  },
  '/webapp/workflow/workflowMainPop': {
    component: ()=>import('@pea/components/WebApp/Workflow/WorkflowMainPop')
  },
  '/main': {
    component: ()=>import('@framework/modules/Base/pages/NewMain'),
    name: '首页'
  },
  '/personal-center': {
    component: ()=>import('@framework/modules/Base/pages/PersonalCenter'),
    name: '个人设置'
  },
  '/webapp/antd-mobile': {
    component: ()=>import('@pea/components/WebApp/AntdMobile')
  },
  '/webapp/other/reset-pwd': {
    component: ()=>import('@pea/components/WebApp/Other/ResetPwd')
  },
  '/document': {
    component: ()=>import('@/document'),
    name: '组件文档'
  },
  '/outerIframe': {
    component: ()=>import('@framework/modules/Base/pages/OuterIframe')
  },
  '/pupa': {
    component: ()=>import('@framework/modules/Base/pages/Pupa')
  },
  '/webapp/test-oopform': {
    component: ()=>import('@pea/components/WebApp/Other/Test')
  },
};
export default routers
