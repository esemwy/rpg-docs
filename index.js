const express = require('express');
const fs = require('fs');
const path = require('path');
const url = require('url');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Serve static files like CSS and images
app.use('/coverpages', express.static('coverpages'));
app.use('/pdfjs', express.static('pdfjs'));

// Middleware to check referrer

app.use('/pdf', (req, res, next) => {
    const referrer = req.get('referrer');
    if (referrer) {
        const hostname = url.parse(referrer).hostname;
	if ((hostname === 'localhost') || hostname.endsWith('.smy.com')) {
            next();
            return;
	}
    }
    console.log('Referrer:', referrer); // log the referrer for debugging
    res.status(403).send('Forbidden');
});

app.use('/pdf', express.static('pdf'));

app.get('/', (req, res) => {
    const dir = path.join(__dirname); 
    const pdfs = path.join(dir, 'pdf');
    const coverpages = path.join(dir, 'coverpages');
    const jsonPath = path.join(dir, 'metadata.json');

    const files = fs.readdirSync(pdfs);
    const metadataStr = fs.readFileSync(jsonPath, 'utf8');
    const metadata = JSON.parse(metadataStr);

    const image_url = {}
    for (const file of files) {
        if (file.startsWith('.')) continue;
        const basename = path.basename(file, '.pdf');

        let info = basename;
        if (metadata[basename]) {
            info = metadata[basename];
        }

        const image = path.join(coverpages, `${basename}.jpg`);
        if (fs.existsSync(image)) {
            image_url[basename] = { pdf: encodeURIComponent(basename), info: info };
        }
    }
    res.render('index', { image_url });
});

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
