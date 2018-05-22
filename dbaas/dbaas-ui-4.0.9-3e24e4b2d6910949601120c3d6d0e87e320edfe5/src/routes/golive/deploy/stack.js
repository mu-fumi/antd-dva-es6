/**
 * Created by wengyian on 2017/8/22.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Input, Icon, message, Button, Modal, Steps, InputNumber } from 'antd'
import { DataTable, Search, Filter, IconFont, ConfigInput } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import styles from './create.less'

export default class Stack extends React.Component{
  constructor(props){
    super(props)

    this.state = {
      filter : props.filter,
      stackTags : props.stackTags,
      selectedStack : props.selectedStack,
      /******** 20180109 处理搜索后 已选上不见问题  *********/
      /********* preSelectedStack 和 selectedStack 两者只存在一个  ************/
      /********* 存在 selectedStack 时  ************/
      /*** 当搜索时 如果新出来的 dataSource 里无 selectedStack 则赋值给 pre *****/
      /*** 当搜索时 如果新出来的 dataSource 里有 selectedStack 则不管 *****/
      /********* 不存在 selectedStack 时  ************/
      /*** 当搜索时 如果新出来的 dataSource 里有 pre  则赋值给 selectedStack *****/
      /********************** 否则不管 ***********************/
      /**************** 点击选择套件时 ********************/
      /******************* 清空 pre 赋值 selecteStack ***************/
      preSelectedStack : []
    }

    this.next = this.next.bind(this)
    this.handleCheckedStack = this.handleCheckedStack.bind(this)
  }

  componentWillReceiveProps(nextProps){
    if(!_.isEqual(nextProps.filter, this.state.filter) ||
        !_.isEqual(nextProps.stackTags, this.state.stackTags)
    ){
      this.setState({
        filter : nextProps.filter,
        stackTags : nextProps.stackTags,
      })
    }
  }

  next(){

    if(this.state.selectedStack.length === 0){
      message.error('请选择套件')
      return
    }

    if(this.props.getMemoryRange){
      this.props.getMemoryRange(this.state.selectedStack[0].id)
    }

    if(this.props.getService){
      this.props.getService(this.state.selectedStack[0].id)
    }

    if(this.props.getTemplate){
      this.props.getTemplate(this.state.selectedStack[0].id)
    }

    if(this.props.handleStackChange){
      this.props.handleStackChange(this.state.selectedStack)
    }

    if(this.props.next){
      this.props.next()
    }
  }

  handleCheckedStack(params){
    const { dataSource = []} = params
    const { selectedStack, preSelectedStack } = this.state
    let exists = false
    if(selectedStack.length && !preSelectedStack.length){
      const selctedId = selectedStack[0] && selectedStack[0].id
      exists = dataSource.find(v => v.id === selctedId)
      if(!exists){
        this.setState({
          selectedStack : [],
          preSelectedStack : [...selectedStack]
        })
      }
    }else if(preSelectedStack.length && !selectedStack.length){
      const preSelctedId = preSelectedStack[0] && preSelectedStack[0].id
      exists = dataSource.find(v => v.id === preSelctedId)
      if(exists){
        this.setState({
          selectedStack : [...preSelectedStack],
          preSelectedStack : []
        })
      }
    }
  }

  render(){

    const { stackKeyword } = this.props

    const searchProps = [{
      placeholder : '关键字搜索',
      onSearch : (value) => {
        if(this.props.handleFilter){
          this.props.handleFilter({
            keyword : value
          })
        }
        // this.setState({
        //   selectedStack : []
        // })
      },
      keyword : this.state.filter.keyword
    }]

    let tagsOptions = {'全部' : ''}
    this.state.stackTags.forEach((val, i) => {
      tagsOptions[val] = val
    })


    const selectProps = [{
      label : '套件类型',
      options: tagsOptions,
      props : {
        onChange : (value) => {
          if(this.props.handleFilter){
            this.props.handleFilter({
              tag : value
            })
          }
          // this.setState({
          //   selectedStack : []
          // })
        },
        value : this.state.filter.tag
      }
    }]


    const filterProps = {
      searchProps,
      selectProps,
    }

    const selectedRowKeys = this.state.selectedStack.map(item => item.id)

    const dataTableProps = {
      fetch : {
        url : '/stack/summary',
        data : this.state.filter
      },
      columns : [  {
        title : '名称',
        dataIndex : 'name',
      },{
        title : '版本',
        dataIndex : 'version',
      },{
        title : '类型',
        dataIndex : 'tag',
      },{
        title : '描述',
        dataIndex : 'description',
      }],
      rowKey : 'id',
      rowSelection : {
        type : 'radio',
        onChange : (selectedRowKeys, selectedRows) => {
          // if(this.props.handleStackChange){
          //   this.props.handleStackChange(selectedRows)
          // }
          this.setState({
            selectedStack : selectedRows,
            preSelectedStack : []
          })
        },
        selectedRowKeys : selectedRowKeys
      },
      cb : this.handleCheckedStack
    }

    const className = classnames(styles["button-row"], 'text-right')

    return (
      <Row className={styles['stack']}>
        <Filter {...filterProps}/>
        <DataTable {...dataTableProps} className={styles["mgt-16"]}/>
        <Row className={className}>
          <Button type="primary" onClick={this.next}>下一步</Button>
        </Row>
      </Row>
    )
  }
}
Stack.propTypes = {
  next : PropTypes.func,
  handleFilter : PropTypes.func,
  filter : PropTypes.object,
  stackTags : PropTypes.array,
  handleSelectedStack : PropTypes.func,
  getMemoryRange : PropTypes.func,
  getTemplate : PropTypes.func
}
