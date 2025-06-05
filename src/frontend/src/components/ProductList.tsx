import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { FiShoppingCart, FiFilter, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Types
interface Product {
  ProductID: number;
  Name: string;
  Price: number;
  Description: string;
  category: {
    CategoryID: number;
    Name: string;
  };
}

interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const ProductList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch products with React Query
  const { data, isLoading, error } = useQuery<ProductsResponse>({
    queryKey: ['products', page, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(selectedCategory && { categoryId: selectedCategory.toString() }),
      });
      const response = await api.get(`/products?${params}`);
      return response.data;
    },
  });

  // Add to cart handler
  const handleAddToCart = async (productId: number) => {
    try {
      await api.post('/cart', {
        ProductID: productId,
        Quantity: 1,
      });
      // Show success toast or notification
    } catch (error) {
      // Show error toast or notification
      console.error('Error adding to cart:', error);
    }
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
        <div className="text-red-500">Error loading products. Please try again later.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiFilter className="w-5 h-5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <div className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg p-4 transform transition-transform">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {/* Add filter options here */}
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data?.data.products.map((product) => (
          <div
            key={product.ProductID}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Product Image Placeholder */}
            <div className="aspect-w-1 aspect-h-1 bg-gray-200">
              <div className="w-full h-48 bg-gray-200"></div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="text-sm text-blue-500 mb-1">{product.category.Name}</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.Name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.Description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">
                  ${product.Price.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(product.ProductID)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data && data.data.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <FiChevronLeft />
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {data.data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.data.totalPages, p + 1))}
            disabled={page === data.data.totalPages}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;