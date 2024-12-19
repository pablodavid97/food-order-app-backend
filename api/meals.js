import fs from 'node:fs/promises';

export default async (req, res) => {
    if (req.method === 'GET') {
        const meals = await fs.readFile('./data/available-meals.json', 'utf8');
        res.status(200).json(JSON.parse(meals));
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
};
