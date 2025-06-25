# CRM Nexus Frontend Developer Documentation

## Project Structure
```
crm_frontend_app/
├── src/
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   ├── auth/
│   │   ├── AuthContext.js
│   │   └── ProtectedRoute.js
│   └── pages/
│       ├── CustomersPage.js
│       ├── ExportPage.js
│       ├── InteractionLog.js
│       ├── InteractionsPage.js
│       ├── LoginPage.js
│       ├── MetricsPage.js
│       ├── SignupPage.js
│       └── TasksPage.js
├── README.md
└── DEVELOPER_DOCS.md
```

## Architecture

- **Component Model:** Atomic React function components, separation of auth, sidebar/layout, and CRUD pages.
- **Routing:** React Router, all routes declared in `src/App.js`.
- **Styling:** Centralized in `src/App.css` using variables for strict brand adherence and maintainability.
- **State Management:** Context for Auth, local state/hooks elsewhere.
- **API Integration:** Standard REST via fetch/axios (configurable as needed).

## Feature Overview

- **Authentication:** Signup, login (context managed JWT, stores token in memory, supports redirects).
- **CRUD Management:** 
    - Customers: list, view, create, update, delete.
    - Interactions: log, list by customer, edit, delete.
    - Tasks: assign, track, filter/status, complete.
- **Metrics Dashboard:** Uses backend endpoints, displays counts, trends.
- **CSV Export:** One click, triggers backend download endpoint.
- **Responsive/Accessible UI**
    - Sidebar, topnav, and all pages mobile-first and accessible.
    - Keyboard navigation supported everywhere.

## Setup & Development

1. **Install dependencies** (`npm install`)
2. **Configure backend API URL** (optional, see API call locations).
3. **Start dev server** (`npm start`)
4. **Testing**: (`npm test`)
5. **Build for prod**: (`npm run build`)

### Environment

- No .env required unless customizing API URL (see fetch calls).
- Uses the backend at `/api`.

## Theming & Customization

- **Colors:** All variables in `src/App.css` (see `:root` section).
- **Dark/Light mode**: Controlled in `App.js` by user toggle.
- **Logo/Brand:** Sidebar `.crm-logo` (edit in `App.js`).
- **Accessibility:** Follows WCAG 2.1 AA where feasible, focus outlines, aria labels, live regions for feedback.

## Developer Best Practices

- Use semantic commit messages.
- Keep navigation and page code split clean and atomic.
- Comment public functions with `// PUBLIC_INTERFACE` and a docstring-style comment.
- Write forms and messages to be screen-reader and keyboard accessible.
- Do not hardcode API endpoints outside of a config/constant.
- Always test major UI flows manually after regression/feature changes.

## Extensibility

- Add routes/components from `src/App.js` routing section.
- All major entities (customers, interactions, tasks) have a page component as entrypoint.
- Styling: add CSS to `App.css` or page-level modular CSS if needed.

## Accessibility Requirements Checklist

- [x] Color contrast meets minimum for text/buttons.
- [x] Headings structure hierarchy respected.
- [x] All interactive elements reachable by tab/arrow.
- [x] Forms include aria-labels and error descriptions.
- [x] Focus visible on all inputs, buttons, links.
- [x] No reliance on color alone for important distinctions.
- [x] Table rows and cells focusable.
- [x] Non-decorative images/icons have alt text.

## Support

- For backend API structure see `../crm_backend_api/README.md`.
- Raise issues with steps to reproduce and console/network info.

---

© CRM Nexus. Internal Reference Use Only.
