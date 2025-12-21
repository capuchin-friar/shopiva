"use client"
import React from 'react'
import { useEffect, useRef, useState } from 'react';
import fb_svg from '../../../svgs/facebook-svgrepo-com (1).svg'
import gg_svg from '../../../svgs/google-color-svgrepo-com (1).svg'
import tt_svg from '../../../svgs/twitter-svgrepo-com (3).svg'
import logo_img from '../../../images/462832894_122104672550563288_120709183929923776_n.jpg'
import './styles/xxl.css'
import 'react-phone-number-input/style.css'
import country from '../../../reusables/country.json'
import { set_entrepreneur_cookie } from '../../../redux/entrepreneur/entrepreneur_cookie';
import { useDispatch } from 'react-redux';
import { entrepreneur_overlay_setup } from '../../../reusables/overlay';
import axios from 'axios';
import { useSession, signIn, signOut } from "next-auth/react"
import { setNewCookie } from 'app/layout';
 

export default function Signup() {
    const session = useSession();

    const [countries, setcountries] = useState([])
    let dispatch = useDispatch()

    let [fname, setFname] = useState('');
    let [lname, setLname] = useState('');
    let [email, setEmail] = useState('');
    let [provider, setProvider] = useState('');
    let [referral_src, set_referral_src] = useState('');
    let [search_char, set_search_char] = useState('');
    let [country_code, set_country_code] = useState('');
    let [phone_number, setPhone_number] = useState('');
    let [pwd, setPwd] = useState('');
    let [confirm_pwd, set_confirm_pwd] = useState('');
    let [duplicate_err, set_duplicate_err] = useState('')

    const validation = useRef(false);

    useEffect(() => {
        let list = countries.filter(item => item.name.toLowerCase().indexOf(search_char.toLowerCase()) > -1)
        setcountries(list)
        // console.log(search_char, list)
    }, [search_char])

    useEffect(() => {
        setcountries(country)
    }, [])

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const referral = urlParams.get('referral');
        if(referral === ''){
            set_referral_src('website');
        }else{
            set_referral_src(referral);
        }
    }, [])

    // useEffect(() => {
    //     if(referral_src === ''){
    //         set_referral_src('website')
    //     }else{
    //         set_referral_src(referral)
    //     }
    // }, [referral_src])
    
    
    let book = useRef({
        fname: false,
        lname: false,
        email: false,
        pwd: false,
        phn: false
    })

    function addErrMssg(err,pElem) {
            
        let check = pElem.querySelector('.err-mssg');
        if(check){
            pElem.querySelector('.err-mssg').remove()
            let div = document.createElement('div');
            div.className = 'err-mssg';
            // console.log(err)
            if(err.length > 0 ){
                div.innerHTML = err[0].mssg;
                pElem.append(div)
                

            }else{
                
                let check = pElem.querySelector('.err-mssg');

                if(check){
                    pElem.querySelector('.err-mssg').remove()
                }
            }
            
            
        }else{

            let div = document.createElement('div');
            div.className = 'err-mssg';
            // console.log(err)

            if(err.length !== 0 ){
                div.innerHTML = err[0].mssg;
                pElem.append(div)
                

            }else{
                
                let check = pElem.querySelector('.err-mssg');

                if(check){
                    pElem.querySelector('.err-mssg').remove()
                }
            }
        }
     
    }

    let Registration = (e) => {
        // console.log(session)
        try {
            // e.target.disabled = true;
            entrepreneur_overlay_setup(true, 'One Moment Please...')
            Validation();

            // console.log(book.current)
            Object.values(book.current).filter(item => item !== true).length > 0 ? validation.current = false : validation.current = true;
    
            if(validation.current){
               
                // if (pwd === confirm_pwd) {
                    // e.target.disabled = true;
                    fetch('http://localhost:3456/entrepreneur/registration', {
                        method: 'post',
                        headers: {
                            "Content-Type": "Application/json"
                        },
                        body: JSON.stringify({fname,lname,email,pwd,phone_number,referral_src,provider})
                    })
                    .then(async(result) => {
                        let response = await result.json();
                        if(response.bool){
                            setNewCookie(response.cookie, 1) 
                            window.location.href="/entrepreneur/pre-sale"
                            entrepreneur_overlay_setup(false, 'One Moment Please...')
    
                        }else{
                            
                            // overlay.removeAttribute('id');
                            if(response.data.mssg === 'email exists'){
                                // addErrMssg([{mssg:'Email already exist, please try something else'}], document.querySelector('.email').parentElement)
                                set_duplicate_err('Email already exist, please try something else')
                            }else if(response.data.mssg === 'phone exists'){
                                // addErrMssg([{mssg:'Phone Number already exist, please try something else'}], document.querySelector('.phone').parentElement)
                                set_duplicate_err('Phone already exist, please try something else')

                            }
                            // setBtn("Signup")
                            // e.target.disabled = false;
                            entrepreneur_overlay_setup(false, 'Try Again...')
    
                        }
                    })
                    .catch((err) => {
                        // setBtn("Signup")
                        // e.target.disabled = false;
                        entrepreneur_overlay_setup(false, 'One Moment Please...')

                    })
                // }else{

                // }
                
            }else{
                // alert()
                entrepreneur_overlay_setup(false, 'Try Again...')

            }
        } catch (error) {
            console.log(error)
        }
    }

    function Validation() {
        let inputs = [...document.querySelectorAll('input')]
        // let select = [...document.querySelectorAll('select')]
        

        inputs.map(async(item) => {
            if(item.type === 'text'){

                if(item.name === 'fname'){

                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty'}
                    let length = item.value.length > 3 ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please name must be at least 3 letters.'}
                    let specialCharFree = /^[a-zA-Z]+$/.test(item.value.trim()) ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please enter only alphabets.'}
                    let errs = [empty,length,specialCharFree];
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement);
                    let list =errs.filter(item => item.mssg !== '')

                    list.length > 0 ? book.current.fname = false : book.current.fname = true
                    
                }else if(item.name === 'lname'){

                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty'}
                    let length = item.value.length > 3 ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please name must be at least 3 letters.'}
                    let specialCharFree = /^[a-zA-Z]+$/.test(item.value.trim()) ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please enter only alphabets.'}

                    let errs = [empty,length,specialCharFree];
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)
                    let list =errs.filter(item => item.mssg !== '')

                    list.length > 0 ? book.current.lname = false : book.current.lname = true

                }else if(item.name === 'email'){

                    // let emailvailidity = await checkEmailDuplicate();
                    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                    let validEmail = emailRegex.test(item.value) ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please enter a valid email address.'}
                    // let emailDuplicate =  emailvailidity ? {bool: true, mssg: ''} : {bool: false, mssg: 'Email already exist, please try something else'} 
                    let errs = [empty,validEmail];
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)
                    let list = errs.filter(item => item.mssg !== '')
                    list.length > 0 ? book.current.email = false : book.current.email = true

                }
                
            }else if(item.type === 'password'){
                if(item.name === 'password'){
                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                    let length = item.value.length >= 8 ? {bool: true, mssg: ''} :  {bool: false, mssg: 'Password must contain at least 8 characters.'}
                    let errs = [empty,length];
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)

                    let list =errs.filter(item => item.mssg !== '')

                    list.length > 0 ? book.current.pwd = false : book.current.pwd = true
                }else if(item.name === 'confirm-password'){
                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                    let length = item.value === pwd ? {bool: true, mssg: ''} :  {bool: false, mssg: 'Password mismatch.'}
                    let errs = [empty,length];
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)

                    let list =errs.filter(item => item.mssg !== '')

                    list.length > 0 ? book.current.pwd = false : book.current.pwd = true
                }
            }else if(item.type === 'tel'){
                if(item.name === 'phone'){
                    let empty = item.value !== '' ? {bool: true, mssg: ''} : {bool: false, mssg: 'Please field cannot be empty.'}
                    let length = item.value.length >= 10 ? {bool: true, mssg: ''} :  {bool: false, mssg: 'Invalid Phone Number'}
                    let errs = [empty,length];
                    
                    addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)

                    let list =errs.filter(item => item.mssg !== '')

                    list.length > 0 ? book.current.phn = false : book.current.phn = true
                }
            }
        })

        // select.map(item => {
        //     if(item.name === 'state'){
        //         let empty = state !== '' ?  {bool: true, mssg: ''} :  {bool: false, mssg: 'Please select a state'}
        //         let errs = [empty];
                    
        //         addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)
        //         let list =errs.filter(item => item.mssg !== '')

        //         list.length > 0 ? book.current.state = false : book.current.state = true
        //     }else if(item.name === 'campus'){
        //         let empty = campus !== '' ?  {bool: true, mssg: ''} :  {bool: false, mssg: 'Please select a campus'}
        //         let errs = [empty];
                    
        //         addErrMssg(errs.filter(item => item.mssg !== ''),item.parentElement)
        //         let list =errs.filter(item => item.mssg !== '')

        //         list.length > 0 ? book.current.campus = false : book.current.campus = true
        //     }
        // })
    }


    useEffect(() => {
        // console.log(session)
        if(session.status==='authenticated'){

            fetch('http://localhost:3456/entrepreneur/registration', {
                method: 'post',
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    fname: session.data.user.name.split(' ')[0],
                    lname: session.data.user.name.split(' ')[1],
                    email: session.data.user.email, 
                    pwd: 'null',
                    phone_number: 'null',
                    gender: 'null',
                    referral_src: 'null',
                    provider: 'google'
                })
            })
            .then(async(result) => {
                let response = await result.json();
                if(response.bool){
                    setNewCookie(response.cookie, 1) 
                    window.location.href="/entrepreneur/pre-sale"
                    entrepreneur_overlay_setup(false, 'One Moment Please...')

                }else{
                    
                    // overlay.removeAttribute('id');
                    if(response.data.mssg === 'email exists'){
                        // addErrMssg([{mssg:'Email already exist, please try something else'}], document.querySelector('.email').parentElement)
                        set_duplicate_err('Email already exist, please try something else')
                    }else if(response.data.mssg === 'phone exists'){
                        // addErrMssg([{mssg:'Phone Number already exist, please try something else'}], document.querySelector('.phone').parentElement)
                        set_duplicate_err('Phone already exist, please try something else')

                    }
                    // setBtn("Signup")
                    e.target.disabled = false;
                    entrepreneur_overlay_setup(false, 'Try Again...')

                }
            })
            .catch((err) => {
                console.log(err)
                // setBtn("Signup")
                e.target.disabled = false;
            })
        }
    }, [session])
    

  return (
    <>
        <div className="enetrepreneur-signup-form">
            <div className='form-cnt'>
            <section>
                    <section style={{marginLeft: '0px', flexDirection: 'row', display: 'flex', alignItems: 'flex-start'}}>
                        <img src={logo_img.src} style={{height: '40px', width: '40px', borderRadius: '10px'}} alt="" />
                        {/* <h5 style={{color: '#00926e', paddingLeft: '5px', margin: '0'}}>Shopiva</h5> */}
                    </section>

                    <div style={{display: 'flex', width: 'auto'}}>
                      
                        <button onClick={e=> {
                            setProvider('google')
                            let result = signIn('google', {redirect: false});
                            console.log(result)
                        }} style={{padding: '2px 15px', height: '40px', background: '#000', border: 'none', borderRadius: '5px'}}>
                            <span style={{color: '#fff'}}>Continue with Google</span>
                            &nbsp;
                            &nbsp;
                            <span><img src={gg_svg.src} style={{height: '20px', width: '20px'}} alt="" /></span>
                        </button>
                    </div>
                </section>


                
                
                <section style={{height: 'auto'}}>

                    <h6 className='err-mssg'>{duplicate_err}</h6>
                    <div style={{width: '100%'}}>
                        <section style={{display: 'flex', justifyContent: 'space-between'}}>
                            <div style={{width: '48%', display: 'flex', flexDirection: 'column'}} className="input-cnt">
                                <label htmlFor="">First name</label>
                                <input style={{color: '#000', width: '100%'}} onInput={e=> setFname(e.target.value)} type="text" placeholder='First name' name="fname" id="" />
                            </div>
                            <div style={{width: '48%', display: 'flex', flexDirection: 'column'}} className="input-cnt">
                                <label htmlFor="">Last name</label>
                                <input style={{color: '#000', width: '100%'}} onInput={e=> setLname(e.target.value)} type="text" placeholder='Last name' name="lname" id="" />
                            </div>
                        </section>
                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Email</label>
                            <input style={{color: '#000', width: '100%'}} onInput={e=> setEmail(e.target.value)} type="text" placeholder='Email' name="email" id="" />
                        </div>
                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Phone</label>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span>
                                    <div style={{padding: '5px', background: '#fff', border: 'none', height: '40px', width: '100px'}} name="" id="">
                                        <div className="dropdown">
                                            <button style={{height: '40px', width: '90px', margin: '-5px 0px 0px 0px', background: '#f9f9f9', padding: '5px 0px 5px 5px', display:'flex', justifyContent: 'center', alignItems: 'center', color: '#000'}} className="btn btn-secondary" type="button" data-bs-toggle="dropdown" aria-expanded="false">

                                           {
                                            !country_code === ''
                                            ?
                                            <small><b>+ country</b></small>
                                            :
                                            <>
                                                <span>
                                                    <img src={'https://flagcdn.com/w320/ng.png'} style={{height: '20px', width: '20px'}} alt="" />
                                                </span>
                                                
                                                <span style={{color: '#000', padding: '5px', display:'flex', justifyContent: 'center', alignItems: 'center', margin: '0px 0px -5px 0px', fontWeight: '500', fontSize: 'small'}}>{'+234'}</span>
                                            </>

                                            
                                           }
                                            </button>

                                            <ul className="dropdown-menu" style={{width: '300px', overflow: 'auto', height: '200px'}}>

                                                {/* <li>
                                                    <input style={{color: '#000'}} style={{height: '30px', width: '100%'}} placeholder='Search country here...' onInput={e=> set_search_char(e.target.value)} type="search" name="" id="" />
                                                </li>
                                               
                                                {
                                                    countries.map((item) => 
                                                        <li onClick={e=>set_country_code(item)} className='dropdown-item'>
                                                            <span>
                                                                <img src={item.flag_icon} style={{height: '20px', width: '20px'}} alt="" />
                                                            </span>
                                                            &nbsp;
                                                            &nbsp;
                                                            <span>{item.phone_code}</span>
                                                            &nbsp;
                                                            &nbsp;
                                                            <span>{item.name}</span>
                                                            
                                                        </li>
                                                    )
                                                } */}
                                            </ul>
                                        </div>
                                    </div>
                                </span>
                                <span style={{width: 'calc(100% - 100px)'}}>
                                    <input style={{color: '#000', width: '100%'}} onInput={e=> setPhone_number(`+234${e.target.value}`)} type="tel" maxLength={11} name="phone" defaultValue={''} id="" />
                                </span>
                            </div>
                        </div> 

                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Password</label>
                            <input style={{color: '#000', width: '100%'}} onInput={e=> setPwd(e.target.value)} type="password" autoComplete='false' placeholder='Password' name="password" id="" />
                        </div>

                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Confirm Password</label>
                            <input style={{color: '#000', width: '100%'}} onInput={e=> set_confirm_pwd(e.target.value)} type="password" placeholder='Confirm Password' name="confirm-password" id="" />
                        </div>
                          
                        {/* <br /> */}

                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column', marginTop: '20px'}}>
                            <button style={{borderRadius: '8px'}} onClick={e => {
                                setProvider('local')
                                Registration(e)
                            }}>Register</button>
                        </div>
                    </div>
                </section>

                <section className="other-reg-forms">
                    <button style={{marginLeft: '0', background: '#fff', border: 'none', color: '#00926e'}} onClick={e=> {
                        window.location.href=('/entrepreneur/login')
                    }} >
                        <small>Already registered? Login.</small>
                    </button>
                   
                </section>

            </div>
        </div>
    </>
  )
}

