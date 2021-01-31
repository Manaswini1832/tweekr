import React, { useState } from "react";
import "./Tweek.css";

const Tweek = (props) => {
    const tweetID = props.tweetID;
    const anchorTag = `https://twitter.com/x/status/${tweetID}`;

    //state to display a loading screen while tweeks load
    const [loading, setLoading] = useState(true);

    function new_script(src) {
        return new Promise(function(resolve, reject){
          var script = document.createElement('script');
          script.src = src;
          script.addEventListener('load', function () {
            resolve();
            setLoading(false);
          });
          script.addEventListener('error', function (e) {
            reject(e);
          });
          document.body.appendChild(script);
        })
      };
      // Promise Interface can ensure load the script only once.
      var my_script = new_script("https://platform.twitter.com/widgets.js");

    return( 
        <div>
         {my_script
         ? 
         <blockquote className="twitter-tweet tweek">
                <a href={anchorTag}></a>
          </blockquote>  
         : null}
         </div>
    )
}


export default Tweek;