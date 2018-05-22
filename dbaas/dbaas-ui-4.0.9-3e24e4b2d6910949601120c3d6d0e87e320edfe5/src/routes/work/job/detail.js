/**
 * Created by zhangmm on 2017/9/8.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter , IconFont } from 'components'
import { Gate } from 'utils'
import { Row , Radio , Modal, Table, Collapse, Button } from 'antd'

const RadioGroup = Radio.Group
const Panel = Collapse.Panel
const modelKey = 'job/detail'


class Detail extends Base{
  constructor(props){
    super(props)
    this.state = {
      display: this.props.job_pid === 0 && Gate.can('retry_job') ? '' : 'none', /*根据是否是子任务及是否有权限判断“重试任务”按钮是否显示*/
      radioValue: 0
    }
    //设置返回按钮
    this.setGobackBtn()
    // 返回时清空输入域里的值,以防出现上个job的详情
    this.push({
      type:`${modelKey}/handleReset`,
      fire : [Base.WillUnmount]
    })

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '任务详情', selectedKey: '任务列表job'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      display: nextProps.detail.job_pid === 0 && Gate.can('retry_job') ? '' : 'none',  /*根据是否是子任务及是否有权限判断“重试任务”按钮是否显示*/
    })
  }

  componentWillUnmount(){
    super.componentWillUnmount()
    window.stopProgressFlag = false
  }

  render(){
    const { dispatch, detail } = this.props
    const { name, progress, progress_status , created_at, finished_at,
      format_output, origin_output, time_cost } = detail
    let content = ''
    if (format_output['ret']) {
      let out = format_output['ret']
      if (out['error']) {
        content = (
          <table key='content' className='table'>
            <tbody>
            <tr key='error'>
              <td>{out['msg']}</td>
            </tr>
            </tbody>
          </table>
        )
      }
      else {
        content = Object.keys(out).map((data, k) => {  // false字体红色
          let tableBody = out[data].map((data1, index) => {
            if (data1 instanceof Array) {
              return (
                data1.map((data2, index) => {
                  return (<tr key={index}>
                    <td>{data2.task}</td>
                    <td className={data1.succeed ? '' : 'text-error'}>{data2.succeed.toString()}</td>
                  </tr>)
                })
              )
            }
            else {
              return (<tr key={index}>
                <td>{data1.task}</td>
                <td className={data1.succeed ? '' : 'text-error'}>{data1.succeed.toString()}</td>
              </tr>)
            }
          })
          return (
            <div className='panel' key={k}>
              <table key='content'
                     className='table'>
                <tbody>
                <tr>
                  <td>{data}</td>
                  <td>
                    <table className='table' key='st'>
                      <tbody>{tableBody}</tbody>
                    </table>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          )
        })
      }
    }

    const columns = [{
      title: '主机',
      dataIndex: 'host',
      width:'150px'
    },
    {
      title: '标题',
      dataIndex: 'task',
      width:'200px'
    },
    {
      title: '状态',
      dataIndex: 'output',
      render: (text,record) => {
        if (typeof record != 'string') {
          record = JSON.stringify(record)
        }
        return (<span >{record}</span>)
      }
    }]

    const jsonText = (text) => {
      // origin_output={exit_code:X，stderr:'XXX', stdout:'XXX'}时进入if，即只显示stdout的内容
      if (typeof text == 'string' || !text) {
        return <pre className='jobShowPre'>{text}</pre>
      }
      let stdout = text.stdout
      let stderr = text.stderr
      return (<pre><span className='jobShowPre'>{stdout}{stderr}</span></pre> )
    }

    const onRadioChange = (e) => {
      this.setState({
        radioValue: e.target.value,
      });
    }

    const handleSubmit = (e) => {
      // state改变时confirm未重新渲染，如果用value,则无法改变选项，所以要用defaultValue
      e.preventDefault()
      Modal.confirm({
        title: '确定要重试任务吗？',
        content: <p>
          请选择重试任务的方式：
          <RadioGroup onChange={onRadioChange} defaultValue={this.state.radioValue}>
            <Radio value={0}>从失败的步骤开始</Radio>
            <Radio value={1}>跳过失败的步骤</Radio>
          </RadioGroup>
        </p>,
        onOk: () => {
          dispatch({
            type: `${modelKey}/retryJob`,
            payload: {
              skipping: this.state.radioValue
            }
          })
        }
      })

    }

    let Co = ''
    if (progress) {
      Co = (<div className='display'>
          <Collapse defaultActiveKey={['1']}>
            <Panel header={'运行详情'} key='1'>
              <Table columns={columns} dataSource={progress}
                     rowKey={(recode, index) => {
                       return index
                     }} pagination={false}/>
            </Panel>
          </Collapse>
        </div>
      )
    }

    if (origin_output) {
      Co = (<Collapse defaultActiveKey={['1']}>
          <Panel header={'运行详情'} key='2'>
            {jsonText(origin_output.stdout)}
          </Panel>
        </Collapse>
      )
    }

    return(
      <Row className={styles.detail}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <ul className='list-unstyled mb30 detail'>
              <li className="li-left">
                <span className='column-title'>任务名称：</span>
                <span>{name}</span>
              </li>
              <li className="li-right">
                <span className='column-title'>结果：</span>
                {
                  <span className={progress_status === 1 ? 'text-success' : (progress_status === 2 ? 'text-error'
                  : (progress_status === 3 ? 'text-info' : 'text-warning'))}>{progress_status === 1 ? '完成' :
                    (progress_status === 2 ? '出错' : (progress_status === 3 ? '超时' :
                      (progress_status === 0 ? '运行中' : '')))}</span>
                }
              </li>
              <li className="li-left">
                <span className='column-title'>开始时间：</span>
                <span>{created_at}</span>
              </li>
              <li className="li-right">
                <span className='column-title'>完成时间：</span>
                <span>{finished_at}</span>
              </li>
              <li className="li-right last-li">
                <span className='column-title'>耗时：</span>
                <span>{time_cost}</span>
              </li>
              {content}
              <li className="li-whole">
                { Co }
              </li>
              <li className='retry-button'>
                <div>
                  <Button style={{display: this.state.display}} onClick={handleSubmit}
                          className='ant-btn ant-btn-primary'>
                    重试任务
                  </Button>
                </div>
              </li>
            </ul>
          </Row>
        </Row>
      </Row>
    )
  }
}

Detail.propTypes = {
  detail: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    detail: state[modelKey],
    // loading: state.loading.effects
  }
}

export default connect(mapStateToProps)(Detail)
