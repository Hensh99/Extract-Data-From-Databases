const {MongoClient} = require('mongodb');
require('dotenv').config();
const Excel = require('exceljs');

const client = new MongoClient(proccess.env.MONGO_URI);

const DB = "logReqproduction2023-02-19"; // db to connect to

async function connectToDatabase() {

    await client.connect();
    console.log('Connected to MongoDB');

    return client.db(DB);
}

(async function main() {
    const db = await connectToDatabase();


    const startDate = '2023-02-20T22:00:00.000Z';
    const endDate = '2023-02-20T23:05:00.000Z';

    const query = {
        // "req.createdAt": {
        //     $gte: startDate,
        //     $lte: endDate
        // },
        // "req.TrxServiceId": 1084
    };

    const options = {
        projection: {
            "req.id": 1,
            "req.transaction_id": 1,
            "req.status.code": 1,
            "req.status.level": 1,
            "req.createdAt": 1,
            "req.requestPath": 1
        }
    };

    try {
        const results = await db.collection('taqaErrors_merchant').find(query, options).toArray();
        fillExcel(results);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }

})();

function fillExcel(rows) {
    const fileName = 'TAQA_19_Merchant_Errors.xlsx';
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('TAQA_19_LOGS');


    // Add some data to the worksheet
    worksheet.columns = [
        {
            header: 'ID',
            key: 'id',
            width: 45
        },
        {
            header: 'Transaction ID',
            key: 'transaction_id',
            width: 45
        },
        {
            header: 'Request Type',
            key: 'request_type',
            width: 25
        },
        {
            header: 'Status Code',
            key: 'code',
            width: 20
        },
        {
            header: 'Status Level',
            key: 'level',
            width: 15
        },
        {
            header: 'Date',
            key: 'date',
            width: 35
        }
    ];
    rows.forEach(row => {
        const req = row.req;
        worksheet.addRow({
            id: req.id,
            transaction_id: req.transaction_id,
            code: req.status.code,
            level: req.status.level,
            request_type: req.requestPath[0].request_type,
            date: new Date(req.createdAt).toISOString(),
        });
    })

    // Save the workbook
    workbook.xlsx.writeFile(fileName)
        .then(() => console.log('Workbook saved!'))
        .catch((err) => console.error(err));
}