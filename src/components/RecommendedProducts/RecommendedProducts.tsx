import React from 'react';
import { Typography, Space } from 'antd';
import { FireOutlined } from '@ant-design/icons';
import ProductCard from '../ProductCard/ProductCard';
import SkeletonCard from '../SkeletonCard/SkeletonCard';
import type { Product } from '../../store/product/types';
import './RecommendedProducts.css';

const { Title } = Typography;

interface RecommendedProductsProps {
  products: Product[];
  loading: boolean;
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ products, loading }) => {
  // 骨架屏数量
  const skeletonCount = 10;

  return (
    <div className="recommended-products-container">
      <div className="section-header">
        <Space align="center">
          <FireOutlined className="header-icon" />
          <Title level={4} className="section-title">猜你喜欢</Title>
        </Space>
      </div>
      
      {products.length > 0 || loading ? (
        <div className="recommended-scroll-container">
          <div className="recommended-scroll-content">
            {/* 骨架屏模式 */}
            {loading && Array.from({ length: skeletonCount }).map((_, index) => (
              <div className="recommended-item" key={`skeleton-${index}`}>
                <SkeletonCard />
              </div>
            ))}
            
            {/* 商品模式 */}
            {!loading && products.map((product) => (
              <div className="recommended-item" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-recommendations">
          <Typography.Text type="secondary">暂无推荐商品</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;
