import React from 'react';

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  x: number;
  y: number;
}

const Tooltip: React.FC<TooltipProps> = ({ visible, content, x, y }) => {
  if (!visible) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${y}px`,
    left: `${x}px`,
    transform: 'translate(-50%, -110%)',
    pointerEvents: 'none',
  };

  return (
    <div
      style={style}
      className="z-50 bg-background-secondary border border-border-primary rounded-lg p-3 w-max max-w-xs shadow-lg animate-fade-in"
      role="tooltip"
    >
      {content}
    </div>
  );
};

export default Tooltip;
