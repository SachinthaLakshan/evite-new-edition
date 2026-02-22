
import React, { ReactNode } from 'react';
import { ThemeLayout } from '@/types/theme';
import { CircularDecoration } from './CircularDecoration';
import { DiagonalDecoration } from './DiagonalDecoration';
import { VerticalDecoration } from './VerticalDecoration';
import { StackedDecoration } from './StackedDecoration';
import { FlowerDecoration } from './FlowerDecoration';

interface LayoutRendererProps {
  layout: ThemeLayout;
  children: ReactNode;
}

export const LayoutRenderer = ({ layout, children }: LayoutRendererProps) => {
  // Render appropriate decoration based on layout type
  const renderDecoration = () => {
    switch (layout.layoutType) {
      case 'circular':
        return <CircularDecoration />;
      case 'diagonal':
        return <DiagonalDecoration />;
      case 'vertical':
        return <VerticalDecoration />;
      case 'stacked':
        return <StackedDecoration />;
      default:
        return <FlowerDecoration themeStyle={layout.id} />;
    }
  };

  return (
    <div className="relative">
      {renderDecoration()}
      <div className={layout.containerStyle}>
        {children}
      </div>
    </div>
  );
};
