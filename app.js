(function () {
  const form = document.getElementById("survey-form");
  const thanks = document.getElementById("thanks");
  const errorEl = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  function showError(msg) {
    errorEl.hidden = !msg;
    errorEl.textContent = msg || "";
  }

  function payloadFromForm(fd) {
    return {
      name: fd.get("name").trim(),
      email: fd.get("email").trim(),
      phone: fd.get("phone").trim(),
      receiving_email: fd.get("receiving_email"),
      receiving_text: fd.get("receiving_text"),
      prefer_announcements: fd.get("prefer_announcements"),
      prefer_ministering: fd.get("prefer_ministering"),
      prefer_activities: fd.get("prefer_activities"),
      prefer_lessons: fd.get("prefer_lessons"),
      notes: (fd.get("notes") || "").trim(),
      source: "github-pages-survey",
      submitted_at: new Date().toISOString(),
    };
  }

  async function submitFormSubmit(data) {
    const email = window.FORMSUBMIT_EMAIL || "jchappellmedia@gmail.com";
    const body = {
      ...data,
      _subject: `EQ Survey Response — ${data.name}`,
      _template: "table",
      _captcha: "false",
    };
    const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "FormSubmit request failed");
    }
    return res.json();
  }

  async function submitEndpoint(data) {
    const endpoint = (window.SURVEY_ENDPOINT || "").trim();
    if (!endpoint) return null;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Survey endpoint failed");
    }
    return res.json().catch(() => ({}));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    if (!form.checkValidity()) {
      form.reportValidity();
      showError("Please fill in the required fields.");
      return;
    }
    const data = payloadFromForm(new FormData(form));
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      await submitFormSubmit(data);
      try {
        await submitEndpoint(data);
      } catch (endpointErr) {
        console.warn("Optional Sheet/GitHub endpoint failed:", endpointErr);
      }
      form.hidden = true;
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      console.error(err);
      showError("Something went wrong sending your response. Please try again in a moment.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit survey";
    }
  });
})();
