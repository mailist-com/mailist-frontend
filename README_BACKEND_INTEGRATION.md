# Backend Integration Guide - Mailist Frontend

## 🎯 Przegląd

Ten projekt to frontend aplikacji Mailist - platformy email marketingu zbudowanej w Angular 20. Został dostosowany do pracy z REST API backendu.

## 📁 Struktura Integracji

```
mailist-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── api/
│   │   │   │   └── api.service.ts          # Główny serwis API
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts     # Interceptor autentykacji
│   │   │   │   └── loading.interceptor.ts  # Interceptor ładowania
│   │   │   ├── models/
│   │   │   │   └── api-response.model.ts   # Modele odpowiedzi API
│   │   │   └── services/
│   │   │       └── loading.service.ts      # Serwis globalnego loading
│   │   └── services/
│   │       ├── auth.service.ts             # Serwis autentykacji (zaktualizowany)
│   │       ├── contact.service.ts          # Serwis kontaktów (zaktualizowany)
│   │       ├── campaign.service.ts         # Serwis kampanii
│   │       ├── template.service.ts         # Serwis szablonów
│   │       └── ...                         # Pozostałe serwisy
│   └── environments/
│       ├── environment.ts                  # Konfiguracja produkcyjna
│       └── environment.development.ts      # Konfiguracja developerska
├── API_DOCUMENTATION.md                    # 📄 Pełna dokumentacja API
├── BACKEND_MODELS.ts                       # 📋 Modele TypeScript dla backendu
└── README_BACKEND_INTEGRATION.md           # Ten plik

```

## 🚀 Quick Start

### 1. Konfiguracja Środowiska

Edytuj pliki środowiskowe:

**Development** (`src/environments/environment.development.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',  // 👈 Twój backend URL
  features: {
    enableMockData: true,  // true = używa mock data, false = używa API
  }
};
```

**Production** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.mailist.com/api/v1',  // 👈 Produkcyjny backend URL
  features: {
    enableMockData: false,  // Zawsze false w produkcji
  }
};
```

### 2. Przełączanie Między Mock Data a API

Frontend automatycznie przełącza się między mock data a prawdziwym API na podstawie flagi `environment.features.enableMockData`:

- `enableMockData: true` - Używa lokalnych mock data (dobre do developmentu frontendu bez backendu)
- `enableMockData: false` - Wysyła prawdziwe żądania HTTP do API

**Przykład z serwisu:**
```typescript
getContacts(): Observable<Contact[]> {
  // Jeśli mock data jest włączone, zwraca mock data
  if (environment.features.enableMockData) {
    return of(this.mockContacts).pipe(delay(500));
  }

  // Jeśli mock data jest wyłączone, wywołuje API
  return this.api.get<ApiResponse<Contact[]>>('contacts')
    .pipe(map(response => response.data));
}
```

### 3. Instalacja i Uruchomienie

```bash
# Instalacja zależności
npm install

# Development (z mock data)
npm start

# Development (z prawdziwym API)
# 1. Zmień environment.development.ts: enableMockData = false
# 2. Uruchom backend na http://localhost:3000
npm start

# Build produkcyjny
npm run build
```

## 🔐 Autentykacja

### Przepływ Autentykacji

1. **Login** - `POST /auth/login`
   - Frontend wysyła credentials
   - Backend zwraca `{ user, token, refreshToken }`
   - Token zapisywany w localStorage/sessionStorage
   - Token dodawany do wszystkich żądań przez `authInterceptor`

2. **Automatyczne Dodawanie Tokena**
   ```typescript
   // authInterceptor automatycznie dodaje token do każdego żądania
   Authorization: Bearer {token}
   ```

3. **Refresh Token**
   - Gdy token wygasa (401), frontend automatycznie wywołuje `/auth/refresh-token`

4. **Logout**
   - Czyści tokeny z storage
   - Przekierowuje na `/auth/login`

### Testowe Konta (Mock Data)

Gdy `enableMockData: true`:
```
Admin:
- Email: admin@example.com
- Password: password

User:
- Email: user@example.com
- Password: password
```

## 📡 Korzystanie z API Service

### Podstawowe Użycie

```typescript
import { ApiService } from './core/api/api.service';

constructor(private api: ApiService) {}

// GET request
this.api.get<ApiResponse<Contact[]>>('contacts')
  .subscribe(response => {
    console.log(response.data);
  });

// POST request
this.api.post<ApiResponse<Contact>>('contacts', newContact)
  .subscribe(response => {
    console.log('Created:', response.data);
  });

// PUT request
this.api.put<ApiResponse<Contact>>(`contacts/${id}`, updates)
  .subscribe(response => {
    console.log('Updated:', response.data);
  });

// DELETE request
this.api.delete<ApiResponse<void>>(`contacts/${id}`)
  .subscribe(() => {
    console.log('Deleted');
  });
```

### Paginacja

```typescript
// Automatyczna paginacja
this.api.getPaginated<Contact>('contacts', page, pageSize, { search: 'jan' })
  .subscribe(response => {
    console.log(response.data); // Array of contacts
    console.log(response.pagination); // Pagination metadata
  });
```

### Upload Plików

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('type', 'avatar');

this.api.upload<ApiResponse<File>>('files/upload', formData)
  .subscribe(response => {
    console.log('Uploaded:', response.data.url);
  });
```

### Download Plików

```typescript
this.api.download('files/{id}', 'filename.pdf')
  .subscribe(blob => {
    // Obsługa pobranego pliku
  });
```

## 🔄 Interceptory

### Auth Interceptor

Automatycznie:
- Dodaje token JWT do każdego żądania
- Dodaje header `X-API-Version: v1`
- Obsługuje błędy 401 (Unauthorized)
- Przekierowuje na login przy wylogowaniu

### Loading Interceptor

Automatycznie:
- Pokazuje globalny loading indicator
- Śledzi liczbę aktywnych żądań
- Ukrywa loading gdy wszystkie żądania się zakończą

## 📊 Format Odpowiedzi

### Standardowa Odpowiedź

```typescript
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful",
  "timestamp": "2024-11-05T10:00:00Z"
}
```

### Paginowana Odpowiedź

```typescript
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 25,
    "total": 150,
    "totalPages": 6,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Odpowiedź Błędu

```typescript
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password too short"]
  },
  "timestamp": "2024-11-05T10:00:00Z"
}
```

## 🛠️ Implementacja Własnego Serwisu

### Szablon Serwisu

```typescript
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService, ApiResponse } from '../core/api/api.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MyService {
  constructor(private api: ApiService) {}

  getItems(): Observable<Item[]> {
    // Mock data dla developmentu
    if (environment.features.enableMockData) {
      return of(this.mockItems);
    }

    // Prawdziwe API
    return this.api.get<ApiResponse<Item[]>>('items')
      .pipe(map(response => response.data));
  }

  createItem(item: Partial<Item>): Observable<Item> {
    // Mock data
    if (environment.features.enableMockData) {
      const newItem = { ...item, id: generateId() };
      this.mockItems.push(newItem);
      return of(newItem);
    }

    // Prawdziwe API
    return this.api.post<ApiResponse<Item>>('items', item)
      .pipe(map(response => response.data));
  }

  private mockItems: Item[] = [
    // ... mock data
  ];
}
```

## 🔍 Obsługa Błędów

### W Serwisie

```typescript
getContact(id: string): Observable<Contact> {
  return this.api.get<ApiResponse<Contact>>(`contacts/${id}`)
    .pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load contact:', error);
        return throwError(() => error);
      })
    );
}
```

### W Komponencie

```typescript
loadContact(id: string) {
  this.contactService.getContact(id).subscribe({
    next: (contact) => {
      this.contact = contact;
    },
    error: (error) => {
      // error.message zawiera user-friendly wiadomość
      this.errorMessage = error.message;
      console.error('Error:', error);
    }
  });
}
```

## 📝 Checklist dla Backend Developera

### Minimalne Wymagania

- [ ] **Autentykacja**
  - [ ] `POST /auth/login` - zwraca token i user
  - [ ] `POST /auth/register` - rejestracja nowego użytkownika
  - [ ] `POST /auth/logout` - wylogowanie
  - [ ] `POST /auth/refresh-token` - odświeżenie tokena

- [ ] **Contacts**
  - [ ] `GET /contacts` - lista kontaktów (z filtrowaniem i paginacją)
  - [ ] `GET /contacts/{id}` - pojedynczy kontakt
  - [ ] `POST /contacts` - utworzenie kontaktu
  - [ ] `PUT /contacts/{id}` - aktualizacja kontaktu
  - [ ] `DELETE /contacts/{id}` - usunięcie kontaktu

- [ ] **Campaigns**
  - [ ] `GET /campaigns` - lista kampanii
  - [ ] `POST /campaigns` - utworzenie kampanii
  - [ ] `POST /campaigns/{id}/send` - wysłanie kampanii

- [ ] **Lists**
  - [ ] `GET /lists` - lista wszystkich list
  - [ ] `POST /lists` - utworzenie listy
  - [ ] `POST /lists/{id}/subscribe` - subskrypcja kontaktu

### Format Odpowiedzi

Wszystkie endpointy muszą zwracać:
```json
{
  "success": true,
  "data": { },
  "message": "optional message"
}
```

### Wymagane Nagłówki

Backend musi akceptować:
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
X-API-Version: v1
```

### CORS

Backend musi mieć skonfigurowane CORS dla:
- Development: `http://localhost:4200`
- Production: `https://yourdomain.com`

### Kody HTTP

- `200` - Sukces
- `201` - Utworzono zasób
- `400` - Błędne żądanie
- `401` - Brak autoryzacji
- `403` - Brak uprawnień
- `404` - Nie znaleziono
- `422` - Błąd walidacji
- `500` - Błąd serwera

## 📚 Dokumentacja

Pełna dokumentacja dostępna w:

1. **API_DOCUMENTATION.md** - Kompletna dokumentacja wszystkich endpointów API
2. **BACKEND_MODELS.ts** - Modele TypeScript do użycia jako referencja

## 🧪 Testowanie

### Testowanie z Mock Data

```bash
# Upewnij się, że enableMockData: true
npm start

# Frontend działa bez backendu używając mock data
```

### Testowanie z Prawdziwym API

```bash
# 1. Uruchom backend
cd backend && npm start  # lub python manage.py runserver

# 2. Zmień environment.development.ts
enableMockData: false

# 3. Uruchom frontend
npm start
```

### Testowanie Autentykacji

```bash
# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Test z tokenem
curl http://localhost:3000/api/v1/contacts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Troubleshooting

### Problem: "CORS error"

**Rozwiązanie:** Skonfiguruj CORS na backendzie:
```javascript
// Node.js/Express
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
```

### Problem: "401 Unauthorized"

**Sprawdź:**
1. Czy token jest zapisany w localStorage?
2. Czy backend waliduje token poprawnie?
3. Czy nagłówek Authorization jest dodawany?

### Problem: "API nie odpowiada"

**Sprawdź:**
1. Czy backend działa na poprawnym porcie?
2. Czy `apiUrl` w environment jest poprawne?
3. Czy firewall nie blokuje połączenia?

### Problem: "Timeout errors"

**Rozwiązanie:** Zwiększ timeout w environment:
```typescript
timeout: 60000, // 60 sekund
```

## 💡 Best Practices

### 1. Zawsze używaj ApiService

❌ **Źle:**
```typescript
this.http.get('http://localhost:3000/api/v1/contacts')
```

✅ **Dobrze:**
```typescript
this.api.get<ApiResponse<Contact[]>>('contacts')
```

### 2. Obsługuj Błędy

✅ **Dobrze:**
```typescript
this.contactService.getContacts().subscribe({
  next: (contacts) => this.contacts = contacts,
  error: (error) => this.handleError(error)
});
```

### 3. Używaj Typów TypeScript

✅ **Dobrze:**
```typescript
this.api.get<ApiResponse<Contact[]>>('contacts')
  .pipe(map(response => response.data));
```

### 4. Cachuj Dane Gdy Możliwe

```typescript
private contactsCache$ = new BehaviorSubject<Contact[]>([]);

getContacts(): Observable<Contact[]> {
  if (this.contactsCache$.value.length > 0) {
    return this.contactsCache$.asObservable();
  }

  return this.api.get<ApiResponse<Contact[]>>('contacts')
    .pipe(
      map(response => response.data),
      tap(contacts => this.contactsCache$.next(contacts))
    );
}
```

## 📞 Kontakt i Wsparcie

Jeśli masz pytania dotyczące integracji:

1. Sprawdź **API_DOCUMENTATION.md** - pełna dokumentacja endpointów
2. Zobacz **BACKEND_MODELS.ts** - przykłady modeli danych
3. Przejrzyj kod w `src/app/core/api/` - implementacja API service
4. Sprawdź przykłady w `src/app/services/` - zaktualizowane serwisy

---

**Powodzenia z integracją! 🚀**
