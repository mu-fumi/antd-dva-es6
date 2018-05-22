/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-08 12:21 $
 */
import ReactEcharts from 'echarts-for-react'
import React from 'react'
import PropTypes from 'prop-types'
import { Table, message } from 'antd'
import { request, Logger } from 'utils'
import * as moment from 'moment'
import _ from 'lodash'
import { SUMMARY_HOVER_LINK } from 'utils/constant'
import { routerRedux, Link } from 'dva/router'

class Echart extends React.Component {

  constructor(props) {
    super(props);

    this.timeFormat = 'YYYY-MM-DD HH:mm:ss'
    this.axisLine = {
      show: true,
      onZero: true,
      lineStyle: {
        color: '#333',
        width: 0.3,
        type: 'solid' //x 轴线样式
      }
    }

    this.splitLine = {
      lineStyle: {
        // 使用深浅的间隔色
        color: ['#eee'],
          type: 'dashed'
      }
    }

    this.option =  {
        title: {
          text: '',
          subtext: '',
          textStyle:{
            color: '#666',
            textAlign: 'center',
            fontSize: 12,
            fontFamily: '"Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif'
          },
        },
        tooltip: {
          trigger: 'axis',
          formatter: (params) => {
            let tips = [];
            if(params.length > 0){
              tips.push(`<div>${params[0].axisValue}</div>`)
            }
            for(let i=0; i < params.length; i++){
              const item = params[i]
              if(item.seriesName === '.hidden'){
                continue
              }
              const divStyle = 'display:flex; align-items: center;'
              const spanStyle = 'display:inline-block;border-radius:10px;width:9px;height:9px;margin-right:8px'

              tips.push(`<div style="${divStyle}">`)
              tips.push(`<span style="${spanStyle};background-color:${item.color}">&nbsp;</span>`)
              tips.push(`${item.seriesName}: ${item.value}`)
              tips.push('</div>')
            }
            return tips.join('');
          },
        },
        toolbox: {
          show: true,
          feature: {
            dataZoom: {},
            restore: {}
          },
          right: '30px'
        },
          // primary warn suceess error warn2 info
        color: ['#2db7f5',  '#ffbf00', '#00a854', '#f04134','#f56a00', '#108ee9', '#da70d6', '#2ccdeb', '#ff69b4'],
      // dataZoom: [{
      //   type: 'inside',
      //   start: 0,
      //   end: 10
      // }, {
      //   start: 0,
      //   end: 10,
      //   handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
      //   handleSize: '80%',
      //   handleStyle: {
      //     color: '#fff',
      //     shadowBlur: 3,
      //     shadowColor: 'rgba(0, 0, 0, 0.6)',
      //     shadowOffsetX: 3,
      //     shadowOffsetY: 3
      //   }
      // }],
        legend: { //图例组件, 标记说明不同组件,如多条line, 说明哪条line是什么
          data: [],
          // type: 'scroll',
          // padding: [5, 150]
        },

        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLine: this.axisLine,
          splitLine: this.splitLine
        },
        yAxis: {
          type: 'value',
          axisLine: this.axisLine, // y轴线样式
          splitLine: this.splitLine,
          max: 100,
        },
        grid:  {
          show: false,
          borderColor: '#eee',
          borderWidth: 0.3,
          type: 'dashed'
        },
        series: []
      }

    this.seriesData = {
      name: null,
      type: null,
      symbolSize: 8, // 点大小
      hoverAnimation: false,
      lineStyle: { // 线条样式
        normal: {
          width: 0.6,
          type: 'solid',
        }
      },
      radius: '90%',
      axisLine: {            // 坐标轴线
        lineStyle: {       // 属性lineStyle控制线条样式
          color: [[0.09, '#00a854'],[0.82, '#2db7f5'],[1, '#f04134']],
          width: 2,
        }
      },
      axisLabel: {            // 坐标轴小标记
        textStyle: {       // 属性lineStyle控制线条样式
          fontWeight: 'bolder',
          color: 'auto',
        }
      },
      axisTick: {            // 坐标轴小标记
        length :15,        // 属性length控制线长
        lineStyle: {       // 属性lineStyle控制线条样式
          color: 'auto',
        }
      },
      splitLine: {           // 分隔线
        length :25,         // 属性length控制线长
        lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
          width:3,
          color: 'auto',
        }
      },
      pointer: {           // 分隔线
      },
      title : {
        show: false,
        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          fontWeight: 'bolder',
          fontSize: 20,
          color: 'auto',
        }
      },
      detail : {
        textStyle: {       // 其余属性默认使用全局文本样式，详见TEXTSTYLE
          // fontWeight: 'bolder',
          // color: '#fff'
          fontSize: 14
        }
      },
      animationDuration: () => {
        // 越往后的数据延迟越大
        return 2 * 1000
      },
      data:[]
    }
  }

  timeline(startTime, endTime, timeFormat){
    let data = []
    const startTimeUnix = (+ new Date(startTime))/1000
    const endTimeUnix = (+ new Date(endTime))/1000
    let interval = 60
    const diff = endTimeUnix - startTimeUnix

    if(diff > 60*60*24){
      interval = 300
    }else if(diff > 60*60*24*3){
      interval = 60*60
    }
    for(let timePoint = startTimeUnix; timePoint < endTimeUnix; timePoint+=interval){
      data.push(moment.unix(timePoint).format(timeFormat))
    }
    return data
  }

  insertHiddenSeries(seriesData, type, maxValue ,miniType){
    seriesData['name'] = '.hidden'
    seriesData['type'] = type
    seriesData['showSymbol'] = false
    seriesData['data'] = [type === 'gauge' ? 0 :maxValue]
    //seriesData['itemStyle'] = {normal:{opacity:0}}
    //seriesData['lineStyle'] = {normal:{opacity:0}}

    this.adaptSeries(type, seriesData , miniType)
  }

  detectionData(str) {
  let color = '#87d068';
  if (str >= 50 && str <= 90) {
    color = '#fac450';
  } else if (str > 90) {
    color = '#f50';
  }
  return color;
}

  adaptSeries(type, seriesData , miniType){
    switch (type){
      case 'gauge':
        if(miniType === 'sector'){
           seriesData['startAngle'] = 160
           seriesData['endAngle'] = 20
           seriesData['center'] = ["50%", "65%"]
           seriesData['radius'] = '100%'
           seriesData['axisTick'] = false
           seriesData['splitLine']['show'] = false
           //seriesData['splitNumber'] = 1
           //seriesData['splitLine']['length'] = 0
           seriesData['title']['show'] = false
           seriesData['axisLabel']['show'] = false
           //seriesData['axisLabel']['distance'] = 50
/*           seriesData['axisLabel']['textStyle'] = {
             color:'#999999',
             fontSize:20,
           }*/
           seriesData['axisLine']['lineStyle'] = {
           "width": 78, //柱子的宽度
           "color": [[0, "#E8EAEE"], [1, "#E8EAEE"]] //0.298是百分比的比例值（小数），还有对应两个颜色值
           }
           seriesData.pointer = {
           "width": 8, //指针的宽度
           "length": "115%", //指针长度，按照半圆半径的百分比
           }
           seriesData.itemStyle = {
            normal: {
              color: "rgba(200,200,210, 0.8)",
            }
           }
           seriesData['detail'] = {
             offsetCenter:[0,'-68%'],
             textStyle:{
               color:'#ffffff',
               fontWeight:'bold',
               fontSize:20,
             }
           }
          seriesData['detail']['formatter'] = '{value}%'
/*           seriesData['detail']['offsetCenter'] = [0,'-68%']
           seriesData['detail']['textStyle']['color'] = '#666666'*/
        }else if(miniType === 'circle'){
           seriesData['radius'] = '60%'
           seriesData['startAngle'] = 90
           seriesData['endAngle'] = -269.999
           seriesData['splitNumber'] = 4
           seriesData['axisLabel']['show'] = false
           seriesData['pointer']['show'] = false
           seriesData['axisTick'] = { // 坐标轴小标记
             show:true,
             length: -4, // 属性length控制线长
             lineStyle: { // 属性lineStyle控制线条样式
               color: '#D6DBDF',
             },
             splitNumber:6,
           }
           seriesData['splitLine'] = { // 分隔线
             show:true,
             length: -8, // 属性length控制线长
             lineStyle: { // 属性lineStyle（详见lineStyle）控制线条样式
               width: 1,
               color: '#D6DBDF',
               shadowColor: '#D6DBDF', //默认透明
               shadowBlur: 2,
             }
           }
           seriesData['axisLine'] = { // 坐标轴线
             lineStyle: { // 属性lineStyle控制线条样式
             width: 6,
             color: [[0, "#D6DBDF"],[1,"#D6DBDF"]] //0.298是百分比的比例值（小数），还有对应两个颜色值
           }
           }
           seriesData['detail'] = {
             offsetCenter:[0, 0],
             textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
               fontWeight: 'bold',
               fontSize: 20,
               color: '#666666',
             }
           }
           seriesData['title'] = {
             offsetCenter:[0,'-45%'],
             textStyle: { // 其余属性默认使用全局文本样式，详见TEXTSTYLE
               fontWeight: 'bold',
               fontSize: 9,
               color: '#9999A5',
             }
           }
          seriesData['detail']['formatter'] = '{value}'
        }
        break
      case 'area':
        seriesData['type'] = 'line'
        seriesData['areaStyle'] = {normal: {}}
        break
    }
  }
  legendDate(data){
    let seriesDate = []
    //let unit = ''
    let legendDate = []
    let barDate = []
    //data.forEach((value) => {
      let unit = data.unit
    if(data.values && data.values.length > 0){
      data.values.map((va) => {
        legendDate.unshift(va[0]);
        barDate.unshift(va[1]);
      });
    }

      seriesDate.push({
        name: data.title,
        type: 'bar',
        label: {
          normal: {
            show: true,
            position: 'insideRight'
          }
        },
        data: barDate
      });
   // })
    return {legendDate,seriesDate}
  }

  formatOption(type, data , miniType) {
    /*
    data:
     {
     "key": "cpu_use_rate",
     "title": "cpu利用率",
     "unit": "%",
     "x_format": {time: 'YYYY-MM-DD HH:mm:ss'}, //default
     "y_format": null, //default
     "values": {
      "HCFDB181:8686": [["1494148284","88.36"],
      "HCFDB182:8686": [["1494148284","88.36"],
     }
     */
    let option = this.option

    //默认最大值
    let maxValue = 100
    if(option.yAxis && data['max_value']){
      maxValue = data['max_value']
      option.yAxis.max = maxValue
    }
    //小图最小值
    let minValue = 0
    if(option.yAxis && data['min_value']){
      minValue = data['min_value']
      option.yAxis.min= minValue
    }


    let keys = [], xData = [], series = []

    // x 轴的格式, 默认 time
    let xFormat = '', timeFormat = this.timeFormat
    if(!data['x_format'] || (data['x_format'] && data['x_format']['time'])) { //默认time format
      timeFormat =  data['x_format'] && data['x_format']['time'] ? data['x_format']['time'] : timeFormat
      xFormat = 'time'
    }

    // 默认是 最近 24 小时
    const startTime = data.start_time || moment.unix((+ new Date() - 24*60*60*1000)/1000).format(timeFormat)
    const endTime = data.end_time || moment.unix((+ new Date())/1000).format(timeFormat)
    const defaultXData = this.timeline(startTime, endTime, timeFormat) //默认x 轴 是时间轴

    // data.values 为空, 那么插入隐藏的数据
    if(data.values && data.values.length === 0){
      let seriesData = _.cloneDeep(this.seriesData)

      xData = defaultXData
      this.insertHiddenSeries(seriesData, type, maxValue , miniType)
      series.push(seriesData)
      //if(data.title === '平均时耗曲线图'){
      //  debugger
      //}
    }else{
      let valuesEmptyCount = 0 //还要看看 data.values 里 各个是否全是空

      const values = Object.keys(data.values)

      values.map((v) => {
        const items = data.values[v]

        xData = []
        keys.push(v)

        let seriesData = _.cloneDeep(this.seriesData)
        seriesData['name'] = v
        seriesData['type'] = type
        seriesData['data'] = []

        this.adaptSeries(type, seriesData , miniType)
        if(items.length === 0){
          valuesEmptyCount ++
        }
        items.map((item)=>{
          switch (type){
            case 'gauge':
              if(miniType === 'circle'){
                let color = [[(item[1]/100), this.detectionData(item[1])],[1, "#D6DBDF"]]
                seriesData['axisLine']['lineStyle']['color']=color
              }else if(miniType === 'sector'){
                seriesData['axisLine']['lineStyle']['color'][0][0] = item[1] / 100
                seriesData['axisLine']['lineStyle']['color'][0][1] = this.detectionData(item[1])
              }
              seriesData.data.push({value: item[1], name: data.title || ''})
              break
            default:
              let xItem = item[0]
              switch (xFormat){
                case 'time':
                  xItem = moment.unix(xItem).format(timeFormat)
                  break
              }
              xData.push(xItem)//@todo 按道理应该和 x 轴的点对比下, 让点落在 默认的 x 轴上

              seriesData.data.push(item[1])
          }
        })
        series.push(seriesData)
      })

      if(valuesEmptyCount === values.length){
        //还要看看 data.values 里 各个是否全是空
        xData = defaultXData
        let seriesData = _.cloneDeep(this.seriesData)
        this.insertHiddenSeries(seriesData, type, maxValue , miniType)
        series.push(seriesData)
      }
    }

    option.title.text = data.title + (data.unit ? ` 单位: ${data.unit}` : '') || ''

    switch (type){
      case 'line':
        option.xAxis.data = xData //x轴数据,一般是时间 即 data.values[xx][n][0]
        option.legend.data = keys // 即 data.values 的 key
        option.legend.type = 'scroll' // 图例滚动轴
        option.legend.padding = [5, 150] // 图例内边距
        option.series = series
        break
      case 'bar':
        //option.grid = {bottom:'3%',containLabel:true,left:'3%',right:'4%',top:'40px'}
        option.legend = null
        option.toolbox = null
        option.title = {}
        option.yAxis = {
          type: 'category',
          data: this.legendDate(data).legendDate
        };

        option.xAxis = {
          type: 'value'
        };
        option.grid = {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '40px',
          containLabel: true
        };
        option.tooltip = {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: function (params) {
            let str = '';
            params.forEach((p) => {
              str += p.seriesName + ':' + p.value  + '<br/>';
            });
            return str;
          }

        };
        option.series= this.legendDate(data).seriesDate

        break
      case 'area':
        option.xAxis.data = xData //x轴数据,一般是时间 即 data.values[xx][n][0]
        option.legend.data = keys // 即 data.values 的 key
        option.series = series
        break
      case 'miniLine':   // 查询分析小图专用
        option.xAxis.data = xData //x轴数据,一般是时间 即 data.values[xx][n][0]
        option.legend.data = keys // 即 data.values 的 key
        option['title']['show'] = false
        option['xAxis']['show'] = false
        option['yAxis']['show'] = false
        option['toolbox']['show'] = false
        option['legend']['show'] = false
        option['grid']['top'] = '0'
        option['grid']['bottom'] = '0'
        option.series = series.map((v)=>{
          return {...v, type: 'line'}
        })
        break

      case 'gauge':
        delete option['xAxis']
        delete option['yAxis']

        option.title.textAlign = 'center'
        option.title.left = '50%'
        option.series = series
        option.toolbox.show = false
        option.tooltip = {
          formatter: "{a} <br/>{b} : {c}%"
        }
        if(miniType === 'sector'){
          //.title.text = data.title || ''
          /*option.series.data = {
            name:data.unit
          }*/
          /*option.title.top = 26
          option.title.fontSize = 20*/
          option['title'] = {
            text:data.title || '',
            left:'center',
            top:26,
            textStyle:{
              color:'#999999',
              fontSize:18
            }
          }
        }else if(miniType === 'circle'){
          option['title'] = {
            text:data.unit,
            left:'center',
            top:'60%',
            textStyle:{
              color:'#A8A5C2',
              fontSize:16
            }
          }
        }
        break
      // 为概览页面新增 type summary_line
      case 'summary_line' :
        option.xAxis.data = xData //x轴数据,一般是时间 即 data.values[xx][n][0]
        option.series = series.map((v)=>{
          return {...v, type: 'line'}
        })
        option.tooltip.enterable = true
        option.tooltip.formatter = (params) => {

          let tips = [];

          const key = Object.keys(data.values)[0]

          const show_data = data.values[key][params[0].dataIndex]

          // 如果没有需要展示的数据
          if(!show_data || !show_data[2]){
            return
          }
          let tooltipData = show_data[2] //要展示的信息在接口数据values的第三位
          const keys = Object.keys(tooltipData)

          keys.map((item) => {
            let divStyles = 'border-bottom : 1px solid #fff'
            let titleSpanStyles = 'display : inline-block; width : 200px; border-right : 1px solid #fff;padding : 4px;'
            let numSpanStyles = 'width: 90px; display : inline-block;;padding : 4px;'
            let linkStyles = 'color : #fff;'
            let content = ''
            // 处理对应项没有数据的情况
            if(tooltipData[item][0] === "" || tooltipData[item][0] === null){
              content = '--'
            }else{
              content = tooltipData[item][0] + '' + tooltipData[item][1]
            }
            if(tooltipData[item][2] === 'warning'){
              numSpanStyles += 'color : #FF6600;'
            }else if(tooltipData[item][2] === 'sufficient'){
              numSpanStyles += 'color : #00CC00;'
            }

            const time = parseInt( new Date(params[0].axisValue).getTime()/1000)
            // 用 data 里面的 start_time - end_time 获取到时间戳
            let point = parseInt(new Date(data.end_time).getTime() - new Date(data.start_time).getTime())
            // let point = ''

            let url = SUMMARY_HOVER_LINK[item] + '?time=' + time + '&point=' + point

            tips.push(`
              <div style="${divStyles}">
                <span style="${titleSpanStyles}"><a href="${url}" target="_blank" style="${linkStyles}">${item}</a></span>
                <span style="${numSpanStyles}">${content}</span>      
                </div>
            `)
          })

          return tips.join('');
        }
        break
    }
    // console.log(option)
    return option
  }

  render() {

    const { type, option = {},miniType, ...props } = this.props

    let newProps = {
      style: {width: '100%', height: type === 'miniLine'? '30px' : '300px'},
      ...props
    }
    const echartsProps = {
      ...newProps,
      option: this.formatOption(type, option , miniType),
      notMerge : true  //  奇葩，居然会保留上次的series
    }
    return  <ReactEcharts { ...echartsProps }/>
  }
}

Echart.propTypes = {
  type: PropTypes.string.isRequired,
  option: PropTypes.object,
}

export default Echart
