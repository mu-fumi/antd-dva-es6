/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 */

// 关键词和tag可以同时成为筛选条件；标签选中高亮，反选取消选中；初始进入页面下方显示全部工具，进行筛选后变成筛选工具，不管当前是否还有关键词和选中tag

import Base from 'routes/base'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import { Row, Col, Tag, Spin, Modal} from 'antd'
import { DataTable, Layout, Search, ProgressIcon, IconFont } from 'components'
import { Link } from 'dva/router'
import { classnames } from 'utils'
import styles from './tool.less'

const confirm = Modal.confirm;
const modelKey = 'work/tool'

class Tool extends Base {
  constructor() {
    super();
    this.push({  // 防止重定向等跳转此页面无menu
      type : 'app/handleCurrentMenu',
      payload : {activeName : '脚本工具', selectedKey : '脚本工具scripts'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
    this.pageBtns = {
      element: ()=>{
        return <Row>
          <Col className="pageBtn" >
            <Link to="/scripts/create" className="text-info">
              <IconFont type="plus"/>新建工具
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to="/job" target="_blank">
              <IconFont type="iconfont-reset" className="svg"/>历史任务
            </Link>
          </Col>
        </Row>
      }}
  }

  render() {

    const {location, dispatch, tool} = this.props
    const {tags, oftenUsedTools, currentTools, resultTitle, loading, keyword} = tool
    const placeholder = '根据工具名称过滤'

    const searchProps = {
      keyword,
      placeholder,
      onSearch (value) {
        dispatch({
          type: `${modelKey}/handleResultTitle`,
          payload: '筛选结果'
        })
        dispatch({
          type: `${modelKey}/handleKeyword`,
          payload: value,
        })
        dispatch({type: `${modelKey}/getCurrentTools`})
      },
    }

    const onclick = (v) => {
      dispatch({
        type: `${modelKey}/handleResultTitle`,
        payload: '筛选结果'
      })
      dispatch({
        type: `${modelKey}/updateTags`,
        payload: v.tag_name
      })
      dispatch({
        type: `${modelKey}/handleTagID`,
        payload: v.tagChecked ? v.id : '',
      })
      dispatch({type: `${modelKey}/getCurrentTools`})
    }

    const onclose = (v, e) => {
      e.preventDefault();  // prevent以后后面就没有删除tag的动作了。。。
      e.stopPropagation(); // 防止onclose触发onclick

      confirm({
        title: '提示',
        content: '确定要删除此标签？',
        onOk() {
          dispatch({
            type: `${modelKey}/deleteTags`,
            payload: tags.indexOf(v)  // 获取要删除tag的index，通过控制显示隐藏来实现删除的效果
          })
          dispatch({
            type: `${modelKey}/deleteTag`,
            payload: {id: v.id}
          })
        },
        onCancel() {

        },
      });
    }

    const toolResults = currentTools.map((v) => {
      return (
        <div key={v.id} className="tool-item">
          <Link to={`/scripts/${v.id}`} className="link">
            <div className="icon-group">
              <IconFont type="iconfont-hexagon1" style={{color: v.icon_bg_color || '#31719f'}}
                        className="bg-icon"/>
              <IconFont type={ 'iconfont-' + (v.icon || 'wrench') } className="tool-icon"/>
            </div>
            <div className="tool-name">{v.tool_name}</div>
          </Link>
        </div>
      )
    })

    const oftenUsedToolsContent =
      <div>
        <div className="title">经常使用的工具</div>
        <Row>
          {
            oftenUsedTools.map((v) => {
              return (
                <div key={v.id} className="tool-item">
                  <Link to={`/scripts/${v.id}`} className="link">
                    <div className="icon-group">
                      <IconFont type="iconfont-hexagon1" style={{color: v.icon_bg_color || '#31719f'}}
                                className="bg-icon"/>
                      <IconFont type={ 'iconfont-' + (v.icon || 'wrench') } className="tool-icon"/>
                    </div>
                    <div className="tool-name">{ v.tool_name }</div>
                  </Link>
                </div>
              )
            })
          }
        </Row>
      </div>

    return (
      <Row className={styles['tool']}>
        <Row>
          <Col span={10}>
            <Search {...searchProps} />
          </Col>
        </Row>
        <Row className="tags">
          {
            tags.map((v) => {
              return <Tag key={v.id} style={{display: v.tagShow, backgroundColor: v.tagChecked ? '#108ee9' : '#f3f3f3',
                color: v.tagChecked ? '#fff' : 'rgba(0, 0, 0, 0.65)'}} closable={true} onClose={onclose.bind(this, v)}
                          onClick={onclick.bind(this, v)}>{v.tag_name}</Tag>
            })
          }
        </Row>
        { oftenUsedTools.length > 0 ? oftenUsedToolsContent : ''}
        <div className="title">{resultTitle || '全部工具'}</div>
        <Row>
          <Spin spinning={loading}>
          { currentTools.length > 0 ? toolResults : (<span className="no-tool">暂无相关工具</span>) }
          </Spin>
        </Row>
      </Row>
    )
  }
}

Tool.propTypes = {
  tool: PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    tool: state[modelKey],
  }
})(Tool)
