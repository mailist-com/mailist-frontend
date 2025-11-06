# REST API Specification - Notifications Module

## Overview
This document describes the REST API endpoints required for the notifications system in the Mailist frontend application. The notifications system allows users to receive real-time updates about contact list operations (adding/removing contacts from mailing lists).

## Base URL
All endpoints should be prefixed with the API base URL: `{API_BASE_URL}/api/v1/`

## Authentication
All endpoints require authentication via Bearer token:
```
Authorization: Bearer {access_token}
```

---

## Data Models

### Notification Object

```typescript
{
  "id": "string (UUID)",
  "type": "contact_added | contact_removed | campaign_sent | automation_triggered | system",
  "title": "string (HTML allowed for formatting)",
  "message": "string (optional)",
  "status": "unread | read",
  "metadata": {
    // For contact_added/contact_removed
    "contactEmail": "string",
    "listName": "string",
    "listId": "string (UUID)",

    // For campaign_sent
    "campaignName": "string",
    "campaignId": "string (UUID)",
    "recipientCount": "number (optional)"
  },
  "createdAt": "string (ISO 8601 datetime)",
  "readAt": "string (ISO 8601 datetime, optional)"
}
```

### Notification Types

| Type | Description | Use Case |
|------|-------------|----------|
| `contact_added` | Contact was added to a mailing list | Track list growth |
| `contact_removed` | Contact was removed from a mailing list | Track list changes |
| `campaign_sent` | Marketing campaign was sent | Campaign tracking |
| `automation_triggered` | Automation workflow triggered | Workflow monitoring |
| `system` | System-level notifications | Admin notifications |

---

## API Endpoints

### 1. Get All Notifications

**Endpoint:** `GET /notifications`

**Description:** Retrieve all notifications for the authenticated user with optional filtering.

**Query Parameters:**
```typescript
{
  "type": "string (optional, comma-separated: contact_added,contact_removed)",
  "status": "unread | read (optional)",
  "page": "number (optional, default: 1)",
  "pageSize": "number (optional, default: 20)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "contact_added",
      "title": "Kontakt <b>john.doe@example.com</b> dodany do listy <b>Newsletter 2024</b>",
      "status": "unread",
      "metadata": {
        "contactEmail": "john.doe@example.com",
        "listName": "Newsletter 2024",
        "listId": "123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2025-11-06T12:30:00Z"
    }
  ],
  "message": "Notifications retrieved successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing authentication token
- `500 Internal Server Error` - Server error

---

### 2. Get Paginated Notifications

**Endpoint:** `GET /notifications`

**Description:** Retrieve paginated notifications (same as Get All Notifications but with pagination metadata).

**Query Parameters:** Same as above

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "contact_added",
      "title": "Kontakt <b>john.doe@example.com</b> dodany do listy <b>Newsletter 2024</b>",
      "status": "unread",
      "metadata": {
        "contactEmail": "john.doe@example.com",
        "listName": "Newsletter 2024",
        "listId": "123e4567-e89b-12d3-a456-426614174000"
      },
      "createdAt": "2025-11-06T12:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  },
  "message": "Notifications retrieved successfully"
}
```

---

### 3. Get Single Notification

**Endpoint:** `GET /notifications/{id}`

**Description:** Retrieve a single notification by ID.

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "contact_removed",
    "title": "Kontakt <b>anna.kowalska@test.pl</b> usunięty z listy <b>Marketing Q4</b>",
    "status": "read",
    "metadata": {
      "contactEmail": "anna.kowalska@test.pl",
      "listName": "Marketing Q4",
      "listId": "123e4567-e89b-12d3-a456-426614174001"
    },
    "createdAt": "2025-11-06T10:20:00Z",
    "readAt": "2025-11-06T12:45:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found` - Notification not found
- `401 Unauthorized` - Invalid authentication

---

### 4. Mark Notification as Read

**Endpoint:** `PATCH /notifications/{id}/read`

**Description:** Mark a specific notification as read.

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Request Body:** Empty or `{}`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "contact_added",
    "title": "Kontakt <b>john.doe@example.com</b> dodany do listy <b>Newsletter 2024</b>",
    "status": "read",
    "metadata": {
      "contactEmail": "john.doe@example.com",
      "listName": "Newsletter 2024",
      "listId": "123e4567-e89b-12d3-a456-426614174000"
    },
    "createdAt": "2025-11-06T12:30:00Z",
    "readAt": "2025-11-06T12:50:00Z"
  },
  "message": "Notification marked as read"
}
```

**Error Responses:**
- `404 Not Found` - Notification not found
- `401 Unauthorized` - Invalid authentication

---

### 5. Mark All Notifications as Read

**Endpoint:** `POST /notifications/mark-all-read`

**Description:** Mark all user's notifications as read.

**Request Body:** Empty or `{}`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid authentication
- `500 Internal Server Error` - Server error

---

### 6. Delete Notification

**Endpoint:** `DELETE /notifications/{id}`

**Description:** Delete a specific notification.

**Path Parameters:**
- `id` (string, required) - Notification UUID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Notification not found
- `401 Unauthorized` - Invalid authentication

---

### 7. Delete All Read Notifications

**Endpoint:** `DELETE /notifications/read`

**Description:** Delete all read notifications for the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "All read notifications deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid authentication
- `500 Internal Server Error` - Server error

---

### 8. Get Notification Statistics

**Endpoint:** `GET /notifications/stats`

**Description:** Get notification statistics for the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total": 45,
    "unread": 12,
    "byType": {
      "contact_added": 20,
      "contact_removed": 15,
      "campaign_sent": 8,
      "automation_triggered": 2,
      "system": 0
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid authentication

---

## Creating Notifications (Backend Implementation)

When implementing the backend, notifications should be created automatically when:

### Contact Added to List
```typescript
// Triggered when a contact is added to a mailing list
{
  "type": "contact_added",
  "title": "Kontakt <b>{contactEmail}</b> dodany do listy <b>{listName}</b>",
  "metadata": {
    "contactEmail": "{contactEmail}",
    "listName": "{listName}",
    "listId": "{listId}"
  }
}
```

### Contact Removed from List
```typescript
// Triggered when a contact is removed from a mailing list
{
  "type": "contact_removed",
  "title": "Kontakt <b>{contactEmail}</b> usunięty z listy <b>{listName}</b>",
  "metadata": {
    "contactEmail": "{contactEmail}",
    "listName": "{listName}",
    "listId": "{listId}"
  }
}
```

---

## Real-Time Updates (Optional Enhancement)

For real-time notifications, consider implementing:

### WebSocket Connection
**Endpoint:** `WS /notifications/ws`

**Message Format:**
```json
{
  "event": "notification_created",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "type": "contact_added",
    "title": "Kontakt <b>john.doe@example.com</b> dodany do listy <b>Newsletter 2024</b>",
    "status": "unread",
    "metadata": { ... },
    "createdAt": "2025-11-06T12:30:00Z"
  }
}
```

**Note:** The frontend currently uses polling (30-second intervals) but can be easily adapted to use WebSocket for real-time updates.

---

## Database Schema Recommendation

### Notifications Table

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('contact_added', 'contact_removed', 'campaign_sent', 'automation_triggered', 'system')),
  title TEXT NOT NULL,
  message TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,

  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_status (status),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_created_at (created_at DESC)
);
```

---

## Implementation Notes

1. **Permissions**: Each user should only see their own notifications
2. **Soft Delete**: Consider implementing soft delete instead of hard delete
3. **Retention Policy**: Define a policy for how long to keep notifications (e.g., 30 days)
4. **Performance**: Use database indexes for filtering and pagination
5. **Localization**: Titles should be generated in the user's preferred language
6. **HTML in Titles**: The `title` field supports basic HTML (`<b>` tags) for formatting

---

## Frontend Integration

The frontend is already implemented and will:
- Poll for new notifications every 30 seconds (configurable)
- Display unread count in the topbar bell icon
- Filter notifications by type (all, added to list, removed from list)
- Mark notifications as read when clicked
- Support marking all notifications as read

All you need to do is implement the backend endpoints as specified above!

---

## Testing Checklist

- [ ] Create notification when contact is added to list
- [ ] Create notification when contact is removed from list
- [ ] Get all notifications endpoint
- [ ] Get single notification endpoint
- [ ] Mark notification as read
- [ ] Mark all notifications as read
- [ ] Delete notification
- [ ] Delete all read notifications
- [ ] Get notification statistics
- [ ] Pagination works correctly
- [ ] Filtering by type works
- [ ] Filtering by status works
- [ ] Only authenticated users can access
- [ ] Users can only see their own notifications
- [ ] Notifications are created in real-time
- [ ] Performance is acceptable with many notifications

---

## Questions or Issues?

If you need clarification on any endpoint or need additional functionality, please reach out to the frontend team.
