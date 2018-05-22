/**
 * Created by zhangmm on 2017/7/5.
 */
import { getVersionList } from 'services/package'
import { message } from 'antd'

export default {
  namespace:'package/fileList',
  state:{
    versionList:["林丹","李宗伟","谌龙","王适娴"]
  },
  reducers:{
  },
  effects:{
    *getVersionList({payload} , {call , put}){
      let res = yield call(getVersionList , payload)
      if(res.code === 0){
        message.success("文件新增成功")
      }else{
        message.error(res.msg)
      }
    },
  },
  subscriptions:{}
}
