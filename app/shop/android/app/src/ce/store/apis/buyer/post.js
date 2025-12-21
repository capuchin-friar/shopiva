import axios from 'axios'
// import {IP} from '@env'


let uri_1 = 'https://ce-server.vercel.app'
let uri_2 = 'https://ce-server.vercel.app' 
let IP = uri_1


const source = axios.CancelToken.source(); 

export async function RegisterBuyer(fname,lname,email,phone,pwd,state,campus,gender) {
    let response = await post_request_generators('registration', {fname,lname,email,phone,pwd,state,campus,gender})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function LogBuyerIn(email,pwd) {
    let response = await post_request_generators('login', {email,pwd})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function AddItemToCart(product_id,buyer_id) {
    let response = await post_request_generators('add-cart', {product_id,buyer_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function SaveItem(product_id,buyer_id) {
    let response = await post_request_generators('save-item', {product_id,buyer_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function ResetPwd(email,buyer_id) {
    let response = await post_request_generators('password-reset', {email,buyer_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}


export async function Filter_Cards(category,subCategory,condition,price,state,campus) {
    let response = await post_request_generators(`filter`, {category,subCategory,condition,price,state,campus})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function CheckPwdResetToken(buyer_id,token) {
    let response = await post_request_generators('password-token-check', {buyer_id,token})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function ValidateEmail(token) {
    let response = await post_request_generators('email-validation', {token})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function SendEmail(email,buyer_id) {
    let response = await post_request_generators('send-email', {email,buyer_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function CreateOrder(buyer,product_id,price,locale) {
    let response = await post_request_generators('create-order', {buyer,product_id,price,locale})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function UploadChat(buyer_id,seller_id) {
    let response = await post_request_generators('new-chat', {buyer_id,seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}

export async function AddView(product_id,buyer_id) {
    let response = await post_request_generators('new-view', {product_id,buyer_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}


export async function NewVisitor(src) {
    let response = await post_request_generators('new-visitor', {src})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)
}






async function post_request_generators(uri, body) {
    let result = await fetch(`${IP}/${uri}`, {
        method: 'post',
        headers: {
          "Content-Type": "Application/json"
        },
        body: JSON.stringify(body)
    })

    try {
        return await result.json()
    } catch (error) {
        return await result.json()
    }

}



