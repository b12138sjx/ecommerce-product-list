import React from 'react';
import { Typography, Card, Space, Row, Col, Carousel } from 'antd';
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
  // 每行显示的推荐商品数量
  const itemsPerSlide = 5;
  // 骨架屏数量
  const skeletonCount = 5;

  // 将商品数组分成多个幻灯片
  const getSlides = () => {
    const slides = [];
    
    // 骨架屏模式
    if (loading) {
      const skeletonSlide = (
        <Row gutter={[16, 16]} key="skeleton-slide">
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={`skeleton-${index}`}>
              <SkeletonCard />
            </Col>
          ))}
        </Row>
      );
      slides.push(skeletonSlide);
      return slides;
    }

    // 商品模式
    for (let i = 0; i < products.length; i += itemsPerSlide) {
      const slideItems = products.slice(i, i + itemsPerSlide);
      const slide = (
        <Row gutter={[16, 16]} key={`slide-${i}`}>
          {slideItems.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={4.8} key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      );
      slides.push(slide);
    }

    return slides;
  };

  // 轮播配置
  const carouselSettings = {
    dots: products.length > itemsPerSlide,
    infinite: products.length > itemsPerSlide,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
  };

  return (
    <div className="recommended-products-container">
      <div className="section-header">
        <Space align="center">
          <FireOutlined className="header-icon" />
          <Title level={4} className="section-title">猜你喜欢</Title>
        </Space>
      </div>
      
      {products.length > 0 || loading ? (
        <Carousel {...carouselSettings} className="recommended-carousel">
          {getSlides()}
        </Carousel>
      ) : (
        <div className="no-recommendations">
          <Typography.Text type="secondary">暂无推荐商品</Typography.Text>
        </div>
      )}
    </div>
  );
};

export default RecommendedProducts;
