# Greenfield Park Ward · Elders Quorum Communication Survey

Live survey site for collecting communication preferences from Elders Quorum members.

## Live URL

After GitHub Pages is enabled: **https://jchappellmedia.github.io/greenfield-park-eq-survey/**

## How responses are collected

### Works immediately (no extra setup)
Each submission is emailed to `jchappellmedia@gmail.com` via [FormSubmit](https://formsubmit.co). The **first** submission triggers a confirmation email from FormSubmit — open it and confirm once so later responses flow through.

### Optional: Google Sheet + GitHub Issues
1. Open [Google Apps Script](https://script.google.com) → New project.
2. Paste `apps-script/Code.gs`.
3. Project Settings → Script properties:
   - `SHEET_ID` = `19OMoon2nOutd1x5H_1mwMF1Vb5OIJ0GLqZxeEMSVwbU`
   - `GITHUB_REPO` = `jchappellmedia/greenfield-park-eq-survey`
   - `GITHUB_TOKEN` = a classic PAT with `repo` scope
4. Deploy → New deployment → Web app → Execute as **Me** → Who has access **Anyone**.
5. Copy the `/exec` URL into `config.js` as `window.SURVEY_ENDPOINT`, commit, and push.

That writes each response to the **EQ Communication Survey Responses** sheet and opens a GitHub Issue labeled `survey-response`.

## Local files
- `index.html` / `styles.css` / `app.js` / `config.js` — the public survey
- `apps-script/Code.gs` — optional Sheet + GitHub Issues bridge
