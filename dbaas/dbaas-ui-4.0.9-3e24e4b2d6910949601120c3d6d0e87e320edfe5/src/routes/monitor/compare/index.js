import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row , Col ,Checkbox ,Radio ,Button ,Spin ,message,Select , DatePicker ,TimePicker , Collapse} from 'antd'
import { Layout, Echart } from 'components'
import styles from './compare.less'
const { TabMenu } = Layout
const RadioGroup = Radio.Group
const Option = Select.Option
const Panel = Collapse.Panel

class Compare extends React.Component{

  componentWillMount() {
      this.props.dispatch({ type: `monitor/trend/getHosts`})
  }

  render(){
    const { location, tabMenu, compare, dispatch, loading} = this.props
    const {keys , selectKey , machines ,start , end , startTime , endTime , oldKey , monitorData , units} = compare

    //勾选复选框(对selectKey数组进行重组，根据页面勾选的复选框来决定)
    const onChange = (key)=>{
      let tmpSelectKey = []
      if (selectKey.indexOf(key) === -1) {
        tmpSelectKey = selectKey
        tmpSelectKey.push(key)
      }else {
        selectKey.forEach((val) => {
          if (key != val) {
            tmpSelectKey.push(val)
          }
        })
      }
      dispatch({ type: `monitor/trend/handleSelectKey` ,payload:{selectKey: tmpSelectKey}})
    }

    //遍历keys数组
    let options = Object.keys(keys).map((key) => {
      let state = false
      if (selectKey.indexOf(key) !== -1) {
        state = true
      }
      return (
        <label key={key} className="padr-10">
          <Checkbox defaultChecked={state} onChange={onChange.bind(this, key)}/>
          <span className={styles['wrap-span']}>{keys[key]}</span>
        </label>
      )
    })

    //循环得到childs
    let child = Object.keys(machines).map((value) => {
      return (<Option key={value}>{machines[value]}</Option>)
    })

    //监听节点一select 中的option的变化
    const inputChangeFir = (value)=>{
      start.machine = value
      dispatch({ type: `monitor/trend/handleStartMachine` ,payload:{machine:start.machine}})
    }
    //监听节点二select 中的option的变化
    const inputChangeSec = (value)=>{
      end.machine = value
      dispatch({ type: `monitor/trend/handleEndMachine` ,payload:{machine:end.machine}})
    }
    //监听节点一DatePicker 中的mounth的变化
    const monthChangeFir = (value)=>{
      start.date = value
      dispatch({ type: `monitor/trend/handleStartDate` ,payload:{date:start.date}})
    }
    //监听节点二DatePicker 中的mounth的变化
    const monthChangeSec = (value)=>{
      end.date = value
      dispatch({ type: `monitor/trend/handleEndDate` ,payload:{date:end.date}})
    }
    //监听选择时间段开始部分
    const startChange = (value)=>{
      dispatch({ type: `monitor/trend/handleStartTime` ,payload:{startTime:value}})
    }
    //监听选择时间段结束部分
    const endChange = (value) =>{
      dispatch({ type: `monitor/trend/handleEndTime` ,payload:{endTime:value}})
    }

    //点击确定按钮触发事件
    const handleOk = () =>{
      if (selectKey.length < 1) {
        message.error('监控类型最少要选一项')
        return
      }
      if (!start.machine || start.machine == '') {
        message.error('节点一名称必填')
        return
      }
      if (!start.date || start.date == '') {
        message.error('节点一日期必填')
        return
      }
      if (!start.machine || end.machine == '') {
        message.error('节点二名称必填')
        return
      }
      if (!end.date || end.date == '') {
        message.error('节点二日期必填')
        return
      }
      if (!startTime || startTime == '' || !endTime || endTime == '') {
        message.error('时间段必填')
        return
      }
      var oldKey = []
      selectKey.forEach((key) => {
        oldKey.push(key)
        dispatch({ type: `monitor/trend/getTrend` ,payload:{selectKey: key,start:start,end:end,
          startTime:startTime.startTime,endTime:endTime.endTime,oldKey: oldKey}})
      })
      dispatch({ type: `monitor/trend/handleOldKey` ,payload:{oldKey: oldKey}})
    }

    //将未来时间设置为不可点击的状态
    const disabledDate =(current)=>{
      if (current && current.valueOf() > Date.now()) {
        return true
      }else {
        let date = new Date()
        let y = date.getFullYear()
        let m = date.getMonth()
        let d = date.getDate()
        if (m == 0) {
          y--
          m = 12
        }
        return current && current.valueOf() < new Date(`${y}-${m}-${d}`).valueOf()
      }
    }

    //通过遍历返回HTML节点
    let display = {visibility: 'hidden'}
    let num = 0

    let html = selectKey.map((data) => {
      num++
      let chassName = num % 2 == 1 ? styles['padr-10'] : null
      if (oldKey.indexOf(data) != -1) {
        display = {visibility: 'visible'}
      }else {
        display = {visibility: 'hidden'}
      }
      let option = monitorData[data]
      if (!option) {
        option = []
      }

      return (
        <Col span={12} className={styles['mgrb']} style={display} key={num}>
          <Col className={chassName}>
          <Row style={{padding: "10px 15px",
            borderBottom: "1px solid transparent",
            borderTopLeftRadius: "3px",
            borderTopRightRadius: "3px",height:"52px",    borderColor: "#e9e9e9",backgroundColor:"white"}}>
                <span className={styles['block-pard']}>
                  <h4 className={styles['colo-padl-15']}>{units[data]}</h4>
                </span>
          </Row>
          </Col>
          <Col span={24}>
            <Row className={chassName}>
              <Row>
                <Row style={{
                  width: '100%',
                  height: '300px',
                  backgroundColor:'white'
                }}>
                  <Echart type="line" option={option}
                          charType ='line' txt="暂无数据" height={{
                    'lineHeight': '150px'
                  }} timeFormat = 'time'/>
                </Row>
              </Row>
            </Row>
          </Col>
        </Col>
      )
    })

    return(
      <Row>
        <Row className={styles['content']}>
          <Row className={styles['line-height-28']}>
            <Col span={3}><Row  className={styles['choose-monitor-type']}>选择监控类型：</Row></Col>
            <Col span={21}><Row>{options}</Row></Col>
          </Row>
          <Row className={styles['kuang']}/>
          <Row>
            <Col span={3}>
              <Row className={styles['first-node']}>节点一：</Row>
            </Col>
            <Col span={20}>
              <Select showSearch style={{ width: '200px',marginRight:'35px' }} placeholder="节点名，可输入关键词搜索"
                      optionFilterProp="children" onChange={inputChangeFir} notFoundContent="无法找到" >
                {child}
              </Select>
              <DatePicker value={start.date} onChange={monthChangeFir} disabledDate={disabledDate} />
            </Col>
          </Row>
          <Row className={styles['kuang']}/>
          <Row>
            <Col span={3}>
              <Row className={styles['first-node']}>节点二：</Row>
            </Col>
            <Col span={20}>
              <Select showSearch style={{ width: '200px',marginRight:'35px' }} placeholder="节点名，可输入关键词搜索"
                      optionFilterProp="children" onChange={inputChangeSec} notFoundContent="无法找到" key={2}>
                {child}
              </Select>
              <DatePicker value={end.date} onChange={monthChangeSec} disabledDate={disabledDate} />
            </Col>
          </Row>
          <Row className={styles['kuang']}/>
          <Row>
            <Col span={24}>
              <Row>
                <Col span={3}>
                  <span className={styles['first-node']} >选择时间段：</span>
                </Col>
                <Col span={21}>
                  <TimePicker onChange={startChange}/>
                  <span className={styles['padrl-10']}>-</span>
                  <TimePicker onChange={endChange}/>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles['kuang']}/>
          <Row>
            <Col span={3} offset={3}>
              <Button  className="ant-btn ant-btn-primary " onClick={handleOk}>
                确定
              </Button>
            </Col>
          </Row>
        </Row>
        <Row className={styles['kuang']}/>
        <Row>
          {html}
        </Row>
      </Row>
    )
  }
}

Compare.propTypes = {
  compare: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    compare: state['monitor/compare'],
    //loading: state.loading.effects,
    //注意, 如果没有缓存时可能拿不到 horizontal 项
    // tabMenu: state.app.menus['monitor/trend'] ? state.app.menus['monitor/trend']['horizontal'] : [],
  }
}

export default connect(mapStateToProps)(Compare)
