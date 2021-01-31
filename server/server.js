require('dotenv').config();

const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const express = require("express");
const cors = require("cors");

const postgresDb = require("./postgresDb");
const { auth } = require("./utils/admin");

//CSRF Middleware to create a csrf token
const csrfMiddleware = csrf({ cookie : true });

//Custom middleware
const xsrfCreator = require("./middleware/xsrfCreator");

//Request handlers
const { sessionLoginHandler } = require("./handlers/sessionLoginHandler"); 
const { validateEntryHandler } = require("./handlers/validateEntryHandler");
const { signOutHandler } = require("./handlers/signOutHandler");

const PORT = 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(cors());

//Middleware to create XSRF token for every endpoint
app.all('*', xsrfCreator);

app.get("/", (req, res) => {
    res.send("Hey there:)")
})

//To log users in by creating the session cookie and stuff
app.post("/api/v1/sessionLogin", sessionLoginHandler);

//Called everytime some one enters a private route
app.get("/api/v1/validateEntry", validateEntryHandler);

//To sign the user out
app.get("/api/v1/signOut", signOutHandler);

//Postgres DB routes
/*Get tweet details from database : tweet id, collection_id, note and the tags array*/
app.get("/api/v1/tweek", async(req, res) => {
    try {
        const response = await postgresDb.query("SELECT * FROM tweeks");
        const data = response.rows;
        res.json({
            "data" : data
        });
    } catch (err) {
        console.error(err);
    }
});

/*Store tweet id, collection_id notes and tags in the database*/
app.post("/api/v1/tweek", async(req, res) => {
    try {
        const input = req.body;
        const tweetInfo = input.tweetInfo;
        await postgresDb.query("INSERT INTO tweeks (tweet_id, note, tags) VALUES ($1, $2, $3)", [tweetInfo.tweet_id, tweetInfo.note, tweetInfo.tags])
        .then(() => {
            res.json({
                "message" : "Success! Tweek added to the database :)"
            });
        })
        .catch((err) => {
            console.error(err);
            res.json({
                "message" : "Failure! Couldn't add Tweek to the database :( Please try again!"
            });
        });
    } catch (err) {
        console.error(err);
    }
});

/*Edit note and tags CANNOT EDIT TWEET_ID REMEMBER*/
app.put("/api/v1/tweek/:id", async(req, res) => {
    try {
        const tweekSerialNumber = req.params.id;
        const changes = req.body.tweetInfo;
        const note = changes.note;
        const tags = changes.tags;
        const collection_id = changes.collection_id;

        await postgresDb.query(
            "UPDATE tweeks SET note = $1, tags = $2 collection_id=$3 WHERE id = $4",
            [note, tags, collection_id, tweekSerialNumber]
        )
        .then(() => {
            res.json({
                "message" : "Success! Tweek updated"
            })
        })
        .catch((err) => {
            console.error(err);
            res.json({
                "message" : "Failure! Couldn't update Tweek. Please try again!"
            })
        });
    } catch (err) {
        console.error(err);
    }
});

/*Delete tweet totally from postgresDb*/
app.delete("/api/v1/tweek/:id", async(req, res) => {
    try {
        const tweekSerialNumber = req.params.id;
        await postgresDb.query("DELETE FROM tweeks WHERE id = $1", [tweekSerialNumber])
        .then(() => {
            res.json({
                "message" : "Success! Tweek successfully deleted"
            });
        })
        .catch((err) => {
            console.error(err);
            res.json({
                "message" : "Failure! Couldn't delete Tweek. Please try again!"
            });
        });
    } catch (err) {
        console.error(err);
    }
});

/*Create a new collection*/
app.post("/api/v1/collections", async(req, res) => {
    try {
        const collection_name = req.body.collectionInfo.collection_name;
        console.log(collection_name);
        await postgresDb.query("INSERT INTO collections (collection_name) VALUES ($1)", [collection_name])
        .then(() => {
            res.json({
                "message" : "Success! Collection created successfully!"
            });
        })
        .catch((err) => {
            console.error(err);
        });
    } catch (err) {
        console.error(err);
    }
});

/*Edit collection name*/
app.put("/api/v1/collections/:collection_id", async(req, res) => {
    try {
        const collection_id = req.params.collection_id;
        const changedCollectionName = req.body.collectionInfo.collection_name;
        await postgresDb.query(
            "UPDATE collections SET collection_name = $1 WHERE collection_id = $2",
            [changedCollectionName, collection_id]
        )
        .then(() => {
            res.json({
                "message" : "Success! Successfully modified collection :)"
            })
        })
        .catch((err) => {
            res.json({
                "message" : "Failure! Couldn't update collection. Please try again!"
            })
        });
    } catch (err) {
        console.error(err);
    }
});

/*Get all collection names*/
app.get("/api/v1/collections", async(req, res) => {
    try {
        const response = await postgresDb.query("SELECT * FROM collections")
        res.json({
                "message" : "Success! Got all collections :)",
                "collections" : response.rows
            })
    } catch (err) {
        console.error(err);
    }
});

/*Delete collection*/
app.delete("/api/v1/collections/:collection_id", async(req, res) => {
    try {
        const collection_id = req.params.collection_id;
        await postgresDb.query("DELETE FROM collections WHERE collection_id = $1", [collection_id])
        .then(() => {
            res.json({
                "message" : "Successfully deleted collection :)",
            })
        })
        .catch((err) => {
            res.json({
                "message" : "Failed to delete. Please try again!"
            })
            console.error(err);
        })
    } catch (err) {
        console.error(err);
    }
});

//Listening on port
app.listen(PORT, (req, res) => {
    console.log(`Server up and running on port ${PORT}`);
});