const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const logsDir = path.join(__dirname, '../logs'); // Adjusted path

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '../')));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../holotapes.html')); // Adjusted path
});

app.post('/save-log', (req, res) => {
    const log = req.body;
    const logFileName = `${log.title}.json`;
    fs.writeFile(path.join(logsDir, logFileName), JSON.stringify(log), (err) => {
        if (err) {
            return res.status(500).send('Failed to save log');
        }
        res.send('Log saved');
    });
});

app.get('/load-logs', (req, res) => {
    fs.readdir(logsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Failed to load logs');
        }
        const logs = files.map((file) => {
            const log = JSON.parse(fs.readFileSync(path.join(logsDir, file)));
            return { title: log.title, date: log.date };
        });
        res.json(logs);
    });
});

app.get('/load-log/:title', (req, res) => {
    const logFileName = `${req.params.title}.json`;
    fs.readFile(path.join(logsDir, logFileName), (err, data) => {
        if (err) {
            return res.status(500).send('Failed to load log');
        }
        res.json(JSON.parse(data));
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
