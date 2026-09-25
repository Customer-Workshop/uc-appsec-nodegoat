const ResearchDAO = require("../data/research-dao").ResearchDAO;
const needle = require("needle");
const {
    environmentalScripts
} = require("../../config/config");

function ResearchHandler(db) {
    "use strict";

    const researchDAO = new ResearchDAO(db);

    // Fix for SSRF - the outbound destination is fixed server side and the only user controlled
    // part is a ticker symbol, restricted to a safe character set and URL encoded
    const RESEARCH_BASE_URL = "https://finance.yahoo.com/quote/";
    const SYMBOL_RE = /^[A-Za-z0-9.-]{1,10}$/;

    this.displayResearch = (req, res, next) => {

        if (req.query.symbol) {
            const symbol = req.query.symbol;

            if (!SYMBOL_RE.test(symbol)) {
                return next(new Error("Invalid stock symbol requested"));
            }

            const url = RESEARCH_BASE_URL + encodeURIComponent(symbol);
            return needle.get(url, (error, newResponse, body) => {
                if (error || newResponse.statusCode !== 200) {
                    return next(new Error("Unable to retrieve stock information"));
                }
                res.writeHead(200, {
                    "Content-Type": "text/plain"
                });
                res.write("The following is the stock information you requested.\n\n");
                if (body) {
                    res.write(typeof body === "string" ? body : JSON.stringify(body));
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
