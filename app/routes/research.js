const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

// Research data is always fetched from this fixed, server-side base URL.
// The client may only supply the stock symbol, never the destination.
const RESEARCH_BASE_URL = "https://finance.yahoo.com/quote/";
const SYMBOL_PATTERN = /^[A-Z.]{1,10}$/;

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    this.displayResearch = (req, res) => {

        if (req.query.symbol) {
            const symbol = String(req.query.symbol).toUpperCase();

            if (!SYMBOL_PATTERN.test(symbol)) {
                return res.status(400).render("research", {
                    error: "Please enter a valid stock symbol (letters and dots only).",
                    environmentalScripts
                });
            }

            const url = RESEARCH_BASE_URL + encodeURIComponent(symbol);
            const options = {
                "follow_max": 0,
                "open_timeout": 5000,
                "response_timeout": 10000
            };

            return needle.get(url, options, (error, newResponse, body) => {
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
