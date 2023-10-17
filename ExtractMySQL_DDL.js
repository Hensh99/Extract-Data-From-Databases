const fs = require("fs");
const mysql = require("mysql2/promise"); // Use mysql2/promise for async/await

// Database configuration
const dbConfig = {
  host: "",
  user: "",
  password: "",
  database: "",
};

// Array of table names for which you want to extract DDL
const tablesToExtractDDL = [];
// Add your table names here

// Folder where you want to save DDL files
const outputFolder = "./transactions_ddl"; // Change to your desired folder path

// Ensure the output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Function to save DDL to a file in the specified folder
function saveDDLToFile(tableName, ddlStatement) {
  if (ddlStatement) {
    // Check if ddlStatement is not undefined
    const fileName = `${outputFolder}/${tableName}.sql`;
    fs.writeFileSync(fileName, ddlStatement);
    console.log(`DDL for table ${tableName} saved to ${fileName}`);
  } else {
    console.log(`DDL not found for table ${tableName}`);
  }
}

// Define an async function to extract and save DDL
async function extractAndSaveDDL() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    for (const tableName of tablesToExtractDDL) {
      // Query to retrieve DDL for the table
      const [results] = await connection.query("SHOW CREATE TABLE ??", [
        tableName,
      ]);

      if (results.length > 0) {
        const ddlStatement = results[0]["Create Table"];
        saveDDLToFile(tableName, ddlStatement);
      } else {
        console.log(`DDL not found for table ${tableName}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    // Close the connection
    await connection.end();
  }
}

// Call the async function to extract and save DDL
extractAndSaveDDL().catch((err) => {
  console.error("Error:", err);
});
