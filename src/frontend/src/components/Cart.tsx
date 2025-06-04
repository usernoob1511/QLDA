import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import api from '../api/axios';
import { AxiosResponse } from 'axios';

interface CartItem {
  CartID: number;
  ProductID: number;
  Quantity: number;
  product: {
    ProductID: number;
    Name: string;
    Price: number;
    Description: string;
  };
}

interface CartResponse {
  status: string;
  data: {
    cart: CartItem[];
  };
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch cart items
  const { data: cartData, isLoading, error } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response: AxiosResponse<CartResponse> = await api.get('/cart');
      return response.data;
    },
  });

  // Update cart item quantity
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ cartId, quantity }: { cartId: number; quantity: number }) => {
      await api.put(`/cart/${cartId}`, { Quantity: quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove item from cart
  const removeItemMutation = useMutation({
    mutationFn: async (cartId: number) => {
      await api.delete(`/cart/${cartId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Calculate total price
  const calculateTotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + item.product.Price * item.Quantity, 0);
  };

  // Handle quantity update
  const handleQuantityUpdate = (cartId: number, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantityMutation.mutate({ cartId, quantity: newQuantity });
    } else {
      removeItemMutation.mutate(cartId);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error loading cart. Please try again later.</div>
      </div>
    );
  }

  const cartItems = cartData?.data.cart || [];
  const isEmpty = cartItems.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {isEmpty ? (
        <div className="text-center py-12">
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-sm text-gray-500">
            Start shopping to add items to your cart
          </p>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white shadow-sm rounded-lg">
              {cartItems.map((item) => (
                <div
                  key={item.CartID}
                  className="flex items-center px-6 py-4 border-b last:border-b-0"
                >
                  {/* Product Image Placeholder */}
                  <div className="h-20 w-20 flex-shrink-0 bg-gray-200 rounded-md"></div>

                  {/* Product Details */}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          {item.product.Name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          ${item.product.Price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {/* Quantity Controls */}
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => handleQuantityUpdate(item.CartID, item.Quantity, -1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <FiMinus className="h-4 w-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-2 text-gray-900">{item.Quantity}</span>
                          <button
                            onClick={() => handleQuantityUpdate(item.CartID, item.Quantity, 1)}
                            className="p-2 hover:bg-gray-100"
                          >
                            <FiPlus className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItemMutation.mutate(item.CartID)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-500"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              {/* Subtotal */}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${calculateTotal(cartItems).toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900">Free</span>
              </div>

              {/* Total */}
              <div className="flex justify-between py-2 mt-2">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-lg font-medium text-gray-900">
                  ${calculateTotal(cartItems).toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="mt-6 w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Proceed to Checkout
              </button>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-500"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 