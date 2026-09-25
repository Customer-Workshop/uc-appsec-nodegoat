const ProfileDAO = require("../data/profile-dao").ProfileDAO;
const {
    environmentalScripts
} = require("../../config/config");

/* The ProfileHandler must be constructed with a connected db */
function ProfileHandler(db) {
    "use strict";

    const profile = new ProfileDAO(db);

    // The name is only ever interpolated into a URL context, so it must be URL encoded rather
    // than HTML encoded, and the scheme must be fixed so a "javascript:" name cannot become the href
    const buildNameSearchUrl = (name) => `https://www.google.com/search?q=${encodeURIComponent(name || "")}`;

    this.displayProfile = (req, res, next) => {
        const {
            userId
        } = req.session;



        profile.getByUserId(parseInt(userId), (err, doc) => {
            if (err) return next(err);
            doc.userId = userId;

            return res.render("profile", {
                ...doc,
                firstNameSearchUrl: buildNameSearchUrl(doc.firstName),
                environmentalScripts
            });
        });
    };

    this.handleProfileUpdate = (req, res, next) => {

        const {
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting
        } = req.body;

        // Fix for ReDoS attack - a single quantifier avoids the catastrophic backtracking that
        // nested quantifiers (`([0-9]+)+`) allow
        const regexPattern = /([0-9]+)\#/;
        // Allow only numbers with a suffix of the letter #, for example: 'XXXXXX#'
        const testComplyWithRequirements = regexPattern.test(bankRouting);
        // if the regex test fails we do not allow saving
        if (testComplyWithRequirements !== true) {
            return res.render("profile", {
                updateError: "Bank Routing number does not comply with requirements for format specified",
                firstName,
                firstNameSearchUrl: buildNameSearchUrl(firstName),
                lastName,
                ssn,
                dob,
                address,
                bankAcc,
                bankRouting,
                environmentalScripts
            });
        }

        const {
            userId
        } = req.session;

        profile.updateUser(
            parseInt(userId),
            firstName,
            lastName,
            ssn,
            dob,
            address,
            bankAcc,
            bankRouting,
            (err, user) => {

                if (err) return next(err);

                user.updateSuccess = true;
                user.userId = userId;

                return res.render("profile", {
                    ...user,
                    firstNameSearchUrl: buildNameSearchUrl(user.firstName),
                    environmentalScripts
                });
            }
        );

    };

}

module.exports = ProfileHandler;
