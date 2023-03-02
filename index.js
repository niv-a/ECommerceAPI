const connectToMongo = require('./db');
const express = require('express');
const cors = require('cors');

connectToMongo();
const app = express();
const port = 8000;

app.use(express.json());
app.use(cors())

// Defining the routes for all the operations for | USER |
app.use('/api/auth', require('./routes/User/auth'));
app.use('/api/product', require('./routes/User/product'));
app.use('/api/review', require('./routes/User/review'));
app.use('/api/cart', require('./routes/User/cart'));

// Defining the routes for all the operations for | ADMIN |
app.use('/api/admin/auth', require('./routes/Auth/adminAuth'));
app.use('/api/admin/products', require('./routes/Auth/productAuth'));
app.use('/api/admin/users', require('./routes/Auth/adminUsers'));

app.listen(port, () => {
    console.log(`Server listening on : http://localhost:${port}`);
})