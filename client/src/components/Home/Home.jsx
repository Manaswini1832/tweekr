import { Link } from "react-router-dom"

const Home = () => {
    return(
        <div>
            <h1>Home page</h1>
            <Link to="/login">Start tweeking now!</Link>
        </div>
    )
}

export default Home;