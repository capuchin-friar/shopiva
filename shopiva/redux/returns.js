import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  returnList: [
    
  ],
}

export const returnList_slice = createSlice({
  name: 'returnList',
  initialState,
  reducers: {
    set_returnList: (state, action) => {
      state.returnList = action.payload
    },
  },
})

export const { set_returnList } = returnList_slice.actions

export default returnList_slice.reducer
