/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-17 10:41 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Spin, Steps } from 'antd'
import styles from './create.less'
import { DataTable, Layout, Filter, ProgressIcon } from 'components'
import { constant, Cache } from 'utils'
import { routerRedux } from 'dva/router'
import SqlUpload from './sqlUpload'
import CheckSql from './checkSql'
import Publish from './publish'

const cache = new Cache()
const Step = Steps.Step;
const modelKey = 'golive/sqlPublish/create'

class Create extends Base {

  constructor(props) {
    super(props)

    this.setGobackBtn()
    let pathname = this.props.location.pathname
    const activeName = pathname.includes('create') ? '新建 SQL 发布' : '编辑 SQL 发布'
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : activeName, selectedKey : 'SQL发布sql-publish'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })

    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)
  }

  handleBack(){  //  只返回到列表页，覆盖base方法
    this.props.dispatch(routerRedux.push({
      pathname: '/sql-publish',
    }))
  }

  componentWillReceiveProps(nextProps) {  // 修改为model统一管理
    if (nextProps.create.currentStep) {
      this.setState({
        current: nextProps.create.currentStep
      })
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    window.stopProgress = true  // 离开新建页清空定时器
    window.fakeProgress = null  // 清除变量
    cache.put('currentSqlId', '')  //  离开新建页的时候清空缓存的id，防止再次进入新建页的时候还是跳转缓存id的编辑页
    // console.log('cache.get======>', cache.get('currentSqlId'))
  }

  next(){
    // console.log(this.props.location)
    this.props.dispatch({
      type: `${modelKey}/nextStep`,
    })
  }

  prev() {
    this.props.dispatch({
      type: `${modelKey}/prevStep`,
    })
  }

  render() {
    const props = {
      prev : this.prev,
      next : this.next,
    }

    const steps = [
      {
        title: '上传编辑',
        content: <SqlUpload {...props} />,
      }, {
        title: '检查修改',
        content: <CheckSql {...props} />,
      }, {
        title: '确认发布',
        content: <Publish {...props} />,
      }
    ];

    const {currentStep} = this.props.create

    return (
      <div className={styles['create']}>
        <Steps current={currentStep}>
          {steps.map(item => <Step key={item.title} title={item.title}/>)}
        </Steps>
        <Spin spinning={this.props.create.pageLoading} size="large">
          <div className="steps-content">{steps[currentStep].content}</div>
        </Spin>
      </div>
    )
  }
}

Create.propTypes = {
  create: PropTypes.object,
  dispatch: PropTypes.func,
  location: PropTypes.object,
}

export default connect((state)=>{
  return {
    create: state[modelKey],
  }
})(Create)
