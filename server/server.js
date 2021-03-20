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
    // if(req.body.userInfo.auth){
        const user_id = req.body.userInfo.auth?.uid;
        //ON CONFLICT DO NOTHING ensures that user_id stays unique and we don't keep on adding the same user to table again & again
        // console.log("Got till here")
        
       if(user_id){
        await postgresDb.query(
            "INSERT INTO users (user_id, plan) VALUES ($1, $2) ON CONFLICT ON CONSTRAINT users_user_id_key DO NOTHING", [user_id, 'free'])
        .then(async(data) => {
            // console.log("Got inside")
            res.send({
                "message" : "Success",
                data : data.rows
            })
        })
        .catch((err) => {
            console.log("Catch")
            console.error(err);
            res.send({
                "message" : "Failure! Couldn't retrieve collections. Please try again!"
            })
        });
       } 
    // }
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
        // console.log(user_id);
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

    //Move tweeks to different collections
app.post("/api/v1/moveTweek", async(req, res) => {
    try {
        const tweet_id = req.body.tweek_info.tweet_id;
        const user_id = req.body.tweek_info.user_id;
        const collection_id = req.body.tweek_info.collection_id;
        const currCollectionName = req.body.tweek_info.curr_collection_name;
        if(currCollectionName === 'Uncategorized') {
        //If this request came from Uncat collection, make a new entry in tweeks table
           await postgresDb.query("INSERT INTO tweeks (tweet_id, user_id, collection_id) VALUES ($1,$2,$3)",
           [tweet_id, user_id, collection_id])
           .then(() => {
                res.json({
                    "message" : "Successfully moved tweek!"
                })
           }) 
           .catch((err) => {
               res.json({
                   "message" : "Failed to move tweek. Please try again!"
               })
               console.error(err)
           })

            }else{
            //If this request didn't come from Uncat collection, update collection_id entry instead of creating a new entry for the moved tweek in the tweeks table
            await postgresDb.query("UPDATE tweeks SET collection_id = $1 WHERE user_id=$2 AND tweet_id = $3",
            [collection_id, user_id, tweet_id])
                .then(async() => {
                    res.json({
                        "message" : "Successfully moved tweek!",
                    })

                    //delete from current collection
                })
                .catch((err) => {
                    res.json({
                        "message" : "Failed to move tweek. Please try again!"
                    })
                    console.error(err);
                })
        }

    } catch (err) {
        console.error(err);
        res.send("Error moving tweek into a collection! Please try again");
    }
});

//Create tweek
app.post('/api/v1/createTweek', async(req, res) => {
    try {
        const tweet_id = req.body.tweek_info.tweet_id;
        const user_id = req.body.tweek_info.user_id;
        const collection_id = req.body.tweek_info.collection_id;
        await postgresDb.query("INSERT INTO tweeks (tweet_id, user_id, collection_id) VALUES ($1, $2, $3)", [tweet_id, user_id, collection_id])
            .then(() => {
                res.json({
                    "message" : "Successfully created tweek!",
                })
            })
            .catch((err) => {
                res.json({
                    "message" : "Failed to create tweek. Please try again!"
                })
                console.error(err);
            })
    } catch (err) {
        res.json({
            'message' : 'Failed to create a tweek. Please try again!'
        })
        console.error(err)
    }
})

//Get tweeks
app.get("/api/v1/tweeks", async(req, res) => {
    try {
        const collection_id = req.query.collection_id;
        const user_id = req.query.user_id;
        console.log(collection_id, user_id)
        await postgresDb.query("SELECT tweek_serial_number, tweet_id, tweeks.user_id, tweeks.collection_id FROM tweeks WHERE tweeks.user_id = $1 AND tweeks.collection_id = $2 ORDER BY tweek_serial_number ASC", [user_id, collection_id])
                .then((response) => {
                    res.json({
                        "message" : "Successfully retrieved tweeks!",
                        payload : response.rows
                    })
                })
                .catch((err) => {
                    res.json({
                        "message" : "Failed to retrieve tweeks. Please try again!"
                    })
                    console.error(err);
                })
    } catch (err) {
        console.error(err)
    }
});

// //Get tags
// app.get("/api/v1/tags", async(req, res) => {
//     const userID = req.query.userID;
//     const tweetID = req.query.tweetID;
//     const collectionID = req.query.collectionID;
//     try {
//         await postgresDb.query("SELECT tweeks.tags FROM tweeks WHERE tweeks.user_id = $1 AND tweeks.tweet_id = $2 AND tweeks.collection_id=$3", [userID, tweetID, collectionID])
//         .then((response) => {
//             res.json({
//                 "message" : "Successfully retrieved tags!",
//                 "data" : response.rows 
//             })
//         })
//     } catch (err) {
//         console.error(err)
//     }
// })

// //Create tags
// app.post("/api/v1/tags", async(req, res) => {
//     const tags = req.body.tweek_info.tags;
//     const tweet_id = req.body.tweek_info.tweet_id;
//     const user_id = req.body.tweek_info.user_id;
//     try {
//         await postgresDb.query('UPDATE tweeks SET tags=$1 WHERE tweet_id=$2 AND user_id=$3', [tags, tweet_id, user_id])
//         .then((response) => {
//             res.json({
//                 'message' : 'Successfully added tags!'
//             })
//         })
//         .catch((err) => {
//             res.json({
//                 'message' : 'Failed to add tags. Please try again!'
//             })
//         })
//     } catch (err) {
//         console.error(err)
//     }
// })

// //Edit tag
// app.put("/api/v1/tags", async(req, res) => {
//     const tags = req.body.tweek_info.tags;
//     const tweet_id = req.body.tweek_info.tweet_id;
//     const user_id = req.body.tweek_info.user_id;
//     try {
//         await postgresDb.query('UPDATE tweeks SET tags=$1 WHERE tweet_id=$2 AND user_id=$3', [tags, tweet_id, user_id])
//         .then((response) => {
//             res.json({
//                 'message' : 'Successfully edited tag!'
//             })
//         })
//         .catch((err) => {
//             res.json({
//                 'message' : 'Failed to edit tag. Please try again!'
//             })
//         })
//     } catch (err) {
//         console.error(err)
//     }
// })

// //Delete tag
// app.delete("/api/v1/tags", async(req, res) => {
//     const tagToDelete = req.query.tagToDelete;
//     const tweet_id = req.query.tweetID;
//     const user_id = req.query.userID;
//     const collection_id = req.query.collectionID;
//     try{
//         await postgresDb.query("UPDATE tweeks SET tags=array_remove(tags, $1) WHERE tweeks.tweet_id=$2 AND tweeks.user_id=$3 AND tweeks.collection_id=$4",
//         [tagToDelete, tweet_id, user_id, collection_id]
//         ).then((response) => {
//             res.json({
//                 "message" : "Sucessfully deleted tag!"
//             })
//         })
//         .catch((err) => {
//             res.json({
//                 "message" : "Failed to delete tag. Please try again!"
//             })
//         })
//     }catch(err){
//         console.error(err)
//     }
// })

// //To get all the tags in a collection
// app.get("/api/v1/getAllTags", async(req, res) => {
//     const userID = req.query.userID;
//     const collectionID = req.query.collectionID;
//     console.log(userID, collectionID)
//     try{
//         await postgresDb.query("SELECT tweet_id,tags FROM tweeks WHERE tweeks.user_id=$1 AND tweeks.collection_id=$2", 
//         [userID, collectionID]
//         ).then((response) => {
//             console.log(response.rows)
//             res.json({
//                 "message" : "Successfully received all tags!",
//                 "data" : response.rows 
//             })
//         })
//         .catch((err) => {
//             res.json({
//                 "message" : "Failed to retrieve all tags"
//             })
//         })
//     }catch(err){
//         console.error(err)
//     }
// })

app.delete(`/api/v1/tweeks`, async(req, res) => {
    const tweetID = req.query.tweetID;
    const collectionID = req.query.collectionID;
    const userID = req.query.userID;
    try
    {await postgresDb.query("DELETE FROM tweeks WHERE tweet_id=$1 AND user_id=$2 AND collection_id=$3",
    [tweetID, userID, collectionID]
    )
    .then((response) => {
        res.json({
            "message" : "Successfully deleted tweek!"
        })
    })
    .catch((err) => {
        res.json({
            "message" : "Failure! Couldn't delete tweek. Please try again!"
        })
    })}
    catch(err){
        console.error(err)
    }
})

//Listening on port
app.listen(PORT, (req, res) => {
    console.log(`Server up and running on port ${PORT}`);
});