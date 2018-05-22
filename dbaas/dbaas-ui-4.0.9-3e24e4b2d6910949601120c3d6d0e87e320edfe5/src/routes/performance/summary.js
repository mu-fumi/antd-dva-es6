/**
 * Created by wengyian on 2017/6/12.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Spin, Col } from 'antd'

import { TimeFilter } from 'utils'
import { SUMMARY_HOVER, SUMMARY_HOVER_LINK } from 'utils/constant'

import { DataTable, Card } from 'components'

// import Card from '.'
// import Chart from './chart'
// import LazyLoad from 'react-lazyload'
import styles from './summary.less'

const modelKey = 'performance/summary';

class Summary extends React.Component{

  componentWillReceiveProps (nextProps) {
    if(this.props.performance.currentNode !== nextProps.performance.currentNode){
      this.props.dispatch({type: `${modelKey}/getTimeFilter`})
    }
  }


  render(){
    const { loading, summary, dispatch, performance } = this.props
    const { summaryFilter, summaryLine, sqlDigest, selectReRender, averageTime, tableData } = summary
    const { timeRange } = performance

    const summaryLineEffect = `${modelKey}/getSummaryLine`
    const summaryTimeEffect = `${modelKey}/getTimeFilter`
    const summarySqlEffect = `${modelKey}/getSqlLine`

    // 处理后台返回数据 处理成以前的接口返回数据等同

    const summaryLineProps = summaryLine.map( v => {
      return {
        ...v,
        onEvents : {
          click : (params) => {
            dispatch({
              type : `${modelKey}/setAverageTime`,
              payload : params.name
            })
            dispatch({
              type : `${modelKey}/setTableData`,
              payload : params.dataIndex
            })
          }
        }
      }
    })

    let dataSource = []
    // console.log('tableData===>', tableData)
    Object.keys(tableData).forEach((key, i) => {
      if(key !== 'point'){
        let val  = ''
        if(!_.isEmpty(tableData)){
          if(tableData[key][0] === "" || tableData[key][0] === null){
            val = '--'
          }else{
            val = tableData[key][0] + '' + tableData[key][1] + '&' + tableData[key][2]
          }
        }
        dataSource.push({
          Key : key,
          Value : val
        })
      }
    })
    // console.log('dataSource===>', dataSource)
    // Object.keys(SUMMARY_HOVER_LINK).forEach(v => {
    //   // return {
    //   //   [v] : tableData[v]
    //   // }
    //   let value = ''
    //   // 处理对应项没有数据的情况
    //   if(!_.isEmpty(tableData)){
    //     if(tableData[v][0] === "" || tableData[v][0] === null){
    //       value = '--'
    //     }else{
    //       value = tableData[v][0] + '' + tableData[v][1]
    //     }
    //     dataSource.length === 0 && (dataSource[0] = {})
    //     dataSource[0][v] = value
    //     // console.log('dataSource===>', dataSource)
    //   }
    // })

    // const columns = Object.keys(SUMMARY_HOVER_LINK).map(v => {
    //   return{
    //     title : v,
    //     dataIndex : v,
    //     key : v,
    //     render : (text, record) => {
    //       const time = parseInt( new Date(averageTime).getTime()/1000)
    //       const url = SUMMARY_HOVER_LINK[v] + '?time=' + time + '&point=' + tableData.point
    //       return (
    //         <a href={url}>{record[v]}</a>
    //       )
    //     }
    //   }
    // })

    const columns = [
      {title: '指标项', dataIndex: 'Key', width: '50%', render: (v) => (<span className="explain-title">{v}</span>)},
      {title: '值', dataIndex: 'Value',
        render: (text, record) => {
          const time = parseInt( new Date(averageTime).getTime()/1000)
          const url = SUMMARY_HOVER_LINK[record.Key] + '?time=' + time + '&point=' + tableData.point
          let num = text.split('&')[0]
          let type = text.split('&')[1]
          let className =
            type === 'warning' ? 'col-warning'
              : type === 'sufficient' ? 'col-sufficient' : ''
          return (
            <a target="_blank" href={url} className={styles[className]}>{num}</a>
          )
        }
      }
    ]

    const summaryLineCard = {
      loading : loading[summaryLineEffect],
      radioProps : [{
        buttons : timeRange,
        props : {
          value : summaryFilter['radio'],
          onChange : (e) => {
            dispatch({
              type : summaryTimeEffect,
              payload : {
                time : e.target.value
              }
            })
          }
        }
      }],
      pickerProps : [{
        props : {
          defaultValue: summaryFilter['picker'],
          onOk(value){
            dispatch({
              type : summaryTimeEffect,
              payload : {
                time : TimeFilter.toUnix(value)
              }
            })
          }
        }
      }],
      selectProps : {
        name : 'SQL ID:',
        props : sqlDigest,
        key : selectReRender,
        onSelect : (value) => {
          dispatch({
            type : summarySqlEffect,
            payload : value
          })
        }
      },
      chartProps : summaryLineProps,
      tableProps : [{
        span : 24,
        title : () => (
          <div className="card-title">
            <h3>影响应答时耗指标列表
              <span className="mgl-8 text-caption">时间点:  {TimeFilter.format(averageTime)}</span></h3>
          </div>
        ),
        size : 'small',
        bordered : true,
        columns: columns,
        dataSource : dataSource,
        rowKey : 'id',
        pagination : false,
      }]
    }

    return (
      <Row>
        <Card {...summaryLineCard} className={styles["hover-visible"] } />
      </Row>
    )
  }
}

Summary.propTypes = {
  summary: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state) => {
  return {
    loading : state.loading.effects,
    summary : state[modelKey],
    performance : state['performance']
  }
})(Summary)
