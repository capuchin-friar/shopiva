"use client"
import React, { useEffect } from 'react'
import './styles/xxl.css'
import './styles/s.css'
import './global.css'


import '../styles/s.css'
import '../styles/m.css'
import '../styles/l.css'
import '../styles/xl.css'
import '../styles/xxl.css'


import Head from '../../../../components/entrepreneur/about/Head'
import Story from '../../../../components/entrepreneur/about/Story'
import Mission from '../../../../components/entrepreneur/about/Mission'
import Commitment from '../../../../components/entrepreneur/about/Commitment'
export default function About() { 

    useEffect(() => {
        document.body.style.background='#00b688'
        document.body.querySelector('main').style.background='#00b688'
        document.querySelector('header').style.height='70px'
    }, [])
  return (
    <>
      <div className="pricing-cnt">

        <Head />

        <Story />
       
        <Mission />

        <Commitment />

      </div>
    </>
  )
}
