/**
 *
 * @copyright(c) 2017
 * @created by  lizzy
 * @package dbaas-ui
 * @version :  2017-08-16 10:41 $
 *fileList只能存model，不能存缓存，缓存后名字不见了
 *
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Upload, Icon, message } from 'antd'
import { request, Cache } from 'utils'

const Dragger = Upload.Dragger

class DragUploader extends React.Component {
  state = {
    fileList: this.props.file, // 从model读取，以便从第二步回到第一步时已上传文件还在
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.startUpload !== nextProps.startUpload) {
      this.handleUpload()
    }
  }

  handleUpload = () => {
    const { fileList } = this.state
    if (!this.props.validateCode(!(fileList.length === 0 && this.props.currentSql === ''))) {
      return false
    }  // 前端验证两个不能同时为空
    const formData = new FormData()
    fileList.forEach((file) => {
      formData.append('sql_upload', file)
    })

    formData.append('sql_input', this.props.currentSql)
    this.props.handlePageLoading(true)

    const url = '/sql-audit/upload'
    const method = 'upload'   // 接口会解析成post
    this.promise = request(url,
      {
        method: method,
        data: formData  // 需要把所有参数都包装在一个formdata中，接口参数才能看到
      }
    ).then((response) => {
      if(response.code !== 0){
        const msg = response.error || response.msg
        message.error(msg)
        this.props.handlePageLoading(false)
        return
      }
      this.props.handleSql(response.data)
      this.setState({
        fileList: [],
      });
      this.props.handlePageLoading(false)
      message.success('上传成功！')
      this.props.next()   // 前后端验证通过才能进入下一步
   })
  }

  render() {
    const draggerProps = {
      action: '/sql-audit/upload',
      onRemove: (file) => {
        // this.setState(({ fileList }) => {   多文件上传情况
        //   const index = fileList.indexOf(file)
        //   const newFileList = fileList.slice()
        //   newFileList.splice(index, 1)
        //   return {
        //     fileList: newFileList,
        //   }
        // })
        this.setState({
          fileList: []
        })
        this.props.validateCode(this.props.currentSql !== '')  // 前端验证两个不能同时为空
      },
      beforeUpload: (file) => {
        // this.setState(({ fileList }) => ({  多文件上传情况
        //   fileList: [...fileList, file],
        // }));

        // 目前想到的是通过文件名后缀判断类型是否正确
        let type = ''
        if (file && file.name) {
          type = (file.name.split('.') || [])[1]
        }
        if ((type !== 'txt') && (type !== 'sql')) {
          message.error('请上传 txt 或者 sql 文件！')
          return false
        }
        //

        this.setState(({ fileList }) => ({
          fileList: [file],
        }));
        this.props.handleFile([file])  //  存入model
        return false;
      },
      fileList: this.state.fileList,
      accept: '.txt,.sql'
    };

    return (
      <div>
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">拖拽文件到此处进行上传</p>
        </Dragger>
      </div>
    )
  }
}

DragUploader.propTypes = {
  startUpload: PropTypes.bool,
  next: PropTypes.func,
  handleSql: PropTypes.func,
}

export default DragUploader
