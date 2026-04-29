import { configureStore } from '@reduxjs/toolkit';
import nested_nav from './nested_nav';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    nested_nav,
    auth: authReducer,
  },
});

export default store;