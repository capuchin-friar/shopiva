import React from 'react'
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
// import Title from '../../../studio/components/Home/data/Title';
import Date from '../Order/OrderDate';
import Thumbnail from '../../../reusables/Thumbnail';
import Title from '../Home/data/Title';

export default function SearchResult({search_word}) {
  return (
    <>
      <ScrollView style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#efefef',
            position: 'relative'
        }}
        contentContainerStyle={{display: 'flex', alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap'}}
        >
         {
            search_word?.length < 1
            ?
            <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#efefef',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            flexWrap: 'wrap'
            }}>
                <Text> Find What You Need Here </Text>
            </View>
            :
            search_word?.map(item => {
                return(<>
                <TouchableOpacity onPress={()=>navigation.navigate('order-room')} style={styles.searchCardCnt}>
                    <View style={styles.searchCntLeft}>
                        <Thumbnail br={5} product_id={item.product_id} title={item.title} />
                    </View>

                    <View style={styles.searchCntRight}>

                        <View style={styles.searchCntRightTop}>
                            <View>
                                <Title title={item?.title}  />
                            </View>
                        </View>
                        
                        <View style={styles.searchCntRightBtm}>
                            <Date date={item?.date} />
                        </View>

                    </View>
                </TouchableOpacity> 
                </>)
            })
        }
      </ScrollView>
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
      marginTop: 5,
      marginBottom: 5
  },
  search:{
      height: 55,
      borderRadius: 15,
      padding: 10,
      backgroundColor: '#efefef'
  },
  searchFilter:{
    height: 50,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20, 
    padding: 5,
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
    backgroundColor: '#fff'
    },

    searchCardCnt:{
        height: 140,
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#fff',
        marginBottom: 5
      },
      searchCntLeft:{
        height: '100%',
        width: '30%',
        padding: 0,
        backgroundColor: '#fff',
        marginBottom: 5
      },
      searchCntRight:{
        height: '100%',
        width: '70%',
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginBottom: 5
      },
      searchCntRightTop:{
        height: '70%',
        width: '100%',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        marginBottom: 5
      },
      searchCntRightBtm:{
        height: '30%',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 0,
        backgroundColor: '#fff',
        marginBottom: 5
      }
});