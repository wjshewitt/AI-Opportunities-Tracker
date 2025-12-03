import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

interface MonthlyData {
  month: string;
  commons: number;
  lords: number;
}

interface ContributionData {
  date: Date;
  house: string;
  member: string;
  debate: string;
}

interface MentionsChartProps {
  data: MonthlyData[];
  contributions?: ContributionData[];
}

const LIGHT_COLORS = {
  cream: '#F2F0E9',
  surface: '#FFFFFF',
  primary: '#122623',
  primaryLight: '#1A3832',
  accent: '#9BC62C',
  border: '#CDCBC4',
  subtle: '#8C8A84',
};

const DARK_COLORS = {
  cream: '#0A1412',
  surface: '#0F1E1B',
  primary: '#F5F5F4',
  primaryLight: '#C8E550',
  accent: '#9BC62C',
  border: '#234038',
  subtle: '#A8B5B2',
};

const MentionsChart: React.FC<MentionsChartProps> = ({ data, contributions = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'all'>('monthly');
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width: containerWidth } = container.getBoundingClientRect();
    const width = containerWidth;
    const height = viewMode === 'all' ? 350 : 280;
    const margin = { top: 20, right: 20, bottom: 60, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    if (viewMode === 'monthly') {
      drawMonthlyChart(g, data, innerWidth, innerHeight, svg, margin, height);
    } else {
      drawAllMentionsChart(g, contributions, innerWidth, innerHeight, svg, margin, height);
    }
  }, [data, contributions, viewMode, isDark, COLORS]);

  const drawMonthlyChart = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: MonthlyData[],
    innerWidth: number,
    innerHeight: number,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    margin: { top: number; right: number; bottom: number; left: number },
    height: number
  ) => {
    if (!data || data.length === 0) return;

    // Stack the data
    const stack = d3.stack<MonthlyData>()
      .keys(['commons', 'lords']);
    
    const stackedData = stack(data);

    // Scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.month))
      .range([0, innerWidth])
      .padding(0.3);

    const maxValue = d3.max(stackedData[stackedData.length - 1], d => d[1]) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, Math.max(maxValue, 5)])
      .nice()
      .range([innerHeight, 0]);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks(5))
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', COLORS.border)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.5);

    // Bars
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['commons', 'lords'])
      .range([COLORS.primary, COLORS.accent]);

    const layers = g.selectAll('.layer')
      .data(stackedData)
      .join('g')
      .attr('class', 'layer')
      .attr('fill', d => colorScale(d.key));

    layers.selectAll('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => xScale(d.data.month) || 0)
      .attr('y', innerHeight)
      .attr('width', xScale.bandwidth())
      .attr('height', 0)
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]));

    // X Axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0));

    xAxis.select('.domain').attr('stroke', COLORS.border);
    xAxis.selectAll('text')
      .attr('fill', COLORS.subtle)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Y Axis
    const yAxis = g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickSize(0));

    yAxis.select('.domain').remove();
    yAxis.selectAll('text')
      .attr('fill', COLORS.subtle)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px');

    // Trend line
    interface TotalDataPoint {
      month: string;
      total: number;
    }
    
    const totalData: TotalDataPoint[] = data.map(d => ({
      month: d.month,
      total: d.commons + d.lords
    }));

    const line = d3.line<TotalDataPoint>()
      .x(d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .y(d => yScale(d.total))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(totalData)
      .attr('fill', 'none')
      .attr('stroke', COLORS.primaryLight)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('d', line);

    const pathLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', `${pathLength} ${pathLength}`)
      .attr('stroke-dashoffset', pathLength)
      .transition()
      .duration(1000)
      .delay(600)
      .attr('stroke-dashoffset', 0)
      .on('end', function() {
        d3.select(this).attr('stroke-dasharray', '4,4');
      });

    // Dots on trend line
    g.selectAll('.trend-dot')
      .data(totalData.filter(d => d.total > 0))
      .join('circle')
      .attr('class', 'trend-dot')
      .attr('cx', d => (xScale(d.month) || 0) + xScale.bandwidth() / 2)
      .attr('cy', d => yScale(d.total))
      .attr('r', 0)
      .attr('fill', COLORS.surface)
      .attr('stroke', COLORS.primaryLight)
      .attr('stroke-width', 2)
      .transition()
      .duration(300)
      .delay((_, i) => 800 + i * 50)
      .attr('r', 4);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left + innerWidth / 2 - 80}, ${height - 15})`);

    const legendItems = [
      { label: 'Commons', color: COLORS.primary },
      { label: 'Lords', color: COLORS.accent }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * 100}, 0)`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color)
        .attr('rx', 2);

      legendItem.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('fill', COLORS.subtle)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .text(item.label);
    });
  };

  const drawAllMentionsChart = (
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    contributions: ContributionData[],
    innerWidth: number,
    innerHeight: number,
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    margin: { top: number; right: number; bottom: number; left: number },
    height: number
  ) => {
    if (!contributions || contributions.length === 0) return;

    // Time scale for x-axis
    const startDate = new Date(2025, 0, 1);
    const endDate = new Date();
    
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, innerWidth]);

    // Y scale - just two positions for Commons and Lords
    const yScale = d3.scalePoint()
      .domain(['Commons', 'Lords'])
      .range([innerHeight * 0.3, innerHeight * 0.7])
      .padding(0.5);

    // Grid lines (vertical for months)
    const months = d3.timeMonths(startDate, endDate);
    g.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(months)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .attr('stroke', COLORS.border)
      .attr('stroke-dasharray', '2,2')
      .attr('opacity', 0.3);

    // Horizontal lines for houses
    ['Commons', 'Lords'].forEach(house => {
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yScale(house) || 0)
        .attr('y2', yScale(house) || 0)
        .attr('stroke', COLORS.border)
        .attr('stroke-width', 1)
        .attr('opacity', 0.5);
    });

    // X Axis
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(d3.timeMonth.every(1))
          .tickFormat(d => d3.timeFormat('%b %y')(d as Date))
          .tickSize(0)
      );

    xAxis.select('.domain').attr('stroke', COLORS.border);
    xAxis.selectAll('text')
      .attr('fill', COLORS.subtle)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '9px')
      .attr('transform', 'rotate(-45)')
      .attr('text-anchor', 'end')
      .attr('dx', '-0.5em')
      .attr('dy', '0.5em');

    // Y Axis labels
    g.append('g')
      .selectAll('text')
      .data(['Commons', 'Lords'])
      .join('text')
      .attr('x', -10)
      .attr('y', d => yScale(d) || 0)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', COLORS.subtle)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', '10px')
      .text(d => d);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', COLORS.surface)
      .style('border', `1px solid ${COLORS.border}`)
      .style('padding', '8px 12px')
      .style('font-family', 'JetBrains Mono, monospace')
      .style('font-size', '11px')
      .style('color', COLORS.primary)
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('max-width', '300px');

    // Prepare deterministic positions and group tight points by day + house
    type ContributionPoint = ContributionData & {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
    };

    const basePoints: ContributionPoint[] = contributions.map(d => {
      const baseY = yScale(d.house) || innerHeight / 2;
      const baseX = xScale(d.date);
      return {
        ...d,
        baseX,
        baseY,
        x: baseX,
        y: baseY,
      };
    });

    // Group points that share the same day and house, then vertically offset within the group
    const groups = d3.group(
      basePoints,
      d => `${d.date.toISOString().split('T')[0]}|${d.house}`
    );

    const spreadStep = 8; // px vertical separation between stacked points

    groups.forEach(group => {
      if (group.length === 1) return;
      const n = group.length;
      group.forEach((p, i) => {
        const offsetIndex = i - (n - 1) / 2;
        p.y = p.baseY + offsetIndex * spreadStep;
      });
    });

    const points: ContributionPoint[] = Array.from(groups.values()).flat();

    // Plot each mention as a dot
    g.selectAll('.mention-dot')
      .data(points)
      .join('circle')
      .attr('class', 'mention-dot')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('fill', d => d.house === 'Commons' ? COLORS.primary : COLORS.accent)
      .attr('stroke', COLORS.surface)
      .attr('stroke-width', 1.5)
      .attr('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8);
        
        const dateStr = d3.timeFormat('%d %b %Y')(d.date);
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">${dateStr}</div>
            <div style="color: ${COLORS.subtle}; margin-bottom: 2px;">${d.member}</div>
            <div style="font-size: 10px;">${d.debate}</div>
          `);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5);
        tooltip.style('visibility', 'hidden');
      })
      .transition()
      .duration(400)
      .delay((_, i) => i * 10)
      .attr('r', 5);

    // Legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left + innerWidth / 2 - 80}, ${height - 15})`);

    const legendItems = [
      { label: 'Commons', color: COLORS.primary },
      { label: 'Lords', color: COLORS.accent }
    ];

    legendItems.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * 100}, 0)`);

      legendItem.append('circle')
        .attr('cx', 6)
        .attr('cy', 6)
        .attr('r', 5)
        .attr('fill', item.color);

      legendItem.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .attr('fill', COLORS.subtle)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .text(item.label);
    });

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };
  };

  return (
    <div className="w-full">
      {/* Toggle */}
      <div className="flex justify-end mb-4">
        <div className="inline-flex border border-border dark:border-dark-border bg-cream dark:bg-dark-bg">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              viewMode === 'monthly' 
                ? 'bg-primary text-cream' 
                : 'text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-accent'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
              viewMode === 'all' 
                ? 'bg-primary text-cream' 
                : 'text-subtle dark:text-dark-subtle hover:text-primary dark:hover:text-accent'
            }`}
          >
            All Mentions
          </button>
        </div>
      </div>
      
      <div ref={containerRef} className="w-full">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
};

export default MentionsChart;
