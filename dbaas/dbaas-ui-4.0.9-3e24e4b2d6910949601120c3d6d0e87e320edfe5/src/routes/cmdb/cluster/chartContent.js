/**
 * Created by wengyian on 2017/12/1.
 */

import Base from 'routes/base'
import PropTypes from 'prop-types'
import {classnames, constant, TimeFilter} from 'utils'
import Graph from './graph'
import HCFGraph from './hcf2Graph'
import { Logger } from 'utils'

function ChartContent(obj){
  const { nodes, relateType } = obj

  if (!nodes) {
    return null
  } else {
    const keys = Object.keys(nodes)
    if (keys.includes('spider') || keys.includes('backend')) {
      return <HCFGraph {...obj}/>
    } else {
      return <Graph {...obj}/>
    }
  }
}

ChartContent.propTypes = {
  obj : PropTypes.object
}

export default ChartContent

