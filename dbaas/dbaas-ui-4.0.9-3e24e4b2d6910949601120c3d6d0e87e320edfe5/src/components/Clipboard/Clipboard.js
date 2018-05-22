/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-05-22 17:08 $
 */
import React from 'react'
import PropTypes from 'prop-types'
import Clipboard from 'clipboard'

class ClipboardComponent extends React.Component {

  propsWith(regexp, remove=false) {
    const object = {}

    Object.keys(this.props).forEach(function(key) {
      if (key.search(regexp) !== -1) {
        const objectKey = remove ? key.replace(regexp, '') : key
        object[objectKey] = this.props[key]
      }
    }, this)

    return object
  }

  componentDidMount() {
    // Support old API by trying to assign this.props.options first;
    const options = this.props.options || this.propsWith(/^option-/, true)
    const element = React.version.match(/0\.13(.*)/)
      ? this.refs.element.getDOMNode() : this.refs.element

    this.clipboard = new Clipboard(element, options)

    const callbacks = this.propsWith(/^on/, true) //支持 onXXX 回调
    Object.keys(callbacks).forEach(function(callback) {
      this.clipboard.on(callback.toLowerCase(), this.props['on' + callback])
    }, this)

  }

  componentWillUnmount() {
    this.clipboard && this.clipboard.destroy()
  }

  render() {
    const { className = '', style = {}, onClick } = this.props
    const props = {
      className,
      style,
      onClick,
      ref: 'element',
      ...this.propsWith(/^data-/), //支持 HTML5 data attributes, data-clipboard-xxx
    }
    return <div { ...props }>
      {this.props.children}
    </div>
  }
}

ClipboardComponent.PropTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ])
}

export default ClipboardComponent