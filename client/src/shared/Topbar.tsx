import { Link } from "react-router-dom";
import Logo from "../assets/budgetbuddy-logo.png"
import hb from "../assets/hamburger.svg"
import { useState } from "react";

const Topbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed top-0 w-full z-50 shadow-md bg-[#0c0c0c]">
            <nav className="px-4 py-4 md:px-20 md:py-4 hidden md:flex justify-between w-full text-white items-center">
                <Link to="/" className="flex items-center">
                    <img src={Logo} alt="logo" className="w-16 h-16" />
                    <p>Budget<span className="text-slate-400">Buddy</span></p>
                </Link>
                <ul className="flex items-center gap-8 capitalize">
                    <li className="hover:text-slate-400">
                        <Link to="/">home</Link>
                    </li>
                    <li className="hover:text-slate-400">
                        <Link to="/">about</Link>
                    </li>
                    <li className="hover:text-slate-400">
                        <Link to="/">contact</Link>
                    </li>
                </ul>
                <div className="flex justify-around items-center flex-row gap-6">
                    <Link className="px-4 py-2 border-0 w-full rounded-md cursor-pointer" to="/signup">Signup</Link>
                    <Link className="px-4 py-3 border-0 w-full rounded-md cursor-pointer bg-slate-600" to="/login">Login</Link>
                </div>
            </nav>
            <div className="md:hidden">
                <button onClick={toggleNavbar} className="text-white py-6 px-4 focus:outline-none">
                    <img src={hb} alt="click" className="w-8 h-8" />
                </button>
            </div>
            {isOpen && (
                <div className="absolute top-16 right-0 left-0 bg-[#0c0c0c] z-50 shadow-md">
                    <ul className="flex flex-col items-center gap-6">
                        <li>
                            <Link onClick={toggleNavbar} to="/" className="text-white py-4 px-6 block hover:text-slate-400">Home</Link>
                        </li>
                        <li>
                            <Link onClick={toggleNavbar} to="/" className="text-white py-4 px-6 block hover:text-slate-400">About</Link>
                        </li>
                        <li>
                            <Link onClick={toggleNavbar} to="/" className="text-white py-4 px-6 block hover:text-slate-400">Contact</Link>
                        </li>
                        <li>
                            <Link onClick={toggleNavbar} to="/signup" className="text-white py-4 px-6 block hover:text-slate-400">Signup</Link>
                        </li>
                        <li>
                            <Link onClick={toggleNavbar} to="/login" className="text-white py-4 px-6 block hover:text-slate-400">Login</Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};


export default Topbar;
