/**
 * Created by zhangmm on 2017/8/8.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './instanceGroup.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link } from 'dva/router'
import { Row , Col , Modal} from 'antd'
const confirm = Modal.confirm

class InstanceGroup extends Base{
  constructor(props){
    super(props)
    this.handleInstanceGroupDelete = this.handleInstanceGroupDelete.bind(this)

    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="/cmdb/instanceGroup/add">
              <IconFont type="plus"/>新建实例组
            </Link>
          </Col>
        </Row>)
      }
    }
  }

  handleInstanceGroupDelete(value){
    confirm({
      title : '提示',
      content : `确定要删除${value.name}实例组吗？`,
      onOk : () => {
        this.props.dispatch({
          type : `instanceGroup/deleteInstanceGroup`,
          payload : {
            id : value.id
          }
        })
      }
    })
  }

  render(){
    const { location, dispatch, instanceGroup } = this.props
    const { keyword, placeholder, reload } = instanceGroup

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: `instanceGroup/handleFilter`,
          payload: {
            keyword:value
          },
        })
      },
    }]

    const filterProps = {
      searchProps
    }

    const tableProps = {
      fetch:{
        url:'/instances',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '实例名称',
        dataIndex: 'instance_name',
        key: 'instance_name',
      },
        {
          title: '状态',
          dataIndex: 'run_status',
          key: 'run_status',
        },
        {
          title: '架构',
          dataIndex: 'architecture',
          key: 'architecture',
        },
        {
          title: '数据库版本',
          dataIndex: 'db_version',
          key: 'db_version',
        },
        {
          title: '数据库内存',
          dataIndex: 'db_memory',
          key: 'db_memory',
        },
        {
          title: '访问地址',
          dataIndex: 'instance_addr',
          key: 'instance_addr',
        },
        {
          title: '操作',
          render : (text) => {
            return (
              <span>
              <span>
                <Link to={`/cmdb/instanceGroup/edit/${text.id}`}>修改</Link>
              </span>
                <span className="ant-divider"/>
              <span>
                <a href="javascript:void(0);" onClick={() => this.handleInstanceGroupDelete(text)}>删除</a>
              </span>
            </span>
            )
          }
        }],
      reload:reload
    }

    return(
      <Row className={styles.instanceGroup}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
          <DataTable {...tableProps} />
        </Row>
      </Row>
    )
  }
}

InstanceGroup.propTypes = {
  instanceGroup: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    instanceGroup: state['instanceGroup'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(InstanceGroup)
