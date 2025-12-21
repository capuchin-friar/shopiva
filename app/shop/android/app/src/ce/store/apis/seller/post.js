import axios from 'axios'
// import {IP} from '@env'


let uri_1 = 'https://ce-server.vercel.app'
let uri_2 = 'https://ce-server.vercel.app'
let IP = uri_1
 

const source = axios.CancelToken.source();

export async function RegisterSeller(fname,lname,email,phone,pwd,state,campus) {
    let response = await post_request_generators('registration', {fname,lname,email,phone,pwd,state,campus})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function LogSellerIn(email,pwd) {
    let response = await post_request_generators('login', {email,pwd})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function ValidateEmail(token) {
    let response = await post_request_generators('email-validation', {token})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function SendEmail(email,type, name,) {
    let response = await post_request_generators('send-email', {email,type, name})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}
export async function SendSMS(phone,seller_id, name) {
    let response = await post_request_generators('send-phone', {phone,seller_id, name})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function UploadChat(buyer_id,seller_id) {
    let response = await post_request_generators('new-chat', {seller_id,seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function UploadItem(constantData, dynamicData) {
    let response = await post_request_generators('product-upload', {constantData, dynamicData})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function UpdateItem(constantData, dynamicData) {
    let response = await post_request_generators('product-update', {constantData, dynamicData})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


export async function cloudinarySignature(folder_name) {
    let response = await post_request_generators('cloudinary-signature', {folder_name})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}





async function post_request_generators(uri, body) {
    return(
        await axios.post(`${IP}/seller.${uri}`, body, {
            cancelToken: source.token
        })
        .then((result) => result)
        .catch((error) => error)     
        
    )
}





