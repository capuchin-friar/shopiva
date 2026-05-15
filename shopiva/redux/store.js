import { configureStore } from '@reduxjs/toolkit';
import nested_nav from './nested_nav';
import authReducer from './authSlice';
import orderInfo from './order';

const store = configureStore({
  reducer: {
    nested_nav,
    auth: authReducer,
    orderInfo: orderInfo
  },
});

export default store;