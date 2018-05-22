/**
 * Created by zhangmm on 2017/7/4.
 */
import Base from 'routes/base'
import React from 'react'
import { connect } from 'dva'
import PropTypes from 'prop-types'
import styles from './detail.less'
import { DataTable, Filter , IconFont } from 'components'
import { Link, routerRedux } from 'dva/router'
import { Row ,Col , Icon , Modal  , Tooltip , Table ,Button, Spin} from 'antd'
import DetailLine from './detailLine'
import MemoModal from './memoModal'
import ImportModal from './importModal'
import { classnames } from 'utils'
import { Cache } from 'utils'
const confirm = Modal.confirm
const cache = new Cache()

class Detail extends Base{
  constructor(props){
    super(props)

    this.setGobackBtn()
    this.push({
      type: 'app/handleCurrentMenu',
      payload: {activeName: '程序包详情', selectedKey: '程序包管理packages'},
      defer: true,
      fire : [Base.DidMount]
    })
    this.push({
      type : 'app/handleCurrentMenu',
      payload : {selectedKey : ''},
      fire : [Base.WillUnmount]
    })
    this.pageBtns = {
      element: ({id, detail})=>{
        return  <Row>
          {!(detail && detail.user_name) ? (<Tooltip title="创建者为空无法新增版本">
            <Col className="pageBtn" >
              <Link to={`/packages/${id}/commitVersion`} disabled={!(detail && detail.user_name)} className="text-info">
                <IconFont type="plus"/>新增版本
              </Link>
            </Col>
          </Tooltip>):(<Col className="pageBtn">
            <Link to={`/packages/${id}/commitVersion`} className="text-info">
              <IconFont type="plus"/>新增版本
            </Link>
          </Col>)}
{/*          {!(detail && detail.user_name) ? (<Tooltip title="创建者为空无法导入">
            <Col className="pageBtn" >
              <a href="javascript:void(0);"
                 onClick={this.showImport}
                 disabled={!(detail && detail.user_name)}
              >
                <IconFont type="iconfont-Import"/>导入
              </a>
            </Col>
          </Tooltip>):(<Col className="pageBtn">
            <a href="javascript:void(0);"
               onClick={this.showImport}
            >
              <IconFont type="iconfont-Import"/>导入
            </a>
          </Col>)}*/}

          {!(detail && detail.user_name) ? (<Tooltip title="创建者为空无法编辑">
            <Col className="pageBtn" >
              <Link to={`/packages/${id}/edit`} disabled={!(detail && detail.user_name)} >
                <IconFont type="edit"/>编辑
              </Link>
            </Col>
          </Tooltip>):(<Col className="pageBtn">
            <Link to={`/packages/${id}/edit`}>
              <IconFont type="edit"/>编辑
            </Link>
          </Col>)}

          {!(detail && detail.version_del) ? (<Tooltip title="有版本的包暂不能删除">
            <Col className="pageBtn">
              <a href="javascript:void(0);"
                onClick={this.showConfirm}
                disabled={!(detail && detail.version_del)}
              >
                <IconFont type="delete"/>删除
              </a>
            </Col>
          </Tooltip>):(<Col className="pageBtn">
            <a href="javascript:void(0);"
              onClick={this.showConfirm}
              disabled={!(detail && detail.version_del)}
            >
              <IconFont type="delete"/>删除
            </a>
          </Col>)}
          <Col className="pageBtn" onClick={this.handleDetailReload}>
            <a href="javascript:void(0);">
              <IconFont type="reload"/>刷新
            </a>
          </Col>
        </Row>
      }}
    //返回时清空输入域里的值
    this.push({
      type:"package/detail/handleReset"
    })
    this.showConfirm = this.showConfirm.bind(this)
    this.onUpdate = this.onUpdate.bind(this)
    this.onDelete = this.onDelete.bind(this)
    this.onCompress = this.onCompress.bind(this)
    this.showImport = this.showImport.bind(this)
    this.handleDetailReload = this.handleDetailReload.bind(this)
  }

  handleBack(){  //  只返回到列表页，覆盖base方法
    this.props.dispatch(routerRedux.push({
      pathname: '/packages',
    }))
  }

  handleDetailReload(){
/*    this.props.dispatch({
      type:'package/detail/handleKeyword',
      payload:{keyword:this.refs.inputSearch}
    })*/
    this.props.dispatch({
      type : `package/detail/handleReload`
    })
  }

  showConfirm(){
    const package_name = this.props.detail.info.package_name
    const id = this.props.match.params.id
    confirm({
      title: <span className="wrap-break">确定要删除 <span className="text-bold-italic">{package_name}</span> 程序包吗？</span>,
      content: <span className="wrap-break">删除程序包会删除该程序包下的所有内容</span>,
      onOk:() => {
        this.props.dispatch ({
          type:'package/detail/deletePackage',
          payload:{
            id:id,
            version:package_name,
          }
        })
      },
      onCancel:() =>{},
    })
  }

  onUpdate(id){
    console.log(`/packages/${this.props.match.params.id}/${id}/editVersion`)
    this.props.dispatch(
      routerRedux.push({
        pathname : `/packages/${this.props.match.params.id}/${id}/editVersion`
      })
    )
  }

  onDelete(version){
    confirm({
      title:<span className="wrap-break">确定要删除 <span className="text-bold-italic">{version}</span> 版本吗？</span>,
      content: <span className="wrap-break">删除版本不会删除版本关联的程序包</span>,
      onOk:() =>{
        this.props.dispatch ({
          type:'package/detail/deleteVersion',
          payload:{
            id:this.props.match.params.id,
            version:version
          }
        })
      },
      onCancel() {},
    })
  }

  onCompress(version){
    Modal.confirm({
      title:`确认`,
      content:<Row style={{marginTop : '8px'}}>
        <IconFont type="bulb" className="text-warning"/>
        <span className="wrap-break">是否要进行 {version} 版本压缩</span>
      </Row>,
      onOk:() =>{
        this.props.dispatch ({
          type:'package/detail/handleSpinning',
          payload:{
            spinning:true
          }
        })
        this.props.dispatch ({
          type:'package/detail/handleCompress',
          payload:{
            id:this.props.match.params.id,
            version:version
          }
        })
      },
      onCancel(){
      }
    })
  }

  showImport(){
    this.props.dispatch ({
      type:'package/detail/handleImpVisibility',
      payload:{
        importModalVisible:true
      }
    })
  }

  render(){
    const { location, dispatch ,history ,detail} = this.props
    const {reload , info , updateModalVisible , importModalVisible,
      okText , cancelText ,version , memo , loading, spinning } = detail

    //获取Id
    const pathnameArr = location.pathname.split('/')
    let id = pathnameArr[pathnameArr.length - 1]
    //存入文件路径
    cache.put("filepath",info.location ? info.location.replace(/\s+/g, "") + '/tree' : "")

    const tableProps = {
      fetch:{
        url:`/packages/${id}/version`
      },
      rowKey: 'id',
      columns:[{
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        className: 'min-w-150',
        render:(text)=>{
          return(<span>{!text ? '无' : text}</span>)
        }
        },
        {
          title: '包名',
          dataIndex: 'package_name',
          key: 'package_name',
          className:'min-w-150',
          render:(text)=>{
            return(<span>{!text ? '无' : text}</span>)
          }
        },
        {
          title: '大小',
          dataIndex: 'package_size',
          key: 'package_size',
          className:'min-w-100',
          render:(text)=>{
            return(<span>{!text ? '无' : text}</span>)
          }
        },
        {
          title: 'MD5',
          dataIndex: 'md5',
          key: 'md5',
          className:'min-w-150',
          render:(text)=>{
            if(!text){
              return <span>无</span>
            }else{
              return(
                <Tooltip title={text} overlayClassName={classnames(styles['toolTip'])}>
                  <span className="span-dot">{text.slice(0,7)}</span>
                </Tooltip>
              )
            }

          }
        },
        {
          title: '备注',
          dataIndex: 'memo',
          key: 'memo',
          className:'memo-width',
          render:(text)=>{
            return(<span>{!text ? '无' : text}</span>)
          }
        },
        {
          title: '创建者',
          dataIndex: 'user_name',
          key: 'user_name',
          className: 'min-w-100',
          render:(text) =>{
            return<span>{!text ? "无" : text }</span>
          }
        },
/*        {
          title: '版本 ID',
          dataIndex: 'version_id',
          key: 'version_id',
          render:(text)=>{
            return(
              <Tooltip title={text} overlayClassName={classnames(styles['toolTip'])}>
                <span className="span-dot">{text.slice(0,7)}</span>
              </Tooltip>
            )
          }
        },*/
        {
          title: '操作',
          className: 'min-w-250',
          render: (text, record ) => {
            let display = record.is_deleted === true ?  {display:"block"} : {display:"none"}
            //let compressDisplay = record.has_package === false ?  {display:"block"} : {display:"none"}
            return (
              <span style={{display:'flex'}}>
              <span>
                <a href="javascript:void(0);" onClick={this.onUpdate.bind(this,record.id)}>编辑版本</a>
              </span>
              <span style={display}>
                <span className="ant-divider" />
                <a href="javascript:void(0);" onClick={this.onDelete.bind(this,record.version)}>删除版本</a>
              </span>
  {/*            <span style={compressDisplay}>
                <span className="ant-divider" />
                <a href="javascript:void(0);" onClick={this.onCompress.bind(this,record.version)}>压缩版本</a>
              </span>*/}
            </span>
            )
          }
        }],
      reload: reload
    }

    const memoModalSetting = {
      title :'编辑版本备注',
      visible : updateModalVisible,
      okText:okText,
      cancelText:cancelText,
      version:version,
      memo:memo,
      onOk( visible,version,memo){
        dispatch({
          type:'package/detail/updateMemo',
          payload:{
            id:id,
            version:version,
            memo:{memo:memo},
            visible:visible
          }
        })
      },
      onCancel(visible){
        visible = visible ? false : true
        dispatch({
          type:'package/detail/handleVisibility',
          payload:visible
        })
      },
      updateMemo(memo){
        dispatch({
          type:'package/detail/handleMemo',
          payload:{
            memo:memo
          }
        })
      }
    }

    const importModalSetting = {
      title :'导入',
      visible : importModalVisible,
      okText:okText,
      cancelText:cancelText,
      onOk(visible,path){
        dispatch({
          type:'package/detail/importPackage',
          payload:{
            id:id,
            path:path,
            visible:visible
          }
        })
      },
      onCancel(visible){
        visible = visible ? false : true
        dispatch({
          type:'package/detail/handleImpVisibility',
          payload:{
            importModalVisible:visible
          }
        })
      },
    }

    return(
      <Row className={styles.detail}>
        <Row className="inner-cont">
          <Spin spinning={spinning} tip="压缩中。。。" size='large'>
          <DetailLine {...detail}></DetailLine>
          <DataTable {...tableProps} />
          </Spin>
        </Row>
        <MemoModal {...memoModalSetting}/>
        <ImportModal {...importModalSetting}/>
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
    detail: state['package/detail'],
    loading: state.loading.effects,
  }
}

export default connect(mapStateToProps)(Detail)
