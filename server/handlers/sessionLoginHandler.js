const { auth } = require("../utils/admin");

exports.sessionLoginHandler = (req, res) => {
    const idToken = req.body.idToken.toString();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; //5 days
    auth
    .createSessionCookie( idToken, { expiresIn } )
    .then((sessionCookie) => {
        const options = { maxAge : expiresIn, httpOnly : true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status : "success" }))
        console.log("Cookie set!")
    },
    (error) => {
        res.status(401).send("UNAUTHORIZED REQUEST!");
    })
 }