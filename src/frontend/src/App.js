import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Layout from './components/Layout'; 
import Register from './components/Register';
import ProductList from './components/ProductList';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Layout />}/>
        <Route path="/products" element={<ProductList />} />
        {/* Add more routes as needed */}
      </Routes>
    </div>
  );
};

export default App; 