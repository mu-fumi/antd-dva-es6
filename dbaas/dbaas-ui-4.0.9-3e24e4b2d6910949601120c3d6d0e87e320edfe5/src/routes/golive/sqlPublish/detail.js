/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-17 10:41 $
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Timeline, Collapse, Pagination } from 'antd'
import styles from './detail.less'
import { DataTable, Layout, Filter, ProgressIcon, IconFont } from 'components'
import { constant } from 'utils'

const Panel = Collapse.Panel
const modelKey = 'golive/sqlPublish/detail'
const { SQL_PUBLISH_STATUS_DETAIL } = constant

class Detail extends Base {

  constructor(props) {
    super(props);
    this.setGobackBtn()
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {activeName : 'SQL 发布详情', selectedKey : 'SQL发布sql-publish'},
      defer : true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : { selectedKey : ''},
      fire: [Base.WillUnmount],
    })
  }

  render() {
    const { sqlHistory, total, currentPage, sqlID } = this.props.detail

    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
    }

    const onPageChange = (page) => {
      this.props.dispatch({
        type:  `${modelKey}/getSqlHistory`,
        payload: {
          id: sqlID,
          page: page
        }
      })
    }

    return (
      <div className={styles['detail']}>
        <Timeline>
          {
            sqlHistory.map((v) => {
              const header = (<div className="header">
                <span className="title">{SQL_PUBLISH_STATUS_DETAIL[v.step]}</span>
                <span className="consuming">{v.consuming}&nbsp;秒</span>
                <span className="created-time">{v.created_at}</span>
                <ul className="detail">
                  <li>发布到实例：{v.effected_nodes || '无'}</li>
                  {/*<li>备份到库表：{v.tables || '无'}</li>*/}
                </ul>
              </div>)
              return <Timeline.Item key={v.id} color={v.status === 0 ? 'green' : 'red'}>
                <Collapse className={v.output ? "" : "collapse"} bordered={false} style={customPanelStyle}>
                  <Panel header={header} key="1">
                    <p className="wrap-break">
                      {v.output}
                    </p>
                  </Panel>
                </Collapse>
              </Timeline.Item>
            })
          }
        </Timeline>
        <div className="pagination">
          {
            total ?
              ( <Pagination
                  total={total}
                  showTotal={(total) => `共${total}条`}
                  current={currentPage}
                  onChange={onPageChange}
                  pageSize={10}
                  defaultCurrent={1}
                />
              )
              :
              <span>
                <IconFont type="frown-o" className="mgr-8"/>
                暂无数据
              </span>
          }
        </div>
      </div>
    )
  }
}

Detail.propTypes = {
  detail: PropTypes.object,
  dispatch: PropTypes.func,
}

export default connect((state)=>{
  return {
    detail: state[modelKey],
  }
})(Detail)
