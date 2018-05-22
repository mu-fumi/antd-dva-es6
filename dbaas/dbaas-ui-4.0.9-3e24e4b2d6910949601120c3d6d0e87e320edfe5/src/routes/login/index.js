import React from 'react';
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Form, Input, Button, Icon } from 'antd'
import styles from './index.less'
import NProgress from 'nprogress'

const FormItem = Form.Item

const Login = ({
                 dispatch,
                 app,
                 form: {
                   getFieldDecorator,
                   validateFieldsAndScroll,
                 },
               }) => {
  const { loginLoading } = app
  if(!loginLoading){
    NProgress.done()
  }
  function handleSubmit (e) {
    e.preventDefault()  //  不阻止表单默认提交则提交到本页，默认刷新页面
    validateFieldsAndScroll((errors, values) => {
      if (errors) {
        return
      }
      values.email = values.email.replace(/(^\s*)|(\s*$)/g, "")  //  去除首尾多余空格
      dispatch({
        type: 'app/login',
        payload: values
      })
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.header}>
          <div>
            <img alt="" className={styles.logo} src="https://gw.alipayobjects.com/zos/rmsportal/NGCCBOENpgTXpBWUIPnI.svg"/>
            <span className={styles.title}>DBaaS</span>
          </div>
        </div>
        <p className={styles.desc}>DBaaS 先进的数据库管理平台</p>
      </div>
      <div className={styles.main}>
        <Form onSubmit={handleSubmit.bind(this)}>
          <FormItem>
            {getFieldDecorator('email', {
              rules: [
                {
                  required: true,
                  message: '请填写用户名',
                },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="user" className={styles.prefixIcon} />}
                placeholder="用户名"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                {
                  required: true,
                  message: '请填写密码',
                },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="lock" className={styles.prefixIcon} />}
                type="password"
                placeholder="密码"
              />
            )}
          </FormItem>
          <FormItem className={styles.additional}>
            <Button size="large" loading={loginLoading} className={styles.submit} type="primary" htmlType="submit">
              登录
            </Button>
          </FormItem>
        </Form>
      </div>
      <div className={styles.footer}>
        <div className={styles.copyright}>
          <div>Copyright
            <i className="anticon anticon-copyright"></i>
            2017 华成峰数据库产品部出品
          </div>
        </div>
      </div>
    </div>
  )
}

Login.propTypes = {
  form: PropTypes.object,
  loginLoading: PropTypes.bool,
  onOk: PropTypes.func,
}

export default connect(({app}) =>({ app }))(Form.create()(Login))  // 要共用loginsuccess等，所以直接跟app关联
