/**
 * Created by Lizzy on 2018/3/27.
 */


import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger, TimeFilter, disabledDate } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Select, Form, Radio, DatePicker } from 'antd'
import styles from './index.less'

const FormItem = Form.Item
const Option = Select.Option
const RadioGroup = Radio.Group

const formItemLayout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 12,
  },
}

class ReportModal extends React.Component {
  constructor() {
    super()
    this.state = {
      radioValue: '0',
    }
  }

  render() {

    const { visible, onOk, onCancel, instances, buttonLoading, form } = this.props
    const { getFieldDecorator, validateFields, getFieldsValue } = form

    const modalOpts = {
      title: '生成异常分类',
      visible,
      onOk: () => {
        validateFields((err, values) => {
          if (err) {
            return false
          }
          const data = {
            ...getFieldsValue()
          }
          data['day'] = TimeFilter.format(data['day'] / 1000).split(' ')[0]
          Modal.confirm({
            title: '提示',
            content: <p> 确定要对 巡检时间 为 {data['day']} 的健康巡检报告生成异常分类报告吗？</p> ,
            onOk: () => {
              onOk(data)
            },
            onCancel: () => { }
          })
        })
      },
      onCancel,
      wrapClassName: 'vertical-center-modal',
    }

    return (
      <Modal {...modalOpts} className={styles['sql-modal']}>
        <Form>
          <FormItem label="巡检时间" hasFeedback {...formItemLayout}>
            {getFieldDecorator('day', {
              rules: [
                {
                  required: true,
                  message: '请选择巡检时间',
                },
              ],
            })(
              <DatePicker disabledDate={disabledDate} />
            )}
          </FormItem>
        </Form>
      </Modal>
    )
  }
}

ReportModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  form: PropTypes.object,
  buttonLoading: PropTypes.bool
}

export default Form.create()(ReportModal)
