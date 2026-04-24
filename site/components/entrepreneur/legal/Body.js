/**
 * Legal Page Body Component
 * 
 * Main content section for the Legal page.
 * Displays legal documents and information.
 * 
 * @module components/entrepreneur/legal/Body
 */

import React from "react";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Legal document sections
 * TODO: Add actual legal content
 */
const LEGAL_SECTIONS = [
  {
    title: "",
    items: ["", "", "", "", ""],
  },
];

// ============================================================================
// BODY COMPONENT
// ============================================================================

/**
 * Legal page body section component
 * 
 * @returns {JSX.Element} The body section
 */
export default function Body() {
  return (
    <section>
      <ul>
        {LEGAL_SECTIONS.map((section, index) => (
          <li key={index}>
            <h5>{section.title}</h5>
            <div>
              {section.items.map((item, itemIndex) => (
                <small key={itemIndex}>{item}</small>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
