# 📚 Nesti v2 API Documentation

Base URL: `https://api.nesti.fr`

All requests must include proper authentication cookies (HttpOnly).

## Authentication

### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123",
  "first_name": "Jean",
  "last_name": "Dupont",
  "date_of_birth": "1990-01-15",
  "parental_consent_given": false
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "created_at": "2024-12-20T10:00:00Z"
  },
  "message": "Account created successfully"
}
```

**Errors:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

### POST /api/auth/login
Authenticate and receive session cookies.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecureP@ssw0rd123"
}
```

**Response:** `200 OK` + Sets HttpOnly cookies
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "Jean",
      "last_name": "Dupont"
    }
  },
  "message": "Logged in successfully"
}
```

**Cookies Set:**
- `_nesti_session`: Access token (HttpOnly, Secure, SameSite=Strict, 15 min)
- `_nesti_refresh`: Refresh token (HttpOnly, Secure, SameSite=Strict, 7 days)

**Errors:**
- `401 Unauthorized`: Invalid credentials
- `429 Too Many Requests`: Rate limit exceeded (5 req/min)

---

### POST /api/auth/refresh
Refresh access token using refresh token.

**Request:** No body (uses refresh cookie)

**Response:** `200 OK` + Updates access token cookie
```json
{
  "message": "Token refreshed"
}
```

---

### POST /api/auth/logout
Logout and clear session cookies.

**Request:** No body

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Users

### GET /api/users/me
Get current user profile.

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "avatar_url": "https://...",
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

---

### PUT /api/users/me
Update current user profile.

**Authorization:** Required

**Request:**
```json
{
  "first_name": "Jean",
  "last_name": "Martin",
  "avatar_url": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "first_name": "Jean",
    "last_name": "Martin",
    "updated_at": "2024-12-20T11:00:00Z"
  }
}
```

---

## Families

### POST /api/families
Create a new family.

**Authorization:** Required

**Request:**
```json
{
  "name": "Famille Dupont",
  "description": "Notre petite famille",
  "emoji": "👨‍👩‍👧‍👦"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "name": "Famille Dupont",
    "description": "Notre petite famille",
    "emoji": "👨‍👩‍👧‍👦",
    "created_by": "uuid",
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

---

### GET /api/families
List user's families.

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Famille Dupont",
      "emoji": "👨‍👩‍👧‍👦",
      "members_count": 4
    }
  ]
}
```

---

### GET /api/families/:id
Get family details.

**Authorization:** Required (must be family member)

**Response:** `200 OK`
```json
{
  "data": {
    "id": "uuid",
    "name": "Famille Dupont",
    "description": "Notre petite famille",
    "emoji": "👨‍👩‍👧‍👦",
    "members": [
      {
        "id": "uuid",
        "first_name": "Jean",
        "last_name": "Dupont",
        "role": "admin",
        "avatar_url": "https://..."
      }
    ]
  }
}
```

---

## Posts

### POST /api/families/:family_id/posts
Create a post in family feed.

**Authorization:** Required (must be family member)

**Request:**
```json
{
  "content": "Belle journée en famille!",
  "emoji": "🎉",
  "type": "celebration",
  "image_url": "https://..."
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "uuid",
    "content": "Belle journée en famille!",
    "emoji": "🎉",
    "type": "celebration",
    "author": {
      "id": "uuid",
      "first_name": "Jean",
      "last_name": "Dupont"
    },
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

**Rate Limit:** 100 req/min per user

---

### GET /api/families/:family_id/posts
List family posts.

**Authorization:** Required (must be family member)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 20, max: 100)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Belle journée en famille!",
      "emoji": "🎉",
      "author": {
        "id": "uuid",
        "first_name": "Jean",
        "avatar_url": "https://..."
      },
      "reactions_count": 5,
      "comments_count": 2,
      "created_at": "2024-12-20T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 45
  }
}
```

---

## Privacy (RGPD)

### POST /api/privacy/export-data
Request data export (RGPD portability).

**Authorization:** Required

**Request:**
```json
{
  "format": "json"
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Export request created. You will receive an email when ready.",
  "request_id": "uuid"
}
```

---

### POST /api/privacy/delete-account
Request account deletion (RGPD right to be forgotten).

**Authorization:** Required

**Request:**
```json
{
  "reason": "optional reason"
}
```

**Response:** `202 Accepted`
```json
{
  "message": "Deletion request created. Your account will be deleted in 7 days.",
  "request_id": "uuid"
}
```

---

### GET /api/privacy/consents
List user consents.

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "data": [
    {
      "purpose": "ai_assistant",
      "granted": true,
      "granted_at": "2024-12-20T10:00:00Z"
    },
    {
      "purpose": "analytics",
      "granted": false,
      "granted_at": null
    }
  ]
}
```

---

### POST /api/privacy/consents
Update consent.

**Authorization:** Required

**Request:**
```json
{
  "purpose": "ai_assistant",
  "granted": true
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "purpose": "ai_assistant",
    "granted": true,
    "granted_at": "2024-12-20T10:00:00Z"
  }
}
```

---

## AI Assistant

### POST /api/ai/chat
Send message to Nesti AI.

**Authorization:** Required + AI consent

**Request:**
```json
{
  "message": "Suggest family activities for this weekend"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "response": "Voici quelques idées pour le week-end...",
    "created_at": "2024-12-20T10:00:00Z"
  }
}
```

**Rate Limit:** 20 req/min per user

**Errors:**
- `403 Forbidden`: AI consent not given
- `429 Too Many Requests`: Rate limit exceeded

---

## Rate Limits

All endpoints are rate-limited. Limits vary by endpoint type:

| Endpoint Type | Limit |
|--------------|-------|
| Authentication | 5 req/min per IP |
| General API | 100 req/min per user |
| AI Chat | 20 req/min per user |
| Media Upload | 10 req/min per user |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Rate Limit Error:** `429 Too Many Requests`
```json
{
  "error": "Rate limit exceeded. Please try again later."
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": {
    "field": ["specific error"]
  }
}
```

**HTTP Status Codes:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Invalid data
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Security Headers

All responses include security headers:

```
Content-Security-Policy: default-src 'self'; ...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## WebSocket (Real-time)

### Connection

Connect to: `wss://api.nesti.fr/socket`

**Authentication:** Session cookie required

**Channels:**
- `family:{family_id}`: Family updates
- `user:{user_id}`: Personal notifications

**Example (JavaScript):**
```javascript
const socket = new WebSocket('wss://api.nesti.fr/socket');

socket.onopen = () => {
  socket.send(JSON.stringify({
    topic: 'family:uuid',
    event: 'phx_join',
    payload: {}
  }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## Changelog

### v2.0.0 (2024-12-20)
- Initial Phoenix/Elixir API
- RGPD compliance features
- Enhanced security (Argon2id, AES-256)
- Rate limiting
- WebSocket support

---

For security issues: security@nesti.fr  
For API support: api@nesti.fr
