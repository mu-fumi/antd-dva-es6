import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'dva'
import { Row, Col, Card } from 'antd'
import styles from './index.less'
import { color, Cache } from 'utils'
const cache = new Cache('cookie')

function Dashboard ({ dashboard }) {
  // interact('#drag')
  //   .draggable({
  //     // enable inertial throwing
  //     inertia: true,
  //     // keep the element within the area of it's parent
  //     restrict: {
  //       restriction: "parent",
  //       endOnly: true,
  //       elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
  //     },
  //     // enable autoScroll
  //     autoScroll: true,
  //     axis: 'x',
  //
  //     // call this function on every dragmove event
  //     onmove: dragMoveListener,
  //     // call this function on every dragend event
  //     onend: function (event) {
  //       var textEl = event.target.querySelector('p');
  //
  //       textEl && (textEl.textContent =
  //         'moved a distance of '
  //         + (Math.sqrt(Math.pow(event.pageX - event.x0, 2) +
  //           Math.pow(event.pageY - event.y0, 2) | 0))
  //           .toFixed(2) + 'px');
  //     }
  //   })
  //   .resizable({
  //     edges: {
  //       top   : false,       // Use pointer coords to check for resize.
  //       left  : true,      // Disable resizing from left edge.
  //       bottom: '.resize-s',// Resize if pointer target matches selector
  //       right : true    // Resize if pointer target is the given Element
  //     },
  //   })
  //
  //
  // function dragMoveListener (event) {
  //   var target = event.target,
  //     // keep the dragged position in the data-x/data-y attributes
  //     x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
  //     y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  //
  //   // translate the element
  //   target.style.webkitTransform =
  //     target.style.transform =
  //       'translate(' + x + 'px, ' + y + 'px)';
  //
  //   // update the posiion attributes
  //   target.setAttribute('data-x', x);
  //   target.setAttribute('data-y', y);
  // }
  //
  // // this is used later in the resizing and gesture demos
  // window.dragMoveListener = dragMoveListener;
  //
  // function resizeCanvases () {
  //   [].forEach.call(document.querySelectorAll('.rainbow-pixel-canvas'), function (canvas) {
  //     canvas.width = document.body.clientWidth;
  //     canvas.height = window.innerHeight * 0.7;
  //   });
  // }

  {/*<Row id="drop" style={{width: '500px', height: '200px', border: '1px solid #000'}} gutter={24}>*/}
  {/*<div id="drag" style={{width: '50px', height: '20px', border: '1px solid #000'}}>hello</div>*/}

  {/*</Row>*/}
  const getGreeting = () =>{
    let greeting = ""
    let hour = new Date().getHours()
    switch (true)
    {
      case hour < 6:
        greeting = "凌晨";
        break;
      case hour < 9:
        greeting = "早上";
        break;
      case hour < 12:
        greeting = "上午";
        break;
      case hour < 14:
        greeting = "中午";
        break;
      case hour < 17:
        greeting = "下午";
        break;
      case hour < 19:
        greeting = "傍晚";
        break;
      case hour < 22:
        greeting = "晚上";
        break;
      default :
        greeting = "夜里";
    }
    return greeting;
  }

  return (
    <Row gutter={24}>
      <div style={{fontSize:"20px",color:"rgba(0, 0, 0, 0.85)"}}>{getGreeting()}好，{cache.get('username')}，欢迎登录DBaas管理系统！</div>
    </Row>
  )
}

Dashboard.propTypes = {
  dashboard: PropTypes.object,
}

export default connect(({ dashboard }) => ({ dashboard }))(Dashboard)
