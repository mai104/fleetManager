# Fleet Manager Application

A full-stack web application for managing vehicle movement and maintenance, built with React, Node.js/Express, and MongoDB.

## Features

- **Authentication & User Management**: 
  - User login/signup
  - Role-based permissions
  - Admin user management

- **Vehicle Movement Tracking**:
  - Record vehicle trips with detailed information
  - Auto-filling vehicle information
  - Odometer and fuel cost tracking

- **Vehicle Management**:
  - Comprehensive vehicle information
  - Maintenance history tracking
  - Document expiry tracking

- **Oil Change Alerts**:
  - Automatic alerts for vehicles needing oil change

- **Reports**:
  - Export to Excel
  - Movement reports with filters
  - Maintenance history reports
  - Fleet status reports

## Tech Stack

- **Frontend**: React, Formik, React-Select, React-DatePicker, Axios
- **Backend**: Node.js, Express, MongoDB/Mongoose
- **Authentication**: JWT
- **Reporting**: ExcelJS

## Project Structure

```
fleetManager/
├── client/               # React frontend
│   ├── public/           # Static files
│   └── src/              # React source code
│       ├── components/   # Reusable components
│       ├── context/      # React context
│       ├── pages/        # Page components
│       └── utils/        # Utility functions
└── server/               # Node.js backend
    ├── controllers/      # Route controllers
    ├── middleware/       # Express middleware
    ├── models/           # Mongoose models
    └── routes/           # Express routes
```

## Setup & Installation

### Prerequisites

- Node.js (v14+)
- MongoDB

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/fleetManager.git
   cd fleetManager
   ```

2. Install server dependencies
   ```
   cd server
   npm install
   ```

3. Install client dependencies
   ```
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/fleetManager
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

### Running the Application

1. Start MongoDB (if not already running)

2. Start the server
   ```
   cd server
   npm start
   ```

3. Start the client (in a new terminal)
   ```
   cd client
   npm start
   ```

4. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## First-time Setup

1. Register a new user (will automatically become admin)
2. Use the admin account to manage additional users
3. Add initial data:
   - Vehicles
   - Drivers
   - Supervisors
   - Departments
   - Routes
   - Clients

## Usage

### Vehicle Movement Entry

1. Navigate to "Vehicle Movements" and click "Add New Movement"
2. Fill in the form, selecting vehicle and other details
3. Vehicle information will auto-fill
4. Submit the form to record the movement

### Vehicle Maintenance

1. Navigate to "Vehicles" and select a vehicle
2. Go to the "Maintenance History" section
3. Add new maintenance records
4. Track oil changes and other maintenance activities

### Reports

1. Navigate to "Reports"
2. Choose the type of report to generate
3. Apply any filters
4. Export to Excel

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
