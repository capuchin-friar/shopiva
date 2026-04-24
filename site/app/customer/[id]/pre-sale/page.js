"use client"
import React, { useEffect } from 'react'
import './styles/s.css'
import './styles/xxl.css'


import '../styles/s.css'
import '../styles/m.css'
import '../styles/l.css'
import '../styles/xl.css'
import '../styles/xxl.css'


export default function PreSale() { 

    useEffect(() => {
        document.body.style.background='#fff'
        document.querySelector('header').style.height='70px'
    }, [])
  return (
    <>
      <div className="pricing-cnt">


       
        
      </div>
    </>
  )
}
