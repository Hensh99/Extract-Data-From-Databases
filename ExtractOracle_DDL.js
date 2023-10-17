const fs = require("fs");
const oracledb = require("oracledb");
const dbConfig = {
  user: "",
  password: "",
  connectString: "", // e.g., host:port/service_name
};

const tablesToExtractDDL = []; // Add your table names here
const outputFolder = "./_ddl"; // Change to your desired folder path

// Ensure the output folder exists
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

async function saveDDLToFile(tableName, ddlStatement) {
  if (ddlStatement) {
    const fileName = `${outputFolder}/${tableName}.sql`;
    fs.writeFileSync(fileName, ddlStatement);
    console.log(`DDL for table ${tableName} saved to ${fileName}`);
  } else {
    console.log(`DDL not found for table ${tableName}`);
  }
}

async function extractAndSaveDDL() {
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);

    for (const tableName of tablesToExtractDDL) {
      const query = `
        SELECT dbms_metadata.get_ddl('TABLE', '${tableName}', user) AS ddl
        FROM dual
      `;

      const result = await connection.execute(query);
      if (result.rows.length > 0) {
        const ddlStatement = result.rows[0][0];
        saveDDLToFile(tableName, ddlStatement);
      } else {
        console.log(`DDL not found for table ${tableName}`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
}

extractAndSaveDDL().catch((err) => {
  console.error("Error:", err);
});
