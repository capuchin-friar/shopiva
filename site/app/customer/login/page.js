"use client"
import React from 'react'
import { 
    useEffect, 
    useRef, 
    useState 
} from 'react';
import gg_svg from '../../../svgs/google-color-svgrepo-com (1).svg'
import './styles/xxl.css'
import 'react-phone-number-input/style.css'
import country from '../../../reusables/country.json'
import axios from 'axios';
import logo_img from '../../../images/462832894_122104672550563288_120709183929923776_n.jpg'
import { 
    useSession, 
    signIn, 
    signOut 
} from "next-auth/react"

import {
    set_entrepreneur_cookie 
} from '../../../redux/entrepreneur/entrepreneur_cookie';
import { 
    useDispatch 
} from 'react-redux';
import { 
    entrepreneur_overlay_setup 
} from '../../../reusables/overlay';
import { setNewCookie } from 'app/layout';

export default function Signup() {
    const session = useSession();

    const [countries, setcountries] = useState([])
    let dispatch = useDispatch()

    let [email, setEmail] = useState('')
    let [pwd, setPwd] = useState('')
    const validation = useRef(false);


    
    
    let book = useRef({
        email: false,
        pwd: false 
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

    let Login = (e) => {
        try {
            e.target.disabled = true;
    
            Validation();
            Object.values(book.current).filter(item => item !== true).length > 0 ? validation.current = false : validation.current = true;
    
            if(validation.current){
                entrepreneur_overlay_setup(true, 'One Moment Please...')
               
                e.target.disabled = true;
                fetch('http://localhost:3456/entrepreneur/login', {
                    method: 'post',
                    headers: {
                        "Content-Type": "Application/json"
                    },
                    body: JSON.stringify({email,pwd,provider: 'local'})
                })
                .then(async(result) => {
                    let response = await result.json();
                    if(response.bool){
                        e.target.disabled = false;
                        // console.log(response)
                        setNewCookie(response.cookie, 1) 
                        window.location.href="/entrepreneur";
                        entrepreneur_overlay_setup(false, 'Try Again...');
                    }else{
                        if(response.data === 'duplicate email'){
                            addErrMssg([{mssg:'Email already exist, please try something else'}], document.querySelector('.email').parentElement)
                        }else if(response.data === 'duplicate phone'){
                            addErrMssg([{mssg:'Phone Number already exist, please try something else'}], document.querySelector('.phone').parentElement)
                        }else {
                            addErrMssg([{mssg:'Password is not correct...'}], document.querySelector('.pwd').parentElement)

                        }
                        e.target.disabled = false;
                        entrepreneur_overlay_setup(false, 'Try Again...')

                    }
                })
                .catch((err) => {
                    console.log(err)
                    e.target.disabled = false;
                })
                
            }else{
                
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

            fetch('https://shopiva-server.onrender.com/entrepreneur/login', {
                method: 'post',
                headers: {
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    email: session.data.user.email, 
                    provider: 'google'
                })
            })
            .then(async(result) => {
                let response = await result.json();
                if(response.bool){
                    // e.target.disabled = false;
                    setNewCookie(response.cookie, 1) 
                    window.location.href="/entrepreneur";
                    entrepreneur_overlay_setup(false, 'Try Again...');

                }else{
                    
                    // overlay.removeAttribute('id');
                    if(response.data === 'duplicate email'){
                        addErrMssg([{mssg:'Email already exist, please try something else'}], document.querySelector('.email').parentElement)
                    }else if(response.data === 'duplicate phone'){
                        addErrMssg([{mssg:'Phone Number already exist, please try something else'}], document.querySelector('.phone').parentElement)
                    }else {
                        addErrMssg([{mssg:'Password is not correct...'}], document.querySelector('.pwd').parentElement)

                    }
                    // setBtn("Signup")
                    // e.target.disabled = false;
                    entrepreneur_overlay_setup(false, 'Try Again...')

                }
            })
            .catch((err) => {
                // setBtn("Signup")
                console.log(err)
                // e.target.disabled = false;
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

                    {/* <br />
                    <br /> */}

                    <div style={{display: 'flex', width: 'auto'}}>
                        <button onClick={e=> {
                            // setProvider('google')
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
                    <div style={{width: '100%'}}>
                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Email</label>
                            <input style={{color: '#000', width: '100%'}} onInput={e=> setEmail(e.target.value)} type="text" placeholder='Email' name="email" id="" />
                        </div>
                        <div className="input-cnt" style={{display: 'flex', flexDirection: 'column'}}>
                            <label htmlFor="">Password</label>
                            <input style={{color: '#000', width: '100%'}} onInput={e=> setPwd(e.target.value)} type="password" placeholder='Password' className='pwd' name="password" id="" />
                        </div>

                        <div className="input-cnt">
                            <button style={{borderRadius: '8px', background: '#00926e'}} onClick={e => {
                                Login(e)
                            }}>Login</button>
                        </div>
                    </div>
                </section>

                <section className="other-reg-forms">
                    <button style={{marginLeft: '0', background: '#fff', border: 'none', color: '#00926e'}} onClick={e=> {
                        window.location.href=('/entrepreneur/signup')
                    }} >
                        <small>Not registered? Signup.</small>
                    </button>
                   
                </section>
            </div>
        </div>
    </>
  )
}
