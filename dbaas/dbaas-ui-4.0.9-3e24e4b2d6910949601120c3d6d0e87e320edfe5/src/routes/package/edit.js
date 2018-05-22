/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './edit.less'
import { DataTable, Filter } from 'components'
import { Row , Button} from 'antd'
import CreatePackage from './createPackage'

class Edit extends Base{
  constructor(props){
    super(props)
    this.setGobackBtn()

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '程序包编辑', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    //返回时清空输入域里的值
    this.push({
      type:"package/edit/handleReset"
    })
  }
  componentWillMount(){
     this.props.dispatch({
     type : 'package/edit/getEditInfo',
     payload : {
       id : this.props.match.params.id
     }
     })
   }
  render(){
    const { location, dispatch ,history , edit} = this.props

    const handleSubmit = (data) =>{
      dispatch({type:'package/edit/handleRecommit',payload:{recommit:true}})
      dispatch({
        type : 'package/edit/editPackage',
        payload : {
          id:this.props.match.params.id,
          formData : data
        }
      })
    }

    //获取Id
    const pathnameArr = location.pathname.split('/')
    let id = pathnameArr[pathnameArr.length - 2]

    const formProps = {
      package_name:edit.package_name,
      location:edit.location,
      memo:edit.memo,
      recommit:edit.recommit
    }
    return(
      <Row className={styles.edit}>
        <Row className="inner-cont">
          <Row>
            <CreatePackage {...formProps} onSubmit={handleSubmit}></CreatePackage>
          </Row>
        </Row>
      </Row>
    )
  }
}

Edit.propTypes = {
  edit: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    edit: state['package/edit'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(Edit)
