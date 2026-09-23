interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({ data, width = 80, height = 24, className }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / span) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const lastX = (data.length - 1) * stepX;
  const lastY = height - ((data[data.length - 1] - min) / span) * height;
  const firstY = height - ((data[0] - min) / span) * height;
  const isUp = data[data.length - 1] >= data[0];
  const strokeClass = isUp ? "sparkline-up" : "sparkline-down";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={`sparkline ${className ?? ""}`}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        className={strokeClass}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={lastX} cy={lastY} r={2} className={strokeClass} fill="currentColor" />
      <circle cx={0} cy={firstY} r={1.5} className="sparkline-start" fill="currentColor" />
    </svg>
  );
}
