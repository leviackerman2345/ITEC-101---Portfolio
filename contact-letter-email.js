(function () {
  const EMAILJS_PUBLIC_KEY = "J91PVupym1EEfbInL";
  const EMAILJS_SERVICE_ID = "service_epqrcow";
  const EMAILJS_TEMPLATE_ID = "template_39tqd9f";
  const RECIPIENT_EMAIL = "cdegoma47@gmail.com";
  const RECIPIENT_NAME = "Christian De Goma";
  const SEND_CONFIRMATION_TO_SENDER = true;

  const form = document.getElementById("contact-letter-form");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const honeypotInput = document.getElementById("contact-letter-company");
  const submitButton = document.getElementById("contact-letter-submit");
  const submitLabel = form.querySelector("[data-submit-label]");
  const toast = document.getElementById("contact-letter-toast");

  const defaultButtonLabel = submitLabel ? submitLabel.textContent : "Send Letter";
  let toastTimer = null;

  if (!window.emailjs) {
    console.warn("EmailJS SDK not loaded.");
    return;
  }

  if (window.location.protocol === "file:") {
    console.warn(
      "Running from file:// can block EmailJS requests in some browsers. Use a local server (e.g. Live Server)."
    );
  }

  window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  function showToast(kind, message) {
    if (!toast) {
      alert(message);
      return;
    }

    if (toastTimer) {
      clearTimeout(toastTimer);
      toastTimer = null;
    }

    const isSuccess = kind === "success";
    const cardBase =
      "pointer-events-auto relative overflow-hidden w-full max-w-md rounded-2xl border p-4 sm:p-5 shadow-[0_24px_60px_rgba(2,6,23,0.6)] backdrop-blur-xl";
    const cardStyle = isSuccess
      ? "border-emerald-300/35 bg-gradient-to-br from-emerald-500/20 via-slate-900/90 to-slate-950/95 text-emerald-100"
      : "border-red-300/35 bg-gradient-to-br from-red-500/20 via-slate-900/90 to-slate-950/95 text-red-100";
    const title = isSuccess ? "Message Sent" : "Send Failed";
    const iconClass = isSuccess ? "fa-circle-check text-emerald-300" : "fa-triangle-exclamation text-red-300";
    const glowClass = isSuccess ? "bg-emerald-400/20" : "bg-red-400/20";

    toast.innerHTML =
      '<div class="absolute inset-0 bg-black/40"></div>' +
      '<div class="' +
      cardBase +
      " " +
      cardStyle +
      '\" role="status" aria-live="polite">' +
      '<div class="absolute -top-16 -right-16 w-40 h-40 rounded-full ' +
      glowClass +
      ' blur-3xl"></div>' +
      '<div class="relative flex items-start gap-3">' +
      '<div class="w-9 h-9 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center">' +
      '<i class="fa-solid ' +
      iconClass +
      '"></i>' +
      "</div>" +
      "<div>" +
      '<p class="text-sm font-semibold text-white">' +
      title +
      "</p>" +
      '<p class="text-sm mt-1 leading-relaxed">' +
      message +
      "</p>" +
      "</div>" +
      "</div>" +
      '<div class="relative mt-4 h-1.5 rounded-full bg-white/10 overflow-hidden">' +
      '<span class="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/0 via-white/60 to-white/0 animate-pulse"></span>' +
      "</div>" +
      "</div>";

    toast.classList.remove("opacity-0", "scale-95");
    toast.classList.add("opacity-100", "scale-100");

    toastTimer = setTimeout(function () {
      toast.classList.remove("opacity-100", "scale-100");
      toast.classList.add("opacity-0", "scale-95");
    }, 3500);
  }

  function setSubmitting(isSubmitting) {
    if (!submitButton) return;

    submitButton.disabled = isSubmitting;
    submitButton.classList.toggle("opacity-70", isSubmitting);
    submitButton.classList.toggle("cursor-not-allowed", isSubmitting);

    if (submitLabel) {
      submitLabel.textContent = isSubmitting ? "Sending..." : defaultButtonLabel;
    }
  }

  function validateFormValues(name, email, subject, message) {
    if (!name || !email || !subject || !message) {
      return "Please complete all required fields.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return "Please enter a valid email address.";
    }

    return null;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (honeypotInput && honeypotInput.value.trim() !== "") {
      return;
    }

    const name = nameInput ? nameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const subject = subjectInput ? subjectInput.value.trim() : "";
    const message = messageInput ? messageInput.value.trim() : "";

    const validationError = validateFormValues(name, email, subject, message);
    if (validationError) {
      showToast("error", validationError);
      return;
    }

    const templateParams = {
      name: name,
      email: email,
      subject: subject,
      message: message,
      to_email: RECIPIENT_EMAIL,
      to_name: RECIPIENT_NAME,

      // Common EmailJS aliases to support different template variable naming.
      from_name: name,
      from_email: email,
      reply_to: email,
      sender_name: name,
      sender_email: email,
      user_name: name,
      user_email: email,
      user_subject: subject,
      user_message: message,
      title: subject,
      content: message,
    };

    const senderCopyParams = {
      name: name,
      email: email,
      subject: "Copy of your message: " + subject,
      message:
        "Hi " +
        name +
        ",\n\nThis is a copy of your message sent to " +
        RECIPIENT_NAME +
        ".\n\n" +
        message +
        "\n\nThanks for reaching out.",
      to_email: email,
      to_name: name,
      from_name: RECIPIENT_NAME,
      from_email: RECIPIENT_EMAIL,
      reply_to: RECIPIENT_EMAIL,
      sender_name: RECIPIENT_NAME,
      sender_email: RECIPIENT_EMAIL,
      user_name: name,
      user_email: email,
      user_subject: "Copy of your message: " + subject,
      user_message:
        "Hi " +
        name +
        ",\n\nThis is a copy of your message sent to " +
        RECIPIENT_NAME +
        ".\n\n" +
        message +
        "\n\nThanks for reaching out.",
      title: "Copy of your message: " + subject,
      content:
        "Hi " +
        name +
        ",\n\nThis is a copy of your message sent to " +
        RECIPIENT_NAME +
        ".\n\n" +
        message +
        "\n\nThanks for reaching out.",
    };

    setSubmitting(true);

    window.emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function (response) {
        console.info("EmailJS send success:", response && response.status, response && response.text);

        if (!SEND_CONFIRMATION_TO_SENDER) {
          showToast("success", "Message sent successfully. I will get back to you soon.");
          form.reset();
          return;
        }

        return window.emailjs
          .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, senderCopyParams)
          .then(function (copyResponse) {
            console.info(
              "EmailJS sender copy success:",
              copyResponse && copyResponse.status,
              copyResponse && copyResponse.text
            );
            showToast("success", "Message sent. A copy was also sent to your email.");
            form.reset();
          })
          .catch(function (copyError) {
            console.error("EmailJS sender copy failed:", copyError);
            showToast(
              "success",
              "Message sent to owner, but sender copy failed. Check template To Email settings."
            );
            form.reset();
          });
      })
      .catch(function (error) {
        console.error("EmailJS send failed:", error);
        const details =
          (error && (error.text || error.message || error.status)) ||
          "Unknown EmailJS error";
        showToast("error", "Sending failed: " + details);
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
