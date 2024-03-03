import { Link } from "react-router-dom";
import Logo from "../assets/budgetbuddy-logo.png"

const Topbar = () => {
    return (
        <div className="fixed top-0 w-full z-50 shadow-md bg-[#0c0c0c]">
            <nav className="px-20 py-4 hidden md:flex justify-between w-full text-white items-center">
                <Link to="/" className="flex items-center decoration-">
                    <img src={Logo} alt="logo" className='w-16 h-16' />
                    <p>Budget<span className="text-slate-400">Buddy</span></p>
                </Link>
                <ul className="flex items-center gap-20 capitalize">
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
        </div>
    );
};

export default Topbar;