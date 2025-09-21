# Local development server for portfolio

This small server serves the static portfolio files and accepts contact form submissions at /api/contact, storing them in `contacts.json`.

Requirements
- Node.js 12+ installed

Dependencies
- Install nodemailer (used for sending email notifications):

```powershell
npm install
```

SMTP configuration (optional)
If you want the server to send an email notification to your inbox when a contact form is received, set these environment variables before starting the server:

- SMTP_HOST — SMTP host (e.g., smtp.gmail.com)
- SMTP_PORT — SMTP port (e.g., 587 or 465)
- SMTP_USER — SMTP username (your SMTP account email)
- SMTP_PASS — SMTP password or app-specific password
- EMAIL_FROM — optional From address (defaults to SMTP_USER)
- NOTIFY_TO — optional recipient address (defaults to kungumark321@gmail.com)

Example (PowerShell):

```powershell
$env:SMTP_HOST = 'smtp.gmail.com'; $env:SMTP_PORT = '587'; $env:SMTP_USER = 'you@example.com'; $env:SMTP_PASS = 'yourpassword'; node server.js
```

Note: If using Gmail, you may need to create an App Password and/or enable access for less secure apps depending on your account settings.

Deploying to Netlify (no server required)
- Netlify can host this static portfolio and handle form submissions without any backend. Steps:
	1. Create a new site on Netlify and connect your Git repository (or drag-and-drop the project folder in the Netlify UI).
	2. Netlify will publish the site. The `contact` form is enabled via the `data-netlify="true"` attribute and the hidden `form-name` input.
	3. Submissions will be visible in Netlify's Forms dashboard and forwarded to the address you configure there.

Local development note
- While developing locally, the form will fall back to the `/api/contact` endpoint implemented in `server.js` when served from `localhost`.

Run locally
1. Open a terminal in this folder.
2. Start the server:

```powershell
node server.js
```

3. Open http://localhost:3000/ in your browser (it will serve `home.html`). Go to the Contact page and submit the form.

API
- POST /api/contact — accepts JSON {name, email, message} and appends to `contacts.json`.
- GET /api/contacts — returns all saved contacts (for debugging).

Notes
- This setup is intentionally minimal and stores submissions in a local JSON file. For production, use a proper backend and a database (or an email service).
