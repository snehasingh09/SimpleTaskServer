import React from 'react'
import style from './PageInfo.css'

function PageInfo (props) {
  const url = new URL(window.location.href)
  return (
    <ul className={style.PageInfo}>
      <li>URL: {window.location.href}</li>
      <li>Path: {window.location.pathname}</li>
      <li onClick={() => { console.log(url) }}>{url.toString()}</li>
    </ul>
  )
}

export default PageInfo
