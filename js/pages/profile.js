/* =========================================
   CAMPUS CONNECT V2
   PROFILE PAGE

   Handles:
   - Page authentication
   - Loading user profile
   - Displaying Supabase user data
   - Updating profile information
   - Saving profile to Supabase
   - Empty and error handling
   ========================================= */

"use strict";

import {
  getSupabase,
  getSupabaseUser
} from "../config/supabase.js";

import {
  getCurrentUser,
  setCurrentUser,
  getUserDisplayName,
  getUserInitials
} from "../core/auth.js";

import {
  initializeGuards
} from "../core/guards.js";

import {
  escapeHTML,
  isValidEmail
} from "../core/utils.js";

import {
  setButtonLoading,
  resetButtonLoading
} from "../components/loading.js";

import {
  showSuccess,
  showError
} from "../components/notifications.js";


/* =========================================
   PAGE ELEMENTS
   ========================================= */

function getProfileElements() {
  return {
    name:
      document.querySelector(
        "[data-profile-name]"
      ),

    email:
      document.querySelector(
        "[data-profile-email]"
      ),

    initials:
      document.querySelector(
        "[data-profile-initials]"
      ),

    role:
      document.querySelector(
        "[data-profile-role]"
      ),

    form:
      document.querySelector(
        "#profile-form"
      ),

    nameInput:
      document.querySelector(
        "#profile-name"
      ),

    emailInput:
      document.querySelector(
        "#profile-email"
      ),

    saveButton:
      document.querySelector(
        "#profile-save"
      )
  };
}


/* =========================================
   FORMAT USER
   ========================================= */

function formatProfileUser(user) {
  if (
    !user ||
    !user.id
  ) {
    return null;
  }


  const metadata =
    user.user_metadata || {};


  const name =
    metadata.full_name ||
    metadata.name ||
    metadata.display_name ||
    user.email
      ?.split("@")[0] ||
    "Student";


  return {
    id:
      user.id,

    email:
      user.email || "",

    name,

    displayName:
      name,

    avatar:
      metadata.avatar_url ||
      null,

    role:
      metadata.role ||
      "student"
  };
}


/* =========================================
   DISPLAY PROFILE
   ========================================= */

function renderProfile(user) {
  if (!user) {
    return;
  }


  const {
    name,
    email,
    initials,
    role,
    nameInput,
    emailInput
  } =
    getProfileElements();


  const displayName =
    user.displayName ||
    user.name ||
    getUserDisplayName();


  if (name) {
    name.textContent =
      displayName;
  }


  if (email) {
    email.textContent =
      user.email || "";
  }


  if (initials) {
    initials.textContent =
      getUserInitials();
  }


  if (role) {
    role.textContent =
      user.role === "admin"
        ? "Administrator"
        : "Student";
  }


  if (nameInput) {
    nameInput.value =
      displayName;
  }


  if (emailInput) {
    emailInput.value =
      user.email || "";
  }
}


/* =========================================
   LOAD PROFILE
   ========================================= */

async function loadProfile() {
  /*
   Get current Supabase user.
  */

  const supabaseUser =
    await getSupabaseUser();


  if (!supabaseUser) {
    throw new Error(
      "Unable to load your profile."
    );
  }


  const user =
    formatProfileUser(
      supabaseUser
    );


  if (!user) {
    throw new Error(
      "Invalid user profile."
    );
  }


  /*
   Update local Campus Connect session.
  */

  setCurrentUser(
    user
  );


  renderProfile(
    user
  );


  return user;
}


/* =========================================
   VALIDATE PROFILE
   ========================================= */

function validateProfile(
  name,
  email
) {
  if (
    !name ||
    !name.trim()
  ) {
    return {
      valid: false,
      message:
        "Please enter your name."
    };
  }


  if (
    !email ||
    !email.trim()
  ) {
    return {
      valid: false,
      message:
        "Please enter your email address."
    };
  }


  if (
    !isValidEmail(
      email.trim()
    )
  ) {
    return {
      valid: false,
      message:
        "Please enter a valid email address."
    };
  }


  return {
    valid: true,
    message: ""
  };
}


/* =========================================
   UPDATE PROFILE
   ========================================= */

async function updateProfile(
  name
) {
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
    await client.auth.updateUser({
      data: {
        full_name:
          name.trim()
      }
    });


  if (error) {
    throw new Error(
      error.message
    );
  }


  return (
    data.user ||
    null
  );
}


/* =========================================
   HANDLE PROFILE SAVE
   ========================================= */

async function handleProfileSubmit(
  event
) {
  event.preventDefault();


  const {
    nameInput,
    emailInput,
    saveButton
  } =
    getProfileElements();


  if (
    !nameInput ||
    !emailInput
  ) {
    return;
  }


  const name =
    nameInput.value.trim();


  const email =
    emailInput.value.trim();


  const validation =
    validateProfile(
      name,
      email
    );


  if (
    !validation.valid
  ) {
    showError(
      "Profile error",
      validation.message
    );

    return;
  }


  /*
   Supabase email changes may require
   confirmation depending on project
   settings.

   For now this profile version updates
   the display name only.
  */

  if (saveButton) {
    setButtonLoading(
      saveButton,
      "Saving..."
    );
  }


  try {
    const updatedUser =
      await updateProfile(
        name
      );


    const user =
      formatProfileUser(
        updatedUser
      );


    if (user) {
      setCurrentUser(
        user
      );

      renderProfile(
        user
      );
    }


    showSuccess(
      "Profile updated",
      "Your profile information has been saved."
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Profile update error:",
      error
    );


    showError(
      "Unable to update profile",
      error.message ||
        "Please try again."
    );
  } finally {
    if (saveButton) {
      resetButtonLoading(
        saveButton
      );
    }
  }
}


/* =========================================
   INITIALIZE PROFILE FORM
   ========================================= */

function initializeProfileForm() {
  const {
    form
  } =
    getProfileElements();


  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    handleProfileSubmit
  );
}


/* =========================================
   INITIALIZE PROFILE PAGE
   ========================================= */

export async function initializeProfilePage() {
  /*
   Protect this page.
  */

  const allowed =
    initializeGuards();


  if (!allowed) {
    return;
  }


  try {
    initializeProfileForm();

    await loadProfile();
  } catch (error) {
    console.error(
      "[Campus Connect] Profile error:",
      error
    );


    showError(
      "Unable to load profile",
      error.message ||
        "Please try again."
    );
  }
}


/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeProfilePage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectProfile = {
  initialize:
    initializeProfilePage,

  load:
    loadProfile
};