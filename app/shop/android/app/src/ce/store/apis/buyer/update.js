import axios from 'axios'
// import {IP} from '@env'


let uri_1 = 'https://ce-server.vercel.app'
let uri_2 = 'https://ce-server.vercel.app'
let IP = uri_1
const source = axios.CancelToken.source();


export async function UpdateCartUnit(type,buyer_id,product_id) {
    let response = await update_request_generators('update-cart-unit', {type,buyer_id,product_id})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

export async function UpdatePwd(buyer_id, pwd) {
    let response = await update_request_generators('password-update', {buyer_id, pwd})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}

export async function UpdatePickupChannel(data) {
    let response = await update_request_generators('pickup-channel-update', {data})
    setTimeout(() => source.cancel('timeout'), 10000) 
    return(response)
}
 


async function update_request_generators(uri, body) {
    return(
        fetch(`${IP}/${uri}`, {
            method: 'post',
            headers: {
              "Content-Type": "Application/json"
            },
            body: JSON.stringify(body)
        })
        .then(async(result) => await result.json())
        .catch((error) => {
            if (axios.isCancel(error)) {
                console.log('Request canceled:', error.message);
            }  else {
                console.log('Error:', error.message);
            }    
        })  
        
    )
}
