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
import Tools from '../utils/gen';

/** @type {import('socket.io-client').Socket | null} */
let socketSingleton = null;
/** @type {Promise<import('socket.io-client').Socket | null> | null} */
let connectPromise = null;

/** Server push + client ack events that update order Redux. */
const ORDER_SOCKET_EVENTS = [
  'payment_received',
  'order_acceptance',
  'order_processing',
  'order_shipping',
  'order_out_for_delivery',
  'order_delivered',
  'order_confirmed',
  'order_cancelled',
];

/** Server push + client ack events that update return Redux. */
const RETURN_SOCKET_EVENTS = [
  'return_acceptance',
  'return_processing',
  'return_shipping',
  'return_out_for_delivery',
  'return_delivered',
  'return_confirmed',
  'return_cancelled',
];

/** Server push + client ack events that update dispute (+ related order) Redux. */
const DISPUTE_SOCKET_EVENTS = [
  'raise_dispute',
  'dispute_acceptance',
  'dispute_escalation',
];

/**
 * Chat-only socket events — never read or write order / return / dispute slices.
 * Must stay in sync with `node/src/services/socket.ts` chat handlers.
 */
export const CHAT_SOCKET_EVENTS = new Set([
  'get_room_messages',
  'create_message',
  'get_rooms',
  'create_room',
  'typing',
  'mark_message_as_read',
]);

/** Explicit whitelist of domain events allowed to touch Redux from acks. */
const DOMAIN_SOCKET_EVENTS = new Set([
  ...ORDER_SOCKET_EVENTS,
  ...RETURN_SOCKET_EVENTS,
  ...DISPUTE_SOCKET_EVENTS,
]);

/**
 * @param {unknown} result
 * @returns {boolean}
 */
function isOrderDetailResult(result) {
  if (!result || typeof result !== 'object') return false;
  const r = /** @type {Record<string, unknown>} */ (result);
  return r.order != null && typeof r.order === 'object';
}

/**
 * @param {unknown} result
 * @returns {boolean}
 */
function isReturnDetailResult(result) {
  if (!result || typeof result !== 'object') return false;
  const r = /** @type {Record<string, unknown>} */ (result);
  return r.return != null && typeof r.return === 'object';
}

/** @param {string} event */
function isChatSocketEvent(event) {
  return CHAT_SOCKET_EVENTS.has(event);
}

/** @param {string} event */
function isDomainSocketEvent(event) {
  return DOMAIN_SOCKET_EVENTS.has(event);
}

/**
 * Apply order list/detail from a shaped payload fragment.
 * @param {unknown} orderInfo
 * @param {unknown} orderList
 */
function applyOrderSliceUpdates(orderInfo, orderList) {
  if (isOrderDetailResult(orderInfo)) {
    store.dispatch(set_orderInfo(orderInfo));
  }
  if (Array.isArray(orderList)) {
    store.dispatch(set_orderList(orderList));
  }
}

/** @param {unknown} res */
export async function applyOrderSocketPayload(res) {
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  applyOrderSliceUpdates(payload.result, payload.list);
}

/** @param {unknown} res */
export function applyReturnSocketPayload(res) {
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);
  if (isReturnDetailResult(payload.result)) {
    store.dispatch(set_returnInfo(payload.result));
  }
  if (Array.isArray(payload.list)) {
    store.dispatch(set_returnList(payload.list));
  }
}

/**
 * Push payload uses `{ actor: { voi, vol, cdl, cdi, ... } }`.
 * Ack payload uses `{ dispute: { vendor, customer }, others: { voi, vol, coi, col } }`.
 * @param {unknown} res
 */
export function applyDisputeSocketPayload(res) {
  const auth = store.getState().auth;
  if (!res || typeof res !== 'object') return;
  const payload = /** @type {Record<string, unknown>} */ (res);

  const disputeBlock = payload.dispute;
  if (disputeBlock && typeof disputeBlock === 'object') {
    const d = /** @type {Record<string, unknown>} */ (disputeBlock);
    const vendor =
      d.vendor && typeof d.vendor === 'object'
        ? /** @type {Record<string, unknown>} */ (d.vendor)
        : null;
    const customer =
      d.customer && typeof d.customer === 'object'
        ? /** @type {Record<string, unknown>} */ (d.customer)
        : null;

    if (auth.activeRole === 'vendor' && vendor) {
      if (Array.isArray(vendor.vdl)) {
        store.dispatch(set_disputeList(vendor.vdl));
      }
      if (vendor.vdi != null) {
        store.dispatch(set_disputeInfo(vendor.vdi));
      }
    } else if (auth.activeRole === 'customer' && customer) {
      if (Array.isArray(customer.cdl)) {
        store.dispatch(set_disputeList(customer.cdl));
      }
      if (customer.cdi != null) {
        store.dispatch(set_disputeInfo(customer.cdi));
      }
    }
  }

  const others = payload.others;
  if (others && typeof others === 'object') {
    const o = /** @type {Record<string, unknown>} */ (others);
    if (auth.activeRole === 'vendor') {
      applyOrderSliceUpdates(o.voi, o.vol);
    } else {
      applyOrderSliceUpdates(o.coi, o.col);
    }
  }

  if (payload.actor && typeof payload.actor === 'object') {
    const actor = /** @type {Record<string, unknown>} */ (payload.actor);
    if (auth.activeRole === 'vendor') {
      applyOrderSliceUpdates(actor.voi, actor.vol);
      if (Array.isArray(actor.vdl)) {
        store.dispatch(set_disputeList(actor.vdl));
      }
      if (actor.vdi != null) {
        store.dispatch(set_disputeInfo(actor.vdi));
      }
    } else if (auth.activeRole === 'customer') {
      applyOrderSliceUpdates(actor.coi, actor.col);
      if (Array.isArray(actor.cdl)) {
        store.dispatch(set_disputeList(actor.cdl));
      }
      if (actor.cdi != null) {
        store.dispatch(set_disputeInfo(actor.cdi));
      }
    }
  }
}

/**
 * Apply Redux updates for a single domain socket event (order / return / dispute only).
 * @param {unknown} ack
 * @param {string} event
 */
export async function applySocketAckPayload(ack, event) {
  if (!isDomainSocketEvent(event)) return;

  if (ORDER_SOCKET_EVENTS.includes(event)) {
    await applyOrderSocketPayload(ack);
  }
  if (RETURN_SOCKET_EVENTS.includes(event)) {
    applyReturnSocketPayload(ack);
  }
  if (DISPUTE_SOCKET_EVENTS.includes(event)) {
    applyDisputeSocketPayload(ack);
  }
}

/** @param {import('socket.io-client').Socket} socket */
function bindOrderSocketListeners(socket) {
  if (socket.__orderListenersBound) return;
  socket.__orderListenersBound = true;

  const onOrderUpdate = async (res) => {
    await Tools.playSound();
    applyOrderSocketPayload(res);
  };

  ORDER_SOCKET_EVENTS.forEach((event) => socket.on(event, onOrderUpdate));
}

/** @param {import('socket.io-client').Socket} socket */
function bindReturnSocketListeners(socket) {
  if (socket.__returnListenersBound) return;
  socket.__returnListenersBound = true;

  const onReturnUpdate = async (res) => {
    await Tools.playSound();
    applyReturnSocketPayload(res);
  };

  RETURN_SOCKET_EVENTS.forEach((event) => socket.on(event, onReturnUpdate));
}

/** @param {import('socket.io-client').Socket} socket */
function bindDisputeSocketListeners(socket) {
  if (socket.__disputeListenersBound) return;
  socket.__disputeListenersBound = true;

  const onDisputeUpdate = async (res) => {
    await Tools.playSound();
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
    others: rec.others,
    result: rec.result,
    list: rec.list,
    message: String(rec.message ?? ''),
    error: rec.error != null ? String(rec.error) : '',
  };
}

/**
 * @param {Record<string, unknown>} [payload]
 */
async function prepareSocketPayload(payload = {}) {
  const socket = await connectChatSocket();
  if (!socket) return { socket: null, base: null };

  const base =
    payload && typeof payload === 'object' && !Array.isArray(payload)
      ? /** @type {Record<string, unknown>} */ ({ ...payload })
      : {};
  if (base.app_role == null && base.appRole == null) {
    const role = await getStoredActiveRole();
    base.app_role = role === 'vendor' ? 'vendor' : 'customer';
  }
  return { socket, base };
}

/**
 * @param {unknown} ack
 */
function resolveAckPromise(ack) {
  const out = parseAck(ack);
  return {
    success: out.success,
    dispute: out.dispute,
    others: out.others,
    result: out.result,
    list: Array.isArray(out.list) ? out.list : null,
    message: out.message,
    error: out.error,
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
 * Chat-only socket ack — never updates order / return / dispute Redux.
 * Use for: get_room_messages, create_message, get_rooms, create_room, typing, mark_message_as_read.
 *
 * @template T
 * @param {string} event
 * @param {Record<string, unknown>} [payload]
 */
export async function emitChatSocketAck(event, payload = {}) {
  if (!isChatSocketEvent(event)) {
    console.warn(
      `[chatSocket] emitChatSocketAck called with non-chat event "${event}". Use emitSocketAck for domain events.`,
    );
  }

  const { socket, base } = await prepareSocketPayload(payload);
  if (!socket || !base) {
    return {
      success: false,
      result: null,
      list: null,
      message: 'Sign in required',
      error: '',
      dispute: null,
      others: null,
    };
  }

  return new Promise((resolve) => {
    socket.emit(event, base, (ack) => {
      resolve(resolveAckPromise(ack));
    });
  });
}

/**
 * Order / return / dispute socket ack — updates Redux only for whitelisted domain events.
 * Chat events must use {@link emitChatSocketAck} instead.
 *
 * @template T
 * @param {string} event
 * @param {Record<string, unknown>} [payload]
 */
export async function emitSocketAck(event, payload = {}) {
  if (isChatSocketEvent(event)) {
    return emitChatSocketAck(event, payload);
  }

  const { socket, base } = await prepareSocketPayload(payload);
  if (!socket || !base) {
    return {
      success: false,
      result: null,
      list: null,
      message: 'Sign in required',
      error: '',
      dispute: null,
      others: null,
    };
  }

  return new Promise((resolve) => {
    socket.emit(event, base, (ack) => {
      const out = parseAck(ack);
      if (out.success && isDomainSocketEvent(event)) {
        void applySocketAckPayload(ack, event);
      }
      resolve(resolveAckPromise(ack));
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
