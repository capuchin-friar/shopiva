import { configureStore } from '@reduxjs/toolkit';
import nested_nav from './nested_nav';
import authReducer from './authSlice';
import orderInfo from './order';
import orderList from './orders';

const store = configureStore({
  reducer: {
    nested_nav,
    auth: authReducer,
    orderInfo: orderInfo,
    orderList: orderList
  },
});

export default store;