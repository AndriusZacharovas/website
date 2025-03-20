const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 80;

// Middleware
app.use(express.static(path.join(__dirname, '../static')));
app.use(bodyParser.json());

// SQLite setup
const db = new sqlite3.Database('database/posts.db', (err) => {
    if (err) {
        console.error('Error connecting to database', err.message);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL
        )`);
    }
});

// Serve HTML files
app.get('/:page', (req, res) => {
    res.sendFile(path.join(__dirname, '../static', req.params.page + '.html'));
});

// Serve index for unrecognized routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../static/index.html'));
});

// **API Routes for Comments**

// Fetch all comments
app.get('/api/comments', (req, res) => {
    db.all('SELECT * FROM comments', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Add a new comment
app.post('/api/comments', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Comment text is required' });
    }

    db.run('INSERT INTO comments (text) VALUES (?)', [text], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, text });
        }
    });
});

// Edit a comment
app.put('/api/comments/:id', (req, res) => {
    const { text } = req.body;
    const { id } = req.params;

    db.run('UPDATE comments SET text = ? WHERE id = ?', [text, id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Comment updated successfully' });
        }
    });
});

// Delete a comment
app.delete('/api/comments/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM comments WHERE id = ?', [id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Comment deleted successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});