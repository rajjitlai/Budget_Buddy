import Topbar from "../shared/Topbar"
import Footer from "../shared/Footer"
import Calc from "../pages/Calc"
import { TextShow } from "../components/textShow"

const Home = () => {
    return (
        <div className="w-full relative flex flex-col items-center">
            <Topbar />
            <TextShow />
            <Calc />
            <Footer />
        </div>
    )
}

export default Home