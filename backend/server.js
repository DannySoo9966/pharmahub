require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs'); 

const app = express();
const rootDir = path.join(__dirname, '..');

//Create an uploads folder to save picture for the medicine
const uploadDir = path.join(rootDir, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

app.use('/uploads', express.static(path.join(rootDir, 'uploads')));

// login.html as the main page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.use(express.static(rootDir, { index: false }));

// MySQL database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dateStrings: true
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// ==================== 1. User Login Side ====================
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM staffs WHERE username = ? AND user_password = ?';
    db.query(sql, [username, password], (err, results) => {
        if (err) 
            return res.status(500).json({ success: false, message: err.message });
        if (results.length > 0) {
            res.json({ success: true, username: results[0].username });
        } else {
            res.json({ success: false, message: 'Invalid Username or Password' });
        }
    });
});

// ==================== 2. Medicine ====================
// Get medicine list with real-time stock 
app.get('/api/medicines', (req, res) => {
    const sql = `SELECT m.*, IFNULL(SUM(b.quantity), 0) AS current_units 
        FROM medicines m 
        LEFT JOIN batches b ON m.medicine_id = b.medicine_id 
        GROUP BY m.medicine_id
    `;
    db.query(sql, (err, results) => {
        if (err) 
            return res.status(500).json({ success: false, message: err.message });
        res.json(results);
    });
});

//Add new medicine
app.post('/add-medicine', (req, res) => {
    const { medicine_id, medicine_name, category, medicine_type, dosage_form, cost_price, selling_price, minStock, imageBase64, imageExt } = req.body;
    
    let imageUrl = null;
    if (imageBase64 && imageExt) {
        try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `med_${Date.now()}.${imageExt}`;
            const filePath = path.join(rootDir, 'uploads', fileName);
            fs.writeFileSync(filePath, buffer);
            imageUrl = `/uploads/${fileName}`;
        } catch (fsErr) {
            return res.status(500).json({ success: false, message: 'Failed to save image: ' + fsErr.message });
        }
    }

    const sql = 'INSERT INTO medicines (medicine_id, medicine_name, category, medicine_type, dosage_form, cost_price, selling_price, minStock, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [medicine_id, medicine_name, category, medicine_type, dosage_form, cost_price, selling_price, minStock, imageUrl], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error inserting medicine: ' + err.message });
        }
        res.json({ success: true });
    });
});

// ==================== Edit Medicine (Update) ====================
app.post('/update-medicine', (req, res) => {
    const { medicine_id, medicine_name, category, medicine_type, dosage_form, cost_price, selling_price, minStock, imageBase64, imageExt } = req.body;
    
    let imageSqlPart = '';
    let params = [medicine_name, category, medicine_type, dosage_form, cost_price, selling_price, minStock];

    // Check if a new image was provided in the request
    if (imageBase64 && imageExt) {
        try {
            const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `med_${Date.now()}.${imageExt}`;
            const filePath = path.join(rootDir, 'uploads', fileName);
            fs.writeFileSync(filePath, buffer);
            imageSqlPart = ', image_url = ?';
            params.push(`/uploads/${fileName}`);
        } 
        catch (fsErr) {
            return res.status(500).json({ success: false, message: 'Failed to update image: ' + fsErr.message });
        }
    }

    params.push(medicine_id);
    const sql = `UPDATE medicines SET medicine_name = ?, category = ?, medicine_type = ?, dosage_form = ?, cost_price = ?, selling_price = ?, minStock = ? ${imageSqlPart} WHERE medicine_id = ?`;

    db.query(sql, params, (err) => {
        if (err) 
            return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true });
    });
});

// ==================== Delete Medicine (Delete) ====================
app.post('/api/delete-medicine', (req, res) => {
    const { medicine_id } = req.body;

    // Check Medicine Stock
    const checkStockSql = 'SELECT SUM(quantity) AS total_stock FROM batches WHERE medicine_id = ? AND quantity > 0';
    db.query(checkStockSql, [medicine_id], (err, results) => {
        if (err) 
            return res.status(500).json({ success: false, message: err.message });

        const totalStock = results[0].total_stock || 0;
        if (totalStock > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Cannot delete medicine. There are still ${totalStock} units in stock!` 
            });
        }

        // Delete when the medicine id out of stock
        const deleteSql = 'DELETE FROM medicines WHERE medicine_id = ?';
        db.query(deleteSql, [medicine_id], (err2) => {
            if (err2) 
                return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true });
        });
    });
});

// ==================== Batches ====================
app.get('/api/batches', (req, res) => {
    const sql = `
        SELECT b.*, m.medicine_name, m.category, m.cost_price 
        FROM batches b
        JOIN medicines m ON b.medicine_id = m.medicine_id
    `;
    db.query(sql, (err, results) => {
        if (err) 
            return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// ==================== (Stock In) ====================
app.post('/add-stock-in', async (req, res) => {
    const { medicine_id, quantity, expiry_date } = req.body;
    const qtyNum = parseInt(quantity, 10);

    if (!medicine_id || !qtyNum || qtyNum <= 0 || !expiry_date) {
        return res.status(400).json({ success: false, message: 'Please provide valid input.' });
    }

    try {
        // Create batch_id and batch_number with date and following number
        const { nextBatchId, nextBatchNumber } = await generateNextBatchDetails();
        const inbound_date = new Date().toISOString().slice(0, 10);

        // Wait for the database query to complete before moving to the next step
        await new Promise((resolve, reject) => {
            const batchSql = 'INSERT INTO batches (batch_id, medicine_id, batch_number, inbound_date, expiry_date, quantity) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(batchSql, [nextBatchId, medicine_id, nextBatchNumber, inbound_date, expiry_date, qtyNum], (err) => {
                if (err) 
                    return reject(err);
                resolve();
            });
        });

        const { nextTxnId, nextTxnCode } = await generateNextTxnDetails();

        const txnSql = 'INSERT INTO stock_transaction (txn_id, txn_code, batch_id, medicine_id, txn_type, qty_change, reason) VALUES (?, ?, ?, ?, "Stock In", ?, "Add Stock")';
        db.query(txnSql, [nextTxnId, nextTxnCode, nextBatchId, medicine_id, qtyNum], (err2) => {
            if (err2) 
                return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true });
        });
    } 
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== Stock Out ====================
app.post('/add-stock-out', async (req, res) => {
    const { medicine_id, deduct_qty, reason } = req.body;
    let remainingToDeduct = parseInt(deduct_qty, 10);

    const findBatchesSql = `
        SELECT batch_id, quantity FROM batches 
        WHERE medicine_id = ? AND quantity > 0 AND (expiry_date > CURDATE() OR expiry_date IS NULL) 
        ORDER BY expiry_date ASC, batch_id ASC
    `;

    db.query(findBatchesSql, [medicine_id], async (err, batches) => {
        if (err) 
            return res.status(500).json({ success: false, message: err.message });
        if (!batches || batches.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid sellable batches available.' });
        }

        const totalValidStock = batches.reduce((sum, b) => sum + Number(b.quantity), 0);
        if (remainingToDeduct > totalValidStock) {
            return res.status(400).json({ 
                success: false, 
                message: `Insufficient stock! Total sellable units: ${totalValidStock}` 
            });
        }

        try {
            //For loop for contiunue to deduct the stock if early batch not enough
            for (let i = 0; i < batches.length && remainingToDeduct > 0; i++) {
                const batch = batches[i];
                const currentBatchQty = Number(batch.quantity);

                let deductFromThisBatch = 0;
                if (currentBatchQty <= remainingToDeduct) {
                    deductFromThisBatch = currentBatchQty;
                    remainingToDeduct -= currentBatchQty;
                } 
                else {
                    deductFromThisBatch = remainingToDeduct;
                    remainingToDeduct = 0;
                }

                const newBatchQty = currentBatchQty - deductFromThisBatch;

                await new Promise((resolve, reject) => {
                    db.query('UPDATE batches SET quantity = ? WHERE batch_id = ?', [newBatchQty, batch.batch_id], (e) => {
                        if (e) 
                            return reject(e);
                        resolve();
                    });
                });

                const { nextTxnId, nextTxnCode } = await generateNextTxnDetails();

                const txnSql = `
                    INSERT INTO stock_transaction (txn_id, txn_code, batch_id, medicine_id, txn_type, qty_change, reason) 
                    VALUES (?, ?, ?, ?, "Stock Out", ?, ?)
                `;
                await new Promise((resolve, reject) => {
                    db.query(txnSql, [nextTxnId, nextTxnCode, batch.batch_id, medicine_id, -deductFromThisBatch, reason], (e) => {
                        if (e) 
                            return reject(e);
                        resolve();
                    });
                });
            }

            res.json({ success: true });
        } 
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    });
});

// ==================== Write Off Medicine (After expiry date) ====================
app.post('/api/write-off-batch', async (req, res) => {
    const { batch_id, medicine_id, quantity } = req.body;

    try {
        await new Promise((resolve, reject) => {
            db.query('UPDATE batches SET quantity = 0 WHERE batch_id = ?', [batch_id], (err) => {
                if (err) 
                    return reject(err);
                resolve();
            });
        });

        const { nextTxnId, nextTxnCode } = await generateNextTxnDetails();

        const txnSql = `
            INSERT INTO stock_transaction (txn_id, txn_code, batch_id, medicine_id, txn_type, qty_change, reason) 
            VALUES (?, ?, ?, ?, "Stock Out", ?, "Expired Write-off (Loss)")
        `;
        db.query(txnSql, [nextTxnId, nextTxnCode, batch_id, medicine_id, -Number(quantity)], (err2) => {
            if (err2) 
                return res.status(500).json({ success: false, message: err2.message });
            res.json({ success: true });
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ==================== 6. Report ====================
app.get('/api/reports', (req, res) => {
    const sql = `
        SELECT t.*, m.medicine_name 
        FROM stock_transaction t
        LEFT JOIN medicines m ON t.medicine_id = m.medicine_id
        ORDER BY t.txn_time DESC
    `;
    db.query(sql, (err, results) => {
        if (err) 
            return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// =========== Create batch_id (BTH-100X) and batch_number (BN-YYYYMMDD-XX) =========
function generateNextBatchDetails() {
    return new Promise((resolve, reject) => {
        // Check the larger number of batch_id
        const maxSql = `SELECT MAX(CAST(SUBSTRING_INDEX(batch_id, '-', -1) AS UNSIGNED)) AS max_id_num FROM batches`;

        db.query(maxSql, (err, resMax) => {
            if (err) 
                return reject(err);

            //Increase value from the larger batch_id
            const nextNum = (resMax[0].max_id_num && resMax[0].max_id_num >= 1000) 
                ? resMax[0].max_id_num + 1 
                : 1001;
            const nextBatchId = `BTH-${nextNum}`;

            // Getting the Date with Format YYYYMMDD
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const bnPrefix = `BN-${y}${m}${d}-`;

            // heck how many batches have been generated for the same day
            const bnSql = `SELECT batch_number FROM batches WHERE batch_number LIKE ? ORDER BY batch_number DESC LIMIT 1`;
            db.query(bnSql, [`${bnPrefix}%`], (err2, resBn) => {
                if (err2) 
                    return reject(err2);

                let seq = 1;
                if (resBn.length > 0 && resBn[0].batch_number) {
                    const parts = resBn[0].batch_number.split('-');
                    seq = parseInt(parts[2], 10) + 1;
                }
                const nextBatchNumber = `${bnPrefix}${String(seq).padStart(2, '0')}`;

                resolve({ nextBatchId, nextBatchNumber });
            });
        });
    });
}

// =========== Create Fixed Format Of Transaction ID and Code =========
function generateNextTxnDetails() {
    return new Promise((resolve, reject) => {
        // 1. Check the MAX Value of txn_id 
        const maxSql = `
            SELECT MAX(CAST(SUBSTRING_INDEX(txn_id, '-', -1) AS UNSIGNED)) AS max_id_num
            FROM stock_transaction
        `;
        db.query(maxSql, (err, resMax) => {
            if (err) 
                return reject(err);

            //Increase the number id from max_id
            const nextNum = (resMax[0].max_id_num && resMax[0].max_id_num >= 1000) 
                ? resMax[0].max_id_num + 1 
                : 1001;
            const nextTxnId = `TSC-${nextNum}`;

            // 2. Getting the Date Format YYYYMMDD
            const now = new Date();
            const y = now.getFullYear();
            const m = String(now.getMonth() + 1).padStart(2, '0');
            const d = String(now.getDate()).padStart(2, '0');
            const datePrefix = `TXN-${y}${m}${d}-`;

            // Check how many transactions have been generated for the same day
            const codeSql = `SELECT txn_code FROM stock_transaction WHERE txn_code LIKE ? ORDER BY txn_code DESC LIMIT 1`;
            db.query(codeSql, [`${datePrefix}%`], (err2, resCode) => {
                if (err2) 
                    return reject(err2);

                let seq = 1;
                if (resCode.length > 0) {
                    const lastCode = resCode[0].txn_code;
                    const parts = lastCode.split('-');
                    seq = parseInt(parts[2], 10) + 1;
                }
                const nextTxnCode = `${datePrefix}${String(seq).padStart(3, '0')}`;

                resolve({ nextTxnId, nextTxnCode });
            });
        });
    });
}

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});