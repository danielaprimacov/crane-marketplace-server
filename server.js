require("dotenv/config");

const app = require("./app");
const connectDB = require("./db");

// Set the PORT for the app
const PORT = process.env.PORT || 5005;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
