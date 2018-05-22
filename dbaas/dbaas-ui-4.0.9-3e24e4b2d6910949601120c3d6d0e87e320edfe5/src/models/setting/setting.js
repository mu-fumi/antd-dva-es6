/**
 * Created by zhangmm on 2017/9/6.
 */
import { editSetting } from 'services/setting'
import { Link , browserHistory } from 'dva/router'
import { message, Modal, Row } from 'antd'
import pathToRegexp from 'path-to-regexp'

export default {
  namespace:'setting',
  state:{
    old_password:'',
    password:'',
    password_confirmation:'',
  },
  reducers:{
    handleReset (state) {
      return {
        ...state,
        old_password:'',
        password:'',
        password_confirmation:'',
      }
    },
  },
  effects:{
    *editSetting({payload} , {call , put}){
      let res = yield call(editSetting , payload)
      if(res.code === 0){
        yield put({type:'handleReset'})

        Modal.info({
          title: '提示',
          content: (
            <Row>
              <span>新密码设置成功，请在下次登录时使用新密码进行登录。</span>
            </Row>
          ),
          onOk() {},
        })
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{
  }
}
