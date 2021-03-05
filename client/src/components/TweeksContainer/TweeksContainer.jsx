import { useState, useEffect, useContext } from "react";
import axios from "axios";

import "./TweeksContainer.css";

import { AuthContext } from "../../contexts/AuthContext/AuthContext";
import { BaseContext } from "../../contexts/BaseContext/BaseContext";
import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext";
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

import Tweek from "../Tweek/Tweek";
import Loading from "../Loading/Loading";
import Modal from "../Modal/Modal";
import Tags from "../Tags/Tags";
import { set } from "js-cookie";

const TweeksContainer = (props) => {

    const [tweetIds, setTweetIds] = useState([]);
    const [searchTweetIds, setSearchTweetIds] = useState([]);
    const [searchTweetsDisplay, setSearchTweetDisplay] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [newCollec, setNewCollec] = useState(null);
    const [noTweeks, setNoTweeks] = useState(false);
    const [search, setSearch] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [getAllTags, setGetAllTags] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const {auth, setAuth} = useContext(AuthContext);
    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);
    const firebase = useContext(BaseContext);
    const db = firebase.db;

    //This function helps make all elements in an array unique
    function arrMakeUnique(array){
        return Array.from(new Set(array))
    }

    useEffect(() => {
        setTweetIds([]);
        setAllTags([]); 
        setLoading(true);
        if(currColl[0].collection_name === "Uncategorized") {
            getUncatTweets();
            setSearchTweetDisplay(false);
        }else{
            getCollecTweeks();
        }
    }, [currColl]);

    useEffect(() => {
        if(props.addTweek && props.twID){
            //If this tweet id is already in the page, do nothing
            //If not, add it to tweetIds array
            const alreadyPresent = tweetIds.includes(props.twID);
            if(!alreadyPresent) {
                setTweetIds((prev) => {
                    return [...prev, props.twID];
                })
            }else{
                console.log('Won\'t do anything because the tweet is already present')
            }
        }
    }, [props.twID]);

    useEffect(() => {
        if(search){
            setGetAllTags(true)
        }
    }, [search])

    function changeSearch(arg){
        if(arg === 'Make true'){
            setSearch(true)
        }else{
            setSearch(false)
        }
    }

    function changeGetAllTags(arg){
        if(arg === 'Make true'){
                setGetAllTags(true)
        }else{
            setGetAllTags(false)
        }
    }

    async function getUncatTweets(){
        let tweeksArray = [];
        await db.collection(auth.uid).where('category', '==', 'Uncategorized').get()
        .then(function (querySnapshot) {
            querySnapshot.forEach(function (doc) {
                tweeksArray.push(doc.id);
            });
        });

        setTweetIds(tweeksArray);
        setLoading(false);

        if(tweeksArray.length === 0){
            //Try getting from postgres as well
            getCollecTweeks();
        }else{
            setNoTweeks(false);
        }
    }

    async function getCollecTweeks(){
        await axios.get(`/api/v1/tweeks/?collection_id=${currColl[0].collection_id}&user_id=${auth.uid}`)
        .then((res) => {
            if(res.data.payload.length === 0){
                setLoading(false);
                setNoTweeks(true);
            }else{
                setNoTweeks(false);
                let tweeksArray = [];
                const dataReceived = res.data.payload;
                dataReceived.map((tweek) => {
                    tweeksArray.push(tweek.tweet_id);
                });
                setTweetIds(tweeksArray);
                setLoading(false);
            }
        })
    }

    function removeTweet(id){
        const arrToBeDeleted = tweetIds.filter(tweetId => tweetId !== id);
        setTweetIds([]);
        setTweetIds(arrToBeDeleted);
    }

    async function makePgRequest(idOfCollection, idOfTweet){
            try {
                if(idOfCollection !== "0"){
                    await axios.post("/api/v1/moveTweek", {
                        tweek_info :{
                            tweet_id : idOfTweet,
                            user_id : auth.uid,
                            collection_id : idOfCollection,
                        }
                    })
                    .then((res) => {
                        if(res.data.message === "Successfully moved tweek!"){
                            //delete from firestore and then remove tweet from array
                            deleteFirestoreTweek(idOfTweet);
                        }else{
                            alert("Couldn't move tweet! Please try again!")
                        }
                    })
                    .catch((err) => {
                        alert("Encountered an error moving tweet. Please try again!")
                    })
                }else if(idOfCollection === "0"){
                    alert("Can't move tweeks into Uncategorized again! Try moving them into other collections")
                }
            } catch (error) {
                console.error(error);
            }
    }

    async function deleteFirestoreTweek(idOfTweet){
        await db.collection(auth.uid).doc(idOfTweet).delete()
        .then(() =>{
            removeTweet(idOfTweet);
        })
        .catch((err) => {
            console.log("Couldn't delete from Firestore!")
        })
    }

    function handleNewCollecChange(e){
        setNewCollec(e.target.value);
    }

    async function createCollection(e){
        e.preventDefault();
        if(newCollec && newCollec !== ""){
            if(newCollec === "Uncategorized"){
                alert("A collection with this name can't be created!")
            }else{
                //Make request to API to create a new collection
            await axios.post("/api/v1/collections", {
                collectionInfo : {
                    collection_name : newCollec,
                    user_id : auth.uid,
                }
            })
            .then((res) => {
                if(res.data.message === "Success! Collection created successfully!"){
                    setCollecNames((prev) => {
                        return[...prev, ...res.data.payload]
                    });
                    setModalOpen(false);
                    setCurrColl(res.data.payload);
                }else{
                    alert(res.data.message);
                }
            })
            .catch((err) => {
                alert("Error creating collection! Please try again!")
            })
            }
            
        }else if(newCollec === ""){
            alert("Please enter a collection name");
        }else if(!newCollec){
            alert("Please enter a collection name");
        }
    }

    function prepAllTagsArray(tagsArrFromTagsComponent, tweetIDReceived){
        // console.log(tagsArrFromTagsComponent);
        // console.log(tweetIDReceived);
        setAllTags((prev) => {
            return arrMakeUnique([...prev, ...tagsArrFromTagsComponent]);
        })
    }

    function addChangesAllTagsArray(newTag, tweetIDReceived){
        setAllTags((prev) => {
            return arrMakeUnique([...prev, newTag]);
        })
    }

    function editAllTagsArray(oldTag, editedTag, tweetIDReceived){
        let tagsArr = allTags;
        let tagIndex = tagsArr.indexOf(oldTag)
        tagsArr[tagIndex] = editedTag;
        setAllTags([])
        setAllTags(arrMakeUnique(tagsArr));
    }

    function deleteFromAllTagsArray(tagToBeDeleted, tweetIDReceived){
        let filteredTags = allTags.filter(eachTag => eachTag!==tagToBeDeleted);
        setAllTags(arrMakeUnique(filteredTags));
    }

    function createSearchTweetIds(id){
        setSearchTweetIds([]);
        console.log(id)
        setSearchTweetIds((prev) => {
            return arrMakeUnique([...prev, id]);
        });
        console.log(id)
    }
    useEffect(() => {
        if(searchInput === 'All'){
                setSearchTweetDisplay(false)
            }else{
                setSearchTweetDisplay(true)
            }
    }, [searchInput]);

    useEffect(() => {
        console.log(searchTweetIds)
    }, [searchTweetIds])

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
            <h1>Tweeks here from {currColl[0].collection_name}</h1>
            {
            noTweeks
            ? <h1>No tweeks exist in this collection</h1>
            : null 
            }

            {
                !noTweeks && currColl[0].collection_name !== 'Uncategorized'
               ? <div>
                    <label htmlFor="tag-select">Filter using tags</label>
                    <select id="tag-select" 
                    onFocus={() => {
                        setSearch(true)
                    }} 
                    onChange={(e) => {
                        const selectedIndex = e.target.options.selectedIndex;
                        let searchInp = e.target.options[selectedIndex].innerText;
                        setSearchInput(searchInp);
                        // takeCareOfTweetDisplay(searchInp);
                    }}
                    onBlur={() => {setSearch(false);setShowAllTags(false)}}
                    >
                    <option>All</option>
                    {
                        allTags.map((eachTag, index) => {
                                return(<option key={index}>{eachTag}</option>)
                            })
                    }
                    </select> 
               </div>
                : null
            }
            {
                    searchTweetsDisplay
                    ?searchTweetIds.map((id, index) => {
                    return(
                        <div className="tweek-box" key={index}>
                            <Tweek tweetID={id} />
                            <select onChange={(e) => {
                                const selectedIndex = e.target.options.selectedIndex;
                                const collection_id = e.target.options[selectedIndex].getAttribute("data-collectionid");
                                if(collection_id !== currColl[0].collection_id){
                                    makePgRequest(collection_id, id);
                                }
                            }}>
                                <option>Move into</option>
                                {
                                    collecNames.map((collec, index) => {
                                        if(collec.collection_name){
                                            return(
                                                <option key={index} data-collectionid={collec.collection_id}>{collec.collection_name}</option>
                                            )
                                        }
                                    })
                                }
                            </select>
                            <Tags 
                            prepAllTagsArray={prepAllTagsArray} 
                            addChangesAllTagsArray={addChangesAllTagsArray} 
                            editAllTagsArray={editAllTagsArray} 
                            deleteFromAllTagsArray={deleteFromAllTagsArray} 
                            getAllTags={getAllTags} 
                            userID={auth.uid} 
                            tweetID={id} 
                            changeSearch={changeSearch} 
                            changeGetAllTags={changeGetAllTags} 
                            collectionID={currColl[0].collection_id}
                            searchInput={searchInput} 
                            createSearchTweetIds={createSearchTweetIds} 
                            />
                        </div>
                    )
                })
                    :tweetIds.map((id, index) => {
                    return(
                        <div className="tweek-box" key={index}>
                            <Tweek tweetID={id} />
                            <select onChange={(e) => {
                                const selectedIndex = e.target.options.selectedIndex;
                                const collection_id = e.target.options[selectedIndex].getAttribute("data-collectionid");
                                if(collection_id !== currColl[0].collection_id){
                                    makePgRequest(collection_id, id);
                                }
                            }}>
                                <option>Move into</option>
                                {
                                    collecNames.map((collec, index) => {
                                        if(collec.collection_name){
                                            return(
                                                <option key={index} data-collectionid={collec.collection_id}>{collec.collection_name}</option>
                                            )
                                        }
                                    })
                                }
                            </select>
                            <Tags 
                            prepAllTagsArray={prepAllTagsArray} 
                            addChangesAllTagsArray={addChangesAllTagsArray} 
                            editAllTagsArray={editAllTagsArray} 
                            deleteFromAllTagsArray={deleteFromAllTagsArray} 
                            getAllTags={getAllTags} 
                            userID={auth.uid} 
                            tweetID={id} 
                            changeSearch={changeSearch} 
                            changeGetAllTags={changeGetAllTags} 
                            collectionID={currColl[0].collection_id}
                            searchInput={searchInput} 
                            createSearchTweetIds={createSearchTweetIds} 
                            />
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