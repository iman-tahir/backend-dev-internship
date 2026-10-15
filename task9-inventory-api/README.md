# Multi-Resource Inventory API

REST API for managing suppliers, products and orders, built with Node.js, Express 5 and MongoDB (Mongoose).

## Features
- Full CRUD on Suppliers, Products and Orders
- Relationships: Supplier → Products (one-to-many), Order → Products (items array with price snapshot)
- Pagination, filtering and sorting on all list endpoints
- Atomic stock deduction with rollback, so no overselling
- Referential integrity (409 on unsafe deletes)
- Centralized error handling

## Setup
```bash
npm install
cp .env.example .env    # then fill in MONGO_URI
npm run dev             # development (nodemon)
npm start               # production
```
Server runs on `http://localhost:5001`.

## Endpoints
| Resource | Endpoints |
|---|---|
| Suppliers | `GET/POST /api/suppliers`, `GET/PUT/DELETE /api/suppliers/:id` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` |
| Orders | `GET/POST /api/orders`, `GET/PUT/DELETE /api/orders/:id`, `PATCH /api/orders/:id/status` |

## Query parameters
- **All lists:** `page`, `limit` (max 100), `sort` (e.g. `-price,name`)
- **Suppliers:** `search` (name, email)
- **Products:** `search`, `category`, `supplier`, `minPrice`, `maxPrice`, `inStock=true`
- **Orders:** `status`, `customer`, `product`, `minTotal`, `maxTotal`

## Business rules
- Order `unitPrice` and `total` are calculated by the server from the database.
- Placing an order deducts stock atomically; insufficient stock returns 409 and earlier deductions are rolled back.
- Status flow: `pending → confirmed → shipped → delivered`; `pending` or `confirmed` can be `cancelled` (stock is restored). Invalid moves return 400.
- A supplier with products cannot be deleted (409). A product that appears in orders cannot be deleted (409).
- Duplicate SKU or supplier email returns 409.

## Error format
```json
{ "success": false, "message": "Cannot change status from pending to shipped" }
```

## Documentation
Import `Inventory-API.postman_collection.json` into Postman. Every request has a description and saved example responses.

## Project structure
`config/ controllers/ middleware/ models/ routes/ utils/ server.js`