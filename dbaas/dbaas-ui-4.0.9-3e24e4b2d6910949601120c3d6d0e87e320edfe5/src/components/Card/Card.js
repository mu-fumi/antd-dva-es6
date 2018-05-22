/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-08 12:04 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Card as CardComponent, Spin, Select, Tooltip } from 'antd'
import styles from './Card.less'
import { classnames } from 'utils'

import { Echart, DataTable, TimeFilter } from 'components'

const Option = Select.Option

class Card extends React.Component {

  render() {
    const {
      loading,
      titleText = '',
      radioProps = [],
      pickerProps = [],
      chartProps = [],
      tableProps = [],
      children,
      className = '',
      // 新增下拉选择框 2017-06-12 @wengyian
      selectProps,
    } = this.props

    let title = []
    if (titleText !== '') {
      title.push(<span key={0}>{ titleText }</span>)
    }
    if (radioProps.length > 0 || pickerProps.length > 0) {
      let timeFilterProps = {}
      if(radioProps.length > 0){
        timeFilterProps = {
          radioProps
        }
      }
      if(pickerProps.length > 0){
        timeFilterProps = {
          ...timeFilterProps,
          pickerProps
        }
      }
      title.push(<TimeFilter key={1} className="chart-filter" { ...timeFilterProps } />)
    }

    // 下拉选择框处理

    if(selectProps){

      let option_content = selectProps.props.map((item, key) => {
        return (
          <Option value={item.digest} key={key}>
            <Tooltip title={item.query} key={key} placement="left" overlayClassName={styles["option-tooltip"]}>
              {item.digest}
            </Tooltip>
          </Option>
        )
      })

      title.push(<Row className={styles["select-container"]} key={2}>
        <span style={{marginRight : '8px'}}>{selectProps.name}</span>
        <Select
          placeholder="请选择"
          style={{ minWidth: '250px',marginRight:'35px' }}
          onSelect={selectProps.onSelect}
          key={selectProps.key}
        >
          {option_content}
        </Select>
      </Row>)
    }


    title = title.length > 0 ? title : null

    const cardProps = {
      title,
      bordered: false
    }

    const chartSpan = Math.ceil(24 / chartProps.length), tableSpan = Math.ceil(24 / tableProps.length)
    const chartContent = (
      <Row gutter={16} type="flex" justify="space-between">
        {chartProps.map((chartProp, k)=> <Col key={k} span={chartProp['span'] ? chartProp['span'] : chartSpan }>
            <Echart { ...chartProp } className="chart"/>
          </Col>
        )}
      </Row>
    )
    const otherContent = (
      <Row gutter={16} type="flex" justify="space-between">
        {tableProps.map((tableProp, k)=> <Col key={k} span={tableProp['span'] ? tableProp['span'] : tableSpan } className="mgt-16">
            <DataTable { ...tableProp } />
          </Col>
        )}
        {children}
      </Row>
    )

    return (
      <CardComponent className={classnames(styles['card'], className)} {...cardProps} >
        {loading ? <Spin spinning={loading}  >
          {chartContent}
        </Spin> : chartContent}
        {otherContent}
      </CardComponent>
    )
  }
}

Card.propTypes = {
  loading: PropTypes.bool,
  titleText: PropTypes.any,
  radioProps: PropTypes.array,
  pickerProps: PropTypes.array,
  chartProps: PropTypes.array,
  tableProps: PropTypes.array,
  children: PropTypes.element,
  className: PropTypes.string,
}

export default Card
