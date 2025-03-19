import React from 'react'
import Sidebar from './Sidebar'
import './City.css'

export const City = () => {
  return (
    <div className='city'>
        <Sidebar activeId={6}/>
        <h1>City</h1>
    </div>
  )
}
