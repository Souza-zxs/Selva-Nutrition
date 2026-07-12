import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import Home from "./pages/Home";
import { useLenis } from "./hooks/useLenis";

function App() {
  useLenis();

  return (
    <div className="antialiased">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default App;
