import { configureStore } from '@reduxjs/toolkit';
import nested_nav from './nested_nav';
import authReducer from './authSlice';
import orderInfo from './order';
import orderList from './orders';
import disputeInfo from './dispute';
import disputeList from './disputes';

const store = configureStore({
  reducer: {
    nested_nav,
    auth: authReducer,
    orderInfo: orderInfo,
    orderList: orderList,
    disputeInfo: disputeInfo,
    disputeList: disputeList,
  },
});

export default store;