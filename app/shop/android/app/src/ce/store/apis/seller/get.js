import axios from 'axios'
// import {IP} from '@env'


let uri_1 = 'https://ce-server.vercel.app'
let uri_2 = 'https://ce-server.vercel.app' 
let IP = uri_1


const source = axios.CancelToken.source();

export async function _(params) {
    let response = await get_request_generators(`route`, {params})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function Filter_Cards(category,condition,price,state,campus) {
    let response = await get_request_generators(`filter`, {category,condition,price,state,campus})
    // setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetSeller(seller_id) {
    let response = await get_request_generators(`profile`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetSellerWallet(seller_id) {
    let response = await get_request_generators(`wallet`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


export async function GetSellerPhoto(seller_id) {
    let response = await get_request_generators(`profile-photo`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


export async function GetReviews(seller_id) {
    let response = await get_request_generators(`reviews`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


export async function GetShop(seller_id) {
    let response = await get_request_generators(`shop`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetSoldItems(shop_id) {
    let response = await get_request_generators(`sold-items`, {shop_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


export async function GetItems(id) {
    let response = await get_request_generators(`listing`, {id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetItem(id) {
    let response = await get_request_generators(`product`, {id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetOverview(id) {
    let response = await get_request_generators(`overview`, {id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetEditedItem(id) {
    let response = await get_request_generators(`edited-item`, {id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetItemImages(id) {
    let response = await get_request_generators(`product.images`, {id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetProductThumbnail(product_id) {
    let response = await get_request_generators(`thumbnail`, {product_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetChatRooms(seller_id) {
    let response = await get_request_generators(`chat-rooms`, {seller_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function GetChat(room_id) {
    let response = await get_request_generators(`get-chat`, {room_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}

export async function ValidateToken(token, email) {
    let response = await get_request_generators('token-validation', {token, email})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return (response)?.data
}


async function get_request_generators(uri, params) {
     return(
        await axios.get(`${IP}/seller.${uri}`, {
            params,
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



