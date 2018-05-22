import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import styles from './Search.less'
import { Input, Select, Button, Icon, Form } from 'antd'

const SearchInput = Input.Search
const FormItem = Form.Item

class Search extends React.Component {
  state = {
    clearVisible: false,
    selectValue: (this.props.select && this.props.selectProps) ? this.props.selectProps.defaultValue : '',
    errorMsg: null,
    validateStatus: 'success',
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.validate !== nextProps.validate) {    //  验证结果变化时触发验证状态变化
      this.handleValidate(nextProps.validate)
    }
  }

  handleSearch = (value) => {
    if (this.props.onSearch) this.props.onSearch(value)
  }

  handleValidate = (validate) => {  //  validate = '请输入至少两个字符' / false / 其他任何从页面传给search的validate
    if (validate) {
      this.setState({
        errorMsg: validate,
        validateStatus: 'error',
      })
    } else {
      this.setState({
        errorMsg: null,
        validateStatus: 'success',
      })
    }
  }

  handleInputChange = e => {
    this.setState({
      ...this.state,
      clearVisible: e.target.value !== '',
    })
    if(this.props.onChange){
      this.props.onChange(e)
    }
  }

  handeleSelectChange = value => {
    this.setState({
      ...this.state,
      selectValue: value,
    })
  }

  render() {
    const {
      size='default', select=false, selectOptions=[],
      selectProps, style, keyword, compact=false, placeholder='', validate=false } = this.props

    return (
      <Input.Group compact={compact} size={size} className={styles.search} style={style}>
        {
          select &&
          <Select onChange={this.handeleSelectChange} size={size} {...selectProps}>
            { selectOptions.map((item, key) =>
              <Select.Option value={item.value} key={key}>{item.name || item.value}</Select.Option>)}
          </Select>
        }
        <FormItem help={this.state.errorMsg} validateStatus={this.state.validateStatus}>
          <SearchInput
            ref="searchInput"
            placeholder={placeholder}
            size={size}
            onSearch={this.handleSearch}
            onChange={this.handleInputChange}
            defaultValue={keyword}
            enterButton
          />
        </FormItem>
      </Input.Group>
    )
  }
}


Search.propTypes = {
  size: PropTypes.string,
  select: PropTypes.bool,
  selectProps: PropTypes.object,
  onSearch: PropTypes.func,
  selectOptions: PropTypes.array,
  style: PropTypes.object,
  keyword: PropTypes.string,
  placeholder: PropTypes.string,
}

export default Search





