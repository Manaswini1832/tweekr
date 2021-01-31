import { set } from "js-cookie";
import { useState, useEffect, useContext } from "react";

import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";
import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext"
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

import Tweek from "../Tweek/Tweek";
import Loading from "../Loading/Loading";

const TweeksContainer = () => {

    const [tweetIds, setTweetIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);
    const firebase = useContext(BaseContext);
    const user = useContext(AuthContext);
    const db = firebase.db;

    useEffect(() => {
        setTweetIds([]);
        setLoading(true);
        if(currColl === "Uncategorized") {
            anything();
        }
    }, [currColl]);

    async function anything(){

        let tweeksArray = [];
        await db.collection(user.auth.uid).where('category', '==', 'Uncategorized').get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tweeksArray.push(doc.id);
            });
        });

        setTweetIds(tweeksArray);
        setLoading(false);
    }

    function makePgRequest(collec, id){
        console.log("Will make a request to the PG DB");
    }

    function removeTweet(id){
        console.log(id)
        const tweetIdsDup = tweetIds;
        let dummyArray = tweetIdsDup.filter(item => item !== id);
        console.log(dummyArray);
        setTweetIds([]);
        setTweetIds([...dummyArray]);
        console.log(dummyArray)
    }

    return(
        <div>
            <h1>Tweeks here from {currColl}</h1>
            {
                tweetIds.map((id, index) => {
                    return(
                        <div key={index}>
                            <Tweek tweetID={id} />
                            <p>{id}</p>
                            <label htmlFor="collection names">Move to</label>
                            <select onChange={(e) => {
                                const selectedCollec = e.target.value;
                                const tweetId = id;
                                makePgRequest(selectedCollec, tweetId);
                                console.log(tweetId)
                                removeTweet(tweetId);
                            }} name="collection names" id="collection names">
                                {
                                    collecNames.map((collec, index) => {
                                        if(collec !== currColl) {                                            
                                            return(
                                                <option key={index} value={collec}>{collec}</option>
                                            )
                                        }
                                    })
                                }
                            </select>
                        </div>
                    )
                })
            }
            {
                loading
                ? <Loading />
                : null
            }
        </div>
    )
}

export default TweeksContainer;