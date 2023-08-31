const { MongoClient } = require("mongodb");
const ExcelJS = require("exceljs");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const dbName = "reporting";
const collectionName = "reportsconfigs";

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const query = { "reporterConfigs.status": "running" };
    const projection = {
      "reporterConfigs.name": 1,
      _id: 1,
      "collectorConfigs.options.docConfig.sheetHeaders": 1,
      "collectorConfigs.options.docConfig.sheets.sheetHeaders": 1,
    };

    const cursor = collection.find(query, { projection });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Running Documents");

    worksheet.columns = [
      { header: "Reporter Name", key: "reporterName", width: 20 },
      { header: "Object ID", key: "objectId", width: 40 },
      { header: "Sheet Headers", key: "sheetHeaders", width: 40 },
    ];

    await cursor.forEach((document) => {
      const sheetHeaders = extractKeys(
        document.collectorConfigs?.options?.docConfig?.sheetHeaders
      );
      const sheetHeadersSheets = extractKeys(
        document.collectorConfigs?.options?.docConfig?.sheets?.[0]?.sheetHeaders
      );

      const row = worksheet.addRow({
        reporterName: document.reporterConfigs?.name || "N/A",
        objectId: document._id?.toHexString() || "N/A",
        sheetHeaders:
          sheetHeaders.join(", ") || sheetHeadersSheets.join(", ") || "N/A",
      });
    });

    const excelFileName = "running_documents.xlsx";
    await workbook.xlsx.writeFile(excelFileName);
    console.log(`Excel file "${excelFileName}" created successfully.`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    client.close();
    console.log("Disconnected from MongoDB");
  }
}

function extractKeys(obj) {
  return obj ? Object.keys(obj) : [];
}

main();
