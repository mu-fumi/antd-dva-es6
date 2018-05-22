import React from 'react'
import PropTypes from 'prop-types'
import { Table, message } from 'antd'
import { request, Logger } from 'utils'
import lodash from 'lodash'
import './DataTable.less'

class DataTable extends React.Component {
  constructor (props) {
    super(props)

    // console.log('props===>', props.fetch)

    const { dataSource, pagination = {
      showSizeChanger: false,
      showQuickJumper: false,
      showTotal: total => `共 ${total} 条`,
      current: 1,
      pageSize: 10,
      total: 0 },
    } = props

    this.state = {
      loading: false,
      dataSource,
      fetchData: {},
      pagination,
    }
  }

  componentDidMount () {
    // console.log('<---componentDidMount--->')
    if (this.props.fetch) {
      this.fetch()
    }
  }

  componentWillReceiveProps (nextProps) {
    // console.log('this.props.fetch===>', this.props.fetch.data.time, nextProps.fetch.data.time)
    // console.log('nextProps.fetch===>', nextProps.fetch)
    // console.log('nextProps.isEqual===>', lodash.isEqual(nextProps.fetch.data.time, this.props.fetch.data.time))

    if (nextProps.reload !== this.props.reload) {
      this.props = nextProps
      this.fetch()
    } else if (!lodash.isEqual(nextProps.fetch, this.props.fetch)) {
      this.props = nextProps
      const state = {
        ...this.state,
        pagination: nextProps.pagination === false ? false: {  //  筛选项更新后分页重置为1
          ...this.state.pagination,
          current: 1,
          // 处理fetch 报错后 页面显示总页面丢失
          showSizeChanger: false,
          showQuickJumper: false,
          showTotal: total => `共 ${total} 条`,
          // over
        },
        fetchData: {
          ...this.state.fetchData,
          page: 1,
        }
      }
      this.setState(state, () => {
        this.fetch()
      })
    }else if( !lodash.isEqual(nextProps.dataSource, this.props.dataSource)){//新增传入 dataSource 情况
      this.setState({
        dataSource : nextProps.dataSource,
      })
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    if (this.props.handleSorter) {  // 传sorter给调用DataTable的页面, 需要在发送请求时就修改请求参数，不能放到cb里
      this.props.handleSorter([sorter.field, sorter.order])
    }
    if (this.props.setCurrentPage) {  // 传page给调用DataTable的页面, 需要在发送请求时就修改请求参数，不能放到cb里
      this.props.setCurrentPage(pagination.current)
    }
    const pager = this.state.pagination
    let state = {
      fetchData: {
        sort_field: sorter.field,
        sort_order: sorter.order,
        ...filters,
      },
    }
    if(pagination && pager){
      pager.current = pagination.current
      state['pagination'] = pager
      state['fetchData']['page'] = pagination.current
    }
    this.setState(state, () => {
      this.fetch()
    })
  }

  fetch = () => {
    if(!('fetch' in this.props) || !(this.props['fetch']) || !('url' in this.props['fetch'])){
      return
    }
    const { fetch: { url, data, method ='GET', required = [] }, currentPage } = this.props // 默认是get方法，但可传其他类型

    // 如果data中必须的参数为空，则不发起请求
    let broken = false
    required.map((v)=>{
      if (!data[v]) {
        broken = true
      }
    })
    if (broken) return

    // 从别的页面返回时保存跳转前的分页信息
    if (currentPage) {
      this.setState({
        pagination: {
          ...this.state.pagination,
          current: currentPage
        },
        fetchData: {
          ...this.state.fetchData,
          page: currentPage,
        }
      })
    }

    const { fetchData } = this.state

    this.setState({ loading: true })
    this.promise = request(url,
      {
        method: method,
        data: {
          ...data,
          ...fetchData,
          ...currentPage ? {page: currentPage} : {},  // setState异步可能没更新完fetchData，这里手动更新，currentPage不存在时要避免page被覆盖，在请求中不发送
      }}
    ).then((response) => {
      if (!this.refs.DataTable) {
        return
      }

      if(response.code !== 0){
        const msg = response.error || response.msg
        message.error(msg)

        this.setState({
          loading: false,
          dataSource: [],
          pagination: false  // 返回数据有问题时，无分页
        })
        return
      }

      let result = response.data
      const { pagination } = this.state

      if (typeof pagination === 'object'){
        pagination.total = 'total' in result ? result.total : pagination.total
        // pagination.current = 'current_page' in result ? result['current_page'] : pagination.current
        pagination.pageSize = result.per_page || pagination.pageSize
        // 新增 current 非1 不然减掉 0 就尴尬了啊
        if(Math.ceil(pagination.total / pagination.pageSize) < pagination.current && pagination.current !== 1 ){
          fetchData.page = Math.ceil(pagination.total / pagination.pageSize)
          pagination.current = Math.ceil(pagination.total / pagination.pageSize)
          this.fetch()
          return
        }
        result = result.data
      }
      if(pagination === false){
        result = 'data' in result ?  result.data : result
      }
      //console.log('datatable pagination====>', pagination)
      //console.log('datatable result====>', result)
      //console.log('datatable response====>', response.data)
      this.setState({
        loading: false,
        dataSource: result,
        pagination,
        // fetch: this.props['fetch']
      })

      // todo 新增 看看效果
      if(this.props.cb){
        this.props.cb({pagination, dataSource : result})
      }
    })
  }

  render () {
    const { ...tableProps } = this.props
    const { loading, dataSource, pagination } = this.state
    return (<Table
      ref="DataTable"
      loading={loading}
      onChange={this.handleTableChange}
      {...tableProps}
      pagination={pagination}
      dataSource={dataSource}
    />)
  }
}

DataTable.propTypes = {
  fetch: PropTypes.objectOf((propValue, key, componentName, location, propFullName) => {
    const propTypes = {
      url: PropTypes.string,
      data: PropTypes.object,
      method: PropTypes.string,
      required: PropTypes.array,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  rowKey: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func,
  ]),
  pagination: React.PropTypes.oneOfType([
    React.PropTypes.bool,
    React.PropTypes.object,
  ]),
  columns: PropTypes.array,
  dataSource: PropTypes.array,
}

export default DataTable
