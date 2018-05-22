/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-07-28 12:22 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import { Button, Row, Form, Input } from 'antd'
import { connect } from 'dva'


class Design extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: `app/handlePageBtn`,
      payload: <Button type="primary">Primary</Button>,
    })
  }
  render(){
    return (
      <div>
        <Button type="primary">Primary</Button>
        <Button>Default</Button>
        <Button type="dashed">Dashed</Button>
        <Button type="danger">Danger</Button>
        <Button type="warning">warning</Button>
        <Button type="success">success</Button>
      </div>
    )
  }
}

export default connect(({app}) =>({ app }))(Design)