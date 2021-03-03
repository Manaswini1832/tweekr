import {useState, useEffect} from "react";
import axios from "axios";

const Tags = (props) => {

const [showTagsForm, setShowTagsForm] = useState(false);
const [showEditForm, setShowEditForm] = useState(false);
const [tagInput, setTagInput] = useState('');
const [editInput, setEditInput] = useState('');
const [tags, setTags] = useState([]);

async function getTags(){
    if(props.tweetID && props.userID && props.collectionID){
try {
        await axios.get(`/api/v1/tags?userID=${props.userID}&tweetID=${props.tweetID}&collectionID=${props.collectionID}`)
        .then((res) => {
            if(res.data.data[0].tags){
                setTags(res.data.data[0].tags)
                setTags((prevTags) => {
                    return [...prevTags, ...tags];
                })
            }
            
            // setTags(res.data.data[0])
        })
    } catch (err) {
        console.error(err)
    }}
}

useEffect(() => {
    getTags();
}, []);

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
                    setTagInput('')
                }else{
                    alert('Couldn\'t add the tag. Please try again!')
                }
            })
}
}

async function editTag(){
    console.log(editInput);
}

async function deleteTag(tag){
   await axios.delete(`/api/v1/tags?tagToDelete=${tag}&tweetID=${props.tweetID}&userID=${props.userID}&collectionID=${props.collectionID}`)
   .then((res) => {
       if(res.data.message === "Sucessfully deleted tag!"){
           let filteredTags = tags.filter(eachTag => eachTag!==tag);
           setTags(filteredTags);
       }else{
           alert('Couldn\'t delete the tag. Please try again!')
       }
   }) 
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
                            setEditInput(tag);
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
                 <input onChange={(e) => setEditInput(e.target.value)} type="text" value={editInput}/>
                 <button type="submit">Done</button>
             </form>
             : null
         }
       </div>
   ) 
}

export default Tags;