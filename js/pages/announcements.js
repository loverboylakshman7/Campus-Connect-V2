/* =========================================
   CAMPUS CONNECT V2
   ANNOUNCEMENTS PAGE

   Handles:
   - Page authentication
   - Loading announcements from Supabase
   - Rendering announcement cards
   - Empty states
   - Error handling
   - Refreshing announcements
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

function getAnnouncementElements() {
  return {
    container:
      document.querySelector(
        "[data-announcements-list]"
      ),

    count:
      document.querySelector(
        "[data-announcements-count]"
      ),

    refreshButton:
      document.querySelector(
        "[data-refresh-announcements]"
      )
  };
}


/* =========================================
   LOAD ANNOUNCEMENTS
   ========================================= */

/**
 * Get announcements from Supabase.
 *
 * @returns {Promise<Array>}
 */
async function fetchAnnouncements() {
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
      .from("announcements")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
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
   ANNOUNCEMENT DATE
   ========================================= */

function getAnnouncementDate(
  announcement
) {
  return (
    announcement.created_at ||
    announcement.date ||
    null
  );
}


/* =========================================
   ANNOUNCEMENT TITLE
   ========================================= */

function getAnnouncementTitle(
  announcement
) {
  return (
    announcement.title ||
    "Untitled Announcement"
  );
}


/* =========================================
   ANNOUNCEMENT CONTENT
   ========================================= */

function getAnnouncementContent(
  announcement
) {
  return (
    announcement.content ||
    announcement.message ||
    announcement.description ||
    ""
  );
}


/* =========================================
   CREATE ANNOUNCEMENT CARD
   ========================================= */

/**
 * Create one announcement card.
 *
 * @param {Object} announcement
 * @returns {HTMLElement}
 */
function createAnnouncementCard(
  announcement
) {
  const card =
    document.createElement(
      "article"
    );


  card.className =
    "announcement-card";


  const title =
    escapeHTML(
      getAnnouncementTitle(
        announcement
      )
    );


  const content =
    escapeHTML(
      getAnnouncementContent(
        announcement
      )
    );


  const date =
    getAnnouncementDate(
      announcement
    );


  const formattedDate =
    date
      ? formatDate(date)
      : "Recently posted";


  card.innerHTML = `
    <div class="announcement-card__header">

      <div>
        <h3 class="announcement-card__title">
          ${title}
        </h3>

        <p class="announcement-card__date">
          ${escapeHTML(formattedDate)}
        </p>
      </div>

    </div>

    ${
      content
        ? `
          <p class="announcement-card__content">
            ${content}
          </p>
        `
        : ""
    }
  `;


  return card;
}


/* =========================================
   EMPTY STATE
   ========================================= */

function renderEmptyState(
  container
) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        📢
      </div>

      <h3 class="empty-state__title">
        No announcements yet
      </h3>

      <p class="empty-state__text">
        New campus announcements will appear here.
      </p>

    </div>
  `;
}


/* =========================================
   LOADING STATE
   ========================================= */

function renderLoadingState(
  container
) {
  container.innerHTML = `
    <div class="page-loading-state">

      <div
        class="loading-spinner"
        aria-hidden="true"
      ></div>

      <p>
        Loading announcements...
      </p>

    </div>
  `;
}


/* =========================================
   ERROR STATE
   ========================================= */

function renderErrorState(
  container
) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        ⚠
      </div>

      <h3 class="empty-state__title">
        Unable to load announcements
      </h3>

      <p class="empty-state__text">
        Please try refreshing the page.
      </p>

    </div>
  `;
}


/* =========================================
   RENDER ANNOUNCEMENTS
   ========================================= */

/**
 * Render announcements into the page.
 *
 * @param {Array} announcements
 */
function renderAnnouncements(
  announcements
) {
  const {
    container,
    count
  } =
    getAnnouncementElements();


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (
    !announcements.length
  ) {
    renderEmptyState(
      container
    );


    if (count) {
      count.textContent = "0";
    }


    return;
  }


  announcements.forEach(
    (announcement) => {
      const card =
        createAnnouncementCard(
          announcement
        );


      container.appendChild(
        card
      );
    }
  );


  if (count) {
    count.textContent =
      String(
        announcements.length
      );
  }
}


/* =========================================
   LOAD PAGE DATA
   ========================================= */

export async function loadAnnouncements() {
  const {
    container
  } =
    getAnnouncementElements();


  if (!container) {
    console.warn(
      "[Campus Connect] Announcement container was not found."
    );

    return;
  }


  renderLoadingState(
    container
  );


  try {
    const announcements =
      await fetchAnnouncements();


    renderAnnouncements(
      announcements
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Announcements error:",
      error
    );


    renderErrorState(
      container
    );


    showError(
      "Unable to load announcements",
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
    getAnnouncementElements();


  if (!refreshButton) {
    return;
  }


  refreshButton.addEventListener(
    "click",
    async () => {
      await loadAnnouncements();


      showInfo(
        "Updated",
        "Announcements have been refreshed."
      );
    }
  );
}


/* =========================================
   INITIALIZE PAGE
   ========================================= */

export async function initializeAnnouncementsPage() {
  /*
   Protect the page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  showLoading(
    "Loading announcements..."
  );


  try {
    initializeRefreshButton();

    await loadAnnouncements();
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
    initializeAnnouncementsPage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectAnnouncements = {
  initialize:
    initializeAnnouncementsPage,

  load:
    loadAnnouncements,

  refresh:
    loadAnnouncements
};