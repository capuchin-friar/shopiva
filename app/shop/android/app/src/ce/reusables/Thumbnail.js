import { useEffect, useState } from 'react';
import { Image } from 'react-native';
 

const Thumbnail = ({thumbnail_id,br}) => {
   
    let [screenWidth, setScreenWidth] = useState(window.innerWidth);
    useEffect(() => {
        setScreenWidth(window.innerWidth)
    }, [])


    
    return (  
        <>
            <Image 
                source={{uri: thumbnail_id}}
                style={{height: '100%', width: '100%', borderRadius: br}}
            />
        </> 
     );
}
 
export default Thumbnail;