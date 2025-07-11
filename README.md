# KranHub Server

> **KranHub** is the backend for a managed marketplace of construction cranes.  
> It provides RESTful CRUD APIs for users, cranes, inquiries, and messages,  
> with JWT-based authentication and role-based access control.

---

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JSON Web Tokens (JWT)
- **Env var management:** dotenv
- **Linting / Formatting:** ESLint, Prettier (optional)

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/danielaprimacov/kranhub-server.git
cd kranhub-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a .env file in the project root:

```bash
PORT=5005
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/kranhub
JWT_SECRET=your_super_secret_key
```

- PORT — HTTP port (default 5005)

- MONGODB_URI — your MongoDB connection string

- JWT_SECRET — secret used to sign tokens

### 4. Run the server

```bash
npm start
```

Or, for live-reloading during development:

```bash
npm run dev
```

You should see:

```bash
> KranHub API listening on http://localhost:5005
```

## 🗂️ Project Structure

```bash
src/
├─ config/
│  └─ db.config.js       # MongoDB connection setup
├─ middleware/
│  ├─ jwt.middleware.js  # `isAuthenticated`
│  └─ role.middleware.js # `isAdmin`
├─ models/
│  ├─ User.model.js
│  ├─ Crane.model.js
│  ├─ Inquiry.model.js
│  └─ Message.model.js
├─ routes/
│  ├─ auth.routes.js
│  ├─ users.routes.js
│  ├─ crane.routes.js
│  ├─ inquiry.routes.js
│  └─ message.routes.js
├─ app.js                # Express app setup
└─ server.js             # Launches HTTP server
```

## 🔌 API Endpoints

## 🔒 Security & Access Control

- isAuthenticated middleware protects any route that requires a logged-in user.

- isAdmin middleware further restricts routes to admin-role users.

- On protected routes, the client must send:

```bash
Authorization: Bearer <your_jwt_token>
```

## 📝 Data Models (Mongoose)

```bash
// User.model.js
{
  name: String,
  email: { type: String, unique: true },
  password: String,    // hashed
  role: { type: String, enum: ["user","admin"], default: "user" }
}

// Crane.model.js
{
  producer, seriesCode, capacityClassNumber, capacity,
  height, radius, variantRevision, images: [String],
  description, location, status: { "for sale","for rent" },
  owner: { type: ObjectId, ref: "User" }
  // optional availability dates, price, etc.
}

// Inquiry.model.js
{
  customerName, email, message, crane: {ObjectId,ref:"Crane"},
  from: Date, to: Date, address: String,
  needsTransport: Boolean, needsInstallation: Boolean,
  status: { "new","in_progress","resolved" }
}

// Message.model.js
{
  formType: { contact, expert, newsletter },
  // contact form fields...
  // expert-advice fields...
  // newsletter signup fields...
}

```

## 🛠️ Scripts

- npm start – start in production

- npm run dev – start in dev mode (nodemon)

- npm test  – run your test suite (if you add tests)

## 🤝 Contributing

1. Fork the repo

2. Create a feature branch (git checkout -b feat/XYZ)

3. Commit your changes (git commit -m "feat: …")

4. Push (git push origin feat/XYZ) & open a PR

Built with ❤️ by the KranHub team.

Feel free to adapt sections (especially the **API Endpoints** table and **Models**) to match your exact field names and middleware usage.
