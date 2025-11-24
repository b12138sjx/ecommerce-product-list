import React, { useState } from 'react';
import { Card, Badge, Rate, Button, message, Typography, Space } from 'antd';
import { ShoppingCartOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/product/productSlice';
import type { Product } from '../../store/product/types';
import './ProductCard.css';

const { Title, Text } = Typography;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { name, price, originalPrice, discount, rating, sales, image, tags, inStock } = product;
  const dispatch = useDispatch();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    if (!inStock) {
      message.warning('商品暂时缺货');
      return;
    }

    setAddingToCart(true);
    
    // 模拟添加购物车的异步操作
    setTimeout(() => {
      dispatch(addToCart({ productId: product.id, quantity: 1 }));
      message.success('已添加到购物车');
      setAddingToCart(false);
      setAddedToCart(true);
      
      // 2秒后重置按钮状态
      setTimeout(() => {
        setAddedToCart(false);
      }, 2000);
    }, 300);
  };

  return (
    <Card
      hoverable
      cover={
        <div className="product-image-container">
          <img alt={name} src={image} className="product-image" />
          {tags && tags.map((tag, index) => (
            <Badge.Ribbon key={index} text={tag} color={index % 2 === 0 ? '#1890ff' : '#52c41a'} />
          ))}
          {!inStock && (
            <div className="out-of-stock-overlay">
              <span>缺货</span>
            </div>
          )}
        </div>
      }
      actions={[
        <Button
          key="cart"
          type="primary"
          icon={addedToCart ? <CheckOutlined /> : <ShoppingCartOutlined />}
          onClick={handleAddToCart}
          disabled={!inStock || addingToCart}
          loading={addingToCart}
          className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
        >
          {addedToCart ? '已加入' : '加入购物车'}
        </Button>
      ]}
    >
      <Space direction="vertical" size={[0, 8]} style={{ width: '100%' }}>
        <div>
          {discount && (
            <Badge count={`${discount}折`} style={{ backgroundColor: '#ff4d4f' }} />
          )}
          <Title level={5} className="product-name" title={name}>
            {name.length > 20 ? `${name.substring(0, 20)}...` : name}
          </Title>
        </div>
        
        <div className="product-price-container">
          <Text strong className="product-price">¥{price.toFixed(2)}</Text>
          {originalPrice && originalPrice > price && (
            <Text delete className="product-original-price">¥{originalPrice.toFixed(2)}</Text>
          )}
        </div>
        
        <div className="product-meta">
          <Rate disabled defaultValue={rating} allowHalf className="product-rating" />
          <Text type="secondary" className="product-sales">已售 {sales.toLocaleString()} 件</Text>
        </div>
      </Space>
    </Card>
  );
};

export default ProductCard;
