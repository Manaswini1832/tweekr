import {useState, useEffect, useContext} from "react";
import axios from "axios";
import {AllTagsContext} from "../../contexts/AllTagsContext/AllTagsContext";
import {SearchTweetIdsContext} from "../../contexts/SearchTweetIdsContext/SearchTweetIdsContext";

const Tags = (props) => {

const [showTagsForm, setShowTagsForm] = useState(false);
const [showEditForm, setShowEditForm] = useState(false);
const [tagInput, setTagInput] = useState('');
const [beforeEditInput, setBeforeEditInput] = useState('');
const [afterEditInput, setAfterEditInput] = useState('');
const [tags, setTags] = useState([]);

const {allTags, setAllTags, arrMakeUnique, searchTags, setSearchTags, idsAndTags, setIdsAndTags} = useContext(AllTagsContext);
const {searching, setSearching, searchIds, setSearchIds} = useContext(SearchTweetIdsContext);

async function getTags(){
    if(props.tweetID && props.userID && props.collectionID){
try {
    if(props.collectionID !== 0){
        await axios.get(`/api/v1/tags?userID=${props.userID}&tweetID=${props.tweetID}&collectionID=${props.collectionID}`)
        .then((res) => {   
            if(res.data.data.length!==0 && res.data.data[0].tags){
                setTags(res.data.data[0].tags)
                setTags((prevTags) => {
                    return [...prevTags, ...tags];
                })
            }
        })
    }
    } catch (err) {
        console.error(err)
    }}
}

useEffect(() => {
    getTags();
}, []);

// useEffect(() => {
//     console.log(props.searchInput)
//     // if(props.searchInput.length !== 0){
//         // props.searchInput.map((searchQuery) => {
//             if(tags.includes(props.searchInput["label"])){
//                 setSearchIds((prev) => {
//                     return [...prev, props.tweetID]
//                 })
//             }
//         // })
// // }
// }, [props.searchInput])

async function addTags(){
    if(tagInput !== ''){
            await axios.post(`/api/v1/tags`, { 
                tweek_info :{
                    tags : [...tags, tagInput],
                    tweet_id : props.tweetID,
                    user_id : props.userID
                }
            })
            .then((res) => {
                if(res.data.message === "Successfully added tags!"){
                    setTags((prevTag) => {
                        return [...prevTag, tagInput]
                    })
                    setTagInput('');
                    setAllTags((prev) => {
                        return arrMakeUnique([...prev, tagInput])
                    })
                    setSearchTags((prev) => {
                        return [...prev, {
                            "label" : tagInput,
                            "value" : tagInput,
                        }]
                    })
                    let idsTagsObj = idsAndTags;
                    const reqdObjIndex = idsTagsObj.findIndex(x => x.tweet_id === props.tweetID)
                    idsTagsObj[reqdObjIndex]["tags"].push(tagInput)
                    setIdsAndTags(idsTagsObj)
                }else{
                    alert('Couldn\'t add the tag. Please try again!')
                }
            })
}
}

async function editTag(){
    let tagsArr = tags;
    const indexOfEditInp = tags.indexOf(beforeEditInput);
    tagsArr[indexOfEditInp] = afterEditInput;
    makeEditRequest(tagsArr);
    editAllTagsArray();
}

function editAllTagsArray() {
    let tagsArr = allTags;
    let tagIndex = tagsArr.indexOf(beforeEditInput)
    tagsArr[tagIndex] = afterEditInput;
    setAllTags([])
    setAllTags(arrMakeUnique(tagsArr));
    
    let searchTagsArr = searchTags;
    let searchTagIndex = searchTagsArr.findIndex(x => x.label === beforeEditInput);
    searchTagsArr[searchTagIndex]["label"] = afterEditInput;
    searchTagsArr[searchTagIndex]["value"] = afterEditInput;
    setSearchTags([])
    setSearchTags(searchTagsArr);

    let idsTagsObj = idsAndTags;
    const reqdObjIndex = idsTagsObj.findIndex(x => x.tags.includes(beforeEditInput));
    const indexOfTag = idsTagsObj[reqdObjIndex]["tags"].indexOf(beforeEditInput);
    idsTagsObj[reqdObjIndex]["tags"][indexOfTag] = afterEditInput;
    setIdsAndTags(idsTagsObj);
}

async function makeEditRequest(tagsArr){
    await axios.put('/api/v1/tags', {
        tweek_info : { 
            tags :tagsArr,
            tweet_id : props.tweetID,
            user_id: props.userID
        }
    })
    .then((res) => {
        if(res.data.message === "Successfully edited tag!"){
            setShowEditForm(false);
            setTags(tagsArr);
        }else{
            alert("Couldn't edit tag. Please try again!")
        }
    })
}

async function deleteTag(tag){
   await axios.delete(`/api/v1/tags?tagToDelete=${tag}&tweetID=${props.tweetID}&userID=${props.userID}&collectionID=${props.collectionID}`)
   .then((res) => {
       if(res.data.message === "Sucessfully deleted tag!"){
           let filteredTags = tags.filter(eachTag => eachTag!==tag);
           setTags(filteredTags);
           deleteFromAllTagsArray(tag, props.tweetID)
       }else{
           alert('Couldn\'t delete the tag. Please try again!')
       }
   }) 
}

    function deleteFromAllTagsArray(tagToBeDeleted, tweetIDReceived){
        let filteredTags = allTags.filter(eachTag => eachTag!==tagToBeDeleted);
        setAllTags(arrMakeUnique(filteredTags));

        let searchTagsFiltered = searchTags.filter(eachTag => eachTag["label"]!==tagToBeDeleted);
        setSearchTags(arrMakeUnique(searchTagsFiltered));

        let idsTagsArr = idsAndTags;
        idsTagsArr.forEach((entry) => {
            if(entry["tags"].includes(tagToBeDeleted)){
                //Delete that tag
                entry["tags"] = entry["tags"].filter(eachTag => eachTag!==tagToBeDeleted);
            }
        })
        setIdsAndTags(idsTagsArr)
    }


   return(
       <div>
        <button onClick={() => {
             setShowTagsForm(true)
         }}>Tags +</button>
         {
             showTagsForm
             ? <form>
                 <input onChange={(e) => setTagInput(e.target.value)} value={tagInput}></input>
                 <button type="submit" onClick = {(e) => {
                     e.preventDefault();
                     setShowTagsForm(false);
                     if(tagInput) {
                         //Checking if tag already exists or not
                         if(!tags.includes(tagInput)) {
                            addTags();
                         }
                     }
                 }}>Done</button>
                 <button onClick={(e) => {e.preventDefault();setShowTagsForm(false)}}>Cancel</button>
             </form>
             : null
         }
         {  
             tags.map((tag, index) => {
                 return(
                     <div key={index}>
                     <p>
                         {tag}
                         <button onClick={() => {
                            setBeforeEditInput(tag);
                            setAfterEditInput(tag);
                            setShowEditForm(true)
                         }}>
                             Edit
                         </button>
                         <button onClick={() => deleteTag(tag)}>
                             -
                         </button>
                         </p>
                     </div>
                 )
             })
         }
         {
             showEditForm
             ? <form onSubmit={(e) => {
                 e.preventDefault();
                 editTag();
                 } }>
                 <input onChange={(e) => setAfterEditInput(e.target.value)} type="text" value={afterEditInput}/>
                 <button type="submit">Done</button>
             </form>
             : null
         }
       </div>
   ) 
}

export default Tags;