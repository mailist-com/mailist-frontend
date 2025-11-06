# Raport: Analiza zgodności Frontend-Backend dla widoku Integrations

**Data analizy:** 2025-11-06
**Analizowany moduł:** Integration/API Keys
**Status:** ⚠️ Frontend wymaga aktualizacji przed pełną integracją z backendem

---

## 🔴 **KRYTYCZNE NIEZGODNOŚCI**

### 1. **Model ApiKey - Brakujące pola**
**Lokalizacja:** `src/app/models/api-key.model.ts:1-11`

**Backend zwraca:**
- `description` - opis klucza API (BRAK na frontendzie)
- `prefix` - prefix klucza (np. "ml_live_") (BRAK na frontendzie)
- `lastUsedIpAddress` - IP ostatniego użycia (BRAK na frontendzie)
- `updatedAt` - data ostatniej aktualizacji (BRAK na frontendzie)
- `totalCalls` - liczba wywołań (Frontend używa `requestCount`)

**Rekomendacja:** Zaktualizować interfejs `ApiKey`:
```typescript
export interface ApiKey {
  id: string;
  name: string;
  description?: string;        // ⬅️ DODAĆ
  key: string;
  prefix?: string;             // ⬅️ DODAĆ
  status: ApiKeyStatus;
  permissions: ApiKeyPermission[];
  lastUsedAt?: Date;
  lastUsedIpAddress?: string;  // ⬅️ DODAĆ
  totalCalls: number;          // ⬅️ ZMIENIĆ z requestCount
  createdAt: Date;
  updatedAt?: Date;            // ⬅️ DODAĆ
  expiresAt?: Date;
}
```

---

### 2. **Status Values - Różnice w formatowaniu**
**Lokalizacja:** `src/app/models/api-key.model.ts:13`

**Backend używa:** `"ACTIVE"` (uppercase)
**Frontend używa:** `"active"` (lowercase)

Ponadto:
- Backend: `"ACTIVE"` / `"REVOKED"`
- Frontend: `"active"` / `"inactive"` / `"expired"`

**Rekomendacja:**
- Dostosować wartości statusu do backendu
- Zamapować `REVOKED` na `inactive` w UI

```typescript
export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
```

---

### 3. **Permissions - Brakujące uprawnienia**
**Lokalizacja:** `src/app/models/api-key.model.ts:15-24`

**Backend obsługuje dodatkowo:**
- `campaigns.send` - wysyłanie kampanii (BRAK)
- `*` - pełny dostęp admin (BRAK)

**Rekomendacja:** Dodać brakujące uprawnienia:
```typescript
export type ApiKeyPermission =
  | 'contacts.read'
  | 'contacts.write'
  | 'contacts.delete'
  | 'lists.read'
  | 'lists.write'
  | 'campaigns.read'
  | 'campaigns.write'
  | 'campaigns.send'      // ⬅️ DODAĆ
  | 'automation.read'
  | 'automation.write'
  | '*';                  // ⬅️ DODAĆ (full access)
```

---

### 4. **CreateApiKeyDTO - Brak pola description**
**Lokalizacja:** `src/app/models/api-key.model.ts:45-49`

Backend akceptuje:
```json
{
  "name": "...",
  "description": "...",  // ⬅️ BRAK na frontendzie
  "permissions": [...],
  "expiresAt": "..."
}
```

**Rekomendacja:** Dodać pole `description`:
```typescript
export interface CreateApiKeyDTO {
  name: string;
  description?: string;  // ⬅️ DODAĆ
  permissions: ApiKeyPermission[];
  expiresAt?: Date;
}
```

---

### 5. **Response przy tworzeniu klucza - Brak obsługi plainKey**

Backend zwraca specjalną strukturę przy tworzeniu klucza:
```json
{
  "success": true,
  "data": {
    "apiKey": { /* obiekt klucza */ },
    "plainKey": "ml_live_AbCdEfGhIjKlMnOpQrStUvWxYz123456789",
    "message": "API key created successfully. Save it now, it won't be shown again!"
  },
  "message": "API key created successfully"
}
```

**Problem:** Frontend oczekuje zwykłego obiektu `ApiKey`, a nie zagnieżdżonej struktury z `plainKey`.

**Rekomendacja:**
- Utworzyć interfejs dla odpowiedzi tworzenia klucza
- Obsłużyć `plainKey` w serwisie
- Wyświetlać `plainKey` zamiast `key` w modalu

```typescript
export interface CreateApiKeyResponse {
  apiKey: ApiKey;
  plainKey: string;
  message: string;
}
```

---

## 🟡 **ŚREDNIEJ WAGI NIEZGODNOŚCI**

### 6. **ApiKeyActivity - Brakujące pola**
**Lokalizacja:** `src/app/models/api-key.model.ts:34-43`

Backend zwraca dodatkowo:
- `responseTime` - czas odpowiedzi w ms (BRAK)
- `userAgent` - user agent (BRAK)
- `errorMessage` - komunikat błędu jeśli wystąpił (BRAK)

**Rekomendacja:** Rozszerzyć interfejs:
```typescript
export interface ApiKeyActivity {
  id: string;
  apiKeyId: string;
  apiKeyName: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime?: number;    // ⬅️ DODAĆ
  userAgent?: string;       // ⬅️ DODAĆ
  errorMessage?: string;    // ⬅️ DODAĆ
  timestamp: Date;
  ipAddress: string;
}
```

---

### 7. **Paginacja Activities - Nie jest obsługiwana**
**Lokalizacja:** `src/app/services/api-key.service.ts:134-139`

Backend endpoint:
```
GET /api/v1/api-keys/{id}/activities?page=0&pageSize=50
```

Zwraca:
```json
{
  "activities": [...],
  "pagination": {
    "page": 0,
    "pageSize": 50,
    "total": 1543,
    "totalPages": 31,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

**Problem:** Frontend nie obsługuje paginacji dla aktywności.

**Rekomendacja:** Dodać parametry paginacji do metody `getApiKeyActivities`:
```typescript
getApiKeyActivities(
  apiKeyId: string,
  page = 0,
  pageSize = 50
): Observable<PaginatedResponse<ApiKeyActivity>>
```

---

### 8. **Statistics - Różna struktura**
**Lokalizacja:** `src/app/models/api-key.model.ts:26-32`

**Backend zwraca:**
```json
{
  "totalKeys": 3,
  "activeKeys": 2,
  "totalCalls": 15432,
  "topEndpoints": {           // ⬅️ BRAK na frontendzie
    "/api/v1/contacts": 8543,
    "/api/v1/campaigns": 3214,
    "/api/v1/lists": 2187
  }
}
```

**Frontend ma:**
```typescript
{
  totalKeys: number;
  activeKeys: number;
  inactiveKeys: number;       // ⬅️ BRAK na backendzie
  totalRequests: number;      // Backend: totalCalls
  recentActivity: ApiKeyActivity[];  // ⬅️ BRAK na backendzie
}
```

**Rekomendacja:** Dostosować do backendu:
```typescript
export interface ApiKeyStatistics {
  totalKeys: number;
  activeKeys: number;
  totalCalls: number;         // zmienić z totalRequests
  topEndpoints: Record<string, number>;  // dodać
}
```

**Nota:** `recentActivity` można pobierać osobno przez endpoint activities.

---

## 🟢 **ENDPOINT DIFFERENCES**

### 9. **Revoke vs Delete**
**Lokalizacja:** `src/app/services/api-key.service.ts:90-100`

**Backend ma dwa osobne endpointy:**
- `DELETE /api/v1/api-keys/{id}` - usuwa klucz
- `POST /api/v1/api-keys/{id}/revoke` - odwołuje klucz (zmienia status na REVOKED)

**Frontend:** używa tylko `revokeApiKey` i usuwa klucz z listy (symulacja DELETE).

**Rekomendacja:**
- Implementować oba endpointy oddzielnie
- `revokeApiKey` powinno zmienić status na REVOKED (nie usuwać)
- Dodać osobną metodę `deleteApiKey` do trwałego usunięcia

---

### 10. **Endpoint /permissions - Nie jest używany**

Backend oferuje:
```
GET /api/v1/api-keys/permissions
```

Zwraca listę dostępnych uprawnień z opisami:
```json
{
  "success": true,
  "data": [
    {
      "permission": "contacts.read",
      "description": "Read contacts"
    },
    ...
  ]
}
```

**Frontend:** Ma hardcoded listę uprawnień w komponencie (src/app/views/integrations/integrations/integrations.ts:41-51).

**Rekomendacja:** Pobierać uprawnienia dynamicznie z backendu:
```typescript
getAvailablePermissions(): Observable<PermissionInfo[]> {
  return this.api.get<ApiResponse<PermissionInfo[]>>('api-keys/permissions')
    .pipe(map(response => response.data));
}

interface PermissionInfo {
  permission: ApiKeyPermission;
  description: string;
}
```

---

## 📋 **CHECKLIST - Co należy zaktualizować**

### Modele (`src/app/models/api-key.model.ts`)
- [ ] Dodać brakujące pola do `ApiKey` (description, prefix, lastUsedIpAddress, updatedAt)
- [ ] Zmienić `requestCount` na `totalCalls`
- [ ] Zmienić status values na uppercase (ACTIVE, REVOKED, EXPIRED)
- [ ] Dodać brakujące permissions (campaigns.send, *)
- [ ] Dodać `description` do `CreateApiKeyDTO`
- [ ] Utworzyć interfejs `CreateApiKeyResponse` z `plainKey`
- [ ] Rozszerzyć `ApiKeyActivity` o responseTime, userAgent, errorMessage
- [ ] Zaktualizować `ApiKeyStatistics` (topEndpoints zamiast recentActivity)
- [ ] Dodać interfejs `PermissionInfo`

### Serwis (`src/app/services/api-key.service.ts`)
- [ ] Zaktualizować `createApiKey` do obsługi `CreateApiKeyResponse`
- [ ] Rozdzielić `revokeApiKey` (zmiana statusu) i `deleteApiKey` (usunięcie)
- [ ] Dodać paginację do `getApiKeyActivities`
- [ ] Dodać metodę `getAvailablePermissions()`
- [ ] Zaktualizować mock data do nowych pól
- [ ] Zmienić wartości statusów na uppercase w mock data

### Komponent (`src/app/views/integrations/integrations/integrations.ts`)
- [ ] Dodać pole `description` do formularza tworzenia klucza
- [ ] Obsłużyć `plainKey` z odpowiedzi tworzenia
- [ ] Zaktualizować listę dostępnych uprawnień (campaigns.send, *)
- [ ] Pobierać uprawnienia dynamicznie z API
- [ ] Dodać paginację dla aktywności
- [ ] Zmienić nazwę `requestCount` na `totalCalls`
- [ ] Rozdzielić akcje "Odwołaj" (revoke) i "Usuń" (delete)
- [ ] Obsłużyć `topEndpoints` w statystykach

### Template (`src/app/views/integrations/integrations/integrations.html`)
- [ ] Dodać pole description w formularzu tworzenia (linia ~605)
- [ ] Wyświetlać `plainKey` zamiast `key` w modalu po utworzeniu
- [ ] Dodać kolumnę z `lastUsedIpAddress` w tabeli (opcjonalne)
- [ ] Dodać wyświetlanie `topEndpoints` w sekcji statystyk
- [ ] Dodać osobny przycisk "Usuń" obok "Odwołaj" w dropdown menu
- [ ] Dodać paginację dla tabeli aktywności
- [ ] Zmienić wszystkie odniesienia `requestCount` na `totalCalls`

---

## 🎯 **PRIORYTETY**

### **P0 - Krytyczne (muszą być poprawione przed integracją)**
1. ✅ Dostosować model `ApiKey` do backendu (pola i nazwy)
2. ✅ Zmienić status values na uppercase (ACTIVE/REVOKED/EXPIRED)
3. ✅ Obsłużyć `plainKey` w response przy tworzeniu klucza
4. ✅ Rozdzielić endpointy revoke i delete
5. ✅ Zmienić `requestCount` na `totalCalls` wszędzie

### **P1 - Ważne (powinny być poprawione)**
1. ⚠️ Dodać pole `description` do formularza tworzenia klucza
2. ⚠️ Dodać brakujące permissions (campaigns.send, *)
3. ⚠️ Zaktualizować strukturę `ApiKeyStatistics`
4. ⚠️ Dodać paginację dla activities

### **P2 - Nice to have**
1. 💡 Pobierać permissions dynamicznie z API
2. 💡 Wyświetlać `topEndpoints` w UI
3. 💡 Wyświetlać dodatkowe pola activities (responseTime, userAgent)
4. 💡 Dodać kolumnę lastUsedIpAddress w tabeli

---

## 🔍 **SZCZEGÓŁY TECHNICZNE**

### Prefix generowania klucza

Backend generuje klucze z prefiksem `ml_live_` lub `ml_test_`:
```
ml_live_AbCdEfGhIjKlMnOpQrStUvWxYz123456789
```

Frontend generuje klucze z prefiksem `mlst_`:
```
mlst_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Rekomendacja:** Nie generować kluczy na frontendzie - backend to robi. Frontend tylko wyświetla otrzymany `plainKey`.

### Format dat

Backend zwraca daty w formacie ISO 8601:
```
"2024-11-06T10:30:00Z"
```

Frontend używa obiektów `Date` w TypeScript - automatyczna konwersja powinna działać, ale należy upewnić się, że interceptor poprawnie parsuje daty.

### Nagłówki HTTP

Backend oczekuje:
```
Authorization: Bearer {jwt_token}
```

Dla użycia API Key (nie w panelu admin):
```
X-API-Key: ml_live_YourApiKeyHere
```

Frontend używa JWT tokens dla autentykacji w panelu admina - to jest poprawne.

---

## ✅ **PODSUMOWANIE**

**Status:** ⚠️ Frontend **NIE JEST** w pełni dostosowany do backendu.

Wymaga aktualizacji w następujących obszarach:

1. ✅ **Modele danych** - brakuje kilku pól, różne nazwy
2. ✅ **Status values** - lowercase vs uppercase
3. ✅ **Response structure** - szczególnie przy tworzeniu klucza
4. ✅ **Endpointy** - brak rozróżnienia revoke/delete
5. ⚠️ **Paginacja** - nie jest obsługiwana dla activities
6. ⚠️ **Permissions** - brakuje niektórych uprawnień
7. ⚠️ **Statistics** - różna struktura

**Rekomendacja:** Zalecam przeprowadzenie aktualizacji frontendu według powyższej checklisty, zaczynając od elementów o priorytecie P0.

**Szacowany czas pracy:**
- P0 (Krytyczne): ~4-6 godzin
- P1 (Ważne): ~3-4 godziny
- P2 (Nice to have): ~2-3 godziny

**Razem:** ~9-13 godzin pracy developerskiej

---

**Autor raportu:** Claude Code
**Data:** 2025-11-06
**Wersja:** 1.0
