/**
 * Created by zhangmm on 2017/7/11.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './compares.less'
import { DataTable, Filter } from 'components'
import { Link , browserHistory} from 'dva/router'
import { Row , Button , Select , Icon} from 'antd'
const Option = Select.Option
import CodeMirror from 'react-codemirror'
require('codemirror/lib/codemirror.css')
require('codemirror/mode/shell/shell')
require('codemirror/mode/python/python')

class Compares extends React.Component{
  constructor(props){
    super(props)
  }

  render(){
    const filterProps = {
      buttonProps : [{
        label: '返回列表页',
        iconProps: {
          type: 'rollback'
        },
        props:{
          onClick() {
            browserHistory.push('packages')
          }
        }
      }],
      buttonSpan:24
    }

    let options = {
      lineNumbers: true,
      mode: 'text/x-sh',
      readOnly: false,
      cursorBlinkRate: -1
    }

    return(
      <Row className={styles.compares}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps}/>
          </Row>
          <Select defaultValue="lucy" style={{ width: 90 }} >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
          </Select>
          <Icon type="ellipsis" />
          <Select defaultValue="lucy" style={{ width: 90 }} >
            <Option value="jack">Jack</Option>
            <Option value="lucy">Lucy</Option>
          </Select>
          <CodeMirror key={+new Date()} className="code-mirror"
                      options={options}/>
        </Row>
      </Row>
    )
  }
}

Compares.propTypes = {
  compares: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    compares: state['package/compares'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(Compares)
