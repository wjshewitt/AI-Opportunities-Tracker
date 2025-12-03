import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Recommendation, Status } from '../types';

interface DeadlineHorizonProps {
  data: Recommendation[];
  onRecommendationClick?: (id: string) => void;
}

interface ParsedDeadline extends Partial<d3.SimulationNodeDatum> {
  id: string;
  title: string;
  department: string;
  status: Status;
  horizon: 'short' | 'medium' | 'long';
  dateValue: number;
  dateLabel: string;
}

const parseTimeline = (timeline: string): { horizon: 'short' | 'medium' | 'long'; dateValue: number; dateLabel: string } => {
  const lower = timeline.toLowerCase();
  
  // Extract year
  const yearMatch = timeline.match(/20\d{2}/);
  const year = yearMatch ? parseInt(yearMatch[0]) : 2025;
  
  // Determine season/quarter offset
  let seasonOffset = 0.5;
  let dateLabel = timeline;
  
  if (lower.includes('spring')) {
    seasonOffset = 0.25;
    dateLabel = `Spring ${year}`;
  } else if (lower.includes('summer')) {
    seasonOffset = 0.5;
    dateLabel = `Summer ${year}`;
  } else if (lower.includes('autumn') || lower.includes('fall')) {
    seasonOffset = 0.75;
    dateLabel = `Autumn ${year}`;
  } else if (lower.includes('end of')) {
    seasonOffset = 0.9;
    dateLabel = `End ${year}`;
  } else if (lower.includes('q1') || lower.includes('january') || lower.includes('february') || lower.includes('march')) {
    seasonOffset = 0.2;
  } else if (lower.includes('q2') || lower.includes('april') || lower.includes('may') || lower.includes('june')) {
    seasonOffset = 0.4;
  } else if (lower.includes('q3') || lower.includes('july') || lower.includes('august') || lower.includes('september')) {
    seasonOffset = 0.6;
  } else if (lower.includes('q4') || lower.includes('october') || lower.includes('november') || lower.includes('december')) {
    seasonOffset = 0.85;
  }
  
  const dateValue = year + seasonOffset;
  
  // Categorize into horizons (based on reference point of early 2025)
  let horizon: 'short' | 'medium' | 'long';
  if (dateValue <= 2025.6) {
    horizon = 'short';
  } else if (dateValue <= 2026.5) {
    horizon = 'medium';
  } else {
    horizon = 'long';
  }
  
  // Handle special cases
  if (lower.includes('continuous') || lower.includes('ongoing') || lower.includes('thereafter')) {
    horizon = 'long';
    dateLabel = 'Ongoing';
  }
  
  return { horizon, dateValue, dateLabel };
};

const statusColors: Record<Status, string> = {
  [Status.COMPLETED]: '#122623',
  [Status.ON_TRACK]: '#D9F85E',
  [Status.PARTIALLY]: '#FFB800',
  [Status.DELAYED]: '#FF4D00',
  [Status.NOT_STARTED]: '#CDCBC4'
};

const DeadlineHorizon: React.FC<DeadlineHorizonProps> = ({ data, onRecommendationClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Add ref to store simulation to stop it on unmount/update
  const simulationRef = useRef<d3.Simulation<ParsedDeadline, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    // Parse all deadlines
    const parsed: ParsedDeadline[] = data.map(d => {
      const { horizon, dateValue, dateLabel } = parseTimeline(d.deliveryTimeline);
      return {
        id: d.id,
        title: d.title.length > 60 ? d.title.slice(0, 60) + '...' : d.title,
        department: d.department,
        status: d.status,
        horizon,
        dateValue,
        dateLabel
      };
    });

    const horizons: ('short' | 'medium' | 'long')[] = ['short', 'medium', 'long'];
    const horizonLabels = {
      short: 'Short-term',
      medium: 'Medium-term',
      long: 'Long-term'
    };
    const horizonSubtitles = {
      short: '0-6 months',
      medium: '6-18 months',
      long: '18+ months'
    };

    // Get container dimensions
    const containerWidth = containerRef.current.clientWidth;
    const width = containerWidth;
    const laneHeight = 120; // Increased for better breathing room
    const margin = { top: 40, right: 50, bottom: 50, left: 140 };
    const height = laneHeight * 3 + margin.top + margin.bottom;

    // Clear previous content
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;

    // X scale for date positioning
    const allDates = parsed.map(d => d.dateValue);
    const minDate = Math.min(...allDates, 2024.8); // Ensure we start before 2025
    const maxDate = Math.max(...allDates, 2027.2); // Ensure we end after 2027
    
    const xScale = d3.scaleLinear()
      .domain([minDate, maxDate])
      .range([0, innerWidth]);

    // Create tooltip (improved styling)
    let tooltip = d3.select('body').select('.deadline-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'deadline-tooltip')
        .style('position', 'absolute')
        .style('visibility', 'hidden')
        .style('background-color', 'rgba(18, 38, 35, 0.95)') // Dark semi-transparent
        .style('backdrop-filter', 'blur(8px)')
        .style('color', '#F2F0E9')
        .style('padding', '16px')
        .style('border-radius', '8px')
        .style('border', '1px solid rgba(255,255,255,0.1)')
        .style('font-family', 'Inter, sans-serif')
        .style('font-size', '13px')
        .style('max-width', '320px')
        .style('z-index', '1000')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 10px 40px -10px rgba(0,0,0,0.5)');
    }

    // Draw vertical grid lines for years
    const yearGrid = g.append('g').attr('class', 'grid-lines');
    const years = d3.range(Math.floor(minDate), Math.ceil(maxDate) + 1);

    yearGrid.selectAll('line')
      .data(years)
      .join('line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', laneHeight * 3)
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.05)
      .attr('stroke-dasharray', '4,4')
      .attr('class', 'text-primary dark:text-dark-text');

    // Draw horizons
    horizons.forEach((horizon, i) => {
      const yCenter = i * laneHeight + laneHeight / 2;
      // Filter data for this horizon
      const horizonData = parsed.filter(d => d.horizon === horizon).map(d => ({...d})); // Clone to avoid mutating original parsed array in simulation

      // Lane background (alternating)
      g.append('rect')
        .attr('x', -margin.left + 20) // Extend to left edge roughly
        .attr('y', i * laneHeight)
        .attr('width', width - 40)
        .attr('height', laneHeight)
        .attr('fill', i % 2 === 0 ? 'currentColor' : 'transparent')
        .attr('opacity', 0.02) // Use opacity instead of color for theme compatibility
        .attr('class', 'text-primary dark:text-white');

      // Horizon Label Group
      const labelG = g.append('g')
        .attr('transform', `translate(-20, ${yCenter})`);

      labelG.append('text')
        .attr('text-anchor', 'end')
        .attr('y', -6)
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', '700')
        .attr('font-size', '14px')
        .attr('fill', 'currentColor')
        .attr('class', 'text-primary dark:text-dark-text')
        .text(horizonLabels[horizon]);

      labelG.append('text')
        .attr('text-anchor', 'end')
        .attr('y', 12)
        .attr('font-family', 'JetBrains Mono, monospace')
        .attr('font-size', '10px')
        .attr('fill', 'currentColor')
        .attr('class', 'text-subtle dark:text-dark-subtle')
        .attr('letter-spacing', '0.05em')
        .text(horizonSubtitles[horizon]);

      // Center line
      g.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', yCenter)
        .attr('y2', yCenter)
        .attr('stroke', 'currentColor')
        .attr('stroke-opacity', 0.1)
        .attr('class', 'text-primary dark:text-dark-text');

      // Force Simulation for layout
      // We only need to run this once per render to calculate positions
      const simulation = d3.forceSimulation(horizonData as any)
        .force('x', d3.forceX((d: any) => xScale(d.dateValue)).strength(1))
        .force('y', d3.forceY(yCenter).strength(0.05)) // Weak y-force to keep near center
        .force('collide', d3.forceCollide(9).iterations(3)) // Prevent overlap
        .stop();

      // Run simulation significantly to settle positions
      for (let k = 0; k < 120; ++k) simulation.tick();

      // Draw dots
      const dots = g.selectAll(`.dot-group-${horizon}`)
        .data(horizonData)
        .join('g')
        .attr('class', `dot-group-${horizon} group`)
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y})`);

      // Interaction circle (invisible, larger target)
      dots.append('circle')
        .attr('r', 15)
        .attr('fill', 'transparent')
        .style('cursor', onRecommendationClick ? 'pointer' : 'default')
        .on('click', (event, d: any) => {
          if (onRecommendationClick) {
            onRecommendationClick(d.id);
          }
        });

      // Visible dot
      dots.append('circle')
        .attr('r', 6)
        .attr('fill', (d: any) => statusColors[d.status])
        .attr('stroke', 'var(--bg-color, #F2F0E9)') // Dynamic stroke based on theme? keeping simple for now
        .attr('stroke-width', 2)
        .attr('class', 'stroke-cream dark:stroke-dark-surface transition-transform duration-200 ease-out shadow-sm')
        .style('pointer-events', 'none'); // Let parent group handle events

      // Hover interactions
      dots
        .on('mouseenter', function(event, d: any) {
          // Dim others
          g.selectAll('circle').style('opacity', 0.3);
          d3.select(this).selectAll('circle').style('opacity', 1).attr('transform', 'scale(1.5)');
          
          // Draw connection line to axis
          g.append('line')
            .attr('class', 'hover-guide')
            .attr('x1', d.x)
            .attr('x2', d.x)
            .attr('y1', d.y)
            .attr('y2', laneHeight * 3 + 10)
            .attr('stroke', statusColors[d.status])
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '3,3')
            .attr('opacity', 0);

          g.select('.hover-guide').transition().duration(200).attr('opacity', 1);

          // Tooltip
          tooltip
            .style('visibility', 'visible')
            .html(`
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                 <span style="font-family: JetBrains Mono, monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.6);">${d.department}</span>
                 <span style="font-family: JetBrains Mono, monospace; font-size: 10px; text-transform: uppercase; color: #D9F85E;">${d.dateLabel}</span>
              </div>
              <div style="font-weight: 600; line-height: 1.4; margin-bottom: 12px; font-size: 14px;">${d.title}</div>
              <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: JetBrains Mono, monospace; text-transform: uppercase; background: rgba(255,255,255,0.1);">
                <span style="display: block; width: 6px; height: 6px; border-radius: 50%; background: ${statusColors[d.status]};"></span>
                <span>${d.status}</span>
              </div>
            `);
        })
        .on('mousemove', function(event) {
           tooltip
            .style('top', (event.pageY - 20) + 'px')
            .style('left', (event.pageX + 20) + 'px');
        })
        .on('mouseleave', function() {
          // Reset
          g.selectAll('circle').style('opacity', 1).attr('transform', 'scale(1)');
          g.selectAll('.hover-guide').remove();
          tooltip.style('visibility', 'hidden');
        });
    });

    // X-axis Labels
    g.selectAll('.year-label')
      .data(years)
      .join('text')
      .attr('class', 'year-label')
      .attr('x', d => xScale(d))
      .attr('y', laneHeight * 3 + 30)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-weight', 'bold')
      .attr('font-size', '12px')
      .attr('fill', 'currentColor')
      .attr('class', 'text-primary dark:text-dark-text opacity-60')
      .text(d => d);

    // Cleanup
    return () => {
      tooltip.style('visibility', 'hidden');
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, [data]);

  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      // Trigger re-render by updating the effect dependency
      const event = new Event('resize');
      window.dispatchEvent(event);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full" />
    </div>
  );
};

export default DeadlineHorizon;
