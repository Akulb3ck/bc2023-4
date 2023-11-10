const { readFileSync } = require('fs');
const http = require('http');
const fs = require('fs').promises;
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const host = 'localhost';
const port = 8000;

readFileAsync = async (filePath) => {
    try {
        return fs.readFile(filePath, 'utf-8');
    } catch (error) {
        console.error(error);
        throw new Error('Internal Server Error');
    }
};

parseXmlAsync = async (xmlString) => {
    return new Promise((resolve, reject) => {
        parser.parseString(xmlString, (err, result) => {
            if (err) {
                console.error(err);
                reject(new Error('Internal Server Error'));
            } else {
                resolve(result);
            }
        });
    });
};

requestListener = async (req, res) => {
    try {
        const data = readFileSync('data.xml');
        let result = parseXmlSync(data);

        const transformedData = {
            data: {
                value: [],
            },
        };

        (result.indicators.inflation || []).forEach((item) => {
            const ku = item.ku ? item.ku[0] : null;
            let value = item.value ? parseFloat(item.value[0]) : null;

            if (ku === '13' && value && value > 5) {
                transformedData.data.value.push(item.value[0]);
            }
        });

        const xml = builder.buildObject(transformedData);

        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(xml);
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(error.message);
    }
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
