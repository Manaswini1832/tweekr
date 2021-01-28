import { useEffect, useContext } from "react";

import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

const TweeksContainer = () => {

    const {currColl, setCurrColl} = useContext(CurrCollContext);

    return(
        <h1>Tweeks here from {currColl}</h1>
    )
}

export default TweeksContainer;