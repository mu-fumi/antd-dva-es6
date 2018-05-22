/**
 * Created by zhangmm on 2017/7/4.
 */
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './upload.less'
import { DataTable, Filter } from 'components'
import { Link , browserHistory} from 'dva/router'
import { Row , Button , Icon} from 'antd'


class Upload extends React.Component{
  constructor(props){
    super(props)
  }

  render(){

    const buttonProps = [
      {
        label : '返回列表页',
        iconProps : {
          type : 'rollback'
        },
        props : {
          onClick(){
            browserHistory.push('packages')
          }
        }
      },{
        label:'提交版本',
        iconProps:{
          type:'upload'
        },
        props:{
          type: 'primary',
          onClick(){
            /* browserHistory.push(`/packages/${id}/version`)*/
          }
        }
      }]

    // 右侧按钮占据栅格书
    const buttonSpan = 24

    const filterProps = {
      buttonProps,
      buttonSpan
    }

    return(
      <Row className={styles.upload}>
        <Row className="inner-cont">
          <Row className="mgrb">
            <Filter {...filterProps} />
          </Row>
        </Row>
      </Row>
    )
  }
}

Upload.propTypes = {
  upload: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    upload: state['package/upload'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(Upload)
