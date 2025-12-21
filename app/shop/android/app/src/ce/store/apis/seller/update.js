import axios from 'axios'
// import {IP} from '@env'


let uri_1 = 'https://ce-server.vercel.app'
let uri_2 = 'https://ce-server.vercel.app'
let IP = uri_1


const source = axios.CancelToken.source();


export async function UpdateSellerProfile(fname,lname,state,campus,seller_id,photo) {
    let response = await update_request_generators('profile-update', {fname,lname,state,campus,seller_id,photo})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

export async function UpdateShopTitle(title,seller_id) {
    let response = await update_request_generators('shop-title-update', {title,seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}


export async function UpdateShopDesc(description,seller_id) {
    let response = await update_request_generators('shop-desc-update', {description,seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

export async function UpdateInventory(inventory, seller_id) {
    let response = await update_request_generators('inventory-update', {inventory, seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

export async function UpdateUniversity(seller_id) {
    let response = await update_request_generators('inventory-update', {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}


export async function PayRent(rent, seller_id) {
    let response = await update_request_generators('pay-rent', {rent, seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function UpdatePwd(email, pwd) {
    let response = await update_request_generators('password-update', {email, pwd})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

async function update_request_generators(uri, body) {
    return(
        await axios.post(`${IP}/seller.${uri}`, body, {
            cancelToken: source.token
        })
        .then((result) => result)
        .catch((error) => {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message); 
            }  else {
                console.log('Error:', error.message);
            }    
            
        })     
        
    )
}
