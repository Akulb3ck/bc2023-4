const http = require('http');
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    fs.readFile('data.xml', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            return;
        }

        parser.parseString(data, (err, result) => {
            if (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }


            const transformedData = {
                data: {
                    value: [],
                },
            };

            (result.indicators.inflation || []).forEach((item) => {
                const ku = item.ku ? item.ku[0] : null;
                const value = item.value ? parseFloat(item.value[0]) : null;

                if (ku === '13' && value && value > 5) {
                    transformedData.data.value.push(item.value[0]);
                }
            });


            const xml = builder.buildObject(transformedData);

            res.writeHead(200, { 'Content-Type': 'text/xml' });
            res.end(xml);
        });
    });
};

const server = http.createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});



