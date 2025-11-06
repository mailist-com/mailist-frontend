# REST API Specification for Backend

This document describes the REST API endpoints that the backend needs to implement.

**Base URL**: `/api/v1`

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Contact Lists Endpoints](#contact-lists-endpoints)

---

## Authentication Endpoints

### Refresh Token

**Endpoint**: `POST /auth/refresh-token`

**Description**: Refreshes an expired access token using a valid refresh token. This endpoint is automatically called by the frontend when a 401 error is received.

**Request Headers**:
```
Content-Type: application/json
X-API-Version: v1
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Optional: new refresh token
  },
  "message": "Token refreshed successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Missing or invalid refresh token
- `401 Unauthorized`: Refresh token expired or invalid
- `500 Internal Server Error`: Server error

```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "errors": null
}
```

**Notes**:
- The refresh token should have a longer expiration time than the access token (e.g., 7 days vs 15 minutes)
- Optionally, the backend can implement token rotation by returning a new refresh token with each refresh
- The frontend automatically handles token refresh when receiving 401 errors on protected endpoints

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh-token \
  -H "Content-Type: application/json" \
  -H "X-API-Version: v1" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

## Contact Lists Endpoints

### Authentication Required

All contact lists endpoints require authentication via JWT Bearer token:

```
Authorization: Bearer <token>
```

When the access token expires (401 error), the frontend will automatically attempt to refresh it using the refresh token endpoint above.

---

## Endpoints

### 1. Get All Lists

**Endpoint**: `GET /lists`

**Description**: Returns all contact lists for the authenticated user.

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Newsletter Subscribers",
      "description": "Monthly newsletter recipients",
      "type": "regular",
      "status": "active",
      "subscriberCount": 1250,
      "unsubscribedCount": 45,
      "cleanedCount": 12,
      "bouncedCount": 8,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-03-20T14:22:00Z",
      "settings": {
        "doubleOptIn": true,
        "welcomeEmail": true,
        "notifyOnSubscribe": false,
        "notifyOnUnsubscribe": true,
        "allowPublicSubscription": true,
        "requireNameOnSignup": true,
        "requirePhoneOnSignup": false,
        "respectUnsubscribes": true,
        "respectBounces": true
      },
      "customFields": [],
      "tags": ["newsletter", "active"]
    }
  ],
  "message": "Lists retrieved successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission to access lists
- `500 Internal Server Error`: Server error

```json
{
  "success": false,
  "message": "Access forbidden. You do not have permission to access this resource.",
  "errors": null
}
```

---

### 2. Get List Statistics

**Endpoint**: `GET /lists/statistics`

**Description**: Returns aggregated statistics for all contact lists.

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "totalLists": 12,
    "activeLists": 10,
    "totalSubscribers": 15420,
    "averageEngagement": 78.5
  },
  "message": "Statistics retrieved successfully"
}
```

**Field Descriptions**:

- `totalLists`: Total number of contact lists (all statuses)
- `activeLists`: Number of lists with status = "active"
- `totalSubscribers`: Sum of subscriberCount across all lists
- `averageEngagement`: Average engagement rate percentage across all lists
  - Formula: `((subscriberCount - unsubscribedCount) / subscriberCount) * 100`
  - Averaged across all lists

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission
- `500 Internal Server Error`: Server error

---

### 3. Get Single List

**Endpoint**: `GET /lists/{id}`

**Description**: Returns details of a specific contact list.

**Path Parameters**:
- `id` (string, required): List ID (UUID)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Newsletter Subscribers",
    "description": "Monthly newsletter recipients",
    "type": "regular",
    "status": "active",
    "subscriberCount": 1250,
    "unsubscribedCount": 45,
    "cleanedCount": 12,
    "bouncedCount": 8,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-03-20T14:22:00Z",
    "settings": {
      "doubleOptIn": true,
      "welcomeEmail": true,
      "notifyOnSubscribe": false,
      "notifyOnUnsubscribe": true,
      "allowPublicSubscription": true,
      "requireNameOnSignup": true,
      "requirePhoneOnSignup": false,
      "respectUnsubscribes": true,
      "respectBounces": true
    },
    "customFields": [],
    "tags": ["newsletter", "active"]
  },
  "message": "List retrieved successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: List doesn't exist
- `500 Internal Server Error`: Server error

---

### 4. Create List

**Endpoint**: `POST /lists`

**Description**: Creates a new contact list.

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:

```json
{
  "name": "VIP Customers",
  "description": "High-value customer segment",
  "type": "regular",
  "status": "active",
  "settings": {
    "doubleOptIn": false,
    "welcomeEmail": false,
    "notifyOnSubscribe": false,
    "notifyOnUnsubscribe": false,
    "allowPublicSubscription": false,
    "requireNameOnSignup": false,
    "requirePhoneOnSignup": false,
    "respectUnsubscribes": true,
    "respectBounces": true
  },
  "customFields": [],
  "tags": []
}
```

**Field Validation**:

- `name` (string, required): 1-255 characters
- `description` (string, optional): Max 1000 characters
- `type` (enum, required): One of ["regular", "smart", "static"]
- `status` (enum, required): One of ["active", "inactive", "archived"]
- `settings` (object, required): All boolean fields required
- `customFields` (array, optional): Array of custom field definitions
- `tags` (array, optional): Array of strings

**Response**: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "VIP Customers",
    "description": "High-value customer segment",
    "type": "regular",
    "status": "active",
    "subscriberCount": 0,
    "unsubscribedCount": 0,
    "cleanedCount": 0,
    "bouncedCount": 0,
    "createdAt": "2024-03-21T10:30:00Z",
    "updatedAt": "2024-03-21T10:30:00Z",
    "settings": {
      "doubleOptIn": false,
      "welcomeEmail": false,
      "notifyOnSubscribe": false,
      "notifyOnUnsubscribe": false,
      "allowPublicSubscription": false,
      "requireNameOnSignup": false,
      "requirePhoneOnSignup": false,
      "respectUnsubscribes": true,
      "respectBounces": true
    },
    "customFields": [],
    "tags": []
  },
  "message": "List created successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "type": ["Type must be one of: regular, smart, static"]
  }
}
```
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission to create lists
- `500 Internal Server Error`: Server error

---

### 5. Update List

**Endpoint**: `PUT /lists/{id}`

**Description**: Updates an existing contact list.

**Path Parameters**:
- `id` (string, required): List ID (UUID)

**Request Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body** (all fields optional):

```json
{
  "name": "Updated List Name",
  "description": "Updated description",
  "status": "inactive",
  "settings": {
    "doubleOptIn": true
  },
  "tags": ["updated", "modified"]
}
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Updated List Name",
    "description": "Updated description",
    "type": "regular",
    "status": "inactive",
    "subscriberCount": 1250,
    "unsubscribedCount": 45,
    "cleanedCount": 12,
    "bouncedCount": 8,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-03-21T11:45:00Z",
    "settings": {
      "doubleOptIn": true,
      "welcomeEmail": true,
      "notifyOnSubscribe": false,
      "notifyOnUnsubscribe": true,
      "allowPublicSubscription": true,
      "requireNameOnSignup": true,
      "requirePhoneOnSignup": false,
      "respectUnsubscribes": true,
      "respectBounces": true
    },
    "customFields": [],
    "tags": ["updated", "modified"]
  },
  "message": "List updated successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: List doesn't exist
- `500 Internal Server Error`: Server error

---

### 6. Delete List

**Endpoint**: `DELETE /lists/{id}`

**Description**: Deletes a contact list (soft delete recommended).

**Path Parameters**:
- `id` (string, required): List ID (UUID)

**Request Headers**:
```
Authorization: Bearer <token>
```

**Response**: `200 OK`

```json
{
  "success": true,
  "data": null,
  "message": "List deleted successfully"
}
```

**Error Responses**:

- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: User doesn't have permission
- `404 Not Found`: List doesn't exist
- `500 Internal Server Error`: Server error

---

## Data Models

### ContactList

```typescript
{
  id: string;                    // UUID
  name: string;                  // 1-255 characters
  description: string;           // Max 1000 characters
  type: 'regular' | 'smart' | 'static';
  status: 'active' | 'inactive' | 'archived';
  subscriberCount: number;       // Total active subscribers
  unsubscribedCount: number;     // Number of unsubscribed contacts
  cleanedCount: number;          // Number of cleaned contacts
  bouncedCount: number;          // Number of bounced contacts
  createdAt: string;             // ISO 8601 datetime
  updatedAt: string;             // ISO 8601 datetime
  settings: ListSettings;
  customFields: CustomField[];
  tags: string[];
}
```

### ListSettings

```typescript
{
  doubleOptIn: boolean;
  welcomeEmail: boolean;
  notifyOnSubscribe: boolean;
  notifyOnUnsubscribe: boolean;
  allowPublicSubscription: boolean;
  requireNameOnSignup: boolean;
  requirePhoneOnSignup: boolean;
  respectUnsubscribes: boolean;
  respectBounces: boolean;
}
```

### Statistics Response

```typescript
{
  totalLists: number;           // Count of all lists
  activeLists: number;          // Count of active lists
  totalSubscribers: number;     // Sum of subscribers across all lists
  averageEngagement: number;    // Average engagement rate (0-100)
}
```

---

## Permission Requirements

All endpoints require:
- Valid JWT authentication token
- User must have access to their own organization's lists
- Users should only see/modify lists they have permission for

Recommended roles:
- **Admin**: Full access to all lists
- **User**: Access to lists they created or were granted access to
- **Read-only**: View lists only, no create/update/delete

---

## Notes for Backend Implementation

1. **Soft Delete**: Consider implementing soft delete for lists (mark as deleted rather than actually removing)
2. **Pagination**: Consider adding pagination to `GET /lists` for large datasets
3. **Caching**: Statistics endpoint can be cached for 5-10 minutes
4. **Validation**: Validate all input data and return meaningful error messages
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Audit Log**: Log all create/update/delete operations for audit purposes
7. **CORS**: Configure CORS to allow requests from frontend domain
8. **Database Indexes**: Add indexes on `userId`, `status`, `createdAt` for performance

---

## Example cURL Commands

### Get all lists
```bash
curl -X GET http://localhost:8080/api/v1/lists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Get statistics
```bash
curl -X GET http://localhost:8080/api/v1/lists/statistics \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Create list
```bash
curl -X POST http://localhost:8080/api/v1/lists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test List",
    "description": "Testing",
    "type": "regular",
    "status": "active",
    "settings": {
      "doubleOptIn": false,
      "welcomeEmail": false,
      "notifyOnSubscribe": false,
      "notifyOnUnsubscribe": false,
      "allowPublicSubscription": false,
      "requireNameOnSignup": false,
      "requirePhoneOnSignup": false,
      "respectUnsubscribes": true,
      "respectBounces": true
    },
    "customFields": [],
    "tags": []
  }'
```

### Delete list
```bash
curl -X DELETE http://localhost:8080/api/v1/lists/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```
