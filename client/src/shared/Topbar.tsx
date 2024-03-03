import { Link } from "react-router-dom";
import Logo from "../assets/budgetbuddy-logo.png"

const Topbar = () => {
    return (
        <div className="fixed top-0 w-full z-50 shadow-md bg-[#0c0c0c]">
            <nav className="container flex justify-between w-full text-white">
                <Link to="/" className="flex items-center decoration-">
                    <img src={Logo} alt="logo" className='w-20 h-20' />
                    <h3>Budget<span className="text-slate-400">Buddy</span></h3>
                </Link>
                <ul className="flex items-center gap-16 capitalize">
                    <li><a href="/">home</a></li>
                    <li><a href="#about">about</a></li>
                    <li><a href="#contact">contact</a></li>
                </ul>
                <div className="bbLoginContainer">
                    <button className="signupBtn">Signup</button>
                    <button className="loginBtn">Login</button>
                </div>
            </nav>
        </div>
    );
};

export default Topbar;