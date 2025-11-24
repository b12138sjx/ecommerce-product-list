import React, { useState, useCallback, useRef } from 'react';
import { Input, Select, Slider, Row, Col, Button, Pagination, Space, Typography, Checkbox, Badge, Tooltip } from 'antd';
import { SearchOutlined, DeleteOutlined, FilterOutlined } from '@ant-design/icons';
import { debounce } from 'lodash-es';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFilterOptions, resetFilterOptions, setPagination, applyFiltersAndSort } from '../../store/product/productSlice';
import './FilterBar.css';

const { Option } = Select;
const { Text } = Typography;

interface FilterBarProps {
  totalItems: number;
}

// 分类列表
const categories = ['电子产品', '服装', '家居', '食品', '美妆'];

// 排序选项
const sortOptions = [
  { value: 'newest', label: '最新上架' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
  { value: 'rating-desc', label: '评分从高到低' },
  { value: 'sales-desc', label: '销量从高到低' },
];

const FilterBar: React.FC<FilterBarProps> = ({ totalItems }) => {
  const dispatch = useAppDispatch();
  const { filterOptions, pagination } = useAppSelector((state) => state.products);
  
  // 本地搜索值状态
  const [searchValue, setSearchValue] = useState(filterOptions.searchTerm || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const priceSliderRef = useRef<HTMLDivElement>(null);
  
  // 价格区间快速选择预设
  const pricePresets: Array<{ label: string; range: [number, number] }> = [
    { label: '0-100', range: [0, 100] },
    { label: '100-500', range: [100, 500] },
    { label: '500-1000', range: [500, 1000] },
    { label: '自定义', range: [0, 1000] },
  ];

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      dispatch(setFilterOptions({ searchTerm: value }));
      dispatch(applyFiltersAndSort());
    }, 300), // 减少防抖时间以提高响应性
    [dispatch]
  );
  
  // 价格预设选择处理
  const handlePresetPriceSelect = (preset: { range: [number, number] }) => {
    setPriceRange(preset.range);
    dispatch(setFilterOptions({
      minPrice: preset.range[0] > 0 ? preset.range[0] : undefined,
      maxPrice: preset.range[1] < 1000 ? preset.range[1] : undefined
    }));
    dispatch(applyFiltersAndSort());
  };
  
  // 检查是否有活跃的筛选条件
  const hasActiveFilters = filterOptions.searchTerm || 
    filterOptions.category || 
    filterOptions.minPrice || 
    filterOptions.maxPrice || 
    filterOptions.inStockOnly;
  
  // 获取活跃筛选条件数量
  const getActiveFilterCount = () => {
    let count = 0;
    if (filterOptions.searchTerm) count++;
    if (filterOptions.category) count++;
    if (filterOptions.minPrice || filterOptions.maxPrice) count++;
    if (filterOptions.inStockOnly) count++;
    return count;
  };

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // 处理分类变化
  const handleCategoryChange = (value: string) => {
    dispatch(setFilterOptions({ category: value || undefined }));
    dispatch(applyFiltersAndSort());
  };

  // 处理价格范围变化
  const handlePriceChange = (values: number | number[]) => {
    if (Array.isArray(values)) {
      setPriceRange(values as [number, number]);
    }
  };

  // 价格范围拖动结束后应用筛选
  const handlePriceAfterChange = (values: number | number[]) => {
    if (Array.isArray(values)) {
      dispatch(setFilterOptions({
        minPrice: values[0] > 0 ? values[0] : undefined,
        maxPrice: values[1] < 1000 ? values[1] : undefined
      }));
      dispatch(applyFiltersAndSort());
    }
  };
  
  // 清除特定筛选条件
  const clearSpecificFilter = (filterType: string) => {
    switch(filterType) {
      case 'search':
        setSearchValue('');
        dispatch(setFilterOptions({ searchTerm: undefined }));
        break;
      case 'category':
        dispatch(setFilterOptions({ category: undefined }));
        break;
      case 'price':
        setPriceRange([0, 1000]);
        dispatch(setFilterOptions({ minPrice: undefined, maxPrice: undefined }));
        break;
      case 'stock':
        dispatch(setFilterOptions({ inStockOnly: false }));
        break;
    }
    dispatch(applyFiltersAndSort());
  };

  // 处理排序变化
  const handleSortChange = (value: 'price-asc' | 'price-desc' | 'rating-desc' | 'sales-desc' | 'newest') => {
    dispatch(setFilterOptions({ sortBy: value }));
    dispatch(applyFiltersAndSort());
  };

  // 处理库存筛选
  const handleStockChange = (e: any) => {
    dispatch(setFilterOptions({ inStockOnly: e.target.checked }));
    dispatch(applyFiltersAndSort());
  };

  // 重置筛选
  const handleReset = () => {
    setSearchValue('');
    setPriceRange([0, 1000]);
    setIsMobileFilterOpen(false);
    dispatch(resetFilterOptions());
    dispatch(applyFiltersAndSort());
  };

  // 处理分页变化
  const handlePaginationChange = (page: number, pageSize: number) => {
    dispatch(setPagination({ page, pageSize }));
  };

  return (
    <div className="filter-bar-container">
      {/* 移动端筛选器切换按钮 */}
      <div className="mobile-filter-toggle">
        <Button 
          icon={<FilterOutlined />} 
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="filter-toggle-btn"
        >
          筛选 {hasActiveFilters && <Badge count={getActiveFilterCount()} className="filter-badge" />}
        </Button>
      </div>

      {/* 移动端筛选面板 */}
      <div className={`mobile-filter-panel ${isMobileFilterOpen ? 'open' : ''}`}>
        <div className="mobile-filter-header">
          <h3>筛选条件</h3>
          <Button type="text" onClick={() => setIsMobileFilterOpen(false)}>关闭</Button>
        </div>
        <div className="mobile-filter-content">
          <div className="filter-item">
            <Text strong className="filter-label">搜索:</Text>
            <Input
              placeholder="搜索商品名称或描述"
              prefix={<SearchOutlined />}
              value={searchValue}
              onChange={handleSearchChange}
              className="mobile-search"
              allowClear
            />
          </div>
          
          <div className="filter-item">
            <Text strong className="filter-label">分类:</Text>
            <Select
              placeholder="全部分类"
              allowClear
              style={{ width: '100%' }}
              value={filterOptions.category}
              onChange={handleCategoryChange}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </div>
          
          <div className="filter-item">
            <Text strong className="filter-label">价格范围:</Text>
            <div className="price-presets">
              {pricePresets.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  onClick={() => handlePresetPriceSelect(preset)}
                  className={`preset-btn ${priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1] ? 'active' : ''}`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Slider
              range
              min={0}
              max={1000}
              value={priceRange}
              onChange={handlePriceChange}
              onAfterChange={handlePriceAfterChange}
              tooltip={{ formatter: (value) => `¥${value}` }}
            />
            <div className="price-range-text">
              <Text>¥{priceRange[0]} - ¥{priceRange[1]}</Text>
            </div>
          </div>
          
          <div className="filter-item checkbox-container">
            <Checkbox 
              checked={filterOptions.inStockOnly || false}
              onChange={handleStockChange}
            >
              仅显示有货
            </Checkbox>
          </div>
          
          <div className="filter-item">
            <Text strong className="filter-label">排序:</Text>
            <Select
              placeholder="默认排序"
              allowClear
              style={{ width: '100%' }}
              value={filterOptions.sortBy}
              onChange={handleSortChange}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </div>
          
          <div className="mobile-filter-actions">
            {hasActiveFilters && (
              <Button 
                icon={<DeleteOutlined />} 
                onClick={handleReset}
                style={{ marginRight: 8 }}
              >
                重置
              </Button>
            )}
            <Button 
              type="primary" 
              onClick={() => setIsMobileFilterOpen(false)}
            >
              应用筛选 ({totalItems} 件)
            </Button>
          </div>
        </div>
      </div>

      {/* 桌面端筛选区域 */}
      <div className="filter-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6} lg={4}>
            <div className="filter-item">
              <Text strong className="filter-label">分类:</Text>
              <Select
                placeholder="全部分类"
                allowClear
                style={{ width: '100%' }}
                value={filterOptions.category}
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <Option key={category} value={category}>{category}</Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={8} md={6} lg={4}>
            <div className="filter-item">
              <Text strong className="filter-label">排序:</Text>
              <Select
                placeholder="默认排序"
                allowClear
                style={{ width: '100%' }}
                value={filterOptions.sortBy}
                onChange={handleSortChange}
              >
                {sortOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={12} lg={8}>
            <div className="filter-item">
              <Text strong className="filter-label">价格范围:</Text>
              <div className="price-presets">
                {pricePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    size="small"
                    onClick={() => handlePresetPriceSelect(preset)}
                    className={`preset-btn ${priceRange[0] === preset.range[0] && priceRange[1] === preset.range[1] ? 'active' : ''}`}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <Slider
                range
                min={0}
                max={1000}
                value={priceRange}
                onChange={handlePriceChange}
                onAfterChange={handlePriceAfterChange}
                tooltip={{ formatter: (value) => `¥${value}` }}
              />
              <div className="price-range-text">
                <Text>¥{priceRange[0]} - ¥{priceRange[1]}</Text>
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={16} md={8} lg={6}>
            <div className="filter-item">
              <Text strong className="filter-label">搜索:</Text>
              <Input
                placeholder="搜索商品名称或描述"
                prefix={<SearchOutlined />}
                value={searchValue}
                onChange={handleSearchChange}
                allowClear
              />
            </div>
          </Col>
          
          <Col xs={24} sm={8} md={8} lg={2}>
            <div className="filter-item checkbox-container">
              <Checkbox 
                checked={filterOptions.inStockOnly || false}
                onChange={handleStockChange}
              >
                仅显示有货
              </Checkbox>
            </div>
          </Col>
        </Row>
        
        {/* 活跃筛选标签 */}
        {hasActiveFilters && (
          <div className="active-filters">
            <div className="active-filters-label">已选条件:</div>
            <Space wrap className="active-filter-tags">
              {filterOptions.searchTerm && (
                <Badge.Ribbon text={<DeleteOutlined onClick={() => clearSpecificFilter('search')} style={{ cursor: 'pointer' }} />} color="blue">
                  <span className="filter-tag">搜索: {filterOptions.searchTerm}</span>
                </Badge.Ribbon>
              )}
              {filterOptions.category && (
                <Badge.Ribbon text={<DeleteOutlined onClick={() => clearSpecificFilter('category')} style={{ cursor: 'pointer' }} />} color="green">
                  <span className="filter-tag">分类: {filterOptions.category}</span>
                </Badge.Ribbon>
              )}
              {(filterOptions.minPrice || filterOptions.maxPrice) && (
                <Badge.Ribbon text={<DeleteOutlined onClick={() => clearSpecificFilter('price')} style={{ cursor: 'pointer' }} />} color="orange">
                  <span className="filter-tag">价格: ¥{filterOptions.minPrice || 0} - ¥{filterOptions.maxPrice || 1000}</span>
                </Badge.Ribbon>
              )}
              {filterOptions.inStockOnly && (
                <Badge.Ribbon text={<DeleteOutlined onClick={() => clearSpecificFilter('stock')} style={{ cursor: 'pointer' }} />} color="red">
                  <span className="filter-tag">仅显示有货</span>
                </Badge.Ribbon>
              )}
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                onClick={handleReset}
                className="clear-all-btn"
              >
                清除全部
              </Button>
            </Space>
          </div>
        )}
        
        {/* 重置按钮和总数 */}
        <div className="reset-section">
          <Button onClick={handleReset} disabled={!hasActiveFilters}>重置筛选</Button>
          <Text type="secondary" className="total-count">共 {totalItems} 件商品</Text>
        </div>
      </div>


    </div>
  );
};

export default FilterBar;
