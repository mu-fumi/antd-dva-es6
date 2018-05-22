import React from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Tag } from 'antd'
import MyTag from './checkableTag'
import styles from './tagBox.less'

const { CheckableTag } = Tag

class TagBox extends React.Component {
  constructor(props){
    super(props)
    this.checkSpread = this.checkSpread.bind(this)
  }
  state = {
    checked: this.props.selectAllTag,
    className: 'tag-box',
    spreadTags: false,
    tagProps: this.props.tagProps, // 如果在父组件更改tagProps，通过componentWillReceiveProps检测不到tagProps的变化
    showSpread: false
  }

  componentDidMount(){
    this.checkSpread()
    window.addEventListener('resize', this.checkSpread);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkSpread);
  }

  componentWillReceiveProps(nextProps) {
    this.checkSpread()
    // console.log(this.props.selectAllTag && !nextProps.selectAllTag)
    if (this.props.selectAllTag && !nextProps.selectAllTag) {   //  清除
      this.setState({ checked: false })
      // this.props.tagProps.handleClick('none')
    }
  }

  checkSpread() {  //  获取监控项计算高度，如果超出一行，就显示展开
    // console.log('nextProps===>', nextProps)
    // const itemHeight = document.getElementById("itemHeight")
    // console.log(itemHeight, this.itemHeight)
    const height = window.getComputedStyle(this.itemHeight, null).height
    // console.log(height)
    if (Number(height.replace('px', '')) > 30) {
      this.setState({
        showSpread: true
      })
    } else {
      this.setState({
        showSpread: false
      })
    }
  }

  render() {
    const { label, tags, selectAllTag, clearTags } = this.props

    const spreadTags = () => {
      this.setState({
        className: 'tag-box spread',
        spreadTags: true
      })
    }

    const unspreadTags = () => {
      this.setState({
        className: 'tag-box',
        spreadTags: false
      })
    }

    const removeTags = () => {
      this.setState({
        tagProps: { ...this.state.tagProps, removeAllTags: true }
      })
      clearTags()
      this.props.handleSelectAllTag(false)  // 更新视图层对应那个全部选中状态
    }

    const afterRemoveAll = () => {
      this.setState({
        tagProps: { ...this.state.tagProps, removeAllTags: false}
      })
    }

    const myTagProps = {
      ...this.state.tagProps,
      afterRemoveAll    //  清除完后removeAlltags要变为false
    }

    const selectAll = (checked) => {
      this.setState({ checked })  // 全选状态
      this.setState({  // 全选或全不选时其他tag都不选
        tagProps: { ...this.state.tagProps, removeAllTags: true }
      })
      if (checked) {  //  全选更新model值
        this.props.handleSelectAllTag(true)   // 更新视图层对应那个全部选中状态
        this.props.selectAllTags()   //  model层对应application全选
      } else {  //  全不选更新model值
        this.props.handleSelectAllTag(false)  // 更新视图层对应那个全部选中状态
        clearTags()  //  model层对应application全部反选
      }
    }

    // console.log(this.state.checked)

    return <Row className={styles.tagbox}>
      <Col span={24} className="tags">
        <Col span={2} className="text-right label">
          <span className="mgr-8">{label}</span>
        </Col>
        <Col span={22} className={this.state.className}>
          <Col span={23}>
            <div id="itemHeight" ref={(height) => {this.itemHeight = height}}>
              <CheckableTag key='all' checked={this.state.checked} onChange={selectAll}>全部</CheckableTag>
              {
                tags.map((v) => { // 直接用checkableTag,然后在handleChange里面传v，k都会栈溢出。。y。。
                  return <MyTag key={v.tag} {...myTagProps}>{v.tag}</MyTag>
                })
              }
            </div>
          </Col>
          <Col span={1} style={{ display: this.state.showSpread ? '' : 'none' }}>
            <span className="button" style={{ display: this.state.spreadTags ? 'none' : '' }} onClick={spreadTags}>展开</span>
          </Col>
        </Col>
      </Col>
      <Col span={24} className="unspread" style={{ display: this.state.spreadTags ? '' : 'none' }}>
        <span className="button" onClick={removeTags}>清空</span>
        <span className="ant-divider"></span>
        <span className="button" onClick={unspreadTags}>收起</span>
      </Col>
    </Row>
  }
}

TagBox.propTypes = {
  label: PropTypes.string,
  tags: PropTypes.array,
  clearTags: PropTypes.func,
}

export default TagBox
