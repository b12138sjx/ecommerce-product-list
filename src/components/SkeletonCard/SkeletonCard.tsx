import React from 'react';
import { Card, Skeleton } from 'antd';

interface SkeletonCardProps {
  active?: boolean;
  className?: string;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ active = true, className }) => {
  return (
    <Card hoverable className={className}>
      <Skeleton.Image
        active={active}
        style={{ width: '100%', height: 200 }}
      />
      <Skeleton
        active={active}
        paragraph={{ rows: 3 }}
        title={false}
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default SkeletonCard;
