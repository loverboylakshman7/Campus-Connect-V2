/* =========================================
   CAMPUS CONNECT V2
   CORE UTILITIES

   Shared reusable utility functions.
   This file should not contain page-specific
   or component-specific logic.
   ========================================= */

"use strict";


/* =========================================
   DOM UTILITIES
   ========================================= */


/**
 * Select a single element.
 *
 * @param {string} selector
 * @param {Document|Element} parent
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}


/**
 * Select multiple elements.
 *
 * @param {string} selector
 * @param {Document|Element} parent
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return Array.from(
    parent.querySelectorAll(selector)
  );
}


/**
 * Create a DOM element.
 *
 * @param {string} tag
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createElement(
  tag,
  options = {}
) {
  const element =
    document.createElement(tag);


  if (options.className) {
    element.className =
      options.className;
  }


  if (options.text !== undefined) {
    element.textContent =
      options.text;
  }


  if (options.html !== undefined) {
    element.innerHTML =
      options.html;
  }


  if (options.attributes) {
    Object.entries(
      options.attributes
    ).forEach(([key, value]) => {
      element.setAttribute(
        key,
        String(value)
      );
    });
  }


  return element;
}


/* =========================================
   LOCAL STORAGE UTILITIES
   ========================================= */


/**
 * Save data to localStorage safely.
 *
 * @param {string} key
 * @param {*} value
 * @returns {boolean}
 */
export function setStorage(
  key,
  value
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      "Unable to save data to local storage:",
      error
    );

    return false;
  }
}


/**
 * Get data from localStorage safely.
 *
 * @param {string} key
 * @param {*} defaultValue
 * @returns {*}
 */
export function getStorage(
  key,
  defaultValue = null
) {
  try {
    const value =
      localStorage.getItem(key);


    if (value === null) {
      return defaultValue;
    }


    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Unable to read data from local storage:",
      error
    );

    return defaultValue;
  }
}


/**
 * Remove one localStorage item.
 *
 * @param {string} key
 */
export function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(
      "Unable to remove local storage data:",
      error
    );
  }
}


/**
 * Check whether a storage key exists.
 *
 * @param {string} key
 * @returns {boolean}
 */
export function hasStorage(key) {
  return localStorage.getItem(key) !== null;
}


/* =========================================
   STRING UTILITIES
   ========================================= */


/**
 * Escape HTML to prevent unsafe injection.
 *
 * @param {*} value
 * @returns {string}
 */
export function escapeHTML(value) {
  const div =
    document.createElement("div");

  div.textContent =
    String(value ?? "");

  return div.innerHTML;
}


/**
 * Capitalize the first letter.
 *
 * @param {string} value
 * @returns {string}
 */
export function capitalize(value = "") {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}


/**
 * Convert text into a URL-friendly slug.
 *
 * @param {string} value
 * @returns {string}
 */
export function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


/**
 * Truncate long text.
 *
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(
  value = "",
  maxLength = 100
) {
  const text =
    String(value);


  if (
    text.length <= maxLength
  ) {
    return text;
  }


  return (
    text.slice(
      0,
      maxLength
    ).trimEnd() + "..."
  );
}


/* =========================================
   DATE UTILITIES
   ========================================= */


/**
 * Convert a value into a valid Date object.
 *
 * @param {Date|string|number} value
 * @returns {Date|null}
 */
export function toDate(value) {
  if (!value) {
    return null;
  }


  const date =
    value instanceof Date
      ? value
      : new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }


  return date;
}


/**
 * Format a date.
 *
 * @param {Date|string|number} value
 * @param {Object} options
 * @returns {string}
 */
export function formatDate(
  value,
  options = {
    day: "numeric",
    month: "short",
    year: "numeric"
  }
) {
  const date =
    toDate(value);


  if (!date) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "en-IN",
    options
  ).format(date);
}


/**
 * Format a time.
 *
 * @param {Date|string|number} value
 * @returns {string}
 */
export function formatTime(value) {
  const date =
    toDate(value);


  if (!date) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit"
    }
  ).format(date);
}


/**
 * Check if a date is today.
 *
 * @param {Date|string|number} value
 * @returns {boolean}
 */
export function isToday(value) {
  const date =
    toDate(value);


  if (!date) {
    return false;
  }


  const today =
    new Date();


  return (
    date.getDate() ===
      today.getDate() &&
    date.getMonth() ===
      today.getMonth() &&
    date.getFullYear() ===
      today.getFullYear()
  );
}


/**
 * Check whether a date is in the past.
 *
 * @param {Date|string|number} value
 * @returns {boolean}
 */
export function isPast(value) {
  const date =
    toDate(value);


  if (!date) {
    return false;
  }


  return (
    date.getTime() <
    Date.now()
  );
}


/**
 * Get days remaining until a date.
 *
 * @param {Date|string|number} value
 * @returns {number|null}
 */
export function getDaysUntil(value) {
  const date =
    toDate(value);


  if (!date) {
    return null;
  }


  const now =
    new Date();


  const startOfToday =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );


  const targetDate =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );


  const difference =
    targetDate -
    startOfToday;


  return Math.ceil(
    difference /
    (1000 * 60 * 60 * 24)
  );
}


/**
 * Return a readable relative date.
 *
 * Examples:
 * Today
 * Tomorrow
 * 3 days ago
 * In 5 days
 *
 * @param {Date|string|number} value
 * @returns {string}
 */
export function getRelativeDate(value) {
  const days =
    getDaysUntil(value);


  if (days === null) {
    return "";
  }


  if (days === 0) {
    return "Today";
  }


  if (days === 1) {
    return "Tomorrow";
  }


  if (days === -1) {
    return "Yesterday";
  }


  if (days > 1) {
    return `In ${days} days`;
  }


  return `${Math.abs(days)} days ago`;
}


/* =========================================
   VALIDATION UTILITIES
   ========================================= */


/**
 * Check if a value is empty.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  );
}


/**
 * Validate email format.
 *
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(
  email
) {
  if (
    typeof email !== "string"
  ) {
    return false;
  }


  const pattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


  return pattern.test(
    email.trim()
  );
}


/**
 * Check minimum string length.
 *
 * @param {string} value
 * @param {number} minimum
 * @returns {boolean}
 */
export function hasMinLength(
  value,
  minimum
) {
  return (
    String(
      value ?? ""
    ).trim().length >= minimum
  );
}


/**
 * Check maximum string length.
 *
 * @param {string} value
 * @param {number} maximum
 * @returns {boolean}
 */
export function hasMaxLength(
  value,
  maximum
) {
  return (
    String(
      value ?? ""
    ).trim().length <= maximum
  );
}


/* =========================================
   NUMBER UTILITIES
   ========================================= */


/**
 * Safely convert a value to a number.
 *
 * @param {*} value
 * @param {number} defaultValue
 * @returns {number}
 */
export function toNumber(
  value,
  defaultValue = 0
) {
  const number =
    Number(value);


  return Number.isFinite(number)
    ? number
    : defaultValue;
}


/**
 * Clamp a number between limits.
 *
 * @param {number} value
 * @param {number} minimum
 * @param {number} maximum
 * @returns {number}
 */
export function clamp(
  value,
  minimum,
  maximum
) {
  return Math.min(
    Math.max(
      value,
      minimum
    ),
    maximum
  );
}


/* =========================================
   ID GENERATION
   ========================================= */


/**
 * Generate a simple unique ID.
 *
 * @param {string} prefix
 * @returns {string}
 */
export function generateId(
  prefix = "cc"
) {
  const random =
    Math.random()
      .toString(36)
      .slice(2, 10);


  const timestamp =
    Date.now()
      .toString(36);


  return `${prefix}-${timestamp}-${random}`;
}


/* =========================================
   DEBOUNCE
   ========================================= */


/**
 * Delay a function until activity stops.
 *
 * Useful for:
 * - Search inputs
 * - Window resize
 * - Filtering
 *
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(
  callback,
  delay = 300
) {
  let timeoutId;


  return function debouncedFunction(
    ...args
  ) {
    clearTimeout(timeoutId);


    timeoutId =
      setTimeout(() => {
        callback.apply(
          this,
          args
        );
      }, delay);
  };
}


/* =========================================
   DELAY / WAIT
   ========================================= */


/**
 * Wait for a specific number of milliseconds.
 *
 * @param {number} milliseconds
 * @returns {Promise<void>}
 */
export function wait(
  milliseconds = 0
) {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds
      );
    }
  );
}


/* =========================================
   ARRAY UTILITIES
   ========================================= */


/**
 * Sort objects by a property.
 *
 * @param {Array} array
 * @param {string} property
 * @param {"asc"|"desc"} direction
 * @returns {Array}
 */
export function sortBy(
  array = [],
  property,
  direction = "asc"
) {
  const sorted =
    [...array];


  return sorted.sort(
    (first, second) => {
      const a =
        first[property];

      const b =
        second[property];


      if (a === b) {
        return 0;
      }


      const result =
        a > b
          ? 1
          : -1;


      return direction === "desc"
        ? -result
        : result;
    }
  );
}


/**
 * Find an item by ID.
 *
 * @param {Array} array
 * @param {string} id
 * @returns {Object|null}
 */
export function findById(
  array = [],
  id
) {
  return (
    array.find(
      (item) =>
        item.id === id
    ) || null
  );
}


/* =========================================
   ERROR HANDLING
   ========================================= */


/**
 * Convert an unknown error into a readable
 * error message.
 *
 * @param {*} error
 * @param {string} fallback
 * @returns {string}
 */
export function getErrorMessage(
  error,
  fallback =
    "Something went wrong. Please try again."
) {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }


  if (
    typeof error === "string" &&
    error.trim()
  ) {
    return error;
  }


  return fallback;
}


/* =========================================
   DEVELOPMENT LOGGING
   ========================================= */

export function log(
  ...messages
) {
  console.log(
    "[Campus Connect]",
    ...messages
  );
}


export function logError(
  ...messages
) {
  console.error(
    "[Campus Connect]",
    ...messages
  );
}