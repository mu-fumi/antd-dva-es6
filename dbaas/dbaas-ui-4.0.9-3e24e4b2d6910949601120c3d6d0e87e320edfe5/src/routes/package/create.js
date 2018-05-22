/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './create.less'
import { DataTable, Filter } from 'components'
import { Row , Button} from 'antd'
import CreatePackage from './createPackage'

class Create extends Base{
  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '程序包新增', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
  }

  componentWillMount(){
    const from = location.search ? location.search.split('=')[1] : ""
    if(from){
      this.props.dispatch({
        type:"package/create/handleFrom",
        payload:from
      })
    }
  }

  render(){
    const { location, dispatch ,history , create} = this.props
    const { from, recommit } = create

    const handleSubmit = (data) =>{
      dispatch({type:'package/create/handleRecommit',payload:{recommit:true}})
      dispatch({
        type : 'package/create/packageSubmit',
        payload : {
          formData : data
        }
      })
    }


    const formProps = {
      package_name:create.package_name,
      location:create.location,
      memo:create.memo,
      recommit:recommit
    }
    return(
      <Row className={styles.create}>
        <Row className="inner-cont">
          <Row>
            <CreatePackage {...formProps} onSubmit={handleSubmit}></CreatePackage>
          </Row>
        </Row>
      </Row>
    )
  }
}

Create.propTypes = {
  create: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    create: state['package/create'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(Create)
