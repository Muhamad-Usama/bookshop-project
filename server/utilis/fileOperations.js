const fs = require('fs');
const path = require('path');

const readJSONFile = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../data', filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
};

const writeJSONFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../data', filename);
        fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// Task 10: Async callback function
const getAllBooksCallback = (callback) => {
    const filePath = path.join(__dirname, '../data/books.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return callback(err, null);
        }
        try {
            const books = JSON.parse(data);
            callback(null, books);
        } catch (parseErr) {
            callback(parseErr, null);
        }
    });
};

module.exports = {
    readJSONFile,
    writeJSONFile,
    getAllBooksCallback
};