import React from 'react'
import ReactDOM from 'react-dom'
import Menu from 'components/Menu'
import PageInfo from 'components/PageInfo'

import './product.css'
import productPicture from './product-logo.png'

ReactDOM.render(<Menu />, document.getElementById('menu'))
ReactDOM.render(<PageInfo />, document.getElementById('pageInfo'))
document.getElementById('product-pic').setAttribute('src', productPicture)
