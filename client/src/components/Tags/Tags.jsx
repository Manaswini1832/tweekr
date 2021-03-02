import {useState} from "react";
import axios from "axios";

const Tags = (props) => {

const [showTagsForm, setShowTagsForm] = useState(false);
const [tagInput, setTagInput] = useState(null);
const [tags, setTags] = useState([]);

async function addTags(){
    await axios.put(`/api/v1/addTags`, { 
        tweek_info :{
            tags : [tagInput],
            tweet_id : props.tweetID
        }
    })
    .then((res) => {
        console.log(res)
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
                 <input onChange={(e) => setTagInput(e.target.value)}></input>
                 <button onClick = {() => {
                     setShowTagsForm(false);
                     if(tagInput) {
                         console.log('Will make request')
                         addTags();
                     }
                 }}>Done</button>
             </form>
             : null
         }
       </div>
   ) 
}

export default Tags;