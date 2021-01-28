exports.signOutHandler = (req, res) => {
    res.clearCookie("session");
    res.send("Redirect back to login");
}