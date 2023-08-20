const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
    const uploadedFile = req.file; // Uploaded file details
    if (!uploadedFile) {
        return res.status(400).send('No file uploaded.');
    }

    const downloadPageUrl = `/download/${uploadedFile.filename.replace(/\.[^/.]+$/, '.html')}`;
    const downloadHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="style.css">
            <title>Download Page</title>
            <style>
            /* Your CSS code here */
            body {
              font-family: Arial, sans-serif;
              background-color: black; /* Set the background color to black */
              color: white; /* Set text color to white */
              text-align: center; /* Center align the content */
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
            }
        
            /* Add more styles as needed */
          </style>
        </head>
        <body>
            <img src="https://i.imgur.com/SY9b193.png" alt="Image">
            <h1>Download Page</h1>
            <p>File: ${uploadedFile.originalname}</p>
            <a href="/download/${uploadedFile.filename}" download>Download</a>
        </body>
        </html>
    `;

    const downloadPageFilename = `${uploadedFile.filename.replace(/\.[^/.]+$/, '.html')}`;

    fs.writeFileSync(path.join(__dirname, 'download', downloadPageFilename), downloadHtml);

    const htmlResponse = `
        <p>File uploaded successfully. <a href="${downloadPageUrl}" target="_blank">Click here to access the download page</a></p>
    `;

    res.send(htmlResponse);
});

app.use('/download', express.static(path.join(__dirname, 'uploads')));
app.use('/download', express.static(path.join(__dirname, 'download')));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));    

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
