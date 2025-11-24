import React, { useEffect } from 'react';
import { Row, Col, Empty } from 'antd';
import ProductCard from '../ProductCard/ProductCard';
import SkeletonCard from '../SkeletonCard/SkeletonCard';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts } from '../../store/product/productSlice';
import type { Product } from '../../store/product/types';
import './ProductList.css';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  totalItems: number;
}

const ProductList: React.FC<ProductListProps> = ({ products, loading, totalItems }) => {
  // 骨架屏数量
  const skeletonCount = 8;

  // 渲染骨架屏
  const renderSkeletons = () => {
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`} className="product-col">
        <SkeletonCard />
      </Col>
    ));
  };

  // 渲染商品卡片
  const renderProducts = () => {
    if (loading) {
      return renderSkeletons();
    }

    if (products.length === 0) {
      return (
        <Col span={24} className="empty-container">
          <Empty description="暂无符合条件的商品" />
        </Col>
      );
    }

    return products.map((product) => (
      <Col xs={24} sm={12} md={8} lg={6} key={product.id} className="product-col">
        <ProductCard product={product} />
      </Col>
    ));
  };

  return (
    <div className="product-list-container">
      <Row gutter={[16, 16]}>
        {renderProducts()}
      </Row>
    </div>
  );
};

export default ProductList;
