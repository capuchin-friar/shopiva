import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import SearchBar from '../components/Sasrch/SearchBar'
import SearchResult from '../components/Sasrch/SearchResult'
import { GetSearchWord } from '../apis/buyer/get'

export default function Search() {
    let [search_char, set_search_char] = useState('')
    let [search_word, set_search_word] = useState([])

    function updateSearchChar(data) {
        set_search_char(data)
    }

    useEffect(() => {
        GetSearchWord(search_char)
        .then((result) => {
            set_search_word(result)
        })
        .catch((err) => {
            console.log(err)
        })
    }, [search_char])
  return (
    <>
      <View>
        <SearchBar updateSearchChar={updateSearchChar} />   
        <SearchResult search_word={search_word} />
      </View>
    </>
  )
}
