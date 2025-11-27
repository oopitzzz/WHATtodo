# FE14-30 Implementation Guide (Backend Compatibility)

## Scope & Assumptions
- Base: FE-1~13, axios client (auto Bearer + refresh), Zustand auth/todo stores, common UI (Button/Input/Modal/LoadingSpinner), layouts (Auth/Main), ProtectedRoute (token check).
- API base: `VITE_API_BASE_URL` default `http://localhost:3000/api`.
- Backend responses use snake_case; preserve when reading/updating store state.

## Backend Contracts (must keep in sync)
- Auth
  - POST `/auth/signup|login` → `{ user:{userId,email,nickname,profileImageUrl,notificationEnabled}, accessToken, refreshToken }`
  - POST `/auth/refresh` body `{ refreshToken }` → `{ accessToken, refreshToken }`
  - Access token required in `Authorization: Bearer ...` for protected routes.
- Users
  - GET/PUT `/users/me` (auth). Updatable fields: nickname, profileImageUrl, notificationEnabled. Nickname 2~20 chars.
- Todos
  - Enums: `priority` HIGH|NORMAL|LOW, `status` ACTIVE|COMPLETED|DELETED.
  - Title 1~100 (trim), due_date optional but cannot be past; completed_at required when status COMPLETED; deleted_at when status DELETED.
  - GET `/todos` filters: status, priority, search, dueDateFrom/To, includeDeleted=true, sortBy in {due_date,priority,created_at,updated_at}, sortDirection `asc|desc` (lowercase), limit 1..100, offset>=0.
  - POST `/todos` body: {title, description?, priority?, status?, dueDate?, memo?} -> returns created todo.
  - GET `/todos/:id`, PUT `/todos/:id` (same fields), PATCH `/todos/:id/complete`, PATCH `/todos/:id/restore` body {status='ACTIVE'}, DELETE `/todos/:id` soft-delete.
- Trash
  - GET `/trash?page&pageSize` (auth) → `{items, meta:{page,pageSize,total,totalPages}}` (items are deleted todos).
  - DELETE `/trash/:id` → 204 (only 30d+ deleted rows succeed; otherwise 404).
- Calendar
  - GET `/calendar/holidays?year&month` → `[ {date, holiday_name, description} ]`. month 1~12.

## Current FE State (compat notes)
- Auth store stores tokens in localStorage; login/signup already set isAuthenticated. ProtectedRoute checks only token presence (no live verify).
- Todo store defaults: filter ACTIVE, sortBy `created_at`, sortDirection `DESC` (uppercase) → backend treats unknown as ASC by fallback. Use lowercase `desc` if sorting needed.
- API layer uses snake_case responses; store keeps todo.todo_id etc. Keep that shape in UI components.

## Task Guidance
- FE-14 LoginForm
  - Fields email/password using Input. Validate non-empty + basic email regex. Call `auth.store.login`, show loading/disabled, surface backend 400/401 messages. Enter key submits. Link to signup.
- FE-15 LoginPage
  - Use AuthLayout. If already authenticated, Navigate to `/dashboard`. On success navigate dashboard. Keep responsive padding.
- FE-16 SignupForm/Page
  - Fields: email, password (>=8), passwordConfirm match, nickname (2~20). Password strength hint (length+digits+special). On success set tokens via store and go dashboard. Map 409 duplicate email error to UI.
- FE-17 TodoItem
  - Props todo (snake_case). Card layout with priority badge colors (HIGH red, NORMAL blue, LOW gray/green). Checkbox toggles complete via `completeTodo` -> sets status COMPLETED. Show D-day from due_date; gracefully handle null. Buttons: view/edit/delete; delete uses soft DELETE API. Truncate description/memo.
- FE-18 TodoList
  - States: loading (LoadingSpinner), error (retry button), empty copy. Map todos to TodoItem. Optional infinite scroll: IntersectionObserver triggering fetch with offset/hasMore.
- FE-19 TodoForm
  - Modes create/update via prop. Fields: title(required, trim), description, priority (segmented), dueDate (type=date), memo. Client validation: title not blank, dueDate not past. Submit: createTodo or updateTodo. Keep date string `YYYY-MM-DD` to match backend validation. Use Modal wrapper.
- FE-20 DashboardPage
  - On mount fetchTodos. Summary chips: total/active/completed from store. Controls: filter (status), sort (use lowercase `asc|desc`), search optional. “+” opens TodoForm modal. Render TodoList. Responsive grid 1→2→3 cols.
- FE-21 CalendarView
  - Build month grid, highlight today, show holiday color from `/calendar/holidays`. Show todo count/dots per day (requires store/filter by date). Prev/Next month navigation; optional week scroll on mobile.
- FE-22 CalendarPage
  - Wrap CalendarView; header with month/year, Today button. Handle loading/error for holidays. Date click triggers filter or detail modal.
- FE-23 TrashPage
  - Use `/trash` for deleted todos; show meta pagination. Actions: restore could call `/todos/:id/restore` (status ACTIVE) then refetch; permanent delete uses DELETE /trash/:id (204) with confirm. Show empty/loader/error states; note 30-day rule.
- FE-24 SettingsPage
  - Fetch `/users/me`; allow nickname edit (2~20), notification toggle, profileImageUrl optional. Save via PUT; on success update auth store user. Include logout button (store.logout clears tokens).
- FE-25 MainLayout
  - Convert nav to `Link`/`NavLink` (no full reload). Mobile: hamburger+drawer. Show user avatar/nickname from auth store. Place Outlet. Logout button calls store.logout and navigate to /login.
- FE-26 AuthLayout
  - Center card, add logo/hero copy; maintain responsiveness (padding shrink on small screens).
- FE-27 ProtectedRoute
  - Keep token check; optionally add “checking” state if future token verification added. Redirect unauthenticated to /login.
- FE-28 Responsive
  - Verify at 375/768/1024+. Ensure grids wrap, forms full-width on mobile, modals scrollable. Use Tailwind container/gap/typography adjustments.
- FE-29 ErrorBoundary
  - Class component with `componentDidCatch`. Fallback UI with message + “다시 시도” button (calls reset prop or reload). Log to console. Wrap App (Router) and optionally reset on location change.
- FE-30 Performance
  - `React.memo` TodoItem; stable handlers via `useCallback`/`useMemo`. Lazy-load routes with `React.lazy`+`Suspense`. Consider list virtualization (react-window) if todos large. Ensure Tailwind purge active. Use `vite-plugin-visualizer` for bundle, target Lighthouse 90+ (CLS/FCP). Avoid redundant fetches: debounce search, guard fetch while loading.

## Validation & UX Alignment
- Match backend constraints: title length 1~100, nickname 2~20, password ≥8, due_date not past (client mirror), enums uppercase as above.
- Keep snake_case in outbound date fields: `dueDate` key expected; but backend reads `dueDate` and maps to due_date. Ensure values are strings (ISO date) not Date objects.
- Soft delete/complete flows must respect status transitions; completed_at/deleted_at are server-set.
- Error surfacing: show backend messages for 400/401/409; generic fallback for 500.

## Action Items Before FE-14+ Coding
- Adjust todo.store sortDirection to lowercase `desc`/`asc` to match backend (or normalize before request).
- Confirm VITE_API_BASE_URL in `.env` (frontend) points to backend `/api`.
- Reuse Button/Input/Modal/Spinner components for consistency; keep typography/padding responsive.
