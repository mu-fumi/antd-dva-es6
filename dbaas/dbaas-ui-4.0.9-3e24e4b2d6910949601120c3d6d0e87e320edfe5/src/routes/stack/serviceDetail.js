/**
 * Created by wengyian on 2017/11/20.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card, Icon, message, Tag, Button, Modal } from 'antd'
import { DataTable, Layout, Search, Filter, IconFont, Description } from 'components'
import { routerRedux, Link, browserHistory } from 'dva/router'
import { classnames } from 'utils'
import _ from 'lodash'
import { constant, TimeFilter } from 'utils'

const modelKey = 'stack/serviceDetail'

class ServiceDetail extends Base{
  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : '服务详情', selectedKey : '组件管理component'},
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : { selectedKey : ''},
      fire : [Base.WillUnmount]
    })

    const id = Number(props.match.params.id)

  //   this.pageBtns = {
  //     element : () => {
  //       return (
  //         <Row>
  //           <Col className="pageBtn">
  //             <Link to={`/cmdb/component/editService/${id}`} className="text-info">
  //               <IconFont type="edit"/>编辑服务
  //             </Link>
  //           </Col>
  //         </Row>
  //       )
  //     }
  //   }
  }

  render(){
    const { serviceDetail } = this.props
    const { info } = serviceDetail
    const list = [{
      name : '名称',
      value : info.name
    }, {
      name : '版本',
      value : info.version
    }, {
      name : '类型',
      value : info.type,
      render : (text) => {
        return text === 'Y' ? '监控存活' : '不监控存活'
      }
    }, {
      name : '描述',
      value : info.description
    }, {
      name : '包版本',
      value : info.package
    }]

    const desProps = {
      colspan : 11,
      list : list
    }

    return <Description {...desProps}/>
  }
}

ServiceDetail.propTypes = {
  serviceDetail : PropTypes.object,
  loading : PropTypes.bool,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state) => {
  return {
    loading : state.loading.models[modelKey],
    serviceDetail : state[modelKey]
  }
})(ServiceDetail)
