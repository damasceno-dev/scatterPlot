"use client"
import { useEffect, useState } from "react"
import * as d3 from 'd3';

export default function Home() {

  const [selectedCyclist, setSelectedCyclist] = useState<Partial<CyclistDataByYear>>({});
  
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

  const result = useData("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")

  const svgWidth = 920;
  const svgHeight = 630;
  const paddingRight = 60;
  const paddingLeft = 90;
  const paddingTop = 60;
  const paddingBottom = 50;

  let yScale: d3.ScaleTime<number, number, number> = d3.scaleTime();
  let xScale: d3.ScaleLinear<number, number, never> = d3.scaleLinear();

  function minutesToTimeObject(timeString: string) : Date {
    // Split the time string into minutes and seconds
    const [minutes, seconds] = timeString.split(':').map(Number);
  
    // Return a new Date object with a reference date (e.g., January 1, 1900)
    return new Date(1900, 0, 1, 0, minutes, seconds);
  }

  // const minutesInDateTimeArray = result.map(x => minutesToTimeObject(x.Time));
  // const [minMinutes, maxMinutes] = d3.extent(minutesInDateTimeArray);

  const [minMinutes, maxMinutes] = d3.extent(result, r=> minutesToTimeObject(r.Time));
  const [minYear, maxYear] = d3.extent(result , r => r.Year);

  if (minMinutes !== undefined && maxMinutes !== undefined) {
    yScale = d3.scaleTime([  minMinutes, maxMinutes], [0 + paddingBottom,svgHeight -paddingTop]);
    console.log('minMinutes: ', yScale(minMinutes))
    console.log('maxMinutes: ', yScale(maxMinutes))
  }
  if (minYear !== undefined && maxYear !== undefined) {
    xScale = d3.scaleLinear([minYear, maxYear], [0 + paddingLeft, svgWidth - paddingRight]);
  }
  
  function selectCircle(selectedIndex: number,  e: React.MouseEvent<SVGCircleElement, MouseEvent>) {
    
    const hoveredCyclist = result.find((x, i) => i === selectedIndex);
    if (hoveredCyclist !== undefined) {
      setSelectedCyclist(hoveredCyclist);
    }

    const clientX = e.clientX;
    const clientY = e.clientY;
    const toolTipPadding = 6;
    setTooltipPosition({
      top: clientY + toolTipPadding, 
      left: clientX + toolTipPadding,
    });
    setToolTipAttrs('tooltip active opacity-80')
  }

  function unselectCircle() {
    setToolTipAttrs('tooltip opacity-0')
  }

  return (
    <main className="bg-gray-800 h-[100vh] w-full flex flex-col items-center justify-center">
      <div id='tooltip' className={`bg-slate-400  text-sm  font-bold p-2 absolute rounded text-black select-none pointer-events-none	${tooltipAttrs}`}
        style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}>
        {selectedCyclist.Name !== '' ? (
          <>
            <p>{selectedCyclist.Name}: {selectedCyclist.Nationality}</p>
            <p>Year: {selectedCyclist.Year}, Time: {selectedCyclist.Time}</p>
            <p className="mt-2">{selectedCyclist.Doping}</p> 
          </>
        ) :  (
          <></>
        )}
        
        
      </div>
      <div id="wrapper">
        <div id='title' className="flex flex-col items-center bg-gray-700 mt-2 pt-3">
          <h1 className="text-3xl">Doping in Professional Bicycle Racing</h1>
          <h2 className="text-xl">35 Fastest times up Alpe d&lsquo;Huez</h2>
        </div>
        <svg width={svgWidth} height={svgHeight} className="text-white bg-gray-700 ">
          <AxisLeft
            yScale={yScale}
            padding={{Bottom: paddingBottom, Left: paddingLeft, Right: paddingRight, Top: paddingTop}}
            svgHeight={svgHeight}
            color='white'
          />
          <AxisBottom
            xScale={xScale}
            padding={{Bottom: paddingBottom, Left: paddingLeft, Right: paddingRight, Top: paddingTop}}
            svgHeight={svgHeight}
            svgWidth={svgWidth}
            color='white'
          />
          {result.map((r,i) => (
            <CircleComponent
              key={i}
              elementIndex={i}
              radius={10}
              cx={xScale(r.Year)}
              dataXvalue={r.Year}
              cy={yScale(minutesToTimeObject(r.Time))}
              dataYvalue={r.Time}
              dopping={r.Doping}
              onMouseEnter={(i: number, e: React.MouseEvent<SVGCircleElement, MouseEvent>) => selectCircle(i, e)}
              onMouseLeave={unselectCircle}
            />
          ))}
          <Legend svgHeight={svgHeight} svgWidth={svgWidth}/>
        </svg>
      </div>
    </main>
  )
}

interface CircleComponentProps {
  elementIndex: number
  radius: number;
  cx: number;
  cy: number | undefined;
  dataXvalue: number;
  dataYvalue: string;
  dopping: string;
  onMouseEnter: (i: number, e: React.MouseEvent<SVGCircleElement, MouseEvent>) => void;
  onMouseLeave: () => void;
}

function CircleComponent({elementIndex, radius, cx, cy, dataXvalue, dataYvalue, dopping, onMouseEnter, onMouseLeave}:CircleComponentProps) {


  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
    setIsHovered(true);
    onMouseEnter(elementIndex, e);
  };


  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave()
  };


  return (
    <circle 
      className="transition-all duration-300"
      r={radius}
      cx={cx}
      data-xvalue={dataXvalue}
      cy={cy}
      data-yvalue={dataYvalue}
      stroke={isHovered ? 'white' : 'black'} 
      stroke-width={isHovered ? '3' : '1'} 
      fill={dopping ? 'orange' : 'teal'}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    ></circle>
  )
}

interface CyclistDataByYear {
  Time: string;
  Place: number;
  Seconds: number;
  Name: string;
  Year: number;
  Nationality: string;
  Doping: string;
  URL: string;
}


interface AxisProperties {
  svgHeight: number;  
  padding: {
   Bottom: number;
   Top: number;
   Left: number;
   Right: number;
  }
  color: string;
}


interface AxisLeftProperties extends AxisProperties {
  yScale: d3.ScaleTime<number, number, number>;

}

function AxisLeft({yScale, padding, svgHeight, color}: AxisLeftProperties) {
  // const timeFormat = d3.timeFormat("%M:%S");
  
  function DateFormatMMSS(date:Date) : string {
    let seconds = date.getSeconds().toString();
    let minutes = date.getMinutes().toString();
    if (seconds === '0') {
      seconds = '00';
    }
    if (Number(seconds) > 0 && Number(seconds) < 10) {
      seconds = '0' + seconds;
    }
    return minutes + ":" + seconds;
  }

  return (
      <g id='y-axis'>
        <path
          // d="M x1 y1 L x2 y2"
          d={`M ${padding.Left - 30} ${svgHeight - padding.Bottom + 25} L ${padding.Left- 30} ${padding.Top}`}
          stroke="currentColor"
        />
        <text transform="rotate(-90)" x="-360" y="20" fill={color}>Time in Minutes</text>

      {yScale && yScale.ticks().map((value,index) => (
            <g
              className='tick'
              key={index}
              // transform={`translate(${padding.Left - 30}, ${svgHeight - yScale(value)})`}
              //removes svgHeight to invert ticks position
              transform={`translate(${padding.Left - 30}, ${yScale(value)})`}
            >
              <line
                x2="4"
                x1="-3"
                stroke="currentColor"
              />
              <text
                key={index}
                fill={color}
                style={{
                  fontSize: "10px",
                  textAnchor: "middle",
                  transform: "translateX(-18px) translateY(3px)"
                }}>
                { DateFormatMMSS(value) }
              </text>
            </g>
      ))}
      </g>
  )
}


interface AxisBottomProperties extends AxisProperties {
  xScale: d3.ScaleLinear<number, number, never>;
  svgWidth: number;
}

function AxisBottom({xScale, padding, svgHeight, svgWidth, color}: AxisBottomProperties) {
  
  return (
      <g id='x-axis'>
        <path
        // d="M x1 y1 H x2 y2"
        d={`M ${padding.Left - 35} ${svgHeight-30} H ${svgWidth - padding.Right}`}
        stroke="currentColor"
        />
      {xScale && xScale.ticks().map((value,index) => (
              <g
              className='tick'
              key={index}
              transform={`translate(${xScale(value)}, ${svgHeight -30})`}
              >
                <line
                  y2="6"
                  stroke="currentColor"
                />
                <text
                  key={index}
                  fill={color}
                  style={{
                    fontSize: "10px",
                    textAnchor: "middle",
                    transform: "translateY(20px)"
                  }}>
                  { value }
                </text>
              </g>
      ))}
    </g>
  )
}

function Legend({svgHeight, svgWidth}:{svgHeight: number, svgWidth: number} ) {
  return (
    <g id='legend'>
      <rect x={svgWidth - 50} y={svgHeight/2 - 20} width={20} height={20} fill='teal'></rect>
      <text x={svgWidth - 220} y={svgHeight/2 -4} fill='white'>No doping allegations</text>
      
      <rect x={svgWidth - 50} y={svgHeight/2 + 10}  width={20} height={20} fill='orange'></rect>
      <text x={svgWidth - 283} y={svgHeight/2 + 25} fill='white'>Riders with doping allegations</text>
    </g>
  )
}


function useData(url: string) {
  const [data, setData] = useState<CyclistDataByYear[]>([]);
  useEffect(() => {
    let ignore = false;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if(!ignore) {
          setData(data);
        }
      });

      return () => {
        ignore = true;
      }
  }, [url])

  return data;
}