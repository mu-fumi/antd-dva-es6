/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './fileList.less'
import { DataTable, Filter } from 'components'
import { Link , routerRedux } from 'dva/router'
import { Row ,Col , Button , Icon , Select } from 'antd'
import AsTable from './asTable'
import { Cache } from 'utils'
const cache = new Cache()
const Option = Select.Option

class FileList extends Base{
  constructor(props){
    super(props)

    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '文件列表', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.repath = this.repath.bind(this)
    this.handleVersionSwitch = this.handleVersionSwitch.bind(this)
    this.state = {
      pathSuffix: ""
    }
    cache.put("wholePath",this.state.pathSuffix)
    this.setGobackBtn()
  }

  handleVersionSwitch(value){
    const pathnameArr = this.props.location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 3]
    this.props.dispatch(
      routerRedux.push({
        pathname:`/packages/${id}/tree/${value}`
      })
    )
  }

  repath(e){
    cache.put("wholePath",this.state.pathSuffix + "/" + e.target.innerText.replace(/\s+/g, ""))
    this.setState({
      pathSuffix : this.state.pathSuffix + "/" + e.target.innerText.replace(/\s+/g, "")
    })
  }

  render(){
    const {location ,dispatch , history , fileList } = this.props

    const pathnameArr = this.props.location.pathname.split('/')
    const id = pathnameArr[pathnameArr.length - 3]
    const version = pathnameArr[pathnameArr.length - 1]

    const filepath = cache.get("filepath")

    const tableProps = {
      fetch:{
        url:`/packages/file/${id}/${version}/info`,
        data:{
          filepath: this.state.pathSuffix ? filepath + this.state.pathSuffix : filepath
        }
      },
      showHeader:false,
      //pagination: true,
      rowKey: 'id',
      columns:[{
        dataIndex: 'file',
        key: 'file',
        render:(text,record)=>{
          if(record.type === "file"){
            return(
              <Row><Icon type="file-text"/>&nbsp;&nbsp;
                <Link to={`/packages/file/${id}/${version}/${record.file}`}>{text}</Link></Row>
            )
          }else if(record.type === "dir"){
            return(
              <Row><Icon type="folder"/>&nbsp;&nbsp;<a href="javascript:void(0);" onClick={this.repath}>{text}</a></Row>
            )
          }
        }
        },
        {
          dataIndex: 'size',
          key: 'size',
        }],
    }
    const asTableProps = {
      show:"hidden",
      location : location,
    }

    return(
      <Row className={styles.fileList}>
        <Row className="inner-cont">
          <AsTable {...asTableProps} />
          <DataTable {...tableProps} />
        </Row>
      </Row>
    )
  }
}

FileList.propTypes = {
  fileList: PropTypes.object,
  loading: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
}

function mapStateToProps(state) {
  return {
    fileList: state['package/fileList'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(FileList)
