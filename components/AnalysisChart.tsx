interface AnalysisChartProps {
  labels: string[]
  values: number[]
  colors: string[]
  title?: string
}

export default function AnalysisChart({ labels, values, colors, title }: AnalysisChartProps) {
  const maxValue = 100
  const chartWidth = 280
  const chartHeight = 200
  const barWidth = chartWidth / labels.length
  const padding = 30

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-bold text-gray-700 mb-3">{title}</h3>}
      <svg width="100%" height={chartHeight + padding} viewBox={`0 0 ${chartWidth + padding * 2} ${chartHeight + padding * 2}`} className="mx-auto">
        {/* Y軸 */}
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight + padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* X軸 */}
        <line x1={padding} y1={chartHeight + padding} x2={chartWidth + padding} y2={chartHeight + padding} stroke="#e5e7eb" strokeWidth="1" />

        {/* グリッドライン & ラベル */}
        {[0, 25, 50, 75, 100].map((val) => (
          <g key={`grid-${val}`}>
            <line
              x1={padding}
              y1={padding + (chartHeight * (100 - val)) / 100}
              x2={chartWidth + padding}
              y2={padding + (chartHeight * (100 - val)) / 100}
              stroke="#f3f4f6"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text
              x={padding - 8}
              y={padding + (chartHeight * (100 - val)) / 100 + 3}
              fontSize="10"
              textAnchor="end"
              fill="#9ca3af"
            >
              {val}
            </text>
          </g>
        ))}

        {/* バー */}
        {values.map((value, i) => {
          const barHeight = (value / maxValue) * chartHeight
          const x = padding + i * barWidth + barWidth * 0.1
          const y = chartHeight + padding - barHeight
          const width = barWidth * 0.8

          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={width}
                height={barHeight}
                fill={colors[i]}
                rx="4"
                className="transition-all hover:opacity-80"
              />
              {/* バーの値表示 */}
              <text
                x={x + width / 2}
                y={y - 5}
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                fill={colors[i]}
              >
                {value}
              </text>
            </g>
          )
        })}

        {/* ラベル */}
        {labels.map((label, i) => {
          const x = padding + i * barWidth + barWidth / 2
          const y = chartHeight + padding + 20

          return (
            <text
              key={`label-${i}`}
              x={x}
              y={y}
              fontSize="11"
              textAnchor="middle"
              fill="#6b7280"
              fontWeight="500"
            >
              {label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}
