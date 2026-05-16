import { io } from 'socket.io-client';
import { getStoredAccessToken, getStoredActiveRole } from '../auth/session';
import { getApiBaseUrl } from '../api/config';
import store from '../../redux/store';
import { set_orderInfo } from '../../redux/order';
import { set_orderList } from '../../redux/orders';
import { mapOrderRowToListItem } from '../utils/buyerUi';

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
  'order_cancelled',
];

/** @param {unknown} res */
export function applyOrderSocketPayload(res) {
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  if (payload.result) {
    store.dispatch(set_orderInfo(payload.result));
  }
  if (Array.isArray(payload.list)) {
    const mapped = payload.list.map((row) =>
      mapOrderRowToListItem(/** @type {Record<string, unknown>} */ (row)),
    );
    store.dispatch(set_orderList(mapped));
  }
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

/**
 * @param {unknown} payload
 */
function parseAck(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      result: null,
      list: null,
      message: 'No response from socket server',
      error: '',
    };
  }
  const rec = /** @type {Record<string, unknown>} */ (payload);
  return {
    success: Boolean(rec.success),
    result: rec.result ?? null,
    list: Array.isArray(rec.list) ? rec.list : null,
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
        applyOrderSocketPayload(ack);
      }
      resolve({
        success: out.success,
        result: /** @type {T | null} */ (out.result),
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
