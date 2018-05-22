/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-31 14:24 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Spin, Col } from 'antd'

import { TimeFilter } from 'utils'
import { Card, Chart } from 'components'
import LazyLoad from 'react-lazyload'
import styles from './graphs.less'

const modelKey = 'performance/graphs';


class Graphs extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (this.props.performance.currentNode !== nextProps.performance.currentNode) {
      this.props.dispatch({ type: `${modelKey}/reload`, payload: {} })
    }
  }

  render() {
    const { graphs, performance, dispatch } = this.props;

    const { keys, time } = graphs
    const { currentNode, timeRange } = performance

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
      hostname: currentNode,
      time: time['radio'] || TimeFilter.toUnix(time['picker']),
    }
    return (
      <Row className={styles.graphs}>
        <Card  { ...cardProps }>
          <Row className={styles.chart}>
            { rows.map((v, k) => {
            return (
              <LazyLoad key={k} height={200} offset={[-100, 0]} scroll={true}>
                <Row className={styles.chart}>
                  {v.map((item, index)=> {
                    const chartProps = {
                      fetch: {
                        url: `/performance/query/${item}`,
                        data,
                        required: ['hostname']
                      }
                    }
                    return <Col key={index} span={12}><Chart {...chartProps} /> </Col>
                  })}
                </Row>
              </LazyLoad>
            )
          })}
          </Row>
        </Card>
      </Row>
    )
  }
}

Graphs.propTypes = {
  graphs: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};

export default connect((state)=> {
  return {
    graphs: state[modelKey],
    performance: state['performance']
  }
})(Graphs)
