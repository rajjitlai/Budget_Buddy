import Topbar from "../shared/Topbar"
import Footer from "../shared/Footer"

const Home = () => {
    return (
        <div className="w-full relative">
            <Topbar />
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-900">Home</h1>
            </div>
            <Footer />
        </div>
    )
}

export default Home