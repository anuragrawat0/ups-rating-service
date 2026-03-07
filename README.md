# UPS Rating API (Assignment)

This repo contains a small **Node.js + TypeScript** service wrapper around the **UPS Rating Service** API.

The goal of this project is to show how to:

- Send a shipping rate request to UPS
- Get shipping prices from UPS
- Convert the UPS response into a simpler format
- Handle authentication using OAuth
- Integration tests using a **stubbed HTTP layer** (Axios mocked), so tests run without a live UPS account.

## Design / architecture

### Key modules

- **Domain models + validation** live in [`src/courier/common/types.ts`] and are validated using Zod inside [`UPSRatingService.getRates()`]
- The courier boundary is expressed as an interface in [`src/courier/common/interface.ts`] implemented by [`UPSRatingService`]
- UPS-specific HTTP concerns are isolated in [`UPSClient.getRates()`]
- Mapping between domain and UPS payloads/responses is centralized in [`UPSMapper`]
- OAuth token acquisition + caching is encapsulated in [`OAuthClient.getAccessToken()`]
- All external-facing failures are normalized into a structured [`CarrierError`]

### How the Project Works

1. **`src/index.ts`** creates a **rate request** with shipment details.
2. The request is **validated** using the schemas defined in  
   **`src/courier/common/types.ts`** and checked inside  
   **`src/courier/ups/rating-service.ts`**.
3. The request is **converted into the UPS API format** using  
   **`src/courier/ups/converter.ts`**.
4. The app gets an **OAuth access token** from UPS using  
   **`src/auth/oauth-client.ts`**.
5. The request is sent to the **UPS Rating API** through  
   **`src/courier/ups/http-client.ts`**.
6. The UPS response is **converted into a simple rate quote list** using  
   **`src/courier/ups/converter.ts`**, and the result is returned by  
   **`src/courier/ups/rating-service.ts`**.


### Design decisions (why this shape)

- **Separation of concerns**
  - Mapping logic is isolated (easy to unit-test independently, and easy to update when UPS payloads change).
  - HTTP + auth are in one place (keeps `UPSRatingService` focused on orchestration + domain invariants).
- **Schema validation**
  - Input is validated early (failing fast) in [`UPSRatingService.getRates()`]
- **Typed, structured errors**
  - The code throws [`CarrierError`] with `statusCode`, `type`, and `details` so callers can handle failures consistently.
- **Token caching**
  - [`OAuthClient`] caches tokens in-memory until close to expiry to reduce auth calls.

## How to run

### Prerequisites

- Node.js (recommended **18+**)
- npm

### Install

```bash
npm install
```

### Configure environment

Create a local `.env` based on the example:

**Windows (cmd.exe)**

```bat
copy .env.example .env
```

Then set values in `.env` using the keys shown in [`.env.example`]

### Run (dev)

```bash
npm run dev
```

### Build + run

```bash
npm run build
npm start
```

## Tests

Run the integration tests:

```bash
npm test
```

The integration suite in [`src/testing/integration/ups-rating.test.ts`] stubs Axios and verifies:

- Payload is built correctly (asserting what gets passed to Axios).
- Responses are parsed/normalized into internal types.
- Token reuse behavior (cached token).
- Error normalization for 401/500, validation failures, and timeouts.

Fixtures are defined in [`src/testing/response/ups-response.ts`]

## What I would improve with more time

- **Response validation**
  - Add Zod schemas for UPS responses and fail with a clear [`CarrierError`] when UPS returns malformed/unexpected JSON.
- **Better token cache correctness**
  - Handle concurrent token requests (single-flight) in [`OAuthClient.getAccessToken()`] to prevent multiple requests start at once.
- **Structure logging**
  - Retry/backoff for transient 5xx/429 responses, request correlation IDs, and structured logging around external calls.
- **Auth refresh / retry on 401**
  - Implement “rating call returns 401 → refresh token → retry once” behavior in [`UPSClient.getRates()`] and add explicit tests for it. ALso Retry logic could be added in the HTTP client to handle temporary network failures.
- **Instant block request**
  - If the UPS Rating API goes completely offline, retrying will just clog up our system's memory. A circuit breaker would detect the widespread failure and instantly "trip," returning a fast error to the caller without wasting time attempting doomed network calls.
