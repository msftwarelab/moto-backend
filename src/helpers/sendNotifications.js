import fetch from 'node-fetch';
import { url } from '../config';

export async function sendNotifications(content, userId) {

    // console.log('node fetch', content);    

    const resp = await fetch(url + '/push-notification', {
        method: 'post',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            userId
        }),
        credentials: 'include'
    });
    
    const { status, errorMessge } = resp.json;   

    return await {
        status,
        errorMessge
    };
    
}

export default {
    sendNotifications
}
