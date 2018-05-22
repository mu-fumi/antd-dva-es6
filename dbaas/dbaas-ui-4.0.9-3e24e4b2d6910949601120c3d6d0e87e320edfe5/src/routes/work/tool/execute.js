/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-06-26 10:41 $
 */
//详情页执行工具

import Base from 'routes/base'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Button, Form, Input, Spin} from 'antd'
import { classnames, Cache } from 'utils'

import { DataTable, Layout, Search, ProgressIcon, IconFont, HostFilter } from 'components'
import styles from './execute.less'
import ResultModal from './resultModal'

const cache = new Cache()

const modelKey = 'work/tool/create'

const FormItem = Form.Item

const formItemLayout = {
  labelCol : {
    span : 2
  },
  wrapperCol : {
    span : 10
  }
}

class Execute extends Base {

  constructor(props) {
    super(props)
    const toolName = cache.get('toolName')
    this.setGobackBtn()
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {activeName : `执行工具: ${toolName}`, selectedKey : '脚本工具scripts'},
      defer : true,
      fire: [Base.DidMount],
    })
    this.push({
      type :  'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire: [Base.WillUnmount],
    })
  }

  render() {

    const {
      dispatch,
      create,
      form: {
        getFieldDecorator,
        validateFields,
        getFieldsValue,
        setFieldsValue,
      }
    } = this.props

    const {debugResult, machineModalVisible, resultModalVisible, loading} = create

    const selectMachine = () => {
      dispatch({type: `${modelKey}/showMachineModal`})
    }

    const startDebugging = () => {
      validateFields((err, values) => {
        if (err) {
          return false
        }
        dispatch({
          type: `${modelKey}/handleLoading`,
          payload: true
        })
        const data = {
          ...getFieldsValue()
        }
        dispatch({
          type: `${modelKey}/executeDebugging`,
          payload: data
        })
      })
    }

    const hostFilterProps = {
      visible: machineModalVisible,
      onOk: (data) => {
        setFieldsValue({
          ips: data.join(',')
        })
        dispatch({type: `${modelKey}/hideMachineModal`})
      },
      onCancel: () => {
        dispatch({type: `${modelKey}/hideMachineModal`})
      },
    }

    const resultModalProps = {
      visible: resultModalVisible,
      debugResult,
      onOk: () => {
        dispatch({type: `${modelKey}/hideResultModal`})
      },
      onCancel: () => {
        dispatch({type: `${modelKey}/hideResultModal`})
      },
    }

  return (
    <Row className={styles['execute']}>
      <div>
        <Spin spinning={loading} size="large">
          <Form layout="horizontal" className="debug">
            <FormItem label="目标机器:" {...formItemLayout}>
              { getFieldDecorator('ips', {
                initialValue : '',
                rules : [{
                  required : true,
                  message : '请输入目标机器'
                }]
              })(
                <Input />
              )}
            </FormItem>
            <div className="button-wrapper">
              <Button onClick={selectMachine}>
                <IconFont type="plus"/>
                筛选机器
              </Button>
            </div>
            <FormItem label="执行用户:" {...formItemLayout}>
              { getFieldDecorator('run_user', {
                initialValue : 'root',
              })(
                <Input />
              )}
            </FormItem>
            <div className="button-wrapper">
              <Button onClick={startDebugging}>
                <IconFont type="iconfont-debug"/>
                执行调试
              </Button>
            </div>
          </Form>
        </Spin>
        <HostFilter {...hostFilterProps}/>
        <ResultModal {...resultModalProps}/>
      </div>
    </Row>
  )
}
}

Execute.propTypes = {
  create: PropTypes.object,
  dispatch : PropTypes.func
}

export default connect((state)=>{
  return {
    loading: state.loading.models[modelKey],
    create: state[modelKey]
  }
})(Form.create()(Execute))
