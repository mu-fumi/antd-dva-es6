import React from 'react'
import PropTypes from 'prop-types'
//import { Router, browserHistory } from 'dva/router'

import NProgress from 'nprogress'
//import App from './routes/app'

import { routerRedux, Route, Switch, Redirect } from 'dva/router'
import App from './routes/app'
import Performance from './routes/performance/index'
const { ConnectedRouter } = routerRedux
import dynamic from 'dva/dynamic'

const cached = {}

// const registerModel = (app, model) => {
//   if (!cached[model.namespace]) {
//     app.model(model)
//     cached[model.namespace] = 1
//   }
// }

const Routers = function ({ history, app }) {

  // registerModel(app, require('./models/performance'))

  NProgress.start()

  const Login = dynamic({
    app,
    component: () => require('./routes/login'),
  })

  const exception = dynamic({
    path: '/exception/403',
    component: () => require('./routes/exception/403'),
  })

  const routes = [
    {
      path: '/performance',
      models: () => [
        require('./models/performance'),
      ],
      component: () => require('./routes/performance/index'),
    },
    {
      path: '/graphs',
      models: () => [
        require('./models/monitor/trend'),
      ],
      component: () => require('./routes/monitor/trend'),
    },
    {
      path: '/checkup/full',
      models: () => [
        require('./models/monitor/full'),
      ],
      component: () => require('./routes/monitor/full'),
    },
    {
      path: '/checkup/quick',
      models: () => [
        require('./models/monitor/quick'),
      ],
      component: () => require('./routes/monitor/quick'),
    },
    {
      path: '/alarms',
      models: () => [
        require('./models/monitor/event'),
      ],
      component: () => require('./routes/monitor/event'),
    },
    {
      path: '/report/daily-check',
      models: () => [
        require('./models/monitor/daily'),
      ],
      component: () => require('./routes/monitor/daily'),
    },
    {
      path: '/report/anomaly-classify',
      models: () => [
        require('./models/monitor/anomaly'),
      ],
      component: () => require('./routes/monitor/anomaly'),
    },
    {
      path: '/report/festival-check',
      models: () => [
        require('./models/monitor/festival'),
      ],
      component: () => require('./routes/monitor/festival'),
    },
    {
      path: '/monitor/sort',
      models: () => [
        require('./models/monitor/sort'),
      ],
      component: () => require('./routes/monitor/sort'),
    },
    {
      path: '/monitor/compare',
      models: () => [
        require('./models/monitor/compare'),
      ],
      component: () => require('./routes/monitor/compare'),
    },
    {
      path: '/schedulers',
      models: () => [
        require('./models/work/schedulers'),
      ],
      component: () => require('./routes/work/schedulers'),
    },
    {
      path: '/schedulers/add',
      models: () => [
        require('./models/work/schedulers/add'),
      ],
      component: () => require('./routes/work/schedulers/add'),
    },
    {
      path: '/schedulers/detail/:id(\\d+)',
      models: () => [
        require('./models/work/schedulers/detail'),
      ],
      component: () => require('./routes/work/schedulers/detail'),
    },
    {
      path: '/schedulers/:id(\\d+)',
      models: () => [
        require('./models/work/schedulers/add'),
      ],
      component: () => require('./routes/work/schedulers/add'),
    },
    {
      path: '/scripts',
      models: () => [
        require('./models/work/tool'),
      ],
      component: () => require('./routes/work/tool'),
    },
    {
      path: '/scripts/create',
      models: () => [
        require('./models/work/tool/create'),
      ],
      component: () => require('./routes/work/tool/create'),
    },
    {
      path: '/scripts/:id(\\d+)',
      models: () => [
        require('./models/work/tool/detail'),
      ],
      component: () => require('./routes/work/tool/detail'),
    },
    {
      path: '/scripts/:id(\\d+)/edit',
      models: () => [
        require('./models/work/tool/create'),
      ],
      component: () => require('./routes/work/tool/create'),
    },
    {
      path: '/scripts/:id(\\d+)/execute',
      models: () => [
        require('./models/work/tool/create'),
      ],
      component: () => require('./routes/work/tool/execute'),
    },
    {
      path: '/cmdb/component',
      models: () => [
        require('./models/stack'),
      ],
      component: () => require('./routes/stack'),
    },
    {
      path: '/cmdb/component/stack-view',
      models: () => [
        require('./models/stack/stackList'),
      ],
      component: () => require('./routes/stack/stackList'),
    },
    /******* 20171218 组件管理的操作页面都不要了 ********/
    // {
    //   path: '/cmdb/component/addStack',
    //   models: () => [
    //     require('./models/stack/addStack'),
    //   ],
    //   component: () => require('./routes/stack/addStack'),
    // },
    // {
    //   path: '/cmdb/component/editStack/addService',
    //   models: () => [
    //     require('./models/stack/editStack'),
    //   ],
    //   component: () => require('./routes/stack/stackAddService'),
    // },
    // {
    //   path: '/cmdb/component/editStack/:id(\\d+)',
    //   models: () => [
    //     require('./models/stack/editStack'),
    //   ],
    //   component: () => require('./routes/stack/editStack'),
    // },
    {
      path: '/cmdb/component/service-view',
      models: () => [
        require('./models/stack/serviceList'),
      ],
      component: () => require('./routes/stack/serviceList'),
    },
    {
      path: '/cmdb/component/service-view/:id(\\d+)',
      models: () => [
        require('./models/stack/serviceDetail'),
      ],
      component: () => require('./routes/stack/serviceDetail'),
    },
    // {
    //   path: '/cmdb/component/createService',
    //   models: () => [
    //     require('./models/stack/createService'),
    //   ],
    //   component: () => require('./routes/stack/createService'),
    // },
    // {
    //   path: '/cmdb/component/editService/:id(\\d+)',
    //   models: () => [
    //     require('./models/stack/editService'),
    //   ],
    //   component: () => require('./routes/stack/editService'),
    // },
    {
      path: '/packages',
      models: () => [
        require('./models/package/list'),
      ],
      component: () => require('./routes/package/list'),
    },
    {
      path: '/packages/create',
      models: () => [
        require('./models/package/create'),
      ],
      component: () => require('./routes/package/create'),
    },
    {
      path: '/packages/:id(\\d+)/edit',
      models: () => [
        require('./models/package/edit'),
      ],
      component: () => require('./routes/package/edit'),
    },
    {
      path: '/packages/:pkgid(\\d+)/:id(\\d+)/editVersion',
      models: () => [
        require('./models/package/editVersion'),
      ],
      component: () => require('./routes/package/editVersion'),
    },
    {
      path: '/packages/:id(\\d+)',
      models: () => [
        require('./models/package/detail'),
      ],
      component: () => require('./routes/package/detail'),
    },
    {
      path: '/packages/:id(\\d+)/tree/:version',
      models: () => [
        require('./models/package/fileList'),
      ],
      component: () => require('./routes/package/fileList'),
    },
    {
      path: '/packages/:id(\\d+)/tree',
      models: () => [
        require('./models/package/createVersion'),
      ],
      component: () => require('./routes/package/createVersion'),
    },
    {
      path: '/packages/:id(\\d+)/commitVersion',
      models: () => [
        require('./models/package/commitVersion'),
      ],
      component: () => require('./routes/package/commitVersion'),
    },
    {
      path: '/package/id/compares',
      models: () => [
        require('./models/package/compares'),
      ],
      component: () => require('./routes/package/compares'),
    },
    {
      path: '/packages/file/:id(\\d+)/:name',
      models: () => [
        require('./models/package/fileManage'),
      ],
      component: () => require('./routes/package/fileManage'),
    },
    {
      path: '/packages/file/:id(\\d+)/:name/info',
      models: () => [
        require('./models/package/fileEdit'),
      ],
      component: () => require('./routes/package/fileEdit'),
    },
    {
      path: '/packages/file/:id(\\d+)/:version/:name',
      models: () => [
        require('./models/package/fileView'),
      ],
      component: () => require('./routes/package/fileView'),
    },
    {
      path: '/packages/info/file/:id(\\d+)/add',
      models: () => [
        require('./models/package/fileAdd'),
      ],
      component: () => require('./routes/package/fileAdd'),
    },
    {
      path: '/cmdb/client',
      models: () => [
        require('./models/cmdb/client/client'),
      ],
      component: () => require('./routes/cmdb/client/client'),
    },
    {
      path: '/cmdb/client/add',
      models: () => [
        require('./models/cmdb/client/add'),
      ],
      component: () => require('./routes/cmdb/client/add'),
    },
    {
      path: '/cmdb/client/edit/:id(\\d+)',
      models: () => [
        require('./models/cmdb/client/edit'),
      ],
      component: () => require('./routes/cmdb/client/edit'),
    },
    {
      path: '/cmdb/role',
      models: () => [
        require('./models/cmdb/role/role'),
      ],
      component: () => require('./routes/cmdb/role/role'),
    },
    {
      path: '/cmdb/role/add',
      models: () => [
        require('./models/cmdb/role/add'),
      ],
      component: () => require('./routes/cmdb/role/add'),
    },
    {
      path: '/cmdb/role/edit/:id(\\d+)',
      models: () => [
        require('./models/cmdb/role/edit'),
      ],
      component: () => require('./routes/cmdb/role/edit'),
    },
    {
      path: '/cmdb/host',
      models: () => [
        require('./models/cmdb/host/host'),
      ],
      component: () => require('./routes/cmdb/host/host'),
    },
    {
      path: '/host/:name/editIP',
      models: () => [
        require('./models/cmdb/host/editIP'),
      ],
      component: () => require('./routes/cmdb/host/editIP'),
    },
    {
      path: '/cmdb/host/:id(\\d+)/edit',
      models: () => [
        require('./models/cmdb/host/edit'),
      ],
      component: () => require('./routes/cmdb/host/edit'),
    },
    {
      path: '/cmdb/host/:id(\\d+)',
      models: () => [
        require('./models/cmdb/host/detail'),
      ],
      component: () => require('./routes/cmdb/host/detail'),
    },
    {
      path: '/cmdb/permission',
      models: () => [
        require('./models/cmdb/permission/permission'),
      ],
      component: () => require('./routes/cmdb/permission/permission'),
    },
    {
      path: '/cmdb/user',
      models: () => [
        require('./models/cmdb/user/user'),
      ],
      component: () => require('./routes/cmdb/user/user'),
    },
    {
      path: '/cmdb/user/add',
      models: () => [
        require('./models/cmdb/user/add'),
      ],
      component: () => require('./routes/cmdb/user/add'),
    },
    {
      path: '/cmdb/user/edit/:id(\\d+)',
      models: () => [
        require('./models/cmdb/user/edit'),
      ],
      component: () => require('./routes/cmdb/user/edit'),
    },
    {
      path: '/cmdb/instance-group',
      models: () => [
        require('./models/cmdb/set/index'),
      ],
      component: () => require('./routes/cmdb/set/index'),
    },
    {
      path: '/cmdb/instance-group/:id(\\d+)',
      models: () => [
        require('./models/cmdb/set/summary'),
      ],
      component: () => require('./routes/cmdb/set/summary'),
    },
    {
      path: '/cmdb/instance',
      models: () => [
        require('./models/cmdb/instance/instance'),
      ],
      component: () => require('./routes/cmdb/instance/instance'),
    },
    {
      path: '/cmdb/instance/:id(\\d+)',
      models: () => [
        require('./models/cmdb/instance/summary'),
      ],
      component: () => require('./routes/cmdb/instance/summary'),
    },
    {
      path: '/cmdb/app',
      models: () => [
        require('./models/cmdb/app/app'),
      ],
      component: () => require('./routes/cmdb/app/app'),
    },
    {
      path: '/cmdb/app/add',
      models: () => [
        require('./models/cmdb/app/add'),
      ],
      component: () => require('./routes/cmdb/app/add'),
    },
    {
      path: '/cmdb/app/:id(\\d+)/edit',
      models: () => [
        require('./models/cmdb/app/edit'),
      ],
      component: () => require('./routes/cmdb/app/edit'),
    },
    {
      path: '/cmdb/app/:id(\\d+)/detail',
      models: () => [
        require('./models/cmdb/app/detail'),
      ],
      component: () => require('./routes/cmdb/app/detail'),
    },
    {
      path: '/cmdb/business',
      models: () => [
        require('./models/cmdb/business/business'),
      ],
      component: () => require('./routes/cmdb/business/business'),
    },
    {
      path: '/cmdb/business/add',
      models: () => [
        require('./models/cmdb/business/add'),
      ],
      component: () => require('./routes/cmdb/business/add'),
    },
    {
      path: '/cmdb/business/:id(\\d+)/detail',
      models: () => [
        require('./models/cmdb/business/detail'),
      ],
      component: () => require('./routes/cmdb/business/detail'),
    },
    {
      path: '/cmdb/business/:id(\\d+)/edit',
      models: () => [
        require('./models/cmdb/business/edit'),
      ],
      component: () => require('./routes/cmdb/business/edit'),
    },
    {
      path: '/cmdb/cluster',
      models: () => [
        require('./models/cmdb/cluster/cluster'),
      ],
      component: () => require('./routes/cmdb/cluster/cluster'),
    },
    {
      path: '/cmdb/cluster/:id(\\d+)',
      models: () => [
        require('./models/cmdb/cluster/summary'),
      ],
      component: () => require('./routes/cmdb/cluster/summary'),
    },
    {
      path: '/cmdb/message',
      models: () => [
        require('./models/cmdb/message/message'),
      ],
      component: () => require('./routes/cmdb/message/message'),
    },
    {
      path: '/job',
      models: () => [
        require('./models/work/job/job'),
      ],
      component: () => require('./routes/work/job/job'),
    },
    {
      path: '/job/:id(\\d+)',
      models: () => [
        require('./models/work/job/detail'),
      ],
      component: () => require('./routes/work/job/detail'),
    },
    {
      path: '/setting',
      models: () => [
        require('./models/setting/setting'),
      ],
      component: () => require('./routes/setting/setting'),
    },
    {
      path: '/deploy',
      models: () => [
        require('./models/golive/deploy'),
      ],
      component: () => require('./routes/golive/deploy'),
    },
    {
      path: '/deploy/create',
      models: () => [
        require('./models/golive/deploy/create'),
      ],
      component: () => require('./routes/golive/deploy/create'),
    },
    {
      path: '/configs',
      models: () => [
        require('./models/golive/configs/configs'),
      ],
      component: () => require('./routes/golive/configs/configs'),
    },
    {
      path: '/configs/modify',
      models: () => [
        require('./models/golive/configs/modify'),
      ],
      component: () => require('./routes/golive/configs/modify'),
    },
    {
      path: '/offline',
      models: () => [
        require('./models/golive/offline'),
      ],
      component: () => require('./routes/golive/offline'),
    },
    {
      path: '/offline/types',
      models: () => [
        require('./models/golive/offline/types'),
      ],
      component: () => require('./routes/golive/offline/types'),
    },
    {
      path: '/nodes',
      models: () => [
        require('./models/golive/nodes'),
      ],
      component: () => require('./routes/golive/nodes'),
    },
    {
      path: '/nodes/add',
      models: () => [
        require('./models/golive/nodes/add'),
      ],
      component: () => require('./routes/golive/nodes/add'),
    },
    {
      path: '/nodes/history',
      models: () => [
        require('./models/golive/nodes/history'),
      ],
      component: () => require('./routes/golive/nodes/history'),
    },
    {
      path: '/sql-publish',
      models: () => [
        require('./models/golive/sqlPublish/index'),
      ],
      component: () => require('./routes/golive/sqlPublish/index'),
    },
    {
      path: '/sql-publish/create',
      models: () => [
        require('./models/golive/sqlPublish/create'),
      ],
      component: () => require('./routes/golive/sqlPublish/create'),
    },
    {
      path: '/sql-publish/:id(\\d+)/detail',
      models: () => [
        require('./models/golive/sqlPublish/detail'),
      ],
      component: () => require('./routes/golive/sqlPublish/detail'),
    },
    {
      path: '/sql-publish/:id(\\d+)/:step(\\d+)',
      models: () => [
        require('./models/golive/sqlPublish/create'),
      ],
      component: () => require('./routes/golive/sqlPublish/create'),
    },
    {
      path: '/accounts',
      models: () => [
        require('./models/golive/accounts'),
      ],
      component: () => require('./routes/golive/accounts'),
    },
    {
      path: '/accounts/manage',
      models: () => [
        require('./models/golive/accounts/manage'),
      ],
      component: () => require('./routes/golive/accounts/manage'),
    },

    {
      path: '/databases',
      models: () => [
        require('./models/database/database'),
      ],
      component: () => require('./routes/database/database'),
    },
    {
      path: '/databases/:id(\\d+)/add',
      models: () => [
        require('./models/database/add'),
      ],
      component: () => require('./routes/database/add'),
    },
    {
      path: '/accounts/:id(\\d+)/add',
      models: () => [
        require('./models/database/accounts'),
      ],
      component: () => require('./routes/database/accounts'),
    },
    {
      path: '/accounts/:id(\\d+)/add',
      models: () => [
        require('./models/database/accounts'),
      ],
      component: () => require('./routes/database/accounts'),
    },
    {
      path: '/cmdb/quorum-cluster',
      models: () => [
        require('./models/cmdb/quorumCluster'),
      ],
      component: () => require('./routes/cmdb/quorumCluster'),
    },
    // 数据备份
    {
      path: '/backup',
      models: () => [
        require('./models/security/backup/backup'),
      ],
      component: () => require('./routes/security/backup/backup'),
    },
    // 日志备份
    {
      path: '/log-backup',
      models: () => [
        require('./models/security/logBackup/logBackup'),
      ],
      component: () => require('./routes/security/logBackup/logBackup'),
    },
    //操作日志
    {
      path: '/activities',
      models: () => [
        require('./models/security/logs/logs'),
      ],
      component: () => require('./routes/security/logs/logs'),
    },
    {
      path: '/dashboard',
      models: () => [
        require('./models/dashboard'),
      ],
      component: () => require('./routes/dashboard'),
    },
  ]

  const modelsWrapper = (requiredModel) => [ // 性能分析页面需要加载父model performance
    require('./models/performance'),
    requiredModel
  ]

  const performanceRoutes = [
    {
      path: '/performance/summary',
      models: modelsWrapper.bind(this, require('./models/performance/summary')),
      component: () => require('./routes/performance/summary'),
    },
    {
      path: '/performance/overview',
      models: modelsWrapper.bind(this, require('./models/performance/overview')),
      component: () => require('./routes/performance/overview'),
    },
    {
      path: '/performance/session',
      models: modelsWrapper.bind(this, require('./models/performance/session')),
      component: () => require('./routes/performance/session'),
    },
    {
      path: '/performance/slowlog',
      models: modelsWrapper.bind(this, require('./models/performance/slowlog')),
      component: () => require('./routes/performance/slowlog'),
    },
    {
      path: '/performance/query-analyzer',
      models: modelsWrapper.bind(this, require('./models/performance/queryAnalysis')),
      component: () => require('./routes/performance/queryAnalysis'),
    },
    {
      path: '/performance/database-file-io',
      models: modelsWrapper.bind(this, require('./models/performance/databaseFileIO')),
      component: () => require('./routes/performance/databaseFileIO'),
    },
    {
      path: '/performance/lock-wait',
      models: modelsWrapper.bind(this, require('./models/performance/blockingWait')),
      component: () => require('./routes/performance/blockingWait'),
    },
    {
      path: '/performance/graphs',
      models: modelsWrapper.bind(this, require('./models/performance/graphs')),
      component: () => require('./routes/performance/graphs'),
    },
    {
      path: '/performance/:id(\\d+)',
      models: modelsWrapper.bind(this, require('./models/performance/overview')),
      component: () => require('./routes/performance/overview'),
    },
  ]

  return (
    <ConnectedRouter history={history}>
      <Switch>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/exception/403" component={exception}/>
        <App>
          <Switch>
            {/*<Route exact path="/" render={() => (<Redirect to="/dashboard" />)} />*/}
            {
              routes.map(({ path, ...dynamics }, key) => (
                <Route key={key}
                       exact
                       path={path}
                       component={dynamic({
                         app,
                         ...dynamics,
                       })}
                />
              ))
            }
            <Performance>
              <Switch>
                <Route exact path="/performance" render={() => (<Redirect to="/performance/summary" />)} />
                {
                  performanceRoutes.map(({ path, ...dynamics }, key) => {
                      return (
                        <Route key={key}
                           exact
                           path={path}
                           component={dynamic({
                             app,
                             ...dynamics,
                           })}
                        />
                      )
                  })
                }
                <Route exact path="*" render={() => (<Redirect to="/dashboard" />)} />
              </Switch>
            </Performance>
          </Switch>
        </App>
      </Switch>
    </ConnectedRouter>
  );
}

Routers.propTypes = {
  history: PropTypes.object,
  app: PropTypes.object,
}

export default Routers
