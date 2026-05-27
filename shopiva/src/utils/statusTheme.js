
/** Pill themes */
export const PAY_THEME = {
  paid: {
    bg: '#ECFDF5',
    dot: '#059669',
    text: '#065F46',
    label: 'Paid',
  },

  unpaid: {
    bg: '#FEFCE8',
    dot: '#CA8A04',
    text: '#854D0E',
    label: 'Unpaid',
  },

  refunded: {
    bg: '#EEF2FF',
    dot: '#6366F1',
    text: '#3730A3',
    label: 'Refunded',
  },

  cancelled: {
    bg: '#F3F4F6',
    dot: '#6B7280',
    text: '#374151',
    label: 'Cancelled',
  },
};
export const STATUS_THEME = {
  payment_received: {
    bg: '#ECFDF5',
    dot: '#059669',
    text: '#065F46',
    label: 'Payment received',
  },

  order_accepted: {
    bg: '#FEFCE8',
    dot: '#CA8A04',
    text: '#854D0E',
    label: 'Order accepted',
  },

  order_processing: {
    bg: '#FFF7ED',
    dot: '#EA580C',
    text: '#9A3412',
    label: 'Processing',
  },

  order_shipping: {
    bg: '#EFF6FF',
    dot: '#2563EB',
    text: '#1D4ED8',
    label: 'Shipping',
  },

  order_out_for_delivery: {
    bg: '#E0F2FE',
    dot: '#0284C7',
    text: '#075985',
    label: 'Out For Delivery',
  },

  order_delivered: {
    bg: '#F0FDF4',
    dot: '#22C55E',
    text: '#166534',
    label: 'Delivered',
  },

  order_confirmed: {
    bg: '#ECFEFF',
    dot: '#0891B2',
    text: '#155E75',
    label: 'Order confirmed',
  },

  order_disputed: {
    bg: '#FEF2F2',
    dot: '#DC2626',
    text: '#991B1B',
    label: 'Order disputed',
  },

  order_cancellation: {
    bg: '#F3F4F6',
    dot: '#6B7280',
    text: '#374151',
    label: 'Cancelled',
  },
};
export const ESCROW_STATUS_THEME = {
  held: {
    bg: '#FEFCE8',
    dot: '#CA8A04',
    text: '#854D0E',
    label: 'Held',
    caption:
      'Funds are held in escrow until delivery is completed or the order is otherwise resolved.',
  },

  locked: {
    bg: '#FEF2F2',
    dot: '#DC2626',
    text: '#991B1B',
    label: 'Locked',
    caption: 'Escrow has been locked due to dispute.',
  },

  released: {
    bg: '#ECFDF5',
    dot: '#059669',
    text: '#065F46',
    label: 'Released',
    caption: 'Escrow has been released to the seller.',
  },

  refunded: {
    bg: '#EEF2FF',
    dot: '#6366F1',
    text: '#3730A3',
    label: 'Refunded',
    caption: 'Funds have been refunded from escrow to the buyer.',
  },
};
export const COLOR = ({
    BRAND_COLOR: "#00926e",
    BRAND_COLOR_LITE: "#00bc8d",
    NEUTRAL: "#FFF",
    DARK: "#111111",
    MUTED: "#8E8E93",
    HAIR: "#ECECEE'",
    TEXT: "#1A1A1A",
    BG: "#F2F2F4"
});

export const RETURN_STATUS_THEME = {
  return_initiated: {
    bg: '#FFF4D6',
    dot: '#B58100',
    text: '#7A5800',
    label: 'Return Initiated',
  },
  return_accepted: {
    bg: '#FFF4D6',
    dot: '#B58100',
    text: '#7A5800',
    label: 'Return accepted',
  },
  return_processing: {
    bg: '#FFF0E0',
    dot: '#C45C00',
    text: '#7A3A00',
    label: 'Processing',
  },
  return_shipping: {
    bg: '#E0EAFF',
    dot: '#2F5DDB',
    text: '#1B3FA1',
    label: 'Shipping',
  },
  return_out_for_delivery: {
    bg: '#E0F2E9',
    dot: '#08ccfd',
    text: '#075646',
    label: 'Out For Delivery',
  },
  return_delivered: {
    bg: '#E0F2E9',
    dot: '#0D8A4A',
    text: '#0D5C2F',
    label: 'Delivered',
  },
  return_confirmed: {
    bg: '#d8f6e7',
    dot: '#00d567',
    text: '#28ed7d',
    label: 'Confirmed',
  },
  return_cancellation: {
    bg: '#FDE3E3',
    dot: '#C62828',
    text: '#9F1818',
    label: 'Cancelled',
  },
};

export const RETURN_PAY_THEME = {
  return_initiated: { bg: '#E0F2E9', dot: '#0D8A4A', text: '#0D5C2F', label: 'Paid' },
  return_accepted: { bg: '#FFF4D6', dot: '#B58100', text: '#7A5800', label: 'Unpaid' },
  return_processing: {
    bg: '#EFEAFF',
    dot: '#7C5CFC',
    text: '#3F2BB8',
    label: 'Refunded',
  },
  return_shipping: {
    bg: '#FDE3E3',
    dot: '#C62828',
    text: '#9F1818',
    label: 'Cancelled',
  },
};
