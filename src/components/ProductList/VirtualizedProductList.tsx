import React from 'react';
import { AutoSizer, List } from 'react-virtualized';
import { Row, Col } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import ProductCard from '../ProductCard/ProductCard';
import SkeletonCard from '../SkeletonCard/SkeletonCard';
import type { Product } from '../../store/product/types';
import './VirtualizedProductList.css';

interface VirtualizedProductListProps {
  products: Product[];
  loading: boolean;
  totalItems: number;
}

const VirtualizedProductList: React.FC<VirtualizedProductListProps> = ({ 
  products, 
  loading, 
  totalItems 
}) => {
  // 每行显示的商品数量（根据屏幕宽度计算）
  const getItemsPerRow = () => {
    const width = window.innerWidth;
    if (width < 576) return 1;
    if (width < 768) return 2;
    if (width < 992) return 3;
    return 4;
  };

  // 卡片高度（包含间距）
  const CARD_HEIGHT = 380;
  const itemsPerRow = getItemsPerRow();
  
  // 计算列表行高
  const rowHeight = CARD_HEIGHT + 16; // 卡片高度 + 间距

  // 计算总共有多少行
  const rowCount = loading ? 4 : Math.ceil(products.length / itemsPerRow);

  // 渲染一行商品
  const renderRow = ({ index, key, style }: { index: number; key: string; style: React.CSSProperties }) => {
    // 计算当前行的商品索引范围
    const startIndex = index * itemsPerRow;
    const endIndex = Math.min(startIndex + itemsPerRow, products.length);
    const rowItems = products.slice(startIndex, endIndex);

    // 骨架屏模式
    if (loading) {
      const skeletonItems = Array.from({ length: itemsPerRow });
      return (
        <div key={key} style={style} className="virtualized-row">
          <Row gutter={[16, 16]} align="top">
            {skeletonItems.map((_, i) => (
              <Col 
                xs={24} 
                sm={12} 
                md={8} 
                lg={6} 
                key={`skeleton-${index}-${i}`} 
                className="product-col"
              >
                <SkeletonCard className="product-skeleton" />
              </Col>
            ))}
          </Row>
        </div>
      );
    }

    // 商品模式
    return (
      <div key={key} style={style} className="virtualized-row">
        <Row gutter={[16, 16]} align="top">
          {rowItems.map((product) => (
            <Col 
              xs={24} 
              sm={12} 
              md={8} 
              lg={6} 
              key={product.id} 
              className="product-col"
            >
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  // 渲染空状态
  if (!loading && products.length === 0) {
    return (
      <div className="empty-container">
        <ShoppingOutlined className="empty-state-icon" />
        <div className="empty-state-text">暂无符合条件的商品</div>
        <div className="empty-state-subtext">
          尝试调整筛选条件或搜索其他关键词
        </div>
      </div>
    );
  }

  return (
    <div className="virtualized-list-container">
      <AutoSizer>
        {({ width, height }: { width: number; height: number }) => (
          <List
            width={width}
            height={height}
            rowCount={rowCount}
            rowHeight={rowHeight}
            rowRenderer={renderRow}
            overscanCount={3}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedProductList;
