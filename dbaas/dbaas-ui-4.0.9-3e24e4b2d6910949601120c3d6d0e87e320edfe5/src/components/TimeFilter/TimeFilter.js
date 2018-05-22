import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Radio, DatePicker } from 'antd'
import styles from './TimeFilter.less'

const RadioButton = Radio.Button
const RadioGroup = Radio.Group
const { RangePicker } = DatePicker

class TimeFilter extends React.Component {
  componentWillReceiveProps (nextProps) { // 目前radio和picker都只有一个，radio值变化时更新picker的key使其重新渲染
    if (this.props.radioProps[0].props.value !== nextProps.radioProps[0].props.value) {
      nextProps.pickerProps[0].props.key = +new Date()
    }
  }

  render(){
    const { radioProps = [], pickerProps = [] }= this.props

    return (
      <Row className={styles['time-filter']} >

        { radioProps.map((value, k) =>{
            const buttons = value['buttons'] || {}
            const defaultValue = buttons[Object.keys(buttons)[0]]
            return (
              <Col key={k} className="mgr-16 inline-block">
              <span className="mgr-8"> 查询时间:</span>
                <RadioGroup
                  defaultValue={defaultValue}
                  {...(value['props'] || {})}
                >
                  { Object.keys(buttons).map((v, k) => <RadioButton key={k} value={`${buttons[v]}`}>{v}</RadioButton>) }
                </RadioGroup>
              </Col>
            )
          })
        }
        { pickerProps.map((value, k) => {
          return (
            <Col key={k} className="mgr-16 inline-block">
              <RangePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder={['开始时间', '结束时间']}
                {...(value['props'] || {})}
              />
            </Col>
          )
        })
        }
      </Row>
    )
  }
}

TimeFilter.propTypes = {
  radioProps: PropTypes.array,
  pickerProps: PropTypes.array,
}

export default TimeFilter
