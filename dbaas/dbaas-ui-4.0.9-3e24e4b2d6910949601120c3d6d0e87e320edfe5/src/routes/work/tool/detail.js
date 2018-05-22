/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 * 照官方文档原样引入picker，官网没问题，项目中却有问题
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Link } from 'dva/router'
import { Row, Col, Icon, Modal, Tooltip } from 'antd'
import { DataTable, TimeFilter as Time, IconFont, ProgressIcon } from 'components'
import { classnames, TimeFilter, Cache } from 'utils'
import styles from './detail.less'
import IconModal from './iconModal'
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css');
require('codemirror/mode/shell/shell');
require('codemirror/mode/python/python');

// import { DatePicker } from 'antd';
// import moment from 'moment';
// const RangePicker = DatePicker.RangePicker;

import pathToRegexp from 'path-to-regexp'

const cache = new Cache()

const modelKey = 'work/tool/detail'

class Detail extends Base {

  constructor(props) {
    super(props)
    const pathname = this.props.location.pathname
    const path = pathToRegexp('/scripts/:id(\\d+)').exec(pathname)
    const ID = path[1]
    const toolName = cache.get('toolName')
    const onClick = () => {
      Modal.confirm({
        title: '提示',
        content: '确定删除此工具吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.props.dispatch({
            type: `${modelKey}/deleteTool`,
            payload: {id: ID}
          })
        }
      })
    }
    this.setGobackBtn()
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {activeName : toolName, selectedKey : '脚本工具scripts'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
    this.pageBtns = {
      element : () => {
        return <Row>
          <Col className="pageBtn"
          >
            <Link to={`/scripts/${ID}/execute`}>
              <IconFont type="play-circle-o"/>执行工具
            </Link>
          </Col>
          <Col className="pageBtn">
            <Link to={`/scripts/${ID}/edit`}>
              <IconFont type="edit"/>编辑工具
            </Link>
          </Col>
          <Col className="pageBtn" onClick={onClick}>
            <a href="javascript:void(0);">
              <IconFont type="delete"/>删除工具
            </a>
          </Col>
        </Row>
      }
    }
  }

  render() {

    const { dispatch, detail } = this.props
    const {toolDetail: {tool_name, tags, icon, icon_bg_color, script_type, description, code, editor}, timeRange, tableFilter, ID, iconModalVisible, selectedIcon, selectedColor} = detail

    const timeFilterProps = {
      radioProps: [{
        buttons: timeRange,
        props: {
          value: tableFilter['radio'],
          onChange: (e) => {
            dispatch({
              type: `${modelKey}/handleTableFilter`,
              payload: e.target.value
            })
          }
        }
      }],
      pickerProps: [{
        props: {
          defaultValue: tableFilter['picker'],
          onOk(value) {
            dispatch({
              type: `${modelKey}/handleTableFilter`,
              payload: TimeFilter.toUnix(value),
            })
          }
        }
      }],
    }

    const filter = tableFilter['radio'] ? {day: tableFilter['radio']} : {date: TimeFilter.toUnix(tableFilter['picker'])}

    const tableProps =
      {
        fetch: {
          url: `/tools/${ID}/history`,
          data: filter
        },
        columns: [
          {
            title: '最近执行的工具任务', dataIndex: 'tool_name', key: 'tool_name', render: (text, record) => {
            return <Link to={`message/job/${record.id}`} target="_blank">{text}</Link>
          }
          },
          {
            title: '结果', dataIndex: 'succeed', key: 'succeed', render: (text, record) => {
            return <Link to={`message/job/${record.id}`} target="_blank">
              <ProgressIcon type={text === 0 ? 2 : 1} className="result-icon"/>
              {text ? '成功' : '失败'}
            </Link>
          }
          },
          {title: '执行用户', dataIndex: 'user_name', key: 'user_name'},
          {title: '执行开始时间', dataIndex: 'start_at', sorter: true, key: 'start_at'},
          {title: '耗时 (s)', dataIndex: 'time_consuming', key: 'time_consuming'}
        ],
        rowKey: 'id',
      }

    const changeIcon = () => {
      dispatch({type: `${modelKey}/showIconModal`})
    }

    const iconModalProps = {
      visible: iconModalVisible,
      selectColor(color) {
        dispatch({
          type: `${modelKey}/selectColor`,
          payload: color
        })
      },
      selectedColor: selectedColor || icon_bg_color,
      selectedIcon: selectedIcon || icon,
      selectIcon(icon) {
        dispatch({
          type: `${modelKey}/selectIcon`,
          payload: icon
        })
      },
      onOk() {
        dispatch({type: `${modelKey}/changeIcon`})
        dispatch({type: `${modelKey}/hideIconModal`})
      },
      onCancel: () => {
        dispatch({type: `${modelKey}/hideIconModal`})
      },
    }

    let options = {
      lineNumbers: true,
      mode: script_type === 'shell' ? 'text/x-sh' : 'text/x-python',
      readOnly: true,
      cursorBlinkRate: -1
    }

    const onthisChange = (dates, dateStrings) => {
      console.log('From: ', dates[0], ', to: ', dates[1]);
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
    }

    return (
      <Row className={styles['detail']}>
        <Row>
          <Col span={2}>
            <div className="icon-group" onClick={changeIcon}>
              <Tooltip title="设置工具的图标和样式" placement="right">
                <IconFont type="iconfont-hexagon1" style={{color: icon_bg_color || '#31719f'}} className="bg-icon"/>
                <IconFont type={ 'iconfont-' + (icon || 'wrench') } className="tool-icon"/>
              </Tooltip>
            </div>
          </Col>
          <Col span={20} className="tool-details">
            <Col span={10}>
            <span>工具：
              <span>{tool_name}</span>
              </span>
            </Col>
            <Col span={10}>
            <span>标签：
              <span>{tags || '无'}</span>
              </span>
            </Col>
            <Col span={10}>
            <span>作者：
              <span>{editor || '无'}</span>
              </span>
            </Col>
            <Col span={10}>
            <span>语言：
              <span>{script_type}</span>
              </span>
            </Col>
            <Col span={10}>
            <span>说明：
              <span>{description || '无'}</span>
              </span>
            </Col>
          </Col>
        </Row>
        <Row className="script">
          <Col span={1} className="script-label">
          <span>脚本：
            <Tooltip title='工具脚本仅可在作业平台中执行，无法独立运行' placement="right">
              <Icon type="question-circle" className='text-warning'/>
            </Tooltip>
          </span>
          </Col>
          <Col span={20}>
            <CodeMirror key={+new Date()} value={code} className="code-mirror"
                        options={options}/>
          </Col>
        </Row>
        <Row className="history">
          {/*<RangePicker*/}
            {/*ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}*/}
            {/*onChange={onthisChange}*/}
          {/*/>*/}
          {/*<br />*/}
          {/*<RangePicker*/}
            {/*ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}*/}
            {/*showTime*/}
            {/*format="YYYY/MM/DD HH:mm:ss"*/}
            {/*onChange={onthisChange}*/}
          {/*/>*/}
          <Time {...timeFilterProps}/>
          <DataTable {...tableProps}/>
        </Row>
        <IconModal {...iconModalProps}/>
      </Row>
    )
  }
}

Detail.propTypes = {
  detail: PropTypes.object,
  location : PropTypes.object,
  loading : PropTypes.bool,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    detail: state[modelKey],
  }
})(Detail)
