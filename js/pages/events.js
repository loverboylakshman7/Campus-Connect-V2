/* =========================================
   CAMPUS CONNECT V2
   EVENTS PAGE

   Handles:
   - Page authentication
   - Loading events from Supabase
   - Upcoming event detection
   - Past event detection
   - Event cards
   - Empty states
   - Refreshing events
   ========================================= */

"use strict";

import {
  getSupabase
} from "../config/supabase.js";

import {
  initializeGuards
} from "../core/guards.js";

import {
  formatDate,
  escapeHTML
} from "../core/utils.js";

import {
  showLoading,
  hideLoading
} from "../components/loading.js";

import {
  showError,
  showInfo
} from "../components/notifications.js";


/* =========================================
   PAGE ELEMENTS
   ========================================= */

function getEventElements() {
  return {
    container:
      document.querySelector(
        "[data-events-list]"
      ),

    count:
      document.querySelector(
        "[data-events-count]"
      ),

    refreshButton:
      document.querySelector(
        "[data-refresh-events]"
      )
  };
}


/* =========================================
   FETCH EVENTS
   ========================================= */

async function fetchEvents() {
  const client =
    getSupabase();


  if (!client) {
    throw new Error(
      "Supabase is not configured yet."
    );
  }


  const {
    data,
    error
  } =
    await client
      .from("events")
      .select("*")
      .order(
        "event_date",
        {
          ascending: true
        }
      );


  if (error) {
    throw new Error(
      error.message
    );
  }


  return (
    data ||
    []
  );
}


/* =========================================
   EVENT DATA HELPERS
   ========================================= */

function getEventTitle(event) {
  return (
    event.title ||
    event.name ||
    "Untitled Event"
  );
}


function getEventDescription(event) {
  return (
    event.description ||
    event.content ||
    ""
  );
}


function getEventDate(event) {
  return (
    event.event_date ||
    event.date ||
    event.start_date ||
    null
  );
}


function getEventLocation(event) {
  return (
    event.location ||
    event.venue ||
    ""
  );
}


/* =========================================
   EVENT STATUS
   ========================================= */

function isPastEvent(event) {
  const eventDate =
    getEventDate(event);


  if (!eventDate) {
    return false;
  }


  const date =
    new Date(eventDate);


  const now =
    new Date();


  return date < now;
}


function getEventStatus(event) {
  return isPastEvent(event)
    ? {
        label: "Completed",
        className: "completed"
      }
    : {
        label: "Upcoming",
        className: "upcoming"
      };
}


/* =========================================
   CREATE EVENT CARD
   ========================================= */

function createEventCard(event) {
  const card =
    document.createElement(
      "article"
    );


  const status =
    getEventStatus(event);


  card.className =
    `event-card event-card--${status.className}`;


  const title =
    escapeHTML(
      getEventTitle(event)
    );


  const description =
    escapeHTML(
      getEventDescription(event)
    );


  const location =
    escapeHTML(
      getEventLocation(event)
    );


  const eventDate =
    getEventDate(event);


  const formattedDate =
    eventDate
      ? formatDate(eventDate)
      : "Date to be announced";


  card.innerHTML = `
    <div class="event-card__header">

      <div class="event-card__heading">

        <h3 class="event-card__title">
          ${title}
        </h3>

        <span
          class="event-card__status event-card__status--${status.className}"
        >
          ${status.label}
        </span>

      </div>

    </div>

    ${
      description
        ? `
          <p class="event-card__description">
            ${description}
          </p>
        `
        : ""
    }

    <div class="event-card__details">

      <div class="event-card__detail">
        <span class="event-card__detail-label">
          Date
        </span>

        <span class="event-card__detail-value">
          ${escapeHTML(formattedDate)}
        </span>
      </div>

      ${
        location
          ? `
            <div class="event-card__detail">
              <span class="event-card__detail-label">
                Location
              </span>

              <span class="event-card__detail-value">
                ${location}
              </span>
            </div>
          `
          : ""
      }

    </div>
  `;


  return card;
}


/* =========================================
   EMPTY STATE
   ========================================= */

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        📅
      </div>

      <h3 class="empty-state__title">
        No upcoming events
      </h3>

      <p class="empty-state__text">
        Campus events will appear here when available.
      </p>

    </div>
  `;
}


/* =========================================
   LOADING STATE
   ========================================= */

function renderLoadingState(container) {
  container.innerHTML = `
    <div class="page-loading-state">

      <div
        class="loading-spinner"
        aria-hidden="true"
      ></div>

      <p>
        Loading events...
      </p>

    </div>
  `;
}


/* =========================================
   ERROR STATE
   ========================================= */

function renderErrorState(container) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        ⚠
      </div>

      <h3 class="empty-state__title">
        Unable to load events
      </h3>

      <p class="empty-state__text">
        Please refresh and try again.
      </p>

    </div>
  `;
}


/* =========================================
   RENDER EVENTS
   ========================================= */

function renderEvents(events) {
  const {
    container,
    count
  } =
    getEventElements();


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!events.length) {
    renderEmptyState(
      container
    );


    if (count) {
      count.textContent =
        "0";
    }


    return;
  }


  events.forEach(
    (event) => {
      const card =
        createEventCard(event);


      container.appendChild(
        card
      );
    }
  );


  if (count) {
    count.textContent =
      String(
        events.length
      );
  }
}


/* =========================================
   LOAD EVENTS
   ========================================= */

export async function loadEvents() {
  const {
    container
  } =
    getEventElements();


  if (!container) {
    console.warn(
      "[Campus Connect] Event container was not found."
    );

    return;
  }


  renderLoadingState(
    container
  );


  try {
    const events =
      await fetchEvents();


    renderEvents(
      events
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Events error:",
      error
    );


    renderErrorState(
      container
    );


    showError(
      "Unable to load events",
      error.message ||
        "Please try again."
    );
  }
}


/* =========================================
   REFRESH BUTTON
   ========================================= */

function initializeRefreshButton() {
  const {
    refreshButton
  } =
    getEventElements();


  if (!refreshButton) {
    return;
  }


  refreshButton.addEventListener(
    "click",
    async () => {
      await loadEvents();


      showInfo(
        "Updated",
        "Events have been refreshed."
      );
    }
  );
}


/* =========================================
   INITIALIZE PAGE
   ========================================= */

export async function initializeEventsPage() {
  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  showLoading(
    "Loading campus events..."
  );


  try {
    initializeRefreshButton();

    await loadEvents();
  } finally {
    await hideLoading();
  }
}


/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeEventsPage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectEvents = {
  initialize:
    initializeEventsPage,

  load:
    loadEvents,

  refresh:
    loadEvents
};