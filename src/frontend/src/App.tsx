import { Routes, Route } from 'react-router-dom';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Layout from './components/Layout';
import ProductList from './components/ProductList';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;