# Sweety

Sweety is a blood glucose tracking app where users can record their daily readings and check their glucose reports. Users can add, edit, or delete readings and view summaries for a selected day, the current month, or the previous month. Each user can access only their own readings.

## Tech Stack

- React 19 and Vite for the frontend
- Plain CSS for styling
- Node.js and Express 5 for the backend
- PostgreSQL with Supabase
- bcrypt for password hashing
- JWT for user authentication

## Project Structure

```text
client/    React frontend
server/    Express backend
database/  Database schema
```

## Run the Project Locally

Before starting, make sure Node.js 20 or newer, npm, and a Supabase project are available.

### 1. Database Setup

Open the SQL Editor in Supabase.

Run the SQL file:

```text
database/schema.sql
```

This creates the `users` and `glucose_readings` tables. The schema uses `IF NOT EXISTS`, so it can be run again without recreating existing tables.

### 2. Start the Backend

Open a terminal and run:

```powershell
cd server
npm install
copy .env.example .env
```

Update the `.env` file with your Supabase database connection and JWT settings:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_REF.supabase.co:5432/postgres?sslmode=require
JWT_SECRET=your_random_secret
JWT_EXPIRES_IN=1d
```

To generate a random JWT secret:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start the API:

```powershell
npm start
```

The backend runs at `http://localhost:5000`.

You can open the root URL to check whether the server is running.

### 3. Start the Frontend

Open another terminal:

```powershell
cd client
npm install
copy .env.example .env
npm run dev
```

Set the API URL in `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

The frontend runs at `http://localhost:5173`.

Keep both the backend and frontend running while using the application.

## Sample Data

To add sample users and glucose readings, run the seed script from the server directory:

```bash
node src/seed.js
```

The script creates a demo account and sample readings. It can be used to test the application locally.

## Deployment

The frontend is deployed on Vercel and the backend is deployed on Render. Both are configured to redeploy when changes are pushed to the `main` branch.

### Backend – Render

1. Open the Render dashboard.
2. Create a new Blueprint using the GitHub repository.
3. The `render.yaml` file configures the server directory and start commands.
4. Add the `DATABASE_URL` environment variable.
5. Set the `JWT_SECRET`.
6. Deploy the service.

The API URL will be provided by Render.

### Frontend – Vercel

1. Import the repository into Vercel.
2. Set `client` as the root directory.
3. Add the `VITE_API_URL` environment variable with the backend URL.
4. Deploy the frontend.

The API URL is included during the frontend build, so a new deployment is required if it changes.

The `client/vercel.json` file handles routes such as `/dashboard` and `/reports`.

## API Endpoints

Register and login are public endpoints. The remaining endpoints require a valid JWT in the `Authorization` header.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a token |
| GET | `/api/readings` | Get the logged-in user's readings |
| POST | `/api/readings` | Add a glucose reading |
| PUT | `/api/readings/:id` | Update a reading |
| DELETE | `/api/readings/:id` | Delete a reading |
| GET | `/api/reports/daily` | Get the daily report |
| GET | `/api/reports/month-to-date` | Get the current month's report |
| GET | `/api/reports/previous-month` | Get the previous month's report |

The daily report accepts an optional date parameter:

```text
/api/reports/daily?date=YYYY-MM-DD
```

If no date is provided, it uses the current date.

## Reading Rules

The app supports four reading slots per day:

- Morning (fasting)
- After breakfast
- After lunch
- After dinner

A glucose reading must be a whole number between 40 and 600 mg/dL.

Users cannot add readings for future dates. Each user can add only one reading for a particular slot on a given day. Duplicate readings return a `409` response.

Reports include the reading count, minimum, maximum, and average glucose value. If there are no readings for a period, the count is `0` and the other values are `null`.

## Notes

- JWT tokens are stored in `localStorage`. For a production application, httpOnly cookies would be a better option.
- Email verification and password reset are not implemented.
- The free Render instance may sleep after a period of inactivity. The first request after that can take some time to respond.

This project was built as part of a Junior Full Stack Developer assessment.