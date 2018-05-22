/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-10 11:11 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col } from 'antd'
import { Layout, IconFont } from 'components'
import TopFilter from './topFilter'
import styles from './performance.less'

class Performance extends Base {
  constructor() {
    super();
    const onClick = () => {
      this.props.dispatch({ type: `performance/showSettingModal` })
    }
    this.pageBtns = {
      element: ()=>{
        return <Row>
          <Col className="pageBtn" onClick={onClick}>
            <a href="javascript:void(0);">
              <IconFont type="setting"/>设置
            </a>
          </Col>
        </Row>
      }
    }
  }

  componentWillReceiveProps() {
    // 如果在这里更新breadProps，会栈溢出
  }

  render() {
    const { children, location, tabMenu, performance, dispatch, settingModalLoading } = this.props

    const topFilterProps = {
      location,
      ...performance,
      tabMenu,
      onOk: (data)=> {
        dispatch({type: `performance/saveSetting`, payload: data})
      },
      onCancel: ()=> {
        dispatch({type: `performance/hideSettingModal`})
      },
      confirmLoading: settingModalLoading,
      onChange: (value) => {
        dispatch({
          type: `performance/handleSelectChange`,
          payload: {currentNode: value}
        })
      }
    }
// console.log('ppppp=>', performance)
    return (
      <Row className={styles.performance}>
        <TopFilter { ...topFilterProps } />
        {children}
      </Row>
    )
  }
}

Performance.propTypes = {
  children: PropTypes.element.isRequired,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  performance: PropTypes.object,
  loading: PropTypes.bool,
}

export default connect((state)=> {
  // console.log('state===', state)
  return {
    settingModalLoading: state.loading.effects['performance/saveSetting'],
    performance: state['performance'],
    //注意, 如果没有缓存时可能拿不到 horizontal 项
    tabMenu: [],
  }
})(Performance)
