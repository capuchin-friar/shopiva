import { io } from 'socket.io-client';
import { getStoredAccessToken, getStoredActiveRole } from '../auth/session';
import { getApiBaseUrl } from '../api/config';
import store from '../../redux/store';
import { set_orderInfo } from '../../redux/order';
import { set_orderList } from '../../redux/orders';
import { set_returnInfo } from '../../redux/return';
import { set_returnList } from '../../redux/returns';
import { set_disputeInfo } from '../../redux/dispute';
import { set_disputeList } from '../../redux/disputes';
import { mapBuyerDisputeRow, mapOrderRowToListItem } from '../utils/buyerUi';

/** @type {import('socket.io-client').Socket | null} */
let socketSingleton = null;
/** @type {Promise<import('socket.io-client').Socket | null> | null} */
let connectPromise = null;

const ORDER_SOCKET_EVENTS = [
  'order_acceptance',
  'order_processing',
  'order_shipping',
  'order_out_for_delivery',
  'order_delivered',
  'order_confirmed',
  'order_cancelled',
];

const RETURN_SOCKET_EVENTS = [
  'return_acceptance',
  'return_processing',
  'return_shipping',
  'return_out_for_delivery',
  'return_delivered',
  'return_confirmed',
  'return_cancelled',
];

const DISPUTE_SOCKET_EVENTS = [
  'raise_dispute', 
  'dispute_acceptance'
];

/** @param {unknown} res */
export function applyOrderSocketPayload(res) {
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  console.log("order payload form socket: ", payload);
  store.dispatch(set_orderInfo(payload.result))
  store.dispatch(set_orderList(payload.list))
}

/** @param {unknown} res */
export function applyReturnSocketPayload(res) {
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  if (payload.result) {
    store.dispatch(set_returnInfo(payload.result));
  }
  if (Array.isArray(payload.list)) {
    store.dispatch(set_returnList(payload.list));
  }
}

/** @param {unknown} res */
export function applyDisputeSocketPayload(res) {
  const auth = store.getState().auth;

  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  console.log("coi testing", payload)

  if (payload.actor && typeof payload.actor === 'object') {
    const {actor} = res;
    if (auth.activeRole === "customer" && actor?.cdl) {
      store.dispatch(set_disputeList(actor.cdl));
      store.dispatch(set_disputeInfo(actor.cdi));
    }else if(auth.activeRole === "vendor" && actor?.vdl){
      store.dispatch(set_disputeList(actor.vdl));
      store.dispatch(set_disputeInfo(actor.vdi));
    }

    if (actor?.voi || actor?.coi) {
      if (auth.activeRole === "vendor" && actor?.voi || auth.activeRole === "customer" && actor?.coi) {
        if(auth.activeRole === "vendor"){
          store.dispatch(set_orderInfo(actor.voi))
          store.dispatch(set_orderList(actor.vol))
        }else{
          store.dispatch(set_orderInfo(actor.coi))
          store.dispatch(set_orderList(actor.col))
        }
      }else{
        if(auth.activeRole === "vendor"){
          store.dispatch(set_orderInfo(payload.others.voi))
          store.dispatch(set_orderList(payload.others.vol))
        }else{
          store.dispatch(set_orderInfo(payload.others.coi))
          store.dispatch(set_orderList(payload.others.col))
        }
      }
    }

  }
}

/** @param {unknown} ack */
export function applySocketAckPayload(ack) {
  applyOrderSocketPayload(ack);
  applyReturnSocketPayload(ack);
  applyDisputeSocketPayload(ack);
}

/** @param {import('socket.io-client').Socket} socket */
function bindOrderSocketListeners(socket) {
  if (socket.__orderListenersBound) return;
  socket.__orderListenersBound = true;

  const onOrderUpdate = (res) => {
    applyOrderSocketPayload(res);
  };

  ORDER_SOCKET_EVENTS.forEach((event) => socket.on(event, onOrderUpdate));
}

/** @param {import('socket.io-client').Socket} socket */
function bindReturnSocketListeners(socket) {
  if (socket.__returnListenersBound) return;
  socket.__returnListenersBound = true;

  const onReturnUpdate = (res) => {
    applyReturnSocketPayload(res);
  };

  RETURN_SOCKET_EVENTS.forEach((event) => socket.on(event, onReturnUpdate));
}

/** @param {import('socket.io-client').Socket} socket */
function bindDisputeSocketListeners(socket) {
  if (socket.__disputeListenersBound) return;
  socket.__disputeListenersBound = true;

  const onDisputeUpdate = (res) => {
    console.log(res)
    applyDisputeSocketPayload(res);
  };

  DISPUTE_SOCKET_EVENTS.forEach((event) => socket.on(event, onDisputeUpdate));
}

/**
 * @param {unknown} payload
 */
function parseAck(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      dispute: null,
      others: null,
      result: null,
      list: null,
      message: 'No response from socket server',
      error: '',
    };
  }
  const rec = /** @type {Record<string, unknown>} */ (payload);
  return {
    success: Boolean(rec.success),
    dispute: rec.dispute ?? null,
    others: rec.others ,
    result: rec.result,
    list: rec.list,
    message: String(rec.message ?? ''),
    error: rec.error != null ? String(rec.error) : '',
  };
}

export async function connectChatSocket() {
  if (socketSingleton?.connected) return socketSingleton;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    const token = await getStoredAccessToken();
    if (!token) return null;

    if (!socketSingleton) {
      socketSingleton = io(getApiBaseUrl(), {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        auth: { token },
      });
    } else {
      socketSingleton.auth = { token };
    }

    if (!socketSingleton.connected) {
      await new Promise((resolve) => {
        const done = () => {
          socketSingleton?.off('connect', done);
          socketSingleton?.off('connect_error', done);
          resolve(undefined);
        };
        socketSingleton.on('connect', done);
        socketSingleton.on('connect_error', done);
        socketSingleton.connect();
      });
    }

    bindOrderSocketListeners(socketSingleton);
    bindReturnSocketListeners(socketSingleton);
    bindDisputeSocketListeners(socketSingleton);
    return socketSingleton;
  })();

  const out = await connectPromise;
  connectPromise = null;
  return out;
}

/**
 * @template T
 * @param {string} event
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ success: boolean; result: T | null; list: unknown[] | null; message: string; error: string }>}
 */
export async function emitSocketAck(event, payload = {}) {
  const socket = await connectChatSocket();
  if (!socket) {
    return { success: false, result: null, message: 'Sign in required', error: '' };
  }
  const base =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? /** @type {Record<string, unknown>} */ ({ ...payload })
      : {};
  if (base.app_role == null && base.appRole == null) {
    const role = await getStoredActiveRole();
    base.app_role = role === 'vendor' ? 'vendor' : 'customer';
  }
  return new Promise((resolve) => {
    socket.emit(event, base, (ack) => {
      const out = parseAck(ack);
      if (out.success) {
        applySocketAckPayload(ack);
      }
      resolve({
        success: out.success,
        dispute: /** @type {T | null} */ (out.dispute),
        others: out.others,
        result: out.result,
        list: out.list,
        message: out.message,
        error: out.error,
      });
    });
  });
}

/** @returns {import('socket.io-client').Socket | null} */
export function getChatSocket() {
  return socketSingleton;
}

export function disconnectChatSocket() {
  if (socketSingleton) socketSingleton.disconnect();
}
