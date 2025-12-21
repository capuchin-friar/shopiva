import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function SearchBar({updateSearchChar}) {

  return ( 
    <>
      <View>
        <View style={styles.searchCnt}>
          <View style={styles.back}> 
            <Text> Back </Text>
          </View>
          <TextInput onTextInput={txt => {updateSearchChar(txt)}} style={styles.search} placeholder='What Are You LookinG For' />
        </View>

        {/* <View style={styles.searchFilter}>  
          <TouchableOpacity style={styles.btn}>
            <Text>Items</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn}>
            <Text>Shops</Text>
          </TouchableOpacity>   
          <TouchableOpacity style={styles.btn}>
            <Text>Price</Text>
          </TouchableOpacity>   
          <TouchableOpacity style={styles.btn}>
              <Text>Location</Text>
          </TouchableOpacity>   
        </View> */}
      </View>
    </>
  ) 
}




const styles = StyleSheet.create({
  searchCnt:{
      height: 'auto',
      //   width: '100%',
      paddingTop: 15,
      paddingBottom: 15,
      paddingLeft: 15,
      paddingRight: 15,
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'left',
      alignItems: 'center',
      // marginBottom: 5
  },
  search:{
      height: 55,
      borderRadius: 15,
      padding: 10,
      width: '85%',
      backgroundColor: '#efefef',
      float: 'right'
  },
  back:{
    height: 55,
    borderRadius: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '15%',
},
  searchFilter:{
    height: 'auto',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'left',
    alignItems: 'center',
    flexWrap: 'wrap',
    borderRadius: 20, 
    padding: 8,
    backgroundColor: 'rgb(255, 244, 224)',
    marginBottom: 10
  },

  btn:{
    height: '100%',
    padding: 0,
    padding: 8,
    display: 'flex',
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginLeft: 5,
    marginRight: 5

},
});