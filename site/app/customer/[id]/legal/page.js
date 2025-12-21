"use client"
import React, { useEffect } from 'react'
import './styles/xxl.css'
import './global.css'


import Head from '../../../../components/entrepreneur/legal/Head'
import Body from '../../../../components/entrepreneur/legal/Body'
export default function Legal() { 

    useEffect(() => {
        document.body.style.background='#fff'
        document.querySelector('header').style.height='70px'
    }, [])
  return (
    <>
      <div className="legal-cnt">
        <Head />

        <Body />
       
      </div>
    </>
  )
}
