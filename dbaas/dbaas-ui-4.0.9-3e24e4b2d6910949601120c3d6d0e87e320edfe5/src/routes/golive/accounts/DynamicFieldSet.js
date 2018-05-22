
import React from 'react'
import PropTypes from 'prop-types'
import { Form, Input, Icon, Button, Row, Col, Select, Tooltip } from 'antd';
import { DataTable, Filter, IconFont } from 'components'
import { PRIVILEGES, GLOBAL_PRIVILEGES} from 'utils/constant'
const FormItem = Form.Item;
const Option = Select.Option

let uuid = 1;
class DynamicFieldSet extends React.Component {
  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(uuid);
    uuid++;
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    // console.log(this.props)
    const permissions = {}
    // permissions['*'] = '全部'
    PRIVILEGES.map(v => { permissions[v] = v })
    GLOBAL_PRIVILEGES.map(v => {
      permissions[v] = (
        <Tooltip key={v} placement="right" title={<span className="word-wrap">GLOBAL PRIVILEGE</span>}>
          <span>
            <IconFont type="iconfont-global-privileges"/>
            {v}
          </span>
        </Tooltip>
      )
    })

    // console.log(permissions)
    const checkName = (rule, value, callback) => {
      if (value === '*') {
        callback()
        return
      }
      if (this.props.checkName) {
        this.props.checkName(rule, value, callback)
      }
    }

    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 24, offset: 0 },
      },
    }
    getFieldDecorator('keys', { initialValue: this.props.keys });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => {
      return (
      <Row key={k} >
          <FormItem
            style={{width: '40%', marginRight: '5%', float: 'left'}}
            {...formItemLayoutWithOutLabel}
            key={`databases[${k}]`}
          >
            {getFieldDecorator(`databases[${k}]`, {
              // validateTrigger: ['onChange', 'onBlur'],
              initialValue: this.props.databases[k],
              rules: [{
                required: true,
                // whitespace: true,
                message: "请输入数据库",
              }, {
                validator: checkName
              }],
            })(
              <Input placeholder="请输入数据库" style={{ marginRight: 8 }} />
            )}
          </FormItem>
          <FormItem
            style={{width: '55%', float: 'left'}}
            {...formItemLayoutWithOutLabel}
            key={`permissions[${k}]`}
          >
            {getFieldDecorator(`permissions[${k}]`, {
              // validateTrigger: ['onChange', 'onBlur'],
              initialValue: this.props.permissions[k],
              // onChange: handlePermissions,
              rules: [{
                required: true,
                // whitespace: true,
                message: "请选择权限",
                 }],
             })(
              <Select mode="multiple" placeholder="请选择权限" style={{ width: '90%', marginRight: 8 }}>
                {
                  Object.keys(permissions).map(v => {
                    return <Option key={v} value={v} title=''>{permissions[v]}</Option>
                  })
                }
              </Select>
             )}
            {keys.length > 1 ? (
               <Icon
                 className="dynamic-delete-button"
                 type="minus-circle-o"
                 disabled={keys.length === 1}
                 onClick={() => this.remove(k)}
               />
             ) : null}
           </FormItem>
       </Row>
      );
    });
    return (
      <div>
        {formItems}
        <FormItem {...formItemLayoutWithOutLabel}>
          <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
            <Icon type="plus" /> 添加授权数据库
          </Button>
        </FormItem>
      </div>
    );
  }
}

DynamicFieldSet.propTypes = {
  form: PropTypes.object,
  keys: PropTypes.array,
  databases: PropTypes.array,
  permissions: PropTypes.array,
  checkName: PropTypes.func
}


export default DynamicFieldSet
// .dynamic-delete-button {
//   cursor: pointer;
//   position: relative;
//   top: 4px;
//   font-size: 24px;
//   color: #999;
//   transition: all .3s;
// }
// .dynamic-delete-button:hover {
//   color: #777;
// }
// .dynamic-delete-button[disabled] {
//   cursor: not-allowed;
//   opacity: 0.5;
// }
