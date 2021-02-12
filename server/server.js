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

app.get("/api/v1", (req, res) => {
    console.log("Stray route");
});

//To log users in by creating the session cookie and stuff
app.post("/api/v1/sessionLogin", sessionLoginHandler);

//Called everytime some one enters a private route
app.get("/api/v1/validateEntry", validateEntryHandler);

//To sign the user out
app.get("/api/v1/signOut", signOutHandler);

//Sets user details in postgres DB
app.post("/api/v1/setUser", async(req, res) => {
    if(req.body.userInfo.auth){
        const user_id = req.body.userInfo.auth.uid;
        //ON CONFLICT DO NOTHING ensures that user_id stays unique and we don't keep on adding the same user to table again & again
        await postgresDb.query(
            "INSERT INTO users (user_id, plan) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user_id, 'free'])
        .then((data) => {
            res.send({
                "message" : "Success",
                data : data.rows
            })
        })
        .catch((err) => {
            console.error(err);
            res.send({
                "message" : "Failure! Couldn't retrieve collections. Please try again!"
            })
        });
    }
})

//Retrieve all collections
app.get("/api/v1/collections/:user_id", async(req, res) => {
    const user_id = req.params.user_id 
    await postgresDb.query(
                    "SELECT collection_id, collection_name FROM collections WHERE user_id = $1", [user_id]
                )
                .then((data) => {
                    res.send({
                        "message" : "Success",
                        data : data.rows
                    })
                })
                .catch((err) => {
                    console.error(err);
                    res.send({
                        "message" : "Failure! Couldn't retrieve collections. Please try again!"
                    })
                });
});

//Create a new collection
app.post("/api/v1/collections", async(req, res) => {
    try {
        const collection_name = req.body.collectionInfo.collection_name;
        const user_id = req.body.collectionInfo.user_id
        console.log(user_id);
        await postgresDb.query("INSERT INTO collections (collection_name, user_id) VALUES ($1, $2) RETURNING collection_id, collection_name, user_id", [collection_name, user_id])
        .then((response) => {
            res.json({
                "message" : "Success! Collection created successfully!",
                "payload" : response.rows
            });
        })
        .catch((err) => {
            console.error(err);
            res.json({
                "message" : "Failure! Couldn't create collection!",
            });
        });
    } catch (err) {
        console.error(err);
    }
});

//Edit collection name
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

//Delete collection
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

app.post("/api/v1/moveTweek", async(req, res) => {
    try {
        const tweet_id = req.body.tweek_info.tweet_id;
        const user_id = req.body.tweek_info.user_id;
        const collection_id = req.body.tweek_info.collection_id;
        await postgresDb.query("INSERT INTO tweeks (tweet_id, user_id, collection_id) VALUES ($1, $2, $3)", [tweet_id, user_id, collection_id])
            .then(() => {
                res.json({
                    "message" : "Successfully moved tweek!",
                })
            })
            .catch((err) => {
                res.json({
                    "message" : "Failed to move tweek. Please try again!"
                })
                console.error(err);
            })

    } catch (err) {
        console.error(err);
        res.send("Error moving tweek into a collection! Please try again");
    }
});

app.get("/api/v1/tweeks", async(req, res) => {
    try {
        const collection_id = req.query.collection_id;
        const user_id = req.query.user_id;
        await postgresDb.query("SELECT tweek_serial_number, tweet_id, tweeks.user_id, tweeks.collection_id FROM tweeks WHERE tweeks.user_id = $1 AND tweeks.collection_id = $2", [user_id, collection_id])
                .then((response) => {
                    res.json({
                        "message" : "Successfully moved tweek!",
                        payload : response.rows
                    })
                })
                .catch((err) => {
                    res.json({
                        "message" : "Failed to move tweek. Please try again!"
                    })
                    console.error(err);
                })
    } catch (err) {
        console.error(err)
    }
});

//Listening on port
app.listen(PORT, (req, res) => {
    console.log(`Server up and running on port ${PORT}`);
});