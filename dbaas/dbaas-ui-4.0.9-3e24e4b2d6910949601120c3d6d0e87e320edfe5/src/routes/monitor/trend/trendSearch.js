/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-11-27 14:24 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Form, Select, Input, Button, Tag } from 'antd'
import { Filter, Card, Chart, IconFont, Search } from 'components'
import TagBox from './tagBox'
import FuzzySelect from './fuzzySelect'

import { TimeFilter, constant } from 'utils'

const { SELECT_TYPES } = constant
const modelKey = 'monitor/trend';

const InputGroup = Input.Group;
const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol : {
    span : 6
  },
  wrapperCol : {
    span : 18
  }
}

class TrendSearch extends React.Component {

  state = {
    key: 1,
  }

  componentWillReceiveProps() {
    // if (this.monitor.childNodes[0]) {
    //   console.log(this.monitor.childNodes[0].childNodes[0])
    //   if (this.monitor.childNodes[0].childNodes[0]) {
    //     console.log(this.monitor.childNodes[0].childNodes[0].childNodes[0])
    //   }
    // }
  }

  render() {
    const {
      trend,
      dispatch,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue,
        setFieldsValue,
      }
    } = this.props;

    const { keyword, advancedSearch, complexNodes, applications, tags, selectAllTag, selectedSimpleNodes, selectedComplexNodes,
      selectedComplexNodesForTag, businesses, clusters, sets, instances, apps, relateType, selectedBusiness,
      selectedApp, hasQuery, selectedContent, selectContents } = trend

    const showMore = () => {
      dispatch({
        type: `${modelKey}/showAdvancedSearch`,
      })
    }

    const showLess = () => {
      dispatch({
        type: `${modelKey}/hideAdvancedSearch`,
      })
      this.setState({
        key: +new Date()
      })
    }

    const setKeyword = (e) => {
      dispatch({
        type: `${modelKey}/setKeyword`,
        payload: e.target.value
      })
    }

    const clearAll = () => {
      backToGraphs()

      setFieldsValue({  // 清除表单所有内容
        business_id: '',
        app_id: '',
        select_type: Object.keys(SELECT_TYPES)[0],
        select_content: '',
        complex_node: []
      })

      clearApps() //  清除应用待选项

      clearSelectContents()  //  清除三选一待选项

      clearComplexNodes() // 清除节点待选项

      dispatch({   //  清除已选高级搜索下的节点
        type: `${modelKey}/setSelectedComplexNodes`,
        payload: []
      })

      dispatch({   //  清除所有已选节点tag
        type: `${modelKey}/setSelectedComplexNodesForTag`,
        payload: []
      })

      this.setState({   // 去掉视图层所有tags选中状态
        key: +new Date()
      })

      dispatch({   //  model层对应清除所有监控项tags
        type: `${modelKey}/clearAllTags`,
      })

      dispatch({   // 清除所有选中全部
        type: `${modelKey}/clearSelectAllTag`,
      })
    }

    const handleSearch = (e) => {
      e.preventDefault()
      validateFields((err, values) => {
        // console.log(err, values)// 通过动态required控制仅检查当前必选项
        if (err) {
          return false
        }

        // 简易搜索hostname是主机，高级搜索时如果还没有选节点，则hostname还是主机，选了以后就是节点
        // const hostname = advancedSearch ? (selectedComplexNodesForTag.length === 0 ?
        //   selectedSimpleNodes : selectedComplexNodesForTag) : selectedSimpleNodes

        let hostname = []
        let nodeType = ''
        if (advancedSearch && selectedComplexNodesForTag.length !== 0) {
          hostname = selectedComplexNodesForTag
          nodeType = 'node'
        } else {
          hostname = selectedSimpleNodes
          nodeType = 'host'
        }

        // 点击搜索时才更新图的搜索参数hostname
        dispatch({
          type: `${modelKey}/setHostname`,
          payload: hostname
        })

        // 判断当前节点是node还是host，getCards中需要相关参数
        dispatch({
          type: `${modelKey}/setNodeType`,
          payload: nodeType
        })

        // 参数为空默认获取所有keys
        dispatch({
          type: `${modelKey}/getKeys`,
          payload: {}
        })
        // 更新chart
        dispatch({
          type: `${modelKey}/handleReload`,
        })
      })
    }

    const getApps = (data) => {
      dispatch({
        type : `${modelKey}/getApps`,
        payload : data
      })
    }

    const getAllSelectContents = (data) => {
      dispatch({
        type : `${modelKey}/getAllSelectContents`,
        payload : data
      })
    }

    const changeBusinesses = (value) => {  // 选择不同业务
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      const id = value.split('-_-')[1]

      // 清空业务外其他已选项
      setFieldsValue({
        app_id: '',
        select_type: Object.keys(SELECT_TYPES)[0],
        select_content: '',
        complex_node: []
      })

      clearSelectContents()  //  清除三选一待选项

      clearComplexNodes() // 清除节点待选项

      getApps(id)  // 更新应用待选项

      dispatch({  // 更新选中业务
        type : `${modelKey}/setSelectedBusiness`,
        payload: value.split('-_-')[0]
      })

    }

    const clearApps = () => {  //  清除应用待选项
      dispatch({
        type : `${modelKey}/setApps`,
        payload: []
      })
    }

    const clearSelectContents = () => {  //  清除三选一待选项
      dispatch({
        type : `${modelKey}/clearSelectContents`
      })
    }

    const clearComplexNodes = () => {  // 清除节点待选项
      dispatch({
        type : `${modelKey}/setComplexNodes`,
        payload: []
      })
    }

    const changeApp = (value) => {
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      const appId = value.split('-_-')[1]

      getAllSelectContents(appId)  //  更新三选一待选项

      clearComplexNodes() // 清除节点待选项

      dispatch({
        type : `${modelKey}/setRelateType`,
        payload: SELECT_TYPES[Object.keys(SELECT_TYPES)[0]]
      })
      setFieldsValue({
        select_type: SELECT_TYPES[Object.keys(SELECT_TYPES)[0]],
        select_content: '',
        complex_node: []
      })

      dispatch({  // 更新选中应用
        type : `${modelKey}/setSelectedApp`,
        payload: value.split('-_-')[0]
      })

    }

    const changeSelectType = (value) => {  // 更新三选一类型
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      let selectContent = []
      switch (value) {
        case SELECT_TYPES['集群']:
          selectContent = clusters
          break
        case SELECT_TYPES['实例组']:
          selectContent = sets
          break
        case SELECT_TYPES['实例']:
          selectContent = instances
          break
      }
      clearComplexNodes() // 清除节点待选项
      setFieldsValue({
        select_content: '',
        complex_node: []
      })
      dispatch({
        type: `${modelKey}/setSelectContents`,  // 更新三选一待选项
        payload: selectContent
      })
      dispatch({
        type: `${modelKey}/setRelateType`,  // 更新三选一接口参数
        payload: value
      })

    }

    const changeSelectContent = (value) => {
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      clearComplexNodes() // 清除节点待选项
      setFieldsValue({
        complex_node: []
      })
      dispatch({
        type: `${modelKey}/setRelateId`,
        payload: value
      })
      dispatch({
        type: `${modelKey}/getComplexNodes`,
      })
      dispatch({
        type: `${modelKey}/setSelectedContent`,  // 更新三选一选中项
        payload: value
      })
    }

    const setSelectedSimpleNodes = (value) => {  // 更新选中主机
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      dispatch({
        type: `${modelKey}/setSelectedSimpleNodes`,
        payload: value
      })
    }

    const setSelectedComplexNodes = (value) => {
      // backToGraphs() //  从集群跳过来后更新选项，对应更新url

      dispatch({
        type: `${modelKey}/setSelectedComplexNodes`,   // 更新选中节点
        payload: value
      })
      dispatch({
        type: `${modelKey}/addSelectedComplexNodesForTag`,   // 更新所选节点
        payload: value
      })
      // select删除为空时，value已空，但是似乎field value还未更新，从而未触发校验；required动态校验似乎也没有及时转为true
      const promise = new Promise(resolve => {
        setFieldsValue({
          'complex_node': value
        })
        resolve('dd')
      })
      promise.then(() => {
        this.props.form.validateFields(['complex_node'], { force: true })
      })
    }

    const onDeselect = (value) => {  //  获取被删除项并在tag中也对应删除
      // this.props.form.validateFields(['complex_node'], { force: true })
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      deleteNode(selectedComplexNodesForTag, value)
      dispatch({
        type: `${modelKey}/setSelectedComplexNodesForTag`,
        payload: selectedComplexNodesForTag
      })
    }

    const closeTag = (v, e) => {
      backToGraphs() //  从集群跳过来后更新选项，对应更新url

      e.preventDefault();  // prevent以后后面就没有删除tag的动作了。。。
      e.stopPropagation(); // 防止onclose触发onclick

      deleteNode(selectedComplexNodes, v)
      deleteNode(selectedComplexNodesForTag, v)
      dispatch({
        type: `${modelKey}/setSelectedComplexNodes`,
        payload: selectedComplexNodes
      })
      dispatch({
        type: `${modelKey}/setSelectedComplexNodesForTag`,
        payload: selectedComplexNodesForTag
      })
    }

    const backToGraphs = () => {
      if (hasQuery) {
        dispatch({ type : `${modelKey}/backToGraphs` })  //  从集群跳过来后更新选项，对应更新url
      }
    }

    const deleteNode = (value, tag) => {
      const index = value.indexOf(tag)   // 找到并删除对应tag
      value.splice(index, 1)
    }

    const fakeStar = (<span className="star">*</span>)  // 三选一的假星号

    const fuzzySelectProps = {
      selectedSimpleNodes,
      handleHostNameIdRelations: (data) => {
        dispatch({
          type: `${modelKey}/handleHostNameIdRelations`,
          payload: data
        })
      }
    }

    return (
      <Row className="search-box">
        <Row className="search">
          { !advancedSearch ? <Form key="1" layout="horizontal" style={{ display: advancedSearch ? 'none' : '' }}
                                    onSubmit={handleSearch.bind(this)}>
            <Col span={7} className='keyword'>
              <FormItem label="关键词:" {...formItemLayout}>
                { getFieldDecorator('keyword', {
                  initialValue: keyword,
                  onChange: setKeyword.bind(this)
                })(
                  <Input />
                )}
              </FormItem>
            </Col>
            <Col offset={1} span={9}>
              <FormItem label="主机:" {...formItemLayout}>
                { getFieldDecorator('simple_node', {
                  initialValue: selectedSimpleNodes,   //  不能让前端显示，但能让前端有值。。。
                  onChange: setSelectedSimpleNodes.bind(this),
                  rules: [{
                    required: !advancedSearch,
                    message: '请选择主机'
                  }]
                })(
                  <FuzzySelect {...fuzzySelectProps}/>
                )}
              </FormItem>
            </Col>
            <Col offset={1} span={6} className="simple-search">
              {/*<Button type="primary" htmlType="submit" className="ok-button">搜索</Button>*/}
              <Button type="primary" htmlType="submit" className="ok-button">搜索</Button>
              <Button onClick={showMore}>高级搜索</Button>
            </Col>
          </Form>
            :
            <Form key="2" layout="horizontal" style={{ display: advancedSearch ? '' : 'none' }}
                  onSubmit={handleSearch.bind(this)}>
              <Col span={7}>
                <FormItem label="业务" {...formItemLayout}>
                  {getFieldDecorator('business_id', {
                    initialValue: selectedBusiness,
                    onChange: changeBusinesses.bind(this),
                    rules: [{
                      required: advancedSearch,
                      message: '业务必选'
                    }]
                  })(
                    <Select>
                      { businesses &&
                      businesses.map(v => <Option key={v.id} value={v.name + '-_-' + v.id}>{v.name}</Option>) }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col offset={1} span={7}>
                <FormItem label="应用" {...formItemLayout}>
                  {getFieldDecorator('app_id', {
                    initialValue : selectedApp,
                    onChange : changeApp.bind(this),
                    rules : [{
                      required : advancedSearch,
                      message : '应用必选'
                    }]
                  })(
                    <Select placeholder="请先选择业务">
                      { apps && apps.map(v => <Option key={v.id} value={v.name + '-_-' + v.id}>{v.name}</Option>) }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col offset={1} span={8} className="select-group">
                <InputGroup compact>
                  <FormItem label={fakeStar} {...formItemLayout} className='select-type'>
                    {getFieldDecorator('select_type', {
                      initialValue : relateType,
                      onChange : changeSelectType.bind(this),
                    })(
                      <Select>
                        { SELECT_TYPES &&
                        Object.keys(SELECT_TYPES).map((v) =>
                          <Option key={SELECT_TYPES[v]} value={SELECT_TYPES[v]}>{v}</Option>) }
                      </Select>
                    )}
                  </FormItem>
                  <FormItem {...formItemLayout} className='select-content'>
                    {getFieldDecorator('select_content', {
                      initialValue : selectedContent,
                      onChange : changeSelectContent.bind(this),
                      rules : [{
                        required : advancedSearch,
                        message : '集群，实例组，实例至少选择一项'
                      }]
                    })(
                      <Select>
                        { selectContents &&
                        Object.keys(selectContents).map(v => <Option key={v} value={v}>{selectContents[v]}</Option>) }
                      </Select>
                    )}
                  </FormItem>
                </InputGroup>
              </Col>
              <Col className="complex-node">
                <FormItem label="节点:" {...formItemLayout}>
                  { getFieldDecorator('complex_node', {
                    initialValue: selectedComplexNodes,
                    onChange: setSelectedComplexNodes.bind(this),
                    // onDeselect: onDeselect.bind(this),
                    rules: [{
                      required: advancedSearch && selectedComplexNodesForTag.length === 0,
                      // required: true,
                      message: '请选择节点'
                    }]
                  })(
                    <Select mode="multiple" onDeselect={onDeselect.bind(this)}>
                      { complexNodes &&
                      complexNodes.map((v) => <Option key={v.name} value={v.name}>{v.name}</Option>) }
                    </Select>
                  )}
                </FormItem>
              </Col>
              <div style={{clear: 'both'}}></div>
              <Col className="float-element" style={{display: selectedComplexNodesForTag.length > 0 ? '' : 'none'}}>
                <div className="selected-node-label">所选节点：</div>
                <div className="selected-nodes">
                  {
                    selectedComplexNodesForTag.map((v) => {
                      return <Tag key={v} closable={true} onClose={closeTag.bind(this, v)}
                      >{v}</Tag>
                    })
                  }
                </div>
              </Col>
              <Col className="float-element" >
                <div className="monitor-item-label">监控项：</div>
                <div className="monitor-items" ref={(el) => {this.monitor = el}}>
                  {applications.map((v, i) => {
                    const tagsProps = {
                      label: v+': ',
                      tags: tags[v+'Tags'] || [],
                      selectAllTag: selectAllTag[v],
                      selectAllTags: () => {  //  model层对应application全选
                        dispatch({type:  `${modelKey}/selectAllTags`, payload: {application:v}})
                      },
                      // deSelectAllTags: () => {
                      //   dispatch({type:  `${modelKey}/deSelectAllTags`, payload: {application:v}})
                      // },
                      handleSelectAllTag: (selectAll) => {  // 更新视图层对应那个全部选中状态
                        dispatch({type:  `${modelKey}/handleSelectAllTag`, payload: {application:v, selectAll}})
                      },
                      tagProps: {
                        handleClick: (tag, application=v) => {  // 点击除全部外的其他tag
                          dispatch({type:  `${modelKey}/handleClick`, payload: {tag, application}})
                          // console.log(selectAllTag)
                          // if (selectAllTag) {
                          //   dispatch({type:  `${modelKey}/handleSelectAllTag`, payload: false})
                          //   dispatch({type:  `${modelKey}/clearTags`, payload: {application:v}})
                          // }
                          // dispatch({type:  `${modelKey}/handleTags`, payload: {tag, application:v}})
                        },
                      },
                      clearTags: () => {   //  model层对应application全部反选
                        dispatch({type:  `${modelKey}/clearTags`, payload: {application:v}})
                      }
                    }
                    const isLast = (i === applications.length - 1)

                    return (  //  key要加在div上
                      <div key={this.state.key+v}>
                        <TagBox key={this.state.key+v+1} {...tagsProps} />
                        {
                          !isLast ? <hr/> : ''
                        }
                      </div>
                    )
                  })
                  }
                </div>
              </Col>
              <Col span={24} className="text-right search-bar">
                <Button type="primary" htmlType="submit" className="ok-button">搜索</Button>
                <Button onClick={clearAll}>清除</Button>
                <Button onClick={showLess}>简易搜索</Button>
              </Col>
            </Form>
          }
        </Row>
      </Row>
    )
  }
}

TrendSearch.propTypes = {
  trend: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect((state)=> {
  return {
    trend: state[modelKey],
  }
})(Form.create()(TrendSearch))
