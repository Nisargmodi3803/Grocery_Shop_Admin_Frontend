import React from 'react'
import Sidebar from './Sidebar'
import './Blog.css'

export const Blog = () => {
  return (
    <div className='blog'>
        <Sidebar activeId={9}/>
        <h1>Blog</h1>
    </div>
  )
}
