import React from 'react'
import { 
    StyleSheet, 
    Text, 
    TouchableOpacity 
} from 'react-native';
import FavSvg from '../../../../icons/favourite-heart-svgrepo-com.svg';


export default function SaveBtn() {
  return (
    <>
      <TouchableOpacity style={styles.saveBtn}>
        <FavSvg height={20} width={20} />
      </TouchableOpacity>
    </>
  ) 
}
 


const styles = StyleSheet.create({
    
    saveBtn:{
        height: 'auto',
        width: 'auto',
        zIndex: 1000,
        position: 'absolute',
        top: 3,
        padding: 10,
        left: 3,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        zIndex: 1000,
        // backgroundColor: 'rgb(255, 244, 224);',
        backgroundColor: 'rgba(255, 244, 224, 0.8)',
        borderRadius: 50,
        marginBottom: 5
    },
  });