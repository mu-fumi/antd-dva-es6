/**
 * Created by zhangmm on 2017/8/8.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './client.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link , browserHistory } from 'dva/router'
import { Row , Col , Modal} from 'antd'
const confirm = Modal.confirm

class Client extends Base{
  constructor(props){
    super(props)
    this.handleClientDelete = this.handleClientDelete.bind(this)

    this.pageBtns = {
      element: ()=>{
        return (<Row>
          <Col className="pageBtn">
            <Link to="cmdb/client/add">
              <IconFont type="plus"/>新建客户
            </Link>
          </Col>
        </Row>)
      }
    }
  }

  handleClientDelete(value){
    confirm({
      title : '提示',
      content : `确定要删除${value.name}客户吗？`,
      onOk : () => {
        this.props.dispatch({
          type : `client/deleteClient`,
          payload : {
            id : value.id
          }
        })
      }
    })
  }

  render(){
    const { location, dispatch, client } = this.props
    const { keyword, placeholder, reload } = client

    const searchProps = [{
      keyword,
      placeholder,
      onSearch(value) {
        dispatch({
          type: `client/handleFilter`,
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
        url:'/client',
        data:{
          name:keyword
        }
      },
      rowKey: 'id',
      columns:[{
        title: '客户名',
        dataIndex: 'name',
        key: 'name',
        sorter:true,
        render:(text) => {
          return <Link to={`cmdb/clientInfo`}>{text}</Link>
        }
        },
        {
          title: '备注',
          dataIndex: 'desc',
          key: 'desc',
          sorter:true,
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          sorter:true,
        },
        {
          title: '最后更新',
          dataIndex: 'updated_at',
          key: 'updated_at',
          sorter:true,
        },
        {
          title: '操作',
          render : (text) => {
            return (
              <span>
              <span>
                <Link to={`cmdb/client/edit/${text.id}`}>修改</Link>
              </span>
                <span className="ant-divider"/>
              <span>
                <Link onClick={() => this.handleClientDelete(text)}>删除</Link>
              </span>
            </span>
            )
          }
        }],
      reload:reload
    }

    return(
      <Row className={styles.client}>
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

Client.propTypes = {
  client: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    client: state['client'],
    loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Client)
