import { useContext } from "react";

import "./SideBar.css";

import { CollecNamesContext } from "../../contexts/CollecNamesContext/CollecNamesContext";
import { CurrCollContext } from "../../contexts/CurrCollContext/CurrCollContext";

const SideBar = () => {

    const {collecNames, setCollecNames} = useContext(CollecNamesContext);
    const {currColl, setCurrColl} = useContext(CurrCollContext);


    function changeCurrColl(e){
        setCurrColl(e.target.innerText);
    }

    return(
        <nav>
            <ul>
                {collecNames.map((name, index) => {
                    return(
                        <li onClick={changeCurrColl} className="collecListItem" key={index}>{name}</li>
                    )
                })}
            </ul>
        </nav>
    )
}

export default SideBar;