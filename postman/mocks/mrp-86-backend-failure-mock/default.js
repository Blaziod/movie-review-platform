// MRP-86: Simulate a backend failure (500)
const http = require("http");

const PORT = process.env.PORT || 4500;

http.createServer((req, res) => {
    if (req.method === "GET" && req.url.startsWith("/api/movies/compare")) {
        res.writeHead(500, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            message: "Unable to compare movies."
        }));
        return;
    }

    res.writeHead(404);
    res.end();
}).listen(PORT);