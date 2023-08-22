const express = require('express');
const http = require("http")

const app = express();
app.use(express.json())
const PORT = 3000;

app.get('/numbers', async (req, res) => {
    const urlParam = req.query.url;

    if (!urlParam) {
        return res.status(400).json({ error: 'Invalid or missing URL parameter' });
    }

    const urls = Array.isArray(urlParam) ? urlParam : [urlParam];

    let uniqueNumbers = new Set();
    try {
        await Promise.all(urls.map(async (url) => {
            console.log("url is ", url);

            try {
                const response = await fetchData(url);
                const resp = JSON.parse(response);
                if (Array.isArray(resp.numbers)) {
                    resp.numbers.forEach(num => uniqueNumbers.add(num));
                }
                console.log("uniqueNumbers: ", uniqueNumbers);
            } catch (error) {
                console.error("Error fetching data from URL:", url);
            }
        }));

        return res.json({ numbers: Array.from(uniqueNumbers).sort((a, b) => a - b) });
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching data from URLs' });
    }
});

function fetchData(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve(data);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});