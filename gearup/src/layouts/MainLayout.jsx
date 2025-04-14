import { Outlet } from "react-router-dom"
import Header from "../components/navigation/Header"
import Footer from "../components/navigation/Footer"
import "./MainLayout.css"

const MainLayout = ({ hideHeader = false }) => {
  return (
    <div className="main-layout">
      {!hideHeader && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
