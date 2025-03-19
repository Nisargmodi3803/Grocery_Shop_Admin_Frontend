import React from 'react'
import './Welcome.css'
import Sidebar from './Sidebar'

export const Welcome = () => {
  return (
    <div className='welcome'>
        <Sidebar/>
        <h1>WELCOME TO ADMIN PANEL</h1>
    </div>
  )
}
