import { Link } from "react-router-dom";

const Home = () => {
    return(
        <div>
            <h1>Home page</h1>
            <button><Link to="/login">Start Tweeking</Link></button>
        </div>
    )
}

export default Home;