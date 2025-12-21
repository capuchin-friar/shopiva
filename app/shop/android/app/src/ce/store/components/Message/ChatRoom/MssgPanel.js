import React, { useState } from 'react'
// import MoreImgSvg from '../../assets/more-four-svgrepo-com.svg'
// import SendImgSvg from '../../assets/send-square-svgrepo-com.svg'
import { ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function MssgPanel({sendMssg,imageLoader,setTextInput,message}) {


    return (
        <>
            <ScrollView style={{position: 'absolute', padding: 5, bottom: 0, width: '100%', maxHeight: 120, backgroundColor: '#efefef'}} contentContainerStyle={{alignItems: 'center', display: 'flex'}}>
                
                <TouchableOpacity style={{ position: 'absolute', left: 12, width: '10%', borderRadius: 5, alignItems: 'center', display: 'flex', justifyContent: 'center', height: 40, bottom: 2.5, backgroundColor: '#32CD32'}} onPress={imageLoader}>
                    {/* <MoreImgSvg height="25" width="25" /> */}
                </TouchableOpacity>

                <TextInput
                    multiline={true}
                    value={message}
                    style={{
                        maxHeight: 120,
                        width: '70%',  
                        marginLeft: 14,
                        padding: 8,
                        fontFamily: 'serif',
                        borderRadius: 8, 
                        backgroundColor: '#fff',
                        color: '#000'
                    }}
                    onChangeText={text => setTextInput(text)}
                />
                
                <TouchableOpacity onPress={e => sendMssg(message)} style={{ position: 'absolute', right: 5, width: '10%', borderRadius: 50, alignItems: 'center', display: 'flex', justifyContent: 'center', height: 40, bottom: 2.5, backgroundColor: '#32CD32'}}>
                    {/* <SendImgSvg height="25" width="25" /> */}
                </TouchableOpacity>
            </ScrollView>
        </>
    )
}
