import React from 'react'
import Sidebar from './Sidebar'
import './Banner.css'

export const Banner = () => {
  return (
    <div className='banner'>
        <Sidebar activeId={11}/>
        <h1>Banner</h1>
    </div>
  )
}
