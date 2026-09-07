(function () {
  const form = document.getElementById("survey-form");
  const thanks = document.getElementById("thanks");
  const errorEl = document.getElementById("form-error");
  const submitBtn = document.getElementById("submit-btn");

  function showError(msg) {
    errorEl.hidden = !msg;
    errorEl.textContent = msg || "";
  }

  function showThanks() {
    form.hidden = true;
    thanks.hidden = false;
    thanks.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function payloadFromForm(fd) {
    return {
      receiving_email: fd.get("receiving_email"),
      receiving_text: fd.get("receiving_text"),
      prefer_announcements: fd.get("prefer_announcements"),
      prefer_ministering: fd.get("prefer_ministering"),
      prefer_activities: fd.get("prefer_activities"),
      prefer_lessons: fd.get("prefer_lessons"),
      notes: (fd.get("notes") || "").trim(),
      anonymous: true,
      source: "github-pages-survey-anonymous",
      submitted_at: new Date().toISOString(),
    };
  }

  async function submitFormSubmit(data) {
    const email = window.FORMSUBMIT_EMAIL || "jchappellmedia@gmail.com";
    const body = {
      ...data,
      _subject: "EQ Anonymous Survey Response",
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
    // Apps Script often redirects; mode no-cors still delivers the POST for Sheet sync,
    // but we can't read the response — treat fire-and-forget as success if fetch doesn't throw a network error.
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
        redirect: "follow",
      });
      // Opaque/CORS: still count as attempted; Sheet write usually succeeds.
      if (res.type === "opaque" || res.ok) return { ok: true };
      // Some browsers get 200 HTML redirect pages
      if (res.status >= 200 && res.status < 400) return { ok: true };
      const text = await res.text().catch(() => "");
      throw new Error(text || "Survey endpoint failed");
    } catch (err) {
      // Retry once with no-cors so the POST still lands in Sheets even if CORS blocks reading
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data),
      });
      return { ok: true, noCors: true };
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    showError("");
    if (!form.checkValidity()) {
      form.reportValidity();
      showError("Please answer the required questions.");
      return;
    }
    const data = payloadFromForm(new FormData(form));
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      let sheetOk = false;
      let mailOk = false;
      try {
        await submitEndpoint(data);
        sheetOk = true;
      } catch (endpointErr) {
        console.warn("Sheet endpoint failed:", endpointErr);
      }
      try {
        await submitFormSubmit(data);
        mailOk = true;
      } catch (mailErr) {
        console.warn("FormSubmit failed:", mailErr);
      }
      if (sheetOk || mailOk) {
        showThanks();
      } else {
        throw new Error("Both submission paths failed");
      }
    } catch (err) {
      console.error(err);
      showError("Something went wrong sending your response. Please try again in a moment.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit anonymous survey";
    }
  });
})();
