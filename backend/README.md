# ONE2 - Backend API

Backend API for the ONE2 Point of Sale (PDV) and Services Management System.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB (local or MongoDB Atlas)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm test`: Run tests
- `npm run lint`: Run ESLint

## API Endpoints

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a single order
- `POST /api/orders` - Create a new order
- `PATCH /api/orders/:id` - Update an order
- `DELETE /api/orders/:id` - Delete an order
- `PATCH /api/orders/:id/status` - Update order status

### Stock
- `GET /api/stock` - Get all stock items
- `GET /api/stock/:id` - Get a single stock item
- `POST /api/stock` - Create a new stock item
- `PATCH /api/stock/:id` - Update a stock item
- `DELETE /api/stock/:id` - Delete a stock item
- `PATCH /api/stock/:id/quantity` - Update stock quantity

### Models
- `GET /api/models` - Get all device models
- `GET /api/models/:id` - Get a single device model
- `POST /api/models` - Create a new device model
- `PATCH /api/models/:id` - Update a device model
- `DELETE /api/models/:id` - Deactivate a device model
- `POST /api/models/:id/issues` - Add a common issue to a model
- `DELETE /api/models/:modelId/issues/:issueId` - Remove a common issue from a model

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get a single service
- `POST /api/services` - Create a new service
- `PATCH /api/services/:id` - Update a service
- `DELETE /api/services/:id` - Deactivate a service
- `PATCH /api/services/:id/price` - Update service price
- `PATCH /api/services/:id/toggle-active` - Toggle service active status

### Custom Cases
- `GET /api/custom-cases` - Get all custom cases
- `GET /api/custom-cases/:id` - Get a single custom case
- `POST /api/custom-cases` - Create a new custom case
- `PATCH /api/custom-cases/:id` - Update a custom case
- `DELETE /api/custom-cases/:id` - Delete a custom case
- `PATCH /api/custom-cases/:id/status` - Update custom case status
- `POST /api/custom-cases/:id/upload-design` - Upload design image

## Database Models

### Order
- `customerName`: String (required)
- `phone`: String (required)
- `deviceModel`: String (required)
- `issue`: String (required)
- `serviceType`: String (required)
- `estimatedPrice`: Number (required)
- `status`: String (enum: ['pending', 'in_progress', 'completed', 'delivered'])
- `notes`: String
- `customCase`: ObjectId (ref: 'CustomCase')
- `createdAt`: Date
- `updatedAt`: Date

### StockItem
- `name`: String (required)
- `description`: String
- `quantity`: Number (required, min: 0)
- `price`: Number (required, min: 0)
- `category`: String (enum: ['phone_case', 'screen_protector', 'charger', 'cable', 'adapter', 'other'])
- `sku`: String (auto-generated if not provided)
- `lastUpdated`: Date

### DeviceModel
- `brand`: String (required)
- `model`: String (required)
- `releaseYear`: Number
- `screenSize`: Number
- `isActive`: Boolean (default: true)
- `commonIssues`: Array of { issue: String, averageRepairCost: Number }

### Service
- `name`: String (required)
- `description`: String
- `basePrice`: Number (required, min: 0)
- `estimatedTime`: Number (in minutes, required)
- `category`: String (enum: ['repair', 'maintenance', 'diagnostic', 'customization', 'other'])
- `isActive`: Boolean (default: true)
- `requiresDevice`: Boolean (default: true)

### CustomCase
- `orderId`: ObjectId (ref: 'Order', required)
- `customerName`: String (required)
- `phone`: String (required)
- `deviceModel`: String (required)
- `designDescription`: String (required)
- `designImage`: String (URL, required)
- `status`: String (enum: ['design_pending', 'design_approved', 'in_production', 'ready_for_pickup', 'delivered'])
- `price`: Number (required, min: 0)
- `notes`: String
- `estimatedCompletion`: Date
- `designApprovedAt`: Date
- `completedAt`: Date

## Deployment

### Local Development
1. Make sure MongoDB is running locally or update the `MONGODB_URI` in `.env`
2. Run `npm run dev`
3. The API will be available at `http://localhost:5000`

### Production
1. Set up environment variables in your production environment
2. Install dependencies: `npm install --production`
3. Build the application (if needed)
4. Start the server: `npm start`

## License

This project is licensed under the MIT License.
