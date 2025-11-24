// 商品接口定义
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  tags: string[];
  rating: number;
  sales: number;
  image: string;
  description: string;
  inStock: boolean;
  createdAt: string;
}

// 筛选条件接口
export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating-desc' | 'sales-desc' | 'newest';
  searchTerm?: string;
  tags?: string[];
  inStockOnly?: boolean;
}

// 分页参数接口
export interface PaginationParams {
  page: number;
  pageSize: number;
}

// 购物车商品接口
export interface CartItem {
  productId: number;
  quantity: number;
}

// 产品状态接口
export interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  recommendedProducts: Product[];
  loading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  pagination: PaginationParams;
  totalItems: number;
  cartItems: CartItem[];
}
