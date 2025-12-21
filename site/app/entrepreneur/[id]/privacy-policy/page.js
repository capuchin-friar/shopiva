"use client"
import React, { useEffect } from 'react'
import './styles/xxl.css'
import './global.css'


import Head from '../../../../components/entrepreneur/privacy_policy/Head'
import Body from '../../../../components/entrepreneur/privacy_policy/Body'
export default function PrivacyPolicy() { 

    useEffect(() => {
        document.body.style.background='#fff'
        document.querySelector('header').style.position='sticky'
        document.querySelector('header').style.top='0px'
        document.querySelector('header').style.height='70px'
    }, [])
  return (
    <>
      <div className="privacy-policy-cnt">
        <Head />

        <Body />
       
      </div>
    </>
  )
}
