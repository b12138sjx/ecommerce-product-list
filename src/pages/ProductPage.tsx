import React, { useEffect } from 'react';
import { Layout, Typography } from 'antd';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, fetchRecommendedProducts } from '../store/product/productSlice';
import ProductList from '../components/ProductList/ProductList';
import VirtualizedProductList from '../components/ProductList/VirtualizedProductList';
import FilterBar from '../components/FilterBar/FilterBar';
import RecommendedProducts from '../components/RecommendedProducts/RecommendedProducts';
import './ProductPage.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const ProductPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    products, 
    filteredProducts, 
    recommendedProducts, 
    loading, 
    error,
    pagination,
    totalItems 
  } = useAppSelector((state) => state.products);

  // 初始加载数据
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchRecommendedProducts());
  }, [dispatch]);

  // 根据分页获取当前页的商品
  const getCurrentPageProducts = () => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  };

  return (
    <Layout className="product-page">
      <Header className="page-header">
        <Title level={2} className="header-title">商品列表</Title>
      </Header>
      
      <Content className="page-content">
        {/* 推荐商品模块 */}
        <RecommendedProducts 
          products={recommendedProducts} 
          loading={loading && recommendedProducts.length === 0}
        />

        {/* 筛选栏 */}
        <FilterBar 
          totalItems={totalItems}
        />

        {/* 商品列表 - 根据数量选择虚拟滚动或普通列表 */}
        {totalItems > 24 ? (
          <VirtualizedProductList 
            products={filteredProducts}
            loading={loading && products.length === 0}
            totalItems={totalItems}
          />
        ) : (
          <ProductList 
            products={getCurrentPageProducts()}
            loading={loading && products.length === 0}
            totalItems={totalItems}
          />
        )}
      </Content>
    </Layout>
  );
};

export default ProductPage;
