import express from 'express';
import cors from 'cors';
import { EventExtractor } from "./extractor.js";
const app = express();
const port = 8080;
const extractor = new EventExtractor("https://wiki.chaosdorf.de/api.php");
app.use(cors());
app.get('/freitagsfoo/:date', async (req, res) => {
    const date = req.params.date;
    if (!date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
        res.status(400);
        res.contentType("text/plain");
        res.send(`Bad request: id does not match YYYY-MM-DD format: ${date}`);
        return;
    }
    try {
        const event = await extractor.extractEvent(`Freitagsfoo/${date}`);
        if (event) {
            res.status(200);
            res.contentType("application/json");
            res.send(JSON.stringify(event, null, 2));
        }
        else {
            res.status(404);
            res.contentType("application/json");
            res.send(JSON.stringify(event, null, 2));
        }
    }
    catch (e) {
        res.status(503);
        res.contentType("text/plain");
        res.send(`Internal server error: ${e}`);
    }
});
app.get("/freitagsfoo/", async (req, res) => {
    try {
        const event = await extractor.extractEvent("Freitagsfoo/current");
        res.status(200);
        res.contentType("application/json");
        res.send(JSON.stringify(event, null, 2));
    }
    catch (e) {
        res.status(503);
        res.contentType("text/plain");
        res.send(`Internal server error: ${e}`);
    }
});
app.listen(port, () => {
    console.log(`Express started listening on port ${port}`);
});
//# sourceMappingURL=service.js.map