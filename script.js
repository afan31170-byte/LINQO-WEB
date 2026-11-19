"use strict";

/* =====================================
   LINQO - Application Controller
   Firebase Authentication + Firestore
===================================== */

import { initializeApp } from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-app.js";

import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    serverTimestamp
} from
"https://www.gstatic.com/firebasejs/13.4.0/firebase-firestore.js";


/* ---------- FIREBASE CONFIG ---------- */

const firebaseConfig = {
    apiKey: "AIzaSyAeGes56ateEubJXeQR9E6VOHtirqvBAHYs",
    authDomain: "linqo-85876.firebaseapp.com",
    projectId: "linqo-85876",
    storageBucket: "linqo-85876.firebasestorage.app",
    messagingSenderId: "665298828042",
    appId: "1:665298828042:web:1f5af9de9eff195b4dd8f3"
};


/* ---------- INITIALIZATION ---------- */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


/* TESTING ONLY */

auth.settings.appVerificationDisabledForTesting = true;

auth.languageCode = "en";


/* ---------- TEST NUMBER ---------- */

const TEST_PHONE_NUMBER = "+923001234567";


/* ---------- SAVE USER PROFILE ---------- */

async function saveUserProfile(user) {

    const userRef = doc(db, "users", user.uid);

    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {

        await setDoc(userRef, {

            phoneNumber: user.phoneNumber,
            lastLoginAt: serverTimestamp()

        }, {
            merge: true
        });

    } else {

        await setDoc(userRef, {

            phoneNumber: user.phoneNumber,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp()

        });

    }

}


/* ---------- APPLICATION ---------- */

document.addEventListener("DOMContentLoaded", function () {

    const screens = {
        welcome: document.getElementById("welcome-screen"),
        login: document.getElementById("login-screen"),
        otp: document.getElementById("otp-screen"),
        main: document.getElementById("main-screen")
    };

    const pages = document.querySelectorAll(".page");

    const navButtons = document.querySelectorAll(".nav-button");

    const getStartedBtn =
        document.getElementById("get-started-btn");

    const continueBtn =
        document.getElementById("continue-btn");

    const verifyBtn =
        document.getElementById("verify-btn");

    const phoneInput =
        document.getElementById("phone-number");

    const countryCode =
        document.getElementById("country-code");

    const searchInput =
        document.getElementById("search-input");

    const chatItems =
        document.querySelectorAll(".chat-item");

    const toast =
        document.getElementById("toast");

    const otpInputs =
        document.querySelectorAll(".otp-inputs input");

    let toastTimer = null;

    let confirmationResult = null;

    let recaptchaVerifier = null;


    /* ---------- TOAST ---------- */

    function showToast(message) {

        if (!toast) return;

        toast.textContent = message;

        toast.classList.remove("hidden");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {

            toast.classList.add("hidden");

        }, 3500);

    }


    /* ---------- SCREEN CONTROL ---------- */

    function showScreen(screenName) {

        Object.values(screens).forEach(function (screen) {

            if (screen) {
                screen.classList.add("hidden");
            }

        });

        if (screens[screenName]) {

            screens[screenName].classList.remove("hidden");

        }

        window.scrollTo(0, 0);

    }


    /* ---------- PAGE CONTROL ---------- */

    function showPage(pageId) {

        pages.forEach(function (page) {

            page.classList.add("hidden");

        });

        const selectedPage =
            document.getElementById(pageId);

        if (selectedPage) {

            selectedPage.classList.remove("hidden");

        }

        navButtons.forEach(function (button) {

            button.classList.toggle(
                "active",
                button.dataset.page === pageId
            );

        });

        window.scrollTo(0, 0);

    }


    /* ---------- WELCOME ---------- */

    if (getStartedBtn) {

        getStartedBtn.addEventListener("click", function () {

            showScreen("login");

        });

    }


    /* ---------- BACK BUTTONS ---------- */

    document.querySelectorAll("[data-back]").forEach(function (button) {

        button.addEventListener("click", function () {

            const target = button.dataset.back;

            if (target === "welcome-screen") {

                showScreen("welcome");

            }

            if (target === "login-screen") {

                showScreen("login");

            }

        });

    });


    /* ---------- PHONE INPUT ---------- */

    if (phoneInput) {

        phoneInput.addEventListener("input", function () {

            phoneInput.value =
                phoneInput.value.replace(/\D/g, "");

        });

    }


    /* ---------- RESET RECAPTCHA ---------- */

    function resetRecaptcha() {

        if (recaptchaVerifier) {

            recaptchaVerifier.clear();

            recaptchaVerifier = null;

        }

    }


    /* ---------- SEND OTP ---------- */

    if (continueBtn) {

        continueBtn.addEventListener("click", async function () {

            const phone = phoneInput.value.trim();

            const code = countryCode.value;

            if (phone.length < 7 || phone.length > 15) {

                showToast("Please enter a valid mobile number.");

                phoneInput.focus();

                return;

            }

            let formattedPhone = phone;

            if (formattedPhone.startsWith("0")) {

                formattedPhone = formattedPhone.substring(1);

            }

            const fullPhoneNumber = code + formattedPhone;


            /* TEST NUMBER ONLY */

            if (fullPhoneNumber !== TEST_PHONE_NUMBER) {

                showToast(
                    "Only the configured test number is allowed."
                );

                return;

            }


            try {

                continueBtn.disabled = true;

                continueBtn.textContent = "Please wait...";

                resetRecaptcha();

                const container =
                    document.getElementById("recaptcha-container");

                if (!container) {

                    throw new Error(
                        "reCAPTCHA container not found."
                    );

                }

                recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    "recaptcha-container",
                    {
                        size: "normal"
                    }
                );

                await recaptchaVerifier.render();

                confirmationResult = await signInWithPhoneNumber(
                    auth,
                    fullPhoneNumber,
                    recaptchaVerifier
                );

                showScreen("otp");

                showToast("Verification code is ready.");

            } catch (error) {

                console.error(
                    "Firebase authentication error:",
                    error
                );

                showToast(
                    error.message || "Verification failed."
                );

                resetRecaptcha();

            } finally {

                continueBtn.disabled = false;

                continueBtn.textContent = "Continue";

            }

        });

    }


    /* ---------- OTP INPUT ---------- */

    otpInputs.forEach(function (input, index) {

        input.addEventListener("input", function () {

            input.value = input.value
                .replace(/\D/g, "")
                .slice(0, 1);

            if (input.value && index < otpInputs.length - 1) {

                otpInputs[index + 1].focus();

            }

        });

        input.addEventListener("keydown", function (event) {

            if (
                event.key === "Backspace" &&
                !input.value &&
                index > 0
            ) {

                otpInputs[index - 1].focus();

            }

        });

    });


    /* ---------- VERIFY OTP ---------- */

    if (verifyBtn) {

        verifyBtn.addEventListener("click", async function () {

            if (!confirmationResult) {

                showToast(
                    "Please request a verification code first."
                );

                return;

            }

            const verificationCode = Array.from(otpInputs)

                .map(function (input) {

                    return input.value;

                })

                .join("");


            if (verificationCode.length !== 6) {

                showToast("Enter the complete 6-digit code.");

                return;

            }


            try {

                verifyBtn.disabled = true;

                verifyBtn.textContent = "Verifying...";


                /* VERIFY FIREBASE OTP */

                const result =
                    await confirmationResult.confirm(
                        verificationCode
                    );


                console.log(
                    "LINQO authenticated user:",
                    result.user.uid
                );


                /* SAVE USER IN FIRESTORE */

                try {

                    await saveUserProfile(result.user);

                    console.log(
                        "LINQO user profile saved successfully."
                    );

                    showToast("Account saved successfully!");

                } catch (databaseError) {

                    console.error(
                        "Firestore error:",
                        databaseError
                    );

                    showToast(
                        "Login successful, but profile saving failed."
                    );

                }


                /* OPEN MAIN APP */

                showScreen("main");

                showPage("chats-page");

                confirmationResult = null;


            } catch (error) {

                console.error(
                    "OTP verification error:",
                    error
                );

                showToast(
                    "Invalid code. Please check and try again."
                );

            } finally {

                verifyBtn.disabled = false;

                verifyBtn.textContent = "Open LINQO Preview";

            }

        });

    }


    /* ---------- BOTTOM NAVIGATION ---------- */

    navButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const pageId = button.dataset.page;

            if (!pageId) return;

            showPage(pageId);

        });

    });


    /* ---------- CHAT SEARCH ---------- */

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchText = searchInput.value
                .toLowerCase()
                .trim();

            chatItems.forEach(function (chat) {

                const chatText =
                    chat.textContent.toLowerCase();

                chat.classList.toggle(
                    "hidden",
                    !chatText.includes(searchText)
                );

            });

        });

    }


    /* ---------- OPEN CONVERSATION ---------- */

    chatItems.forEach(function (chat) {

        chat.addEventListener("click", function () {

            const chatName =
                chat.dataset.chat || "Conversation";

            const nameElement =
                document.getElementById("conversation-name");

            if (nameElement) {

                nameElement.textContent = chatName;

            }

            showPage("conversation-page");

        });

    });


    /* ---------- BACK TO CHATS ---------- */

    const backToChats =
        document.getElementById("back-to-chats");

    if (backToChats) {

        backToChats.addEventListener("click", function () {

            showPage("chats-page");

        });

    }


    /* ---------- NEW CHAT ---------- */

    const newChatBtn =
        document.getElementById("new-chat-btn");

    if (newChatBtn) {

        newChatBtn.addEventListener("click", function () {

            showPage("contacts-page");

            showToast(
                "Contact connection is coming soon."
            );

        });

    }


    /* ---------- PROFILE ---------- */

    const profileBtn =
        document.getElementById("profile-btn");

    if (profileBtn) {

        profileBtn.addEventListener("click", function () {

            showPage("settings-page");

            showToast(
                "Profile settings will be available soon."
            );

        });

    }


    /* ---------- SETTINGS ---------- */

    document.querySelectorAll(".setting-item").forEach(function (item) {

        item.addEventListener("click", function () {

            const settingName =
                item.firstElementChild.textContent.trim();

            showToast(
                settingName + " will be available in a future update."
            );

        });

    });


    /* ---------- INITIAL STATE ---------- */

    showScreen("welcome");

    console.log(
        "LINQO application initialized successfully."
    );


    /* ---------- SERVICE WORKER ---------- */

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("./service-worker.js")

            .then(function () {

                console.log("LINQO PWA is ready!");

            })

            .catch(function (error) {

                console.log(
                    "PWA registration failed:",
                    error
                );

            });

    }

});
