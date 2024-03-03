import { IconBrandGithubFilled, IconBrandYoutubeFilled } from "@tabler/icons-react"
import rjinstitute from "../assets/rjinstitute.png"

const Footer = () => {
    return (
        <>
            <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
            <div className="px-20 w-full flex gap-6 flex-col md:flex-row justify-between">
                <div>
                    <p className="text-white">Copyright &copy; 2024 BudgetBuddy</p>
                </div>
                <ul className="flex gap-2 items-center">
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer">
                        <IconBrandGithubFilled />
                    </li>
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer">
                        <img className="w-6 h-6" src={rjinstitute} alt="developer" />
                    </li>
                    <li className="bg-slate-400 rounded-full p-1 cursor-pointer text-[#ee2743]">
                        <IconBrandYoutubeFilled />
                    </li>
                </ul>
            </div>
        </>
    )
}

export default Footer