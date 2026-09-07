/**
 * Optional backend: deploy as a Google Apps Script web app (Execute as: Me, Who has access: Anyone).
 * Script Properties:
 *   GITHUB_TOKEN = classic PAT with repo scope (creates Issues)
 *   GITHUB_REPO  = jchappellmedia/greenfield-park-eq-survey
 *   SHEET_ID     = 1TUIK5Ti7fenO6js4o9Omu5tStEO8t4a4ifxDCPPoyM8
 *
 * Then paste the /exec URL into config.js as window.SURVEY_ENDPOINT.
 */
function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty("SHEET_ID") || "1TUIK5Ti7fenO6js4o9Omu5tStEO8t4a4ifxDCPPoyM8";
  const repo = props.getProperty("GITHUB_REPO") || "jchappellmedia/greenfield-park-eq-survey";
  const token = props.getProperty("GITHUB_TOKEN");

  const ss = SpreadsheetApp.openById(sheetId);
  const sheet = ss.getSheetByName('Survey Responses') || ss.getSheets()[0];
  sheet.appendRow([
    data.submitted_at || new Date().toISOString(),
    data.name || "",
    data.receiving_email || "",
    data.receiving_text || "",
    data.email || "",
    data.phone || "",
    data.prefer_announcements || "",
    data.prefer_ministering || "",
    data.prefer_activities || "",
    data.prefer_lessons || "",
    data.notes || "",
    data.source || "apps-script",
  ]);

  if (token) {
    const title = `Survey response: ${data.name || "Unknown"}`;
    const body = [
      `**Name:** ${data.name || ""}`,
      `**Email:** ${data.email || ""}`,
      `**Phone:** ${data.phone || ""}`,
      `**Receiving emails:** ${data.receiving_email || ""}`,
      `**Receiving texts:** ${data.receiving_text || ""}`,
      `**Prefer announcements:** ${data.prefer_announcements || ""}`,
      `**Prefer ministering/urgent:** ${data.prefer_ministering || ""}`,
      `**Prefer activities:** ${data.prefer_activities || ""}`,
      `**Prefer lessons:** ${data.prefer_lessons || ""}`,
      `**Notes:** ${data.notes || ""}`,
      `**Submitted:** ${data.submitted_at || ""}`,
    ].join("\n");
    UrlFetchApp.fetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "post",
      contentType: "application/json",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "eq-survey-apps-script",
      },
      payload: JSON.stringify({ title: title, body: body, labels: ["survey-response"] }),
      muteHttpExceptions: true,
    });
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput("EQ survey endpoint is live");
}
