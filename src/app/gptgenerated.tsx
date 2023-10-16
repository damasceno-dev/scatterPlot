import { useEffect, useState } from "react";
import * as d3 from 'd3';
import result from "postcss/lib/result";

export default function Home() {
  // ... Other code ...

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  function selectCircle(selectedIndex: number, event: MouseEvent) {
    setSelectedElement(selectedIndex);
    setToolTipAttrs('opacity-80');

    // Calculate the top and left attributes for the tooltip
    const tooltipWidth = 32; // Width of the tooltip
    const tooltipHeight = 32; // Height of the tooltip

    // Get client coordinates of the mouse event
    const clientX = event.clientX;
    const clientY = event.clientY;

    // Set the tooltip position relative to the client coordinates
    setTooltipPosition({
      top: clientY - tooltipHeight, // Adjust for tooltip height
      left: clientX - tooltipWidth / 2, // Center the tooltip horizontally
    });
  }

  // ... Other code ...

  return (
    <main className="bg-gray-800 h-[100vh] w-full flex flex-col items-center justify-center">
      <div
        id='tooltip'
        className={`bg-slate-400 h-32 w-32 absolute rounded ${tooltipAttrs}`}
        style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}
      ></div>
      <svg width={svgWidth} height={svgHeight} className="bg-amber-100">
        {result.map((r, i) => (
          <CircleComponent
            key={i}
            elementIndex={i}
            radius={10}
            cx={xScale(r.Year)}
            dataXvalue={r.Year}
            cy={yScale(minutesToTimeObject(r.Time))}
            dataYvalue={r.Time}
            dopping={r.Doping}
            onMouseEnter={(e) => selectCircle(i, e)}
            onMouseLeave={unselectCircle}
          ></CircleComponent>
        ))}
      </svg>
    </main>
  );
}



function selectCircle(selectedIndex: number, event: MouseEvent) {
    setSelectedElement(selectedIndex);
    setToolTipAttrs('opacity-80');
  
    // Calculate the top and left attributes for the tooltip
    const tooltipWidth = 32; // Width of the tooltip
    const tooltipHeight = 32; // Height of the tooltip
  
    // Get client coordinates of the mouse event
    const clientX = event.clientX;
    const clientY = event.clientY;
  
    // Set the tooltip position relative to the client coordinates
    setTooltipPosition({
      top: clientY - tooltipHeight, // Adjust for tooltip height
      left: clientX - tooltipWidth / 2, // Center the tooltip horizontally
    });
  }
  
  // ...
  
  <svg width={svgWidth} height={svgHeight} className="bg-amber-100">
    {result.map((r, i) => (
      <CircleComponent
        key={i}
        elementIndex={i}
        radius={10}
        cx={xScale(r.Year)}
        dataXvalue={r.Year}
        cy={yScale(minutesToTimeObject(r.Time))}
        dataYvalue={r.Time}
        dopping={r.Doping}
        onMouseEnter={(e) => selectCircle(i, e)}
        onMouseLeave={unselectCircle}
      ></CircleComponent>
    ))}
  </svg>
  