import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  nested_nav: {boolean: true, id: ''},
}

export const nested_nav_slice = createSlice({
  name: 'nested_nav',
  initialState,
  reducers: {
    set_nested_nav: (state, action) => {
      state.nested_nav = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { set_nested_nav } = nested_nav_slice.actions

export default nested_nav_slice.reducer

  
  