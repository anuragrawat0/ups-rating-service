# UPS Rating API (Assignment)

This repository contains a small **Node.js + TypeScript** service wrapper around the **UPS Rating (Shop)** API.

It demonstrates:

- Mapping a domain-level rate request into the UPS payload.
- OAuth client-credentials authentication with in-memory token caching.
- Calling the UPS Rating endpoint and normalizing the response into internal types.
- Structured error handling.
- Integration tests using a **stubbed HTTP layer** (Axios mocked), so tests run without a live UPS account.

Entry point: [`src/index.ts`](src/index.ts:1)

## Design / architecture

### Key modules

- **Domain models + validation** live in [`src/courier/common/types.ts`](src/courier/common/types.ts:1) and are validated using Zod inside [`UPSRatingService.getRates()`](src/courier/ups/rating-service.ts:16).
- The courier boundary is expressed as an interface in [`src/courier/common/interface.ts`](src/courier/common/interface.ts:1), implemented by [`UPSRatingService`](src/courier/ups/rating-service.ts:9).
- UPS-specific HTTP concerns are isolated in [`UPSClient.getRates()`](src/courier/ups/http-client.ts:21).
- Mapping between domain and UPS payloads/responses is centralized in [`UPSMapper`](src/courier/ups/converter.ts:1).
- OAuth token acquisition + caching is encapsulated in [`OAuthClient.getAccessToken()`](src/auth/oauth-client.ts:15).
- All external-facing failures are normalized into a structured [`CarrierError`](src/errors/error.ts:1).

### Request → response flow

1. `src/index.ts` builds a `RateRequest` and calls [`UPSRatingService.getRates()`](src/courier/ups/rating-service.ts:16).
2. The request is validated (Zod) in [`src/courier/ups/rating-service.ts`](src/courier/ups/rating-service.ts:1).
3. The domain request is converted into a UPS payload via [`UPSMapper.mapRateRequest()`](src/courier/ups/converter.ts:1).
4. [`UPSClient.getRates()`](src/courier/ups/http-client.ts:21) obtains/uses a bearer token from [`OAuthClient.getAccessToken()`](src/auth/oauth-client.ts:15) and POSTs to the UPS Rating endpoint.
5. UPS response is normalized back into internal `RateQuota[]` via [`UPSMapper.mapRateResponse()`](src/courier/ups/converter.ts:1).

### Design decisions (why this shape)

- **Separation of concerns**
  - Mapping logic is isolated (easy to unit-test independently, and easy to update when UPS payloads change).
  - HTTP + auth are in one place (keeps `UPSRatingService` focused on orchestration + domain invariants).
- **Schema validation**
  - Input is validated early (failing fast) in [`UPSRatingService.getRates()`](src/courier/ups/rating-service.ts:16).
- **Typed, structured errors**
  - The code throws [`CarrierError`](src/errors/error.ts:1) with `statusCode`, `type`, and `details` so callers can handle failures consistently.
- **Token caching**
  - [`OAuthClient`](src/auth/oauth-client.ts:4) caches tokens in-memory until close to expiry to reduce auth calls.

## Running the project

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

Then set values in `.env` using the keys shown in [`.env.example`](.env.example:1).

### Run (dev)

```bash
npm run dev
```

This executes [`src/index.ts`](src/index.ts:1) via the `tsx` runner from [`package.json`](package.json:9).

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

The integration suite in [`src/testing/integration/ups-rating.test.ts`](src/testing/integration/ups-rating.test.ts:1) stubs Axios and verifies:

- Payload is built correctly (asserting what gets passed to Axios).
- Responses are parsed/normalized into internal types.
- Token reuse behavior (cached token).
- Error normalization for 401/500, validation failures, and timeouts.

Fixtures are defined in [`src/testing/response/ups-response.ts`](src/testing/response/ups-response.ts:1).

## What I would improve with more time

- **Auth refresh / retry on 401**
  - Implement “rating call returns 401 → refresh token → retry once” behavior in [`UPSClient.getRates()`](src/courier/ups/http-client.ts:21) and add explicit tests for it.
- **Response validation**
  - Add Zod schemas for UPS responses and fail with a clear [`CarrierError`](src/errors/error.ts:1) when UPS returns malformed/unexpected JSON.
- **More realistic fixtures from UPS docs**
  - Align error fixtures (codes/messages) with documented codes (see [`error.md`](error.md:1)) and store fixtures as JSON files under a dedicated fixtures directory.
- **Better token cache correctness**
  - Handle concurrent token requests (single-flight) in [`OAuthClient.getAccessToken()`](src/auth/oauth-client.ts:15) to prevent a thundering herd when multiple requests start at once.
- **Operational hardening**
  - Retry/backoff for transient 5xx/429 responses, request correlation IDs, and structured logging around external calls.
- **Packaging as a library**
  - Expose a stable public API and keep the runnable demo (`src/index.ts`) as an example script.

## Additional docs

- Assignment/how-to-run notes within `src/`: [`src/README.md`](src/README.md:1)
