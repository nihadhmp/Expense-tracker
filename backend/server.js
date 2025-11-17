// Initialize sample data if database is empty
const initializeData = async () => {
  try {
    console.log(
      "Database connection established - no sample data initialization"
    );
    // No sample data initialization as requested
  } catch (error) {
    console.error("Error in database initialization:", error);
  }
};
