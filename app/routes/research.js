const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

const STOCK_QUOTE_BASE_URL = "https://finance.yahoo.com/quote/";

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const symbol = String(req.query.symbol).trim().toUpperCase();
            if (!/^[A-Z.]{1,10}$/.test(symbol)) {
                res.writeHead(400, {
                    "Content-Type": "text/html"
                });
                res.write("<h1>Invalid stock symbol.</h1>");
                return res.end();
            }
            const url = STOCK_QUOTE_BASE_URL + encodeURIComponent(symbol);
            return needle.get(url, { follow_max: 0 }, (error, newResponse, body) => {
                if (!error && newResponse.statusCode === 200) {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }
                res.write("<h1>The following is the stock information you requested.</h1>\n\n");
                res.write("\n\n");
                if (body) {
                    res.write(body);
                }
                return res.end();
            });
        }

        return res.render("research", {
            environmentalScripts
        });
    };

}

module.exports = ResearchHandler;
