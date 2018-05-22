import { Tag } from 'antd'
const { CheckableTag } = Tag

class MyTag extends React.Component {
  state = { checked: false }

  componentWillReceiveProps(nextProps) {
    if (nextProps.removeAllTags) {   //  清除
      this.setState({ checked: false })
      this.props.afterRemoveAll()  //  清除完后removeAlltags要变为false
    }
  }

  handleChange = (checked) => {
    this.props.handleClick(this.props.children)
    this.setState({ checked })
  }

  render() {
    return <CheckableTag {...{children: this.props.children}} checked={this.state.checked} onChange={this.handleChange} />
  }
}

export default MyTag
