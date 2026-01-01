# K-Folio Frontend Integration Guide

This guide helps frontend developers connect the K-Folio client to the Express + MongoDB backend.

## Quick Start

1. Ensure the backend is running locally:
   ```bash
   pnpm install
   pnpm dev
   ```
2. Confirm the API base URL (default `http://localhost:3000`). Update `PORT` in the backend `.env` if you need a different port.
3. Add the base URL and any required keys to your frontend environment configuration, for example:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## Authentication Flow

### Sign Up
- **Endpoint:** `POST /auth/signup`
- **Body:**
  ```json
  {
    "user_handle": "sampleuser",
    "username": "Sample User",
    "email": "sampleuser@example.com",
    "password": "StrongPassw0rd!"
  }
  ```
- **Success Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "token": "<jwt>",
    "user": {
      "user_handle": "sampleuser",
      "username": "Sample User",
      "email": "sampleuser@example.com"
    }
  }
  ```

### Sign In
- **Endpoint:** `POST /auth/signin`
- **Body (handle-based):**
  ```json
  {
    "user_handle": "sampleuser",
    "password": "StrongPassw0rd!"
  }
  ```
- **Alternate Body (email-based):**
  ```json
  {
    "email": "sampleuser@example.com",
    "password": "StrongPassw0rd!"
  }
  ```
- **Success Response (200):** same shape as sign up.

### Token Handling
- Store the returned JWT securely (e.g., `localStorage` for simple prototypes or HTTP-only cookies for production).
- Include it in the `Authorization` header for protected endpoints:
  ```http
  Authorization: Bearer <jwt>
  ```

## Sample Frontend Helper

```ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type AuthResponse = {
  message: string;
  token: string;
  user: {
    user_handle: string;
    username: string;
    email: string;
  };
};

export async function signup(payload: Record<string, unknown>): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Signup failed" }));
    throw new Error(error.message || res.statusText);
  }

  return res.json();
}
```

## Expected Errors

| Status | Message                          | Typical Cause                             |
|--------|----------------------------------|-------------------------------------------|
| 400    | `Missing required fields`        | One of `user_handle`, `username`, `email`, `password` is blank during sign up. |
| 400    | `Provide credentials and password` | Sign in missing handle/email or password. |
| 401    | `Invalid credentials`            | User not found or password mismatch.      |
| 409    | `User handle already exists`     | Duplicate `user_handle`.                   |
| 409    | `Email already registered`       | Duplicate `email`.                         |
| 500    | `Unable to sign up user`         | Server error or missing JWT secret.        |
| 500    | `Unable to sign in`              | Server error or missing JWT secret.        |

## Local Development Checklist

- Backend running with `pnpm dev`.
- MongoDB available locally (`mongodb://localhost:27017/k_folio`) or via `MONGODB_URI`.
- Frontend `.env` contains the correct `VITE_API_URL`.
- Use Thunder Client, Postman, or the provided helper to test endpoints before wiring UI.

## Deployment Notes

- Configure `MONGODB_URI` and `JWT_SECRET` in the backend production environment.
- Update the frontend API base URL to the deployed backend domain.
- Review CORS policy if the frontend is hosted on a different origin; adjust in `src/index.ts` if needed.

For more backend details see `README.md`. If additional endpoints are added, mirror their specs here for quick reference.

