const { auth } = require("../utils/admin");

exports.validateEntryHandler = (req, res) => {
    const sessionCookie = req.cookies.session || "";    
    auth
    .verifySessionCookie(sessionCookie, true /*check revoked*/)
    .then((decodedStuff) => {
        res.send({
            message: "Success. Redirect now",
            details : decodedStuff
        });
    })
    .catch((err) => {
        res.send({
            message : "Failed. Don't redirect"
        });
    })
}