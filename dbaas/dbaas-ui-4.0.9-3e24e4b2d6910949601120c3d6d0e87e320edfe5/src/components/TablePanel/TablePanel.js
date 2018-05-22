/**
 * Created by wengyian on 2017/9/7.
 */

import React from 'react';
import ReactDom from 'react-dom'
import PropTypes from 'prop-types'
import styles from './TablePanel.less'
import { Row, Col, Spin, message } from 'antd'
import { classnames, request } from 'utils'

class TablePanel extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      dataSource:{},
      fetchData: {},
    }
  }

  componentDidMount () {
    if (this.props.fetch) {
      this.fetch()
    }
  }

  fetch = () => {
    //获取指定对象
    let certainObj = this.props.certainObj || ''
    if(!('fetch' in this.props) || !(this.props['fetch']) || !('url' in this.props['fetch'])){
      return
    }
    const { fetch: { url, data, method ='GET', required = [] } } = this.props // 默认是get方法，但可传其他类型

    // 如果data中必须的参数为空，则不发起请求
    let broken = false
    required.map((v)=>{
      if (!data[v]) {
        broken = true
      }
    })
    if (broken) return

    const { fetchData } = this.state

    this.setState({ loading: true })
    this.promise = request(url,
      {
        method: method,
        data: {
          ...data,
          ...fetchData,
        }}
    ).then((response) => {
      if(response.code !== 0){
        const msg = response.error || response.msg
        message.error(msg)

        this.setState({
          loading: false,
          dataSource: {}
        })
        return
      }

      //let result = response.data.data ? response.data.data : response.data
      let result = certainObj ? response.data[certainObj] : response.data
      this.setState({
        loading: false,
        dataSource: result,
      })
    })
  }

  render() {
    let props = this.props

    //定义表格标题
    let title = props.title || ''
    //标题默认显示
    let visible = props.visible || true ? {display:'block'} : {display:'none'}
    //是否刷新，加载
    let loading = props.loading || false ? this.state.loading : false
    //定义列数,默认是两列
    let rows = props.rows || 2
    //定义行和列两个数组
    let trs = []
    let tds = []

    let tdWidth = Math.floor(100/ rows ) + '%'

    props.columns.map((v, k) => {
      tds.push(v)
      if(props.columns.length < rows){
        if(k === props.columns.length - 1){
          trs.push(tds)
        }
      }
      if (props.columns.length >= rows && (k + 1) % rows === 0) {
        trs.push(tds)
        tds = []
      }
      if (k === (props.columns.length - 1) && (k + 1) % rows !== 0 && props.columns.length >= rows) {
        v.single = true
        trs.push([v])
      }
    })
    //如果传了dataSource，则以props的为准
    const data = props.dataSource || this.state.dataSource || {}
    const html = trs.map((vs, k) => {
      let td = vs.map((v, i) => {
        // 此处的 v.name 有可能是 reactelement 请不要 用 v.name + ':' 变成字符串了 不然解析不了
        let name = <span className={classnames(styles["mgr-8"],styles["hei-23"])}>{v.name}</span>
        let val = (data && data[v.dataIndex] !== undefined) ?
          ((data[v.dataIndex] !== null && data[v.dataIndex] !== '') ? data[v.dataIndex] : '无') : ''
        val = typeof (v.render) === 'function' ? v.render(val, data) : val
        let colspan = v.single ? '2' : ''
        return (
          <td style={{ width : colspan === '' ? tdWidth : '100%'}} className={styles["break-all"]} colSpan={colspan} key={i}>
            {name}{": "}{val}
          </td>
        )
      })
      return (<tr key={k}>{td}</tr>)
    })

    return (
      <Row className={styles.TablePanel}>
        <Spin spinning={loading}>
          <Row className={styles["title"]} style={visible}>{title}</Row>
          <table cellPadding="0" cellSpacing="0"
            className={classnames(styles["table-bordered"],styles["table-responsive"])}
          >
            <tbody>
            {html}
            </tbody>
          </table>
        </Spin>
      </Row>
    )
  }
}

TablePanel.propTypes = {
  title: PropTypes.string,
  visible: PropTypes.bool,
  loading: PropTypes.bool,
  rows: PropTypes.number,
  columns: PropTypes.array,
  dataSource: PropTypes.object,
}

export default TablePanel
