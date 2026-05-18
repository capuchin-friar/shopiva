import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  returnInfo: null,
}

export const returnInfo_slice = createSlice({
  name: 'returnInfo',
  initialState,
  reducers: {
    set_returnInfo: (state, action) => {
      state.returnInfo = action.payload
    },
  },
})

export const { set_returnInfo } = returnInfo_slice.actions

export default returnInfo_slice.reducer
