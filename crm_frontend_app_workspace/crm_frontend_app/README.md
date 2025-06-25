# CRM Nexus Frontend (React)

This is the frontend web UI for CRM Nexus, a modern and responsive customer relationship management solution. It is built using React with minimal dependencies, a clean layout, color and theme consistency, and accessibility first design.

## 🚀 Features

- **User Authentication** (Signup/Login/JWT management)
- **Customer Management** (CRUD, search/filter, tables, profile view)
- **Interaction Logging** (calls, emails, meetings with timestamped history)
- **Task Assignment & Tracking** (Create, edit, complete, reminders)
- **Metrics Dashboard** (Visual analytics, charts, stats)
- **Export to CSV** (Customer data export with one click)
- **Responsive Design** (Sidebar, topnav, mobile-first fluid layout)
- **Custom Theming** (Color palette, dark/light toggle)
- **In-App Guidance** (Accessible help, tooltips in forms/tables)
- **Keyboard and Screen Reader Accessible**

## 🧑‍💻 Getting Started

In the `crm_frontend_app` directory:

- Install dependencies:
  ```bash
  npm install
  ```
- Start development server:
  ```bash
  npm start
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser.

- Run tests (optional):
  ```bash
  npm test
  ```

- Build for production:
  ```bash
  npm run build
  ```

## ⚙️ Configuration

No configuration is necessary for local frontend use beyond what is in `.env` (optional: customize API endpoints). The app expects backend API at `/api` or as configured in source.

## 🎨 Colors & Theming

The application uses CSS custom properties defined in `src/App.css` including:

```css
:root {
  --primary: #1976D2;
  --secondary: #424242;
  --accent: #FFB300;
  --bg-light: #f2f4fa;
  --bg-dark: #23242a;
  --text-color: #111;
  --text-light: #ffffff;
  --nav-width: 220px;
}
```

- **Theme Toggle:** Accessible via the top right sun/moon button. Remembers user choice in-session.

## 🖥️ Layout & UX

- **Sidebar**: Persistent navigation/sidebar, highlights active link, collapses on mobile.
- **Topnav**: Title, theme toggle, access to authentication/logout.
- **Main Panel**: Route-driven, shows current page, always fully responsive (mobile, tablet, desktop).
- **Forms**: Clearly labeled, focus outline, auto-complete, error announcements.
- **Tables**: Keyboard navigation, focusable rows/cells.
- **Dashboard**: Quick stats, charts (if available), next actions.

## ♿ Accessibility

- All interactive elements (buttons, inputs, nav items) are keyboard accessible.
- Sufficient color contrast for all text and buttons.
- Uses `aria-label`, `aria-*` roles, and adds announcements for dynamic updates.
- Headings (`h1`, `h2`, …) structure respected on every screen.
- Focus is always returned after modal/dialog close, and trapped inside modal if present.

## ❓ In-App Help

- Tooltips added for icons and form actions (hover or focus for keyboard users).
- Short onboarding section at login and dashboard for first-time users.
- Each form/table provides accessible descriptions for new users.
- 404 and error pages have getting-started tips.

## 🛠️ Developer Workflow

- **Components:** Find React components in `src/pages` and folders within.
- **Styling:** Centralized in `src/App.css` for consistency. All colors are CSS variables and easy to update.
- **Auth:** Context/Provider-based (`src/auth`). Use `useAuth()` for hooks.
- **Routing:** React Router. Update `src/App.js` for global routes.
- **APIs:** Change API URLs as needed in fetch/axios calls.

## 🌟 Customization

- To update branding, just edit CSS variables in `src/App.css` and change logo text in `Sidebar` (see `App.js`).
- Add or update sidebar routes in `App.js` and their corresponding pages.

## 🧩 Adding Features

See the backend README for more info about API endpoints and expected data shape. Each feature (metrics, export, customer/task CRUD) has its own page/component for easy extension.

## 🤝 Contributing

- Please use semantic messages for commits.
- PRs and issues welcome! See coding standards in this README and source comments.

## 📄 License

Proprietary — CRM Nexus for demo/reference use.

