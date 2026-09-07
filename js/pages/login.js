/* =========================================
   CAMPUS CONNECT V2
   LOGIN PAGE

   Handles:
   - Email and password login
   - Supabase authentication
   - Form validation
   - Loading states
   - Authentication errors
   - Redirect after successful login
   ========================================= */

"use strict";

import {
  getSupabase,
  getSupabaseUser
} from "../config/supabase.js";

import {
  setCurrentUser,
  isLoggedIn
} from "../core/auth.js";

import {
  getStorage,
  removeStorage,
  isValidEmail
} from "../core/utils.js";

import {
  setButtonLoading,
  resetButtonLoading
} from "../components/loading.js";

import {
  showSuccess,
  showError,
  showWarning
} from "../components/notifications.js";


/* =========================================
   LOGIN PAGE PATHS
   ========================================= */

const DASHBOARD_PATH =
  "index.html";


/* =========================================
   GET PAGE ELEMENTS
   ========================================= */

function getLoginElements() {
  return {
    form:
      document.querySelector(
        "#login-form"
      ),

    email:
      document.querySelector(
        "#email"
      ),

    password:
      document.querySelector(
        "#password"
      ),

    submitButton:
      document.querySelector(
        "#login-submit"
      ),

    passwordToggle:
      document.querySelector(
        "[data-password-toggle]"
      )
  };
}


/* =========================================
   GET REDIRECT PAGE
   ========================================= */

/**
 * Get the page the user should visit
 * after successful login.
 *
 * @returns {string}
 */
function getRedirectPage() {
  const params =
    new URLSearchParams(
      window.location.search
    );


  const redirect =
    params.get("redirect");


  /*
   Allow only Campus Connect
   internal relative paths.
  */

  if (
    redirect &&
    !redirect.startsWith("http") &&
    !redirect.startsWith("//")
  ) {
    return redirect;
  }


  return DASHBOARD_PATH;
}


/* =========================================
   VALIDATE LOGIN FORM
   ========================================= */

/**
 * Validate the login form.
 *
 * @param {string} email
 * @param {string} password
 *
 * @returns {Object}
 */
function validateLoginForm(
  email,
  password
) {
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


  if (
    !password
  ) {
    return {
      valid: false,
      message:
        "Please enter your password."
    };
  }


  return {
    valid: true,
    message: ""
  };
}


/* =========================================
   CONVERT SUPABASE USER
   ========================================= */

/**
 * Convert Supabase user data into
 * Campus Connect user format.
 *
 * @param {Object} user
 *
 * @returns {Object|null}
 */
function formatUser(user) {
  if (
    !user ||
    !user.id
  ) {
    return null;
  }


  const metadata =
    user.user_metadata || {};


  return {
    id:
      user.id,

    email:
      user.email || "",

    name:
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      user.email
        ?.split("@")[0] ||
      "Student",

    displayName:
      metadata.full_name ||
      metadata.name ||
      metadata.display_name ||
      user.email
        ?.split("@")[0] ||
      "Student",

    avatar:
      metadata.avatar_url ||
      null,

    role:
      metadata.role ||
      "student"
  };
}


/* =========================================
   LOGIN USER
   ========================================= */

/**
 * Authenticate the user with Supabase.
 *
 * @param {string} email
 * @param {string} password
 *
 * @returns {Promise<Object>}
 */
async function loginUser(
  email,
  password
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
    await client.auth.signInWithPassword({
      email:
        email.trim(),

      password
    });


  if (error) {
    throw new Error(
      error.message
    );
  }


  if (
    !data ||
    !data.user
  ) {
    throw new Error(
      "Unable to sign in. Please try again."
    );
  }


  return data.user;
}


/* =========================================
   HANDLE LOGIN SUBMISSION
   ========================================= */

async function handleLoginSubmit(
  event
) {
  event.preventDefault();


  const {
    email,
    password,
    submitButton
  } =
    getLoginElements();


  if (
    !email ||
    !password
  ) {
    showError(
      "Login error",
      "Login form elements were not found."
    );

    return;
  }


  const emailValue =
    email.value.trim();


  const passwordValue =
    password.value;


  const validation =
    validateLoginForm(
      emailValue,
      passwordValue
    );


  if (
    !validation.valid
  ) {
    showWarning(
      "Check your details",
      validation.message
    );

    return;
  }


  /*
   Start button loading state.
  */

  if (submitButton) {
    setButtonLoading(
      submitButton,
      "Signing in..."
    );
  }


  try {
    /*
     Authenticate with Supabase.
    */

    const supabaseUser =
      await loginUser(
        emailValue,
        passwordValue
      );


    /*
     Convert user into Campus Connect
     format.
    */

    const user =
      formatUser(
        supabaseUser
      );


    /*
     Save user session locally for
     Campus Connect UI state.
    */

    setCurrentUser(
      user
    );


    showSuccess(
      "Welcome back!",
      `Signed in as ${user.name}.`
    );


    /*
     Redirect after a short delay so
     the success notification can appear.
    */

    setTimeout(
      () => {
        window.location.href =
          getRedirectPage();
      },
      500
    );
  } catch (error) {
    console.error(
      "[Campus Connect] Login error:",
      error
    );


    showError(
      "Unable to sign in",
      error.message ||
        "Please check your email and password."
    );


    if (submitButton) {
      resetButtonLoading(
        submitButton
      );
    }
  }
}


/* =========================================
   PASSWORD VISIBILITY
   ========================================= */

function initializePasswordToggle() {
  const {
    password,
    passwordToggle
  } =
    getLoginElements();


  if (
    !password ||
    !passwordToggle
  ) {
    return;
  }


  passwordToggle.addEventListener(
    "click",
    () => {
      const isPassword =
        password.type ===
        "password";


      password.type =
        isPassword
          ? "text"
          : "password";


      passwordToggle.setAttribute(
        "aria-label",
        isPassword
          ? "Hide password"
          : "Show password"
      );


      passwordToggle.setAttribute(
        "aria-pressed",
        String(isPassword)
      );
    }
  );
}


/* =========================================
   CHECK EXISTING SESSION
   ========================================= */

/**
 * If the user is already authenticated,
 * redirect them away from the login page.
 */
async function checkExistingSession() {
  /*
   Check local Campus Connect session first.
  */

  if (
    isLoggedIn()
  ) {
    window.location.replace(
      getRedirectPage()
    );

    return;
  }


  /*
   Check Supabase session.
  */

  const supabaseUser =
    await getSupabaseUser();


  if (!supabaseUser) {
    return;
  }


  const user =
    formatUser(
      supabaseUser
    );


  if (user) {
    setCurrentUser(
      user
    );

    window.location.replace(
      getRedirectPage()
    );
  }
}


/* =========================================
   INITIALIZE LOGIN PAGE
   ========================================= */

export async function initializeLoginPage() {
  const {
    form
  } =
    getLoginElements();


  /*
   Check whether the user already
   has an active session.
  */

  await checkExistingSession();


  /*
   Attach form listener.
  */

  if (form) {
    form.addEventListener(
      "submit",
      handleLoginSubmit
    );
  }


  /*
   Initialize password visibility button.
  */

  initializePasswordToggle();
}


/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    initializeLoginPage();
  }
);


/* =========================================
   GLOBAL API
   ========================================= */

window.CampusConnectLogin = {
  initialize:
    initializeLoginPage
};