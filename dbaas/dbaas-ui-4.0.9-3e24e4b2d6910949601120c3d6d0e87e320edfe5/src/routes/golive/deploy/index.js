/**
 * Created by wengyian on 2017/8/15.
 */
import Base from 'routes/base'
import PropTypes from 'prop-types'
import {connect} from 'dva'
import {Row, Col, Select, message, Tag, Button, Modal} from 'antd'
import {DataTable, Layout, Search, Filter, IconFont, ProgressIcon, ProgressBadge} from 'components'
import {routerRedux, Link,} from 'dva/router'
import {classnames} from 'utils'
import _ from 'lodash'
import {constant, TimeFilter} from 'utils'
import * as moment from 'moment'
import styles from './index.less'

const confirm = Modal.confirm
const Option = Select.Option
const { PROGRESS } = constant


class Deploy extends Base {

  constructor(props) {
    super(props)

    this.pageBtns = {
      element: () => {
        return <Row>
          <Col className="pageBtn">
            <Link to="/deploy/create?tag=cluster" className="text-info">
              <IconFont type="plus"/>部署集群
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/deploy/create?tag=set" className="text-info">
              <IconFont type="plus"/>部署实例组
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/deploy/create?tag=instance" className="text-info">
              <IconFont type="plus"/>部署实例
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/deploy/create" className="text-info">
              <IconFont type="plus"/>新增
            </Link>
          </Col>
          <Col className="pageBtn" onClick={this.handleReload}>
            <a href="javascript:;">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }
    }

    this.push({
      type : 'app/handleCurrentMenu',
      payload : { activeName : '部署历史', selectedKey : '自动化部署deploy'},
      fire : [Base.DidMount]
    })

    this.push({
      type : 'app/handleCurrentMenu',
      payload : { selectedKey: ''},
      fire : [Base.WillUnmount]
    })

    this.push({
      type : 'deploy/initFilter',
      fire : [Base.WillUnmount]
    })

    this.handleReload = this.handleReload.bind(this)
  }

  handleReload(){
    if(this._keywords === undefined || this._keywords === null){
      this._keywords = ''
    }
    this.props.dispatch({
      type : 'deploy/handleFilter',
      payload : {keyword : this._keywords}
    })
    this.props.dispatch({
      type : 'deploy/handleReload'
    })
  }

  render() {
    const {deploy, dispatch} = this.props
    const {filter, reload, stackModalVisible, stackList, selectedStack,
      instanceModalVisible, instanceList, stackOptions
    } = deploy

    const searchProps = [{
      placeholder: '关键字搜索,',
      onSearch: (value) => {
        dispatch({
          type: 'deploy/handleFilter',
          payload: {
            keyword: value
          }
        })
      },
      onChange : (e) => {
        this._keywords = e.target.value
      }
    }]

    const rangePickerProps = [{
      label: '时间',
      props: {
        onChange: (value, dateString) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'deploy/handleFilter',
            payload: {
              time: time
            }
          })
        },
        onOk: (value) => {
          let time = TimeFilter.toUnix(value)
          dispatch({
            type: 'deploy/handleFilter',
            payload: {
              time: time
            }
          })
        }
      }
    }]

    const selectProps = [{
      label : '套件',
      options : stackOptions,
      props : {
        onChange : (value) => {
          dispatch({
            type : 'deploy/handleFilter',
            payload : {
              stack_id : value
            }
          })
        }
      }
    }]

    const filterProps = {
      searchProps,
      rangePickerProps,
      selectProps,
    }

    const tableProps = {
      fetch: {
        url: '/deploy/history',
        data: filter
      },
      reload: reload,
      columns: [{
        title: '用户',
        dataIndex: 'user',
      },{
        title: '业务',
        dataIndex: 'business',
      },{
        title: '应用',
        dataIndex: 'app',
      },{
        title: '部署名',
        dataIndex: 'deploy_name',
        render : (text, record) => {
          if(record.relate_type=== 0){
            return <Link to={`/cmdb/cluster/${record.relate_id}`}>{text}</Link>
          }else{
            return text
          }
        }
      },{
        title: '使用套件',
        dataIndex: 'stack',
      },{
        title: '部署时间',
        dataIndex: 'time',
        sorter : (a, b) => new Date(a.time) - new Date(b.time),
        width : 220
      },{
        title: '状态',
        dataIndex: 'state',
        className : 'text-center',
        render : (text, record) => {
          // return  <Link to={`/job/${record.job_history_id}`}><ProgressBadge type={text}/></Link>
          /**********************20171201 修改链接存在逻辑*****************************/
          if(record.job_history_id >0){
            return <Link to={`/job/${record.job_history_id}`}><ProgressBadge type={text}/></Link>
          }else{
            return <ProgressBadge type={text}/>
          }
          // if(text === PROGRESS.NOT_START || text === PROGRESS.PEDDING){
          //   return <ProgressBadge type={text}/>
          // }else{
          //   return <Link to={`/job/${record.job_history_id}`}><ProgressBadge type={text}/></Link>
          // }
        }
      }],
      rowKey : 'request_id'
    }


    return (
      <Row>
        <Row className={styles["mgtb-8"]}>
          <Filter {...filterProps}/>
        </Row>
        <DataTable {...tableProps}/>
      </Row>
    )
  }

}

Deploy.propTypes = {
  deploy: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  dispatch: PropTypes.func
}

export default connect((state) => {
  return {
    loading: state.loading.models['deploy'],
    deploy: state['deploy'],
  }
})(Deploy)
