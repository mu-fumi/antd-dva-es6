import 'babel-polyfill'
import dva from 'dva'
import createLoading from 'dva-loading'
//import { browserHistory } from 'dva/router'
import { message } from 'antd'
import { createLogger } from 'redux-logger'
import { Logger } from 'utils'
/*import { useRouterHistory,browserHistory } from 'react-router'
import { createHistory } from 'history'*/
import { createBrowserHistory } from 'history'

message.config({  // message全局配置
  duration: 5,
});

/*const history = Object.assign(browserHistory, useRouterHistory(createHistory)({
    basename: '/'
}));*/

// 1. Initialize
const app = dva({
    ...createLoading({effects: true}),
    history: createBrowserHistory(),
    onError (error) {  /*全局错误处理，需要使用的地方throw new Error()才能catch到*/
        message.error(error.message, 10);
        Logger.error(error)
    },
    //onAction: createLogger()
})


// console.log(createLoading)
// 2. 注册路由表中不包含的Model,全局生效
app.model(require('./models/app'))

// 3. Router
app.router(require('./router'))

// 4. Start
app.start('#root')

