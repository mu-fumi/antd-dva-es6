import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row , Col ,Checkbox ,Radio ,Button ,Spin ,message} from 'antd'
import { Layout } from 'components'
import { Echart } from 'components'
import styles from './sort.less'
const { TabMenu } = Layout
const RadioGroup = Radio.Group;

class Sort extends React.Component{

  componentWillMount() {
    this.props.sort.selectKey.forEach((key) => {
      this.props.dispatch({ type: `monitor/sort/getNodes` ,payload:{selectKey: key,limit:this.props.sort.limit}})
    });
  }

  render(){
    const { location, tabMenu, sort, dispatch, loading} = this.props
    const {keys , selectKey ,option ,limit ,loads , dataSet} = sort

    //点击确定按钮
    const handleOk =()=>{

      if (selectKey.length < 1) {
        message.error('最少要选一项监控类型');
        return
      }

      selectKey.forEach((key) => {
        dispatch({ type: `monitor/sort/getNodes` ,payload:{selectKey: key,limit:limit}})
      })
    }
    //勾选复选框(对selectKey和option两个数组进行重组，根据页面勾选的复选框来决定)
    const onChange = (key)=>{
        let tmpSelectKey = []
        let tmpOption = []
        if (selectKey.indexOf(key) === -1) {
          tmpSelectKey = selectKey
          tmpSelectKey.push(key)
          tmpOption = option
        }else {
          selectKey.forEach((val) => {
            if (key != val) {
              tmpSelectKey.push(val)
              tmpOption[val] = option[val]
            }
          })
        }
      dispatch({ type: `monitor/sort/handleSelectKeyOption` ,payload:{selectKey: tmpSelectKey,option: tmpOption}})
    }

    //勾选单选框
    const change = (e)=>{
      if (e.target.value != limit) {
        dispatch({ type: `monitor/sort/handleLimit` ,payload: e.target.value })
      }
    }

    //遍历keys数组
    let options = Object.keys(keys).map((key) => {
      let state = false
      if (selectKey.indexOf(key) != -1) {
        state = true
      }
      return (
        <label key={key} className="padr-10">
          <Checkbox defaultChecked={state} onChange={onChange.bind(this, key)}/>
          <span className={styles['wrap-span']}>{keys[key]}</span>
        </label>
      )
    })

    //monitor存放的是7种监控类型的表
    let load = false

    let hasData = (op)=>{
      if(op){
        let placeholder = {}
        if(op.values &&　op.values.length > 0){
          return(<Echart type="bar" option={op}  className={styles["content"]}
                         charType='bar' txt="暂无数据" height={{ 'lineHeight': '150px' }}/>)
        }else{
          return(
            <Row>
              <Row style={{"display": 'none'}} className={styles['content']}>
                <Row  className ={styles['style-sort']}></Row>
              </Row>
              <Row style={placeholder} className={styles['content']}>
                <Row style={{'height': '250px'}} className="sort">
                  <Row className={styles['table-placeholder']} style={{"lineHeight":"150px"}}>
                    <i className=" anticon anticon-frown" />
                    <span >暂无数据</span>
                  </Row>
                </Row>
              </Row>
            </Row>
          )
        }
      }
    }

    let monitor = selectKey.map((key) => {
      let op = option[key] ? option[key][0] : option[key]
      if (!op) {
        op = []
      }

      return (
        <Col span="12" key={key}>
          <h4 className="padlf-30">{keys[key]}排序</h4>
          <Spin spinning={false}>
            {hasData(op)}

          </Spin>
        </Col>
      )
    })


    //html中存放的是content结构内容
    let html = null
    if (selectKey.length > 0) {
      html = (
      <Row className={styles['content']}>
        <Row className={styles['padt-15']}>
          {monitor}
        </Row>
      </Row>
      )
    }

    return(
      <Row>
        <Row className={styles['content']}>
          <Row className={styles['line-height-28']}>
            <Col span={3}><Row  className={styles['choose-monitor-type']}>选择监控类型：</Row></Col>
            <Col span={21}><Row>{options}</Row></Col>
          </Row>
          <Row className={styles['kuang']}/>
          <Row className={styles['line-height-28']}>
            <Col span={3}><Row className={styles['first-node']}>排名：</Row></Col>
            <Col span={21}>
              <RadioGroup onChange={change.bind(this)} value={limit}>
                <Radio  value="10">TOP10</Radio >
                <Radio  value="20">TOP20</Radio >
              </RadioGroup>
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
        {html}
      </Row>
    )
  }
}

Sort.propTypes = {
  sort: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    sort: state['monitor/sort'],
    //loading: state.loading.effects,
    //注意, 如果没有缓存时可能拿不到 horizontal 项
    // tabMenu: state.app.menus['monitor/trend'] ? state.app.menus['monitor/trend']['horizontal'] : [],
  }
}

export default connect(mapStateToProps)(Sort)
