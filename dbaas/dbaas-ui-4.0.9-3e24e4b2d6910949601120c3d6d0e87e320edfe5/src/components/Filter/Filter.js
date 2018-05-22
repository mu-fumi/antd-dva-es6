/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-17 16:23 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Form, Button, Row, Col, Switch, Input, DatePicker, Select, Radio, Tooltip } from 'antd'
import { Search, IconFont, CascaderFilter } from 'components'
import { classnames } from 'utils'
import _ from 'lodash'
import styles from './Filter.less'

const FormItem = Form.Item
const { RangePicker } = DatePicker
const Option = Select.Option
const RadioButton = Radio.Button
const RadioGroup = Radio.Group

const Filter = ({
  searchProps,
  rangePickerProps,
  selectProps,
  radioProps,
  dataPickerProps,
  buttonProps,
  onSubmit,
  buttonSpan,
  cascaderProps,
  }) => {

  searchProps = searchProps || []
  rangePickerProps = rangePickerProps || []
  selectProps = selectProps || []
  radioProps = radioProps || []
  dataPickerProps = dataPickerProps || []
  buttonProps = buttonProps || []
  buttonSpan = _.parseInt(buttonSpan || 0)
  cascaderProps = cascaderProps || []


  return (
    <Form
      className={classnames('ant-advanced-search-form', styles['filter-form'])}
      onSubmit={onSubmit}
    >
      <Row type="flex" align="middle" >
        <Col span={(24 - buttonSpan)}>
          <Row gutter={16} type="flex" align="middle" >
            { searchProps.map((props, k) =>{
              return (
                <Col key={k}>
                  <Search {...props} />
                </Col>
                // FormItem加在了组件内部
              )
            })}
            { radioProps.map((value, k) =>{  //  radio调整为picker之前
              const options = value['options'] || {}
              return (
                <Col key={k} style={{marginTop : '-2px'}}>
                  <FormItem label={value['label'] || ''}>
                    <RadioGroup
                      size="default"
                      defaultValue=""
                      {...(value['props'] || {})}
                    >
                      {
                        Object.keys(options).map((v, k) =>
                          <RadioButton key={k} value={`${options[v]}`}>{v}</RadioButton>)
                      }
                    </RadioGroup>
                  </FormItem>
                </Col>
              )
            })}
            { rangePickerProps.map((value, k) =>{
              return (
                <Col key={k} style={{marginTop : '-2px'}}>
                  <FormItem label={value['label'] || ''}>
                    <RangePicker
                      size="default"
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={['开始', '结束']}
                      {...(value['props'] || {})}
                    />
                  </FormItem>
                </Col>
              )
            })}
            { dataPickerProps.map((value, k) =>{
              const options = value['options'] || {}
              return (
                <Col key={k} style={{marginTop : '-2px'}} >
                  <FormItem  label={value['label'] || ''}>
                    <DatePicker
                      className="w-170"
                      size="default"
                      {...(value['props'] || {})}
                    >
                    </DatePicker>
                  </FormItem>
                </Col>
              )
            })}
            { cascaderProps.map((value, k) => {
              return (
                <Col key={k} style={{marginTop : '-2px'}}>
                  <FormItem label={value.label}>
                    <CascaderFilter {...value["props"] || {}}/>
                  </FormItem>
                </Col>
              )
            })}
            { selectProps.map((value, k) =>{
              const options = value['options'] || {}
              return (
                <Col key={k} style={{marginTop : '-2px'}}>
                  <FormItem label={value['label'] || ''}>
                    <Select
                      size="default"
                      defaultValue=''
                      {...(value['props'] || {})}
                    >
                      { Object.keys(options).map((v, k) => <Option key={k} value={`${options[v]}`}>{v}</Option>) }
                    </Select>
                  </FormItem>
                </Col>
              )
            })}

          </Row>
        </Col>
        <Col span={buttonSpan} className="text-right">
          <FormItem >
            { buttonProps.map((value, k) =>{
              return <Tooltip title={value['tip']} key={k}>
              <Button size='default' {...(value['props'] || {})}>
                <IconFont {...(value['iconProps'] || {})} />
                {value['label'] || undefined}
              </Button>
              </Tooltip>
            })}
          </FormItem>
        </Col>
      </Row>
    </Form>
  )
}

Filter.propTypes = {
  form: PropTypes.object.isRequired,
  selectProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
      options: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  radioProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
      options: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  rangePickerProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  dataPickerProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  buttonProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
      iconProps: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
  onSubmit: PropTypes.func,
  searchProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const type = typeof propValue[key]
    if (type !== 'object') {
      return new Error(
        'Failed prop type: Invalid prop `'+propFullName+'` of type `'+
        type+'` supplied to `'+componentName+'`, expected an object.'
      );
    }

  }),
  cascaderProps: PropTypes.arrayOf((propValue, key, componentName, location, propFullName) => {

    const propTypes = {
      label: PropTypes.string,
      props: PropTypes.object,
      options: PropTypes.object,
    }
    return PropTypes.checkPropTypes(propTypes, propValue[key], location, componentName)
  }),
}

export default Form.create()(Filter)
