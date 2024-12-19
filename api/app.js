import fs from 'node:fs/promises';
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';

const app = express();

app.use(bodyParser.json());
app.use(
    express.static('public'),
    express.static(path.join(process.cwd(), 'public'))
);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Function to resolve file paths
const resolveFilePath = (fileName) =>
    path.resolve(process.cwd(), 'data', fileName);

app.get('/meals', async (req, res) => {
    try {
        const filePath = resolveFilePath('available-meals.json');
        const meals = await fs.readFile(filePath, 'utf8');
        const mealsData = JSON.parse(meals);
        res.status(200).json({ meals: mealsData });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching meals',
            error: error.message,
        });
    }
});

app.post('/orders', async (req, res) => {
    const orderData = req.body.order;

    if (
        orderData === null ||
        orderData.items === null ||
        orderData.items.length === 0
    ) {
        return res.status(400).json({ message: 'Missing data.' });
    }

    if (
        orderData.customer.email === null ||
        !orderData.customer.email.includes('@') ||
        orderData.customer.name === null ||
        orderData.customer.name.trim() === '' ||
        orderData.customer.street === null ||
        orderData.customer.street.trim() === '' ||
        orderData.customer['postal-code'] === null ||
        orderData.customer['postal-code'].trim() === '' ||
        orderData.customer.city === null ||
        orderData.customer.city.trim() === ''
    ) {
        return res.status(400).json({
            message:
                'Missing data: Email, name, street, postal code or city is missing.',
        });
    }

    const newOrder = {
        ...orderData,
        id: (Math.random() * 1000).toString(),
    };
    const orders = await fs.readFile('./data/orders.json', 'utf8');
    const allOrders = JSON.parse(orders);
    allOrders.push(newOrder);
    const filePath = resolveFilePath('orders.json');
    await fs.writeFile(filePath, JSON.stringify(allOrders));
    res.status(201).json({ message: 'Order created!' });
});

// 404 Handler
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();

    res.status(404).json({ message: '404 - Not Found' });
});

// Export as Serverless Function
export default app;
