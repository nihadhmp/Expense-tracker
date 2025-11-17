// MongoDB Connection with better error handling and options
const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB with URI:", MONGODB_URI);

    // Add connection options for better reliability
    // Using the method specified by the user
    const conn = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTryOnce: false,
      serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Limit connection pool size
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    await initializeData();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error(
      "Please check your MongoDB connection string and ensure MongoDB is running"
    );
    console.error("Connection URI:", MONGODB_URI);

    // More specific error handling
    if (error.name === "MongooseServerSelectionError") {
      console.error(
        "Server selection error - check network connectivity and MongoDB Atlas IP whitelist"
      );
    } else if (error.name === "MongoNetworkError") {
      console.error(
        "Network error - check firewall settings and network connectivity"
      );
    } else if (error.name === "MongoParseError") {
      console.error(
        "URI parsing error - check MongoDB connection string format"
      );
    } else if (error.code === "ENOTFOUND") {
      console.error("DNS lookup failed - check MongoDB host name");
    }

    // Try to connect to local MongoDB as fallback
    if (MONGODB_URI.includes("mongodb+srv")) {
      console.log("Trying to connect to local MongoDB as fallback...");
      try {
        const localConn = await mongoose.connect(
          "mongodb://localhost:27017/expense-tracker",
          {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
          }
        );
        console.log(`Fallback MongoDB Connected: ${localConn.connection.host}`);
        console.log(`Database Name: ${localConn.connection.name}`);
        await initializeData();
      } catch (localError) {
        console.error("Local MongoDB connection also failed:", localError);
        console.error(
          "Please ensure MongoDB is installed and running locally on port 27017"
        );
        // Exit process in production
        // process.exit(1);
      }
    } else {
      // Exit process in production
      // process.exit(1);
    }
  }
};
