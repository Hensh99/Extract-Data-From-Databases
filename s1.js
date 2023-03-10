var MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
// Replace the uri string with your MongoDB deployment's connection string.
const client = new MongoClient(process.env.MONGO_URI);

const Excel = require('exceljs');

async function runTaqa() {
  let docsTaqa = [] //<- Declare a variable to hold your docs 

  try {
    const database = client.db("logReqproduction2023-02-19");
    const transactions = database.collection("transactions");
    // query for transactions that have a runtime less than 15 minutes

    let arr = await readExcel("taqa.xlsx");
    const query = {
      "req.transaction_id": {
        "$in": arr
      },
      "req.requestPath.request_type": "P"
    };
    const options = {
      projection: {
        "req.transaction_id": 1,
        "req.requestPath": 1
      }
    };
    const cursor = transactions.find(query, options);
    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }
    // replace console.dir with your callback to access individual elements
    await cursor.forEach((doc) => {
      console.log(doc);
      docsTaqa.push({
      id: doc.req.transaction_id,
      time: doc.req.requestPath[35].entryTime
    })});
  } finally {
    await client.close();
    return docsTaqa //<- return the docs
  }
}


async function runCash() {
  let cashdocs = [] //<- Declare a variable to hold your docs  


  
  try {
    const database = client.db("logReqproduction2023-02-19");
    const transactions = database.collection("transactions");
    // query for transactions that have a runtime less than 15 minutes
    let arr = await readExcel("cash call.xlsx");
    const query = {
      "req.transaction_id": {
        "$in": arr
      },
      "req.requestPath.request_type": "P"
    };
    const options = {
      //   // sort returned documents in ascending order by title (A->Z)
      //   sort: { name: 1 },
      // Include only the `title` and `imdb` fields in each returned document
      projection: {
        "req.transaction_id": 1,
        "req.requestPath": 1
      },
    };
    const cursor = transactions.find(query, options);
    
    // print a message if no documents were found
    if ((await cursor.count()) === 0) {
      console.log("No documents found!");
    }
    // replace console.dir with your callback to access individual elements
    await cursor.forEach(doc => cashdocs.push({
      id: doc.req.transaction_id,
      time: doc.req.requestPath[37].entryTime
    }));
  } finally {
    await client.close();
    return cashdocs //<- return the docs
  }
}

async function readExcel(sheetName) {
  const workbook = new Excel.Workbook();
  try {
    await workbook.xlsx.readFile(sheetName);
    const worksheet = workbook.getWorksheet(1);
    const columnB = worksheet.getColumn('B');
    const columnValues = [];
    columnB.eachCell((cell, rowNumber) => {
      if (rowNumber !== 1 && rowNumber > 12 ) {
        columnValues.push(cell.value);
      }
    });
    return columnValues;
  } catch (error) {
    console.error(error);
  }



}


function fillExcel(rows) {
  const fileName = 'TAQA_19.xlsx';
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('LOGS');


  // Add some data to the worksheet
  worksheet.columns = [{
      header: 'Transaction ID',
      key: 'transaction_id',
      width: 35
    },
    {
      header: 'Date',
      key: 'date',
      width: 35
    }
  ];
  rows.forEach(row => {
    worksheet.addRow({
      transaction_id: row.id,
      date: new Date(row.time).toISOString()
    });
  })

  // Save the workbook
  workbook.xlsx.writeFile(fileName)
    .then(() => console.log('Workbook saved!'))
    .catch((err) => console.error(err));
}


(async () => {
  let rows = await runTaqa().catch(console.dir);

  fillExcel(rows)

})()


/**
 * 
 * 
 * 
 * req
 *      (TrxServiceId)--(createdAt)
 *      id, transaction_id, status.code, requestPath[0].request_type, req.createdAt
 */