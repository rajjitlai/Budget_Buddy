import { IconBrandGithubFilled, IconBrandYoutubeFilled } from "@tabler/icons-react"
import rjinstitute from "../assets/rjinstitute.png"
import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <>
            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
            <div className="px-6 md:px-20 w-full flex gap-6 flex-col md:flex-row justify-between">
                <div>
                    <p className="text-white">Copyright &copy; 2024 BudgetBuddy</p>
                </div>
                <ul className="flex gap-2 items-center">
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer">
                        <Link to="https://github.com/rajjitlai" target="_blank">
                            <IconBrandGithubFilled />
                        </Link>
                    </li>
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer">
                        <Link to="https://rjinstitute.netlify.app/" target="_blank">
                            <img className="w-6 h-6" src={rjinstitute} alt="developer" />
                        </Link>
                    </li>
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer text-[#ee2743]">
                        <Link to="https://youtube.com/@rjinstitute.?sub_confirmation=1" target="_blank" >
                            <IconBrandYoutubeFilled />
                        </Link>
                    </li>
                </ul>
            </div>
        </>
    )
}

export default Footer