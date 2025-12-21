"use client"
import React, { useEffect } from 'react'
import './styles/xxl.css'
import './global.css'


import Head from '../../../../components/entrepreneur/term_of_use/Head'
import Body from '../../../../components/entrepreneur/term_of_use/Body'
export default function TermOfUse() { 

    useEffect(() => {
        document.body.style.background='#fff'
        document.querySelector('header').style.position='sticky'
        document.querySelector('header').style.background='#000'
        document.querySelector('header').style.top='0px'
        document.querySelector('header').style.height='70px'
    }, [])
  return (
    <>
      <div className="tou-cnt">
        <Head />

        <Body />
       
      </div>
    </>
  )
}
