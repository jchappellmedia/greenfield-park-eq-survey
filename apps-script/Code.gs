/**
 * EQ anonymous survey → Google Sheet (+ optional GitHub Issue)
 * Sheet: EQ Communication Hub — Greenfield Park Ward
 * Tab: Survey Responses
 */
var DEFAULT_SHEET_ID = '1TUIK5Ti7fenO6js4o9Omu5tStEO8t4a4ifxDCPPoyM8';
var DEFAULT_REPO = 'jchappellmedia/greenfield-park-eq-survey';

function doPost(e) {
  var data = {};
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'invalid_json' });
  }

  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SHEET_ID') || DEFAULT_SHEET_ID;
  var repo = props.getProperty('GITHUB_REPO') || DEFAULT_REPO;
  var token = props.getProperty('GITHUB_TOKEN');

  var ss = SpreadsheetApp.openById(sheetId);
  var sheet = ss.getSheetByName('Survey Responses') || ss.getSheets()[0];

  // Anonymous row aligned to hub headers:
  // Timestamp | Full Name | Receiving Church Emails | Receiving Church Texts |
  // Email | Phone | Prefer Announcements | Prefer Ministering / Urgent |
  // Prefer Activities | Prefer Lessons / Materials | Notes | Source
  sheet.appendRow([
    data.submitted_at || new Date().toISOString(),
    '', // Full Name — anonymous
    data.receiving_email || '',
    data.receiving_text || '',
    '', // Email — anonymous
    '', // Phone — anonymous
    data.prefer_announcements || '',
    data.prefer_ministering || '',
    data.prefer_activities || '',
    data.prefer_lessons || '',
    data.notes || '',
    data.source || 'github-pages-survey-anonymous'
  ]);

  if (token) {
    var title = 'Anonymous survey response';
    var body = [
      '**Anonymous:** yes',
      '**Receiving emails:** ' + (data.receiving_email || ''),
      '**Receiving texts:** ' + (data.receiving_text || ''),
      '**Prefer announcements:** ' + (data.prefer_announcements || ''),
      '**Prefer ministering/urgent:** ' + (data.prefer_ministering || ''),
      '**Prefer activities:** ' + (data.prefer_activities || ''),
      '**Prefer lessons:** ' + (data.prefer_lessons || ''),
      '**Notes:** ' + (data.notes || ''),
      '**Submitted:** ' + (data.submitted_at || '')
    ].join('\\n');
    UrlFetchApp.fetch('https://api.github.com/repos/' + repo + '/issues', {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'eq-survey-apps-script'
      },
      payload: JSON.stringify({
        title: title,
        body: body,
        labels: ['survey-response']
      }),
      muteHttpExceptions: true
    });
  }

  return json_({ ok: true });
}

function doGet() {
  return ContentService.createTextOutput('EQ anonymous survey endpoint is live');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** One-time: set script properties from the editor (Run → setupProperties). */
function setupProperties() {
  PropertiesService.getScriptProperties().setProperties({
    SHEET_ID: DEFAULT_SHEET_ID,
    GITHUB_REPO: DEFAULT_REPO
    // Optional: GITHUB_TOKEN for Issues
  }, false);
}
