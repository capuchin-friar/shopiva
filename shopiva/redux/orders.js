import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  orderList: [
    
  ],
}

export const orderList_slice = createSlice({
  name: 'orderList',
  initialState,
  reducers: {
    set_orderList: (state, action) => {
      state.orderList = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { set_orderList } = orderList_slice.actions

export default orderList_slice.reducer

  
  