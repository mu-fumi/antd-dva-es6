/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Tabs} from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import { classnames, Cache } from 'utils'
import Info from './info'
import Debug from './debug'
import styles from './create.less'

const cache = new Cache()

const modelKey = 'work/tool/create'
const TabPane = Tabs.TabPane;

class Create extends Base {

  constructor(props) {
    super(props)
    const pathname = this.props.location.pathname
    const toolName = cache.get('toolName')
    this.setGobackBtn()
    const activeName = pathname.includes('create') ? '新建工具' : `编辑工具: ${toolName}`
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : activeName, selectedKey : '脚本工具scripts'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
  }

  render () {
    const { dispatch, create } = this.props
    const { tabProps } = create

    const onTabClick = (key) => {  // 点击tab更新activeKey
      dispatch({
        type: `${modelKey}/handleProps`,
        payload: {activeKey: key}
      })
    }

    return (
      <Row className={styles['create']}>
        <Tabs defaultActiveKey="1" {...tabProps} onTabClick={onTabClick.bind(this)}>
          <TabPane tab="基本信息" key="1"><Info/></TabPane>
          <TabPane tab="调试" key="2"><Debug/></TabPane>
        </Tabs>
      </Row>
    )
  }
}

Create.propTypes = {
  create: PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    create: state[modelKey],
  }
})(Create)
