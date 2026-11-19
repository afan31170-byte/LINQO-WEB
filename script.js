"use strict";

/* =====================================
   LINQO - Application Controller
   Communication for Everyone
===================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ---------- Elements ---------- */

    const screens = {
        welcome: document.getElementById("welcome-screen"),
        login: document.getElementById("login-screen"),
        otp: document.getElementById("otp-screen"),
        main: document.getElementById("main-screen")
    };

    const pages = document.querySelectorAll(".page");
    const navButtons = document.querySelectorAll(".nav-button");

    const getStartedBtn = document.getElementById("get-started-btn");
    const continueBtn = document.getElementById("continue-btn");
    const verifyBtn = document.getElementById("verify-btn");

    const phoneInput = document.getElementById("phone-number");
    const countryCode = document.getElementById("country-code");

    const searchInput = document.getElementById("search-input");
    const chatItems = document.querySelectorAll(".chat-item");

    const toast = document.getElementById("toast");

    let toastTimer = null;
    let currentPhoneNumber = "";

    /* ---------- Utility Functions ---------- */

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.remove("hidden");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(function () {
            toast.classList.add("hidden");
        }, 2800);
    }

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

    function showPage(pageId) {
        pages.forEach(function (page) {
            page.classList.add("hidden");
        });

        const selectedPage = document.getElementById(pageId);

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

    /* ---------- Welcome Screen ---------- */

    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", function () {
            showScreen("login");
        });
    }

    /* ---------- Back Buttons ---------- */

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

    /* ---------- Phone Number Validation ---------- */

    if (phoneInput) {

        phoneInput.addEventListener("input", function () {

            phoneInput.value = phoneInput.value.replace(/\D/g, "");

        });

    }

    if (continueBtn) {

        continueBtn.addEventListener("click", function () {

            const phone = phoneInput.value.trim();
            const code = countryCode.value;

            if (phone.length < 7 || phone.length > 15) {

                showToast("Please enter a valid mobile number.");

                phoneInput.focus();

                return;
            }

            currentPhoneNumber = code + phone;

            showScreen("otp");

            showToast("Phone number accepted for demo.");

        });

    }

    /* ---------- OTP Input ---------- */

    const otpInputs = document.querySelectorAll(".otp-inputs input");

    otpInputs.forEach(function (input, index) {

        input.addEventListener("input", function () {

            input.value = input.value.replace(/\D/g, "").slice(0, 1);

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

    /* ---------- Open Main App Demo ---------- */

    if (verifyBtn) {

        verifyBtn.addEventListener("click", function () {

            showScreen("main");

            showPage("chats-page");

            showToast("Welcome to LINQO Preview!");

        });

    }

    /* ---------- Bottom Navigation ---------- */

    navButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const pageId = button.dataset.page;

            if (!pageId) return;

            showPage(pageId);

        });

    });

    /* ---------- Chat Search ---------- */

    if (searchInput) {

        searchInput.addEventListener("input", function () {

            const searchText = searchInput.value
                .toLowerCase()
                .trim();

            chatItems.forEach(function (chat) {

                const chatText = chat.textContent.toLowerCase();

                chat.classList.toggle(
                    "hidden",
                    !chatText.includes(searchText)
                );

            });

        });

    }

    /* ---------- Open Conversation Preview ---------- */

    chatItems.forEach(function (chat) {

        chat.addEventListener("click", function () {

            const chatName = chat.dataset.chat || "Conversation";

            const nameElement = document.getElementById(
                "conversation-name"
            );

            if (nameElement) {
                nameElement.textContent = chatName;
            }

            showPage("conversation-page");

        });

    });

    /* ---------- Back to Chats ---------- */

    const backToChats = document.getElementById("back-to-chats");

    if (backToChats) {

        backToChats.addEventListener("click", function () {

            showPage("chats-page");

        });

    }

    /* ---------- New Chat ---------- */

    const newChatBtn = document.getElementById("new-chat-btn");

    if (newChatBtn) {

        newChatBtn.addEventListener("click", function () {

            showPage("contacts-page");

            showToast("Contact connection is coming soon.");

        });

    }

    /* ---------- Profile ---------- */

    const profileBtn = document.getElementById("profile-btn");

    if (profileBtn) {

        profileBtn.addEventListener("click", function () {

            showPage("settings-page");

            showToast("Your profile settings will be available soon.");

        });

    }

    /* ---------- Settings ---------- */

    document.querySelectorAll(".setting-item").forEach(function (item) {

        item.addEventListener("click", function () {

            const settingName = item.firstElementChild.textContent.trim();

            showToast(settingName + " will be available in a future update.");

        });

    });

    /* ---------- Initial State ---------- */

    showScreen("welcome");

    console.log("LINQO application initialized successfully.");

    /* ---------- PWA Service Worker ---------- */

    if ("serviceWorker" in navigator) {

        navigator.serviceWorker.register("./service-worker.js")

            .then(function (registration) {

                console.log("LINQO PWA is ready!");

            })

            .catch(function (error) {

                console.log("PWA registration failed:", error);

            });

    }

});
