/**
 * Created by wengyian on 2017/6/28.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { Modal, Select, Input, Row } from 'antd'
import { IconFont } from 'components'
import _ from 'lodash'
import styles from './schedulers.less'
import classnames from 'classnames'


const Option = Select.Option
const OptGroup = Select.OptGroup

class ToolModal extends React.Component{

  constructor(props){
    super(props)

    this.state = {
      tools : props.tools,
      visible : props.visible,
      chosenToolItem : props.chosenToolItem
    }
  }

  componentWillReceiveProps(nextProps){

    if(!_.isEqual(nextProps.tools, this.state.tools)
      || this.state.visible !== nextProps.visible
      || !_.isEqual(nextProps.chosenToolItem, this.state.chosenToolItem)){
      this.setState({
        tools : nextProps.tools,
        visible : nextProps.visible,
        chosenToolItem : nextProps.chosenToolItem
      })
    }
  }

  handleSearch(e){
    let value = e.target.value
    if(this.props.handleSearch){
      this.props.handleSearch(value)
    }
  }

  handleClick(item){
    if(this.props.onClick){
      this.props.onClick(item)
    }
  }

  render(){

    const children = () => {
      return this.state.tools.map((item, key) => {
        let className = {}
        if(this.state.chosenToolItem.tool_id === item.tool_id){
          className = "active"
        }
        return (
          <li
            value={item.tool_id}
            key={item.id}
            className={classnames(styles["tool-name-li"], styles[className])}
            onClick={this.handleClick.bind(this, item)}
          >
            <IconFont type={'iconfont-'+item.icon} />
            <span className={styles["tool-name-content"]}>{item.tool_name}</span>
          </li>
        )
      })
    }

    return (
      <Modal
        visible={this.state.visible}
        title={this.props.title}
        footer={this.props.footer}
        className={styles['tool-modal']}
        onCancel={this.props.onCancel}
      >
        <Row>
          <Input
            prefix={<IconFont type="search"/>}
            onChange={this.handleSearch.bind(this)}
          />
        </Row>
        <Row className={styles["mgt-16"]}>
          <ul>
            {children()}
          </ul>
        </Row>
      </Modal>
    )
  }
}

ToolModal.propTypes = {
  visible : PropTypes.bool,
  title : PropTypes.string,
  tools : PropTypes.array,
  chosenToolItem : PropTypes.object,
  onClick : PropTypes.func,
  onCancel : PropTypes.func,
  handleSearch : PropTypes.func,
  footer :PropTypes.element
}

export default ToolModal
