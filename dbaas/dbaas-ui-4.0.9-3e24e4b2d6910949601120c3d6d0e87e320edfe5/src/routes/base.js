/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-08-04 18:45 $
 */

import React from 'react'
import PropTypes from 'prop-types'
//import { browserHistory, Link } from 'dva/router'
import createHistory from 'history/createBrowserHistory'
import { IconFont } from 'components'

class Base extends React.Component {
  static DidMount = 1
  static WillUnmount = 2

  constructor(props) {
    super(props)
    this.events = {} // {'app/handlePageBtns':[event1, event2]}
  }

  handleBack(){
    if(history.length === 1){
      location.href = '/dashboard'
    }else{
      createHistory().go(-1)
    }
  }

  setGobackBtn() {
    this.gobackBtn = {
      element: ()=>{
        return <a href="javascript:void(0);" onClick={this.handleBack.bind(this)}>
        <IconFont type="rollback"/>
      </a>
      }
    }
  }

  get gobackBtn(){
    return this._gobackBtn;
  }

  set gobackBtn(btn){
    this._gobackBtn = btn;
    this.push({ type: 'app/handleGobackBtn', payload: btn })
  }

  get pageTips(){
    return this._pageTips;
  }

  set pageTips(tips){
    this._pageTips = tips;
    this.push({ type: 'app/handlePageTips',  payload: tips })
  }


  get pageBtns(){
    return this._pageBtns;
  }

  set pageBtns(btns){
    this._pageBtns = btns;
    this.push({ type: 'app/handlePageBtns',  payload: btns })
  }

  /**
   * push event
   * @param event = { type, payload=null, fire=[Base.DidMount, Base.WillUnmount], clear=true, overload=false }
   * type required
   */
  push(event:object) {
    if(!('type' in event)){
      throw new Error('type must be required.')
    }
    const defaultEvent = {
      payload: null,
      fire: [Base.DidMount, Base.WillUnmount],
      clear: true,
      overload: false
    }
    const finalEvent = {...defaultEvent,...event }
    let events = this.events[finalEvent.type] || []

    if(finalEvent.overload){ //overload 的话只保留这个
      events = [finalEvent]
    }else{
      events.push(finalEvent)
    }

    this.events[finalEvent.type] = events
  }

  componentDidMount(){
    const { dispatch }  = this.props

    dispatch && Object.keys(this.events).map((index)=>{
      const events = this.events[index]
      events && events.map((v)=>{
        v.fire.includes(Base.DidMount) && (v.defer ? setTimeout(() => dispatch(v), 100) : dispatch(v))
      })
    })
  }

  componentWillUnmount(){
    const { dispatch }  = this.props
    // debugger
    dispatch && Object.keys(this.events).map((index)=>{
      const events = this.events[index]
      events && events.map((v)=>{
        if(v.clear){
          if (v.payload && typeof v.payload === 'object'){ //得清掉具体item的值,但是又得保留结构
            Object.keys(v.payload).map((key)=>{
              v.payload[key] = null
            })
          }else{
            v.payload = null
          }
        }
        v.fire.includes(Base.WillUnmount) && dispatch({type: v.type, payload:v.payload})
      })
    })
    this.events = {}
  }
}

export default Base
