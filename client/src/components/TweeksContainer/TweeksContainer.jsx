import { set } from "js-cookie";
import { useState, useEffect, useContext } from "react";

import "./TweeksContainer.css";

import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";
import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext"
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

import Tweek from "../Tweek/Tweek";
import Loading from "../Loading/Loading";
import Modal from "../Modal/Modal";

const TweeksContainer = () => {

    const [tweetIds, setTweetIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [newCollec, setNewCollec] = useState(null);
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);
    const firebase = useContext(BaseContext);
    const user = useContext(AuthContext);
    const db = firebase.db;

    useEffect(() => {
        setTweetIds([]);
        setLoading(true);
        if(currColl === "Uncategorized") {
            getUncatTweets();
        }
    }, [currColl]);

    async function getUncatTweets(){

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

    function removeTweet(id){
        const arrToBeDeleted = tweetIds.filter(tweetId => tweetId !== id);
        setTweetIds([]);
        setTweetIds(arrToBeDeleted);
    }

    function makePgRequest(collec, id){
        console.log("Will make a request to the PG DB");
        removeTweet(id);
    }

    function handleNewCollecChange(e){
        setNewCollec(e.target.value);
    }

    function createCollection(e){
        e.preventDefault();
        if(newCollec && newCollec !== ""){
            console.log("Will create new collection");
            console.log(newCollec);
        }else if(newCollec === ""){
            alert("Please enter a collection name");
        }else if(!newCollec){
            alert("Please enter a collection name");
        }
    }

    return(
        <div>
            <button onClick={() => setModalOpen(true)}>New Collection</button>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <form onSubmit={createCollection}>
                    <label>Enter a new collection name</label>
                    <input onChange={handleNewCollecChange} type="text"/>
                    <div className="button-div">
                        <button type="submit">Create</button>
                        <button onClick={() => setModalOpen(false)}>Cancel</button>
                    </div>
                </form>
            </Modal>
            <h1>Tweeks here from {currColl}</h1>
            {
                tweetIds.map((id, index) => {
                    return(
                        <div className="tweek-box" key={id}>
                            <Tweek tweetID={id} />
                            <select onChange={(e) => {
                                makePgRequest(e.target.value, id);
                            }}>
                                <option defaultValue disabled>Move to</option>
                                {
                                    collecNames.map((collecName, index) => {
                                        if(collecName !== currColl){
                                            return(
                                                <option key={index}>{collecName}</option>
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