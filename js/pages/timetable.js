/* =========================================
   CAMPUS CONNECT V2
   TIMETABLE PAGE

   Handles:
   - Page authentication
   - Loading timetable from Supabase
   - Day-wise timetable
   - Today's classes
   - Current/next class detection
   - Empty and error states
   - Refreshing timetable
   ========================================= */

"use strict";

import {
  getSupabase
} from "../config/supabase.js";

import {
  getCurrentUser
} from "../core/auth.js";

import {
  initializeGuards
} from "../core/guards.js";

import {
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
   DAYS
   ========================================= */

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];


/* =========================================
   PAGE ELEMENTS
   ========================================= */

function getTimetableElements() {
  return {
    container:
      document.querySelector(
        "[data-timetable-list]"
      ),

    todayContainer:
      document.querySelector(
        "[data-today-timetable]"
      ),

    currentDay:
      document.querySelector(
        "[data-current-day]"
      ),

    count:
      document.querySelector(
        "[data-timetable-count]"
      ),

    refreshButton:
      document.querySelector(
        "[data-refresh-timetable]"
      )
  };
}


/* =========================================
   FETCH TIMETABLE
   ========================================= */

async function fetchTimetable() {
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
      .from("timetable")
      .select("*")
      .order(
        "start_time",
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
   TIMETABLE DATA HELPERS
   ========================================= */

function getClassDay(item) {
  return (
    item.day ||
    item.weekday ||
    ""
  );
}


function getSubject(item) {
  return (
    item.subject ||
    item.title ||
    item.course ||
    "Untitled Class"
  );
}


function getFaculty(item) {
  return (
    item.faculty ||
    item.teacher ||
    item.instructor ||
    ""
  );
}


function getRoom(item) {
  return (
    item.room ||
    item.classroom ||
    item.location ||
    ""
  );
}


function getStartTime(item) {
  return (
    item.start_time ||
    item.start ||
    ""
  );
}


function getEndTime(item) {
  return (
    item.end_time ||
    item.end ||
    ""
  );
}


/* =========================================
   FORMAT TIME
   ========================================= */

function formatTime(time) {
  if (!time) {
    return "";
  }


  /*
   Supports values such as:
   09:30
   09:30:00
  */

  const parts =
    time.split(":");


  if (
    parts.length < 2
  ) {
    return time;
  }


  let hours =
    Number(parts[0]);


  const minutes =
    parts[1];


  if (
    Number.isNaN(hours)
  ) {
    return time;
  }


  const period =
    hours >= 12
      ? "PM"
      : "AM";


  hours =
    hours % 12 ||
    12;


  return (
    `${hours}:${minutes} ${period}`
  );
}


/* =========================================
   GET CURRENT DAY
   ========================================= */

function getTodayName() {
  return DAYS[
    new Date().getDay()
  ];
}


/* =========================================
   NORMALIZE DAY
   ========================================= */

function normalizeDay(day) {
  if (!day) {
    return "";
  }


  return String(day)
    .trim()
    .toLowerCase();
}


/* =========================================
   FILTER TODAY'S CLASSES
   ========================================= */

function getTodayClasses(
  timetable
) {
  const today =
    normalizeDay(
      getTodayName()
    );


  return timetable.filter(
    (item) =>
      normalizeDay(
        getClassDay(item)
      ) === today
  );
}


/* =========================================
   CREATE TIMETABLE CARD
   ========================================= */

function createTimetableCard(
  item,
  isToday = false
) {
  const card =
    document.createElement(
      "article"
    );


  card.className =
    isToday
      ? "timetable-card timetable-card--today"
      : "timetable-card";


  const subject =
    escapeHTML(
      getSubject(item)
    );


  const faculty =
    escapeHTML(
      getFaculty(item)
    );


  const room =
    escapeHTML(
      getRoom(item)
    );


  const day =
    escapeHTML(
      getClassDay(item)
    );


  const start =
    formatTime(
      getStartTime(item)
    );


  const end =
    formatTime(
      getEndTime(item)
    );


  const time =
    start && end
      ? `${start} – ${end}`
      : start ||
        end ||
        "Time not available";


  card.innerHTML = `
    <div class="timetable-card__time">
      ${escapeHTML(time)}
    </div>

    <div class="timetable-card__content">

      ${
        !isToday && day
          ? `
            <span class="timetable-card__day">
              ${day}
            </span>
          `
          : ""
      }

      <h3 class="timetable-card__subject">
        ${subject}
      </h3>

      ${
        faculty
          ? `
            <p class="timetable-card__faculty">
              ${faculty}
            </p>
          `
          : ""
      }

      ${
        room
          ? `
            <p class="timetable-card__room">
              Room: ${room}
            </p>
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

function renderEmptyState(
  container,
  message = "No classes scheduled."
) {
  container.innerHTML = `
    <div class="empty-state">

      <div
        class="empty-state__icon"
        aria-hidden="true"
      >
        📚
      </div>

      <h3 class="empty-state__title">
        No classes
      </h3>

      <p class="empty-state__text">
        ${escapeHTML(message)}
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
        Loading timetable...
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
        Unable to load timetable
      </h3>

      <p class="empty-state__text">
        Please refresh and try again.
      </p>

    </div>
  `;
}


/* =========================================
   RENDER FULL TIMETABLE
   ========================================= */

function renderTimetable(
  timetable
) {
  const {
    container,
    count
  } =
    getTimetableElements();


  if (!container) {
    return;
  }


  container.innerHTML = "";


  if (!timetable.length) {
    renderEmptyState(
      container,
      "Your class timetable will appear here."
    );


    if (count) {
      count.textContent = "0";
    }


    return;
  }


  /*
   Group classes by day.
  */

  const grouped =
    {};


  timetable.forEach(
    (item) => {
      const day =
        getClassDay(item) ||
        "Other";


      if (!grouped[day]) {
        grouped[day] = [];
      }


      grouped[day].push(
        item
      );
    }
  );


  DAYS.forEach(
    (day) => {
      const classes =
        grouped[day];


      if (
        !classes ||
        !classes.length
      ) {
        return;
      }


      const section =
        document.createElement(
          "section"
        );


      section.className =
        "timetable-day";


      const heading =
        document.createElement(
          "h2"
        );


      heading.className =
        "timetable-day__title";


      heading.textContent =
        day;


      section.appendChild(
        heading
      );


      classes.forEach(
        (item) => {
          section.appendChild(
            createTimetableCard(
              item
            )
          );
        }
      );


      container.appendChild(
        section
      );
    }
  );


  if (count) {
    count.textContent =
      String(
        timetable.length
      );
  }
}


/* =========================================
   RENDER TODAY'S CLASSES
   ========================================= */

function renderTodayTimetable(
  timetable
) {
  const {
    todayContainer,
    currentDay
  } =
    getTimetableElements();


  if (currentDay) {
    currentDay.textContent =
      getTodayName();
  }


  if (!todayContainer) {
    return;
  }


  const todayClasses =
    getTodayClasses(
      timetable
    );


  todayContainer.innerHTML =
    "";


  if (!todayClasses.length) {
    renderEmptyState(
      todayContainer,
      "You have no classes scheduled today."
    );

    return;
  }


  todayClasses.forEach(
    (item) => {
      todayContainer.appendChild(
        createTimetableCard(
          item,
          true
        )
      );
    }
  );
}


/* =========================================
   LOAD TIMETABLE
   ========================================= */

export async function loadTimetable() {
  const {
    container
  } =
    getTimetableElements();


  if (!container) {
    console.warn(
      "[Campus Connect] Timetable container was not found."
    );

    return;
  }


  renderLoadingState(
    container
  );


  try {
    const timetable =
      await fetchTimetable();


    renderTimetable(
      timetable
    );


    renderTodayTimetable(
      timetable
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Timetable error:",
      error
    );


    renderErrorState(
      container
    );


    showError(
      "Unable to load timetable",
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
    getTimetableElements();


  if (!refreshButton) {
    return;
  }


  refreshButton.addEventListener(
    "click",
    async () => {
      await loadTimetable();


      showInfo(
        "Updated",
        "Timetable has been refreshed."
      );
    }
  );
}


/* =========================================
   INITIALIZE PAGE
   ========================================= */

export async function initializeTimetablePage() {
  /*
   Protect this page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  showLoading(
    "Loading timetable..."
  );


  try {
    initializeRefreshButton();

    await loadTimetable();
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
    initializeTimetablePage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectTimetable = {
  initialize:
    initializeTimetablePage,

  load:
    loadTimetable,

  refresh:
    loadTimetable
};