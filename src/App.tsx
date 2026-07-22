import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import EmberField from "./components/EmberField";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import MyOrders from "./pages/MyOrders";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import ReturnPolicy from "./pages/legal/ReturnPolicy";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import { useLenis } from "./hooks/useLenis";

function App() {
  useLenis();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="antialiased">
      {!isAdmin && <div className="grain-overlay" />}
      {!isAdmin && <EmberField variant="ambient" className="fixed inset-0 z-20" />}
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/pedido/:id" element={<OrderConfirmation />} />
        <Route path="/minha-conta" element={<MyOrders />} />
        <Route path="/termos" element={<TermsOfService />} />
        <Route path="/privacidade" element={<PrivacyPolicy />} />
        <Route path="/trocas-e-devolucoes" element={<ReturnPolicy />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminProducts />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="produtos/novo" element={<AdminProductForm />} />
          <Route path="produtos/:id" element={<AdminProductForm />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
        </Route>
      </Routes>
      {!isAdmin && (
        <>
          <Footer />
          <CartDrawer />
        </>
      )}
    </div>
  );
}

export default App;
