# E-Commerce Product Catalog API

REST API for managing e-commerce products and categories, built with Node.js, Express 5, MongoDB Atlas and Mongoose.

## Features

- Full CRUD operations for Products and Categories
- One-to-many relationship: Category → Products
- Mongoose ObjectId references between products and categories
- Category details included in product responses using `.populate()`
- Pagination using `page` and `limit`
- Product filtering by category and price range
- Schema validation for required fields and valid product prices
- Unique category names
- Centralized error handling for validation, invalid IDs and duplicate values
- Referential integrity checks to prevent deleting categories that still have products
- Environment-based configuration with `.env`

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

Start the development server:

```bash
npm run dev
```

Or start the server using:

```bash
npm start
```

Server runs on `http://localhost:5000`.

**Note:** The application uses the `ecommercedb` database on MongoDB Atlas. Ensure your connection string and Atlas network access settings are configured correctly. Never commit your `.env` file.

## Endpoints

| Resource | Endpoints |
|---|---|
| Categories | `GET/POST /api/categories`, `GET/PUT/DELETE /api/categories/:id` |
| Products | `GET/POST /api/products`, `GET/PUT/DELETE /api/products/:id` |

## Query parameters

- **All products:** `page`, `limit`
- **Category filtering:** `category` — filter by category ID
- **Price filtering:** `minPrice`, `maxPrice`

### Examples

```http
GET /api/products?page=1&limit=2
GET /api/products?minPrice=50&maxPrice=200
GET /api/products?category=CATEGORY_ID
GET /api/products?page=2&limit=2&minPrice=50&maxPrice=200
```

Pagination returns metadata including `page`, `limit`, `total`, `totalPages` and `count`, along with the product data. The maximum page size is 100.

## Data relationships

- Each category can have multiple products.
- Each product references a category using its MongoDB ObjectId.
- `.populate("category")` returns category details with the product.
- A category cannot be deleted while products still reference it.

## Business rules

- Category names must be unique.
- Required fields are validated through Mongoose schemas.
- Product prices cannot be negative.
- Update operations use `runValidators: true`.
- Products cannot reference a category that does not exist.
- Deleting a category that is still referenced by products is blocked.
- Duplicate category names return `400 Bad Request`.
- Invalid MongoDB IDs return `400 Bad Request`.

## Error handling

A centralized error handler processes:

- Validation errors
- Invalid MongoDB ObjectIds
- Duplicate key errors
- Missing routes (`404 Not Found`)
- Unexpected server errors (`500 Internal Server Error`)

Example error response:

```json
{
  "message": "Price cannot be negative"
}
```

## Testing

Tested using Postman and browser-based GET requests:

- Create and retrieve categories
- Create and retrieve products
- Verify populated category details
- Test pagination across multiple pages
- Filter products by category and price range
- Update products and verify validation
- Test duplicate categories and invalid IDs
- Verify that referenced categories cannot be deleted
- Delete products and then delete their categories

## Technologies

- Node.js
- Express 5
- MongoDB Atlas
- Mongoose
- dotenv
- Postman

## Project structure

`config/ controllers/ middleware/ models/ routes/ server.js`

## Documentation

This project demonstrates building a database-backed e-commerce catalog API with related resources, validated CRUD operations, pagination, filtering and centralized error handling.
