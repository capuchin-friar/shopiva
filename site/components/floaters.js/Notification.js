/**
 * Notification Floater Component
 * 
 * Displays user notifications and alerts.
 * Appears when clicking on the notification bell in the header.
 * 
 * @module components/floaters/Notification
 */

import React from "react";
import "./style.css";
import filter_svg from "../../svgs/filter-svgrepo-com (1).svg";
import markasread_svg from "../../svgs/web-mark-as-favorite-star-svgrepo-com.svg";

// ============================================================================
// MOCK DATA
// ============================================================================

/**
 * Sample notification data
 * TODO: Replace with actual API data
 */
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: "Billing",
    time: "2:20PM",
    title: "Your bill payment failed",
    message:
      "Your $1.0 payment for your shopify bill couldn't be processed because of a problem with your payment method.",
  },
  {
    id: 2,
    type: "Billing",
    time: "2:20PM",
    title: "Your bill payment failed",
    message:
      "Your $1.0 payment for your shopify bill couldn't be processed because of a problem with your payment method.",
  },
  {
    id: 3,
    type: "Billing",
    time: "2:20PM",
    title: "Your bill payment failed",
    message:
      "Your $1.0 payment for your shopify bill couldn't be processed because of a problem with your payment method.",
  },
  {
    id: 4,
    type: "Billing",
    time: "2:20PM",
    title: "Your bill payment failed",
    message:
      "Your $1.0 payment for your shopify bill couldn't be processed because of a problem with your payment method.",
  },
];

// ============================================================================
// NOTIFICATION FLOATER COMPONENT
// ============================================================================

/**
 * Notification floater dropdown component
 * Shows alerts and notifications with filtering options
 * 
 * @returns {JSX.Element} The notification floater dropdown
 */
export default function NotificationFloater() {
  // ============================================================================
  // RENDER HELPERS
  // ============================================================================
  
  /**
   * Renders a single notification item
   * @param {Object} notification - The notification data
   * @returns {JSX.Element} Notification list item
   */
  const renderNotificationItem = (notification) => (
    <li key={notification.id}>
      {/* Header Row */}
      <div style={{ justifyContent: "flex-start", alignItems: "center" }}>
        <span>
          <input type="checkbox" name="" id="" />
        </span>
        &nbsp;&nbsp;
        <span>{notification.type}</span>
        &nbsp;&#8226;&nbsp;
        <span>{notification.time}</span>
      </div>

      {/* Title Row */}
      <div style={{ justifyContent: "flex-start" }}>
        <span
          style={{
            borderRadius: "50%",
            border: "1px solid red",
            height: "18px",
            width: "18px",
            display: "flex",
            alignItems: "center",
            color: "red",
            justifyContent: "center",
            padding: "4px",
          }}
        >
          !
        </span>
        &nbsp;&nbsp;
        <span>{notification.title}</span>
      </div>

      {/* Message */}
      <div>
        <p style={{ color: "#333333" }}>{notification.message}</p>
      </div>
    </li>
  );

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="notification-floater shadow-sm">
      {/* Header */}
      <div
        className="shadow-sm"
        style={{
          borderBottom: "1px solid #efefef",
          borderBottomLeftRadius: "0",
          borderBottomRightRadius: "0",
        }}
      >
        <span>
          <small>
            <b>Alerts</b>
          </small>
        </span>

        <span>
          {/* Filter Button */}
          <span>
            <img
              src={filter_svg.src}
              style={{ height: "18px", width: "20px" }}
              alt="Filter notifications"
            />
          </span>
          &nbsp;&nbsp;&nbsp;
          {/* Mark as Read Button */}
          <span>
            <img
              src={markasread_svg.src}
              style={{ height: "15px", width: "18px" }}
              alt="Mark as read"
            />
          </span>
        </span>
      </div>

      {/* Notification List */}
      <ul>{MOCK_NOTIFICATIONS.map(renderNotificationItem)}</ul>
    </div>
  );
}
