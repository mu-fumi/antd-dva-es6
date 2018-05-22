/**
 *
 * @copyright(c) 2017
 * @created by lizzy
 * @package dbaas-ui
 * @version :  2017-09-5 21:28 $
 */

import React from 'react'
import PropTypes from 'prop-types'
import { classnames, Logger } from 'utils'
import { DataTable, IconFont } from 'components'
import { Modal, Tabs, Table, Button } from 'antd'
import styles from './sqlModal.less'

const TabPane = Tabs.TabPane

class SqlModal extends React.Component {

  render() {

    const { visible, text, sql, operation, modalType, onOk, onCancel } = this.props

    const modalOpts = {
      title: modalType,
      visible,
      onOk,
      onCancel,
      wrapClassName: 'vertical-center-modal',
      // width: 'auto',
      // style: {maxWidth: '60%'},
      footer: <Button onClick={onCancel}>取消</Button>
    }

    if(modalType === 'SQL 语句'){  //  sql语句modal框内容比较多
      modalOpts.width = 'auto' //  加上这个maxWidth才生效
      modalOpts.style= {maxWidth: '60%'}
    }

    // operation:{
    //  webcron: {
    //    t_group: ["INSERT", "REPLACE"]
    //  },
    //  test: {
    //    table: ["INSERT", "REPLACE"],
    //    txt: ["INSERT", "REPLACE"],
    //  }
    // }

    // operation可能为undefined，[]，或者非空对象
    const databases = operation === undefined || Array.isArray(operation) ? [] :Object.keys(operation)

    let tables = []

    databases.forEach((v) => {
      let tableList = Object.keys(operation[v])  // ['table', 'txt']
      tableList = tableList.map((k) => {  //  {table: table, database: test, operation: INSERT, REPLACE}
        return { table:k, database:v, operation: operation[v][k].join(', ') }
      })
      tables = tables.concat(tableList)
    })

    const dataSource = tables.map((v, k) => {  // 每个表占一行，所以以表进行遍历
      return {
        key: k,
        database: v.database,
        table: v.table,
        operation: v.operation
      }
    })

    const columns = [{
      title: '库',
      dataIndex: 'database',
      key: 'database',  // render的参数row只是当前行，所以无法获取当前页面所有库，所以无法进行比较并合并行
    }, {
      title: '表',
      dataIndex: 'table',
      key: 'table',
    }, {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
    }];

    const title = () => '操作分析'
    return (
      <Modal {...modalOpts} className={styles['sql-modal']}>
        {text ?
          <pre>{text}</pre>
          :
          <form>
            {databases.length !== 0 ?
              <Table dataSource={dataSource} columns={columns} title={title}
                     size="small" bordered={true}/>
              :
              ''
            }
            {sql ?
              <pre>{sql}</pre>
              :
              ''
            }
          </form>
        }
      </Modal>
    )
  }
}

SqlModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func,
  modalType: PropTypes.string,
  onOk: PropTypes.func,
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  ddl: PropTypes.string,
  dml: PropTypes.string,
}

export default SqlModal
