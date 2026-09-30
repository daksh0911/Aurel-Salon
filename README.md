# Aurel Salon Studio

A premium full-stack salon appointment booking system for Definition 23.

## Features

- Customer and administrator login
- Service catalog with ten bookable rituals
- Staff and service assignment management
- Working days, opening hours, and live availability
- Appointment booking
- Rescheduling and cancellation
- Customer upcoming appointments and history
- Admin appointment filters and status controls
- Contact messages with admin read/delete actions
- SQLite persistence with validation and conflict handling
- Responsive mobile-first editorial UI

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- VS Code is optional
- Live Server extension is optional for static preview

## Install from a clean ZIP

For the VS Code workflow, **no manual install command is required**. The automatic Go Live task installs dependencies and prepares the build on the first project open.

For command-line use only, the equivalent setup is:

```bash
npm install
cd server
npm install
cd ..
npm run build
```

The ZIP intentionally does **not** include `node_modules`; the automatic Go Live task recreates them when needed.

## Run the complete website

Use this mode for the working booking system, authentication, database, admin tools, and API:

```bash
npm start
```

Open:

- Website and API: <http://localhost:5000>
- API health: <http://localhost:5000/api/health>
- API capability index: <http://localhost:5000/api>

The server automatically serves the production React build from `web/` and supports direct refreshes on application routes.

## One-click VS Code Go Live

The project is configured so you do **not** need to open multiple terminals or manually start the API.

1. Extract the ZIP and open the **`aurel-salon-studio` folder** in VS Code.
2. If VS Code asks whether to allow automatic tasks, choose **Allow**. This is only a first-run VS Code security prompt.
3. Open `web/index.html` and click **Go Live**.

The included `.vscode/tasks.json` automatically runs `npm run go-live` when the folder opens. That script silently:

- installs frontend and API dependencies if they are missing;
- builds the current React source into the single `web/` folder;
- starts the Express API on port `5000` if it is not already running.

Go Live serves the built site on port `5500`, while the frontend automatically connects to the API on port `5000`. Login, availability, booking, rescheduling, cancellation, history, contact, and admin features therefore work from the same Go Live page.

### Navigation behavior

On desktop, the full navigation links are always visible, so there is no unnecessary Menu button. On mobile, the **Menu** button opens the navigation drawer and changes to **Close**; selecting any link closes the drawer.

For later source edits, simply save the file and reopen the project or run **Tasks: Run Task → Aurel: Prepare Go Live**. No separate API terminal is required.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | `daksh@example.com` | `demo1234` |
| Admin | `admin@aurel.com` | `admin123` |

## Project structure

```text
src/                 React source and pages
server/              Express API, SQLite database, seed data and routes
web/                 Single generated static build for Go Live and Express
.vscode/             Live Server settings and optional API task
index.html           Vite source HTML shell
vite.config.js       Vite build/proxy configuration
package.json         Frontend/build scripts
aurel-salon...zip    Clean submission archive is generated outside the project
```

## Clean build rules

- `web/` contains the current `index.html`, current hashed assets, and the required salon hero image.
- `node_modules/` is not required in the submission archive and should be regenerated with `npm install`.
- SQLite WAL/shm runtime files are not part of the submission archive.
- Do not edit generated files in `web/` directly; change `src/` and run `npm run build`.
