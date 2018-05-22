/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-7-31 14:24 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Form, Pagination, Select } from 'antd'
import { Filter, Card, Chart, IconFont } from 'components'
import TrendSearch from './trendSearch'

import { TimeFilter, constant } from 'utils'

import LazyLoad from 'react-lazyload'
import styles from './trend.less'

const modelKey = 'monitor/trend';

class Trend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      cards: {}
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type : 'app/handleReturnButton',
      payload : ''
    })
  }

  // componentWillReceiveProps(nextProps) {
    // if (this.props.trend.hostname !== nextProps.trend.hostname) {
    //   this.props.dispatch({
    //     type : `${modelKey}/getKeys`,
    //   })
    // }
  // }

  render() {
    const {
      trend,
      dispatch,
    } = this.props;

    const { reload, timeRange, keys, time, total, currentPage, hostname } = trend

    const cardProps = {
      radioProps: [{
        buttons: timeRange,
        props: {
          value: time['radio'],
          onChange: (e) => {
            dispatch({type: `${modelKey}/reload`, payload: {time: e.target.value}})
          }
        }
      }],
      pickerProps: [{
        props: {
          // key: +new Date(),
          defaultValue: time['picker'],
          onOk(value) {
            dispatch({
              type: `${modelKey}/reload`,
              payload: {time: TimeFilter.toUnix(value)},
            })
          }
        }
      }],
    }
    let rows = []
    const len = Math.ceil(keys.length / 2)
    for (let i = 0; i < len; i++) {
      rows.push(keys.slice(i * 2, i * 2 + 2))
    }
    const data = {
      hostname: hostname,
      time: time['radio'] || TimeFilter.toUnix(time['picker']),
    }

    const onPageChange = (page) => {
      dispatch({type:  `${modelKey}/getKeys`, payload: {page}})
    }

    const onSelect = (key, value) => {  //  value必须放在传的参数后面
      // console.log(this, key, value)
      this.setState({
        cards: {...this.state.cards, [key]:value}
      })
    }

    return (
      <Row className={styles.trend}>
        <TrendSearch />
        <Card { ...cardProps }>
          <Row className={styles.chart}>
            { rows.map((v, k) => {
              return (
                <LazyLoad key={k} height={200} offset={[-100, 0]} scroll={true}>
                  <Row className={styles.chart}>
                    {v.map((item, index)=> {
                      // console.log(item)
                      const {key, cards} = item
                      const chartProps = {
                        fetch: {
                          url: `/monitor/graphs/${key}`,
                          data: {...data},
                          required: ['hostname']   //  hostname为空时不发起请求
                        },
                        reload,
                        selectedCard: this.state.cards[key]
                      }
                      // console.log('chartProps', this.state.cards[key])
                      return <Col key={index} span={24}>
                        { cards && cards.length > 1 && // cards为数组或者null
                          <Col span={4}>
                            <Select onChange={onSelect.bind(this, key)}>
                              { cards.map(v => <Select.Option key={v} value={v}>{v}</Select.Option>) }
                            </Select>
                          </Col>
                        }
                        <Col span={24}>
                          <Chart {...chartProps} />
                        </Col>
                      </Col>
                    })}
                  </Row>
                </LazyLoad>
              )
            })}
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
          </Row>
        </Card>
      </Row>
    )
  }
}

Trend.propTypes = {
  trend: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect((state)=> {
  return {
    trend: state[modelKey],
  }
})(Form.create()(Trend))
