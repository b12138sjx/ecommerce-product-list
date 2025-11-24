import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, FilterOptions, PaginationParams, ProductState } from './types';

// 模拟商品数据
const mockProducts: Product[] = Array.from({ length: 50 }, (_, index) => ({
  id: index + 1,
  name: `商品 ${index + 1}`,
  price: Math.floor(Math.random() * 900) + 100,
  originalPrice: Math.floor(Math.random() * 1000) + 200,
  discount: Math.floor(Math.random() * 50) + 10,
  category: ['电子产品', '服装', '家居', '食品', '美妆'][Math.floor(Math.random() * 5)],
  tags: [['热销', '新品', '限时'], ['优惠', '推荐']][Math.floor(Math.random() * 2)],
  rating: Number((Math.random() * 2 + 3).toFixed(1)),
  sales: Math.floor(Math.random() * 1000),
  image: `https://picsum.photos/id/${index + 20}/300/300`,
  description: `这是一个优质的商品描述，详细介绍了商品的特点和优势。`,
  inStock: Math.random() > 0.1,
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
}));

// 异步获取商品数据
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockProducts;
    } catch (error) {
      return rejectWithValue('获取商品数据失败');
    }
  }
);

// 异步获取推荐商品
export const fetchRecommendedProducts = createAsyncThunk(
  'products/fetchRecommended',
  async (_, { rejectWithValue }) => {
    try {
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      // 随机选择10个推荐商品
      return [...mockProducts]
        .sort(() => 0.5 - Math.random())
        .slice(0, 10);
    } catch (error) {
      return rejectWithValue('获取推荐商品失败');
    }
  }
);

// 根据筛选条件过滤商品
const filterProducts = (products: Product[], filters: FilterOptions): Product[] => {
  return products.filter(product => {
    // 分类筛选
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    
    // 价格范围筛选
    if (filters.minPrice && product.price < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice && product.price > filters.maxPrice) {
      return false;
    }
    
    // 搜索词筛选
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      if (!product.name.toLowerCase().includes(term) && 
          !product.description.toLowerCase().includes(term)) {
        return false;
      }
    }
    
    // 标签筛选
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some(tag => product.tags.includes(tag))) {
        return false;
      }
    }
    
    // 库存筛选
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    
    return true;
  });
};

// 排序商品
const sortProducts = (products: Product[], sortBy?: string): Product[] => {
  const sortedProducts = [...products];
  
  switch (sortBy) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
    case 'rating-desc':
      return sortedProducts.sort((a, b) => b.rating - a.rating);
    case 'sales-desc':
      return sortedProducts.sort((a, b) => b.sales - a.sales);
    case 'newest':
      return sortedProducts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    default:
      return sortedProducts;
  }
};

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  recommendedProducts: [],
  loading: false,
  error: null,
  filterOptions: {},
  pagination: {
    page: 1,
    pageSize: 12
  },
  totalItems: 0,
  cartItems: []
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // 设置筛选条件
    setFilterOptions: (state, action: PayloadAction<FilterOptions>) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
      // 重置页码
      state.pagination.page = 1;
    },
    
    // 重置筛选条件
    resetFilterOptions: (state) => {
      state.filterOptions = {};
      state.pagination.page = 1;
    },
    
    // 设置分页
    setPagination: (state, action: PayloadAction<Partial<PaginationParams>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // 应用筛选和排序
    applyFiltersAndSort: (state) => {
      let filtered = filterProducts(state.products, state.filterOptions);
      let sorted = sortProducts(filtered, state.filterOptions.sortBy);
      
      state.filteredProducts = sorted;
      state.totalItems = sorted.length;
    },
    
    // 添加商品到购物车
    addToCart: (state, action: PayloadAction<{ productId: number; quantity: number }>) => {
      const { productId, quantity } = action.payload;
      const existingItem = state.cartItems.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ productId, quantity });
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取商品列表
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.products = action.payload;
        state.filteredProducts = action.payload;
        state.totalItems = action.payload.length;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || '获取商品失败';
      })
      // 获取推荐商品
      .addCase(fetchRecommendedProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecommendedProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.recommendedProducts = action.payload;
        state.loading = false;
      })
      .addCase(fetchRecommendedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || '获取推荐商品失败';
      });
  }
});

export const { setFilterOptions, resetFilterOptions, setPagination, applyFiltersAndSort, addToCart } = productSlice.actions;

export default productSlice.reducer;
