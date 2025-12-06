# TaskFlow — IMS566 Individual Project

## Description
TaskFlow is a responsive personal task and project manager web application prototype built for the IMS566 Advanced Web Design assignment. It is focused on managing university assignments with a clean dashboard, charts, and simple content management using only frontend technologies and `localStorage`.

## Features
- Simulated Authentication (Login / Register, no real database)
- Responsive sidebar layout + mobile topbar (Bootstrap 5)
- Dashboard with key summary cards and Chart.js “tasks by status” visualization
- Tasks page: Add / Edit / Delete tasks using a modal form
- Projects page: Card-style project management for your subjects/assignments
- Profile page with avatar URL and editable name/email/bio (stored locally)
- Dark mode toggle with preference saved in `localStorage`
- AOS scroll animations and Bootstrap Icons
- All data (tasks, projects, profile, session) stored in `localStorage` only

## Demo credentials
You can login using either the fixed demo account or a registered demo account:

- Demo email: `nmuhd0033@gmail.com`  
- Demo password: `Naim.0033`  

Or:

1. Open `register.html`.
2. Create an account (it will be stored as a demo account in `localStorage`).
3. Use that email and password on `login.html`.

## How to run locally
1. Place all files in a folder on your computer.
2. Open `login.html` in Google Chrome (recommended for marking).
3. Login using the demo credentials above or a registered account.
4. Explore:
   - Dashboard (`dashboard.html`) for overview and chart.
   - Tasks (`tasks.html`) to manage your assignment tasks.
   - Projects (`projects.html`) to manage assignment/subject projects.
   - Profile (`profile.html`) to edit your name, email, bio, and avatar URL.

## Deployment (GitHub Pages)
1. Create a GitHub repository and push all files (`login.html`, `dashboard.html`, `tasks.html`, `projects.html`, `profile.html`, `script.js`, `styles.css`, etc.).
2. In GitHub → Settings → Pages, set the branch to `main` (root folder).
3. Wait for deployment and use the live URL:
   `https://<username>.github.io/<repo>/`

Submit both:
- GitHub Pages live URL
- GitHub repository link

## Notes
- This is a frontend-only prototype for IMS566. For a real system, `localStorage` should be replaced with a backend (API + database) and proper authentication.
- All data used in this demo is stored only in the browser and can be cleared using browser storage tools.
