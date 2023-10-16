"use client"
import { useEffect, useState } from "react"
import * as d3 from 'd3';
import { utcMinutes } from "d3";

export default function Home() {

  const [selectedElement, setSelectedElement] = useState<number>(9999);
  
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

  const result = useData("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")

  const svgWidth = 920;
  const svgHeight = 630;
  const paddingRight = 60;
  const paddingLeft = 90;
  const paddingTop = 100;
  const paddingBottom = 80;

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

  const timeFormat = d3.timeFormat("%M:%S");

  if (minMinutes !== undefined && maxMinutes !== undefined) {
    yScale = d3.scaleTime([minMinutes, maxMinutes], [0 + paddingBottom, svgHeight -paddingTop]);
  }
  if (minYear !== undefined && maxYear !== undefined) {
    xScale = d3.scaleLinear([minYear, maxYear], [0 + paddingLeft, svgWidth - paddingRight]);
  }
  
  function selectCircle(selectedIndex: number,  e: React.MouseEvent<SVGCircleElement, MouseEvent>) {
    setSelectedElement(selectedIndex);

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
    setSelectedElement(9999);
    setToolTipAttrs('tooltip opacity-0')
  }

  return (
    <main className="bg-gray-800 h-[100vh] w-full flex flex-col items-center justify-center">
      <div id='tooltip' className={`bg-slate-400 h-32 w-32 absolute rounded select-none pointer-events-none	${tooltipAttrs}`}
        style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}></div>
      <svg width={svgWidth} height={svgHeight} className="bg-amber-100 text-black">
        <AxisLeft
          yScale={yScale}
          padding={{Bottom: paddingBottom, Left: paddingLeft, Right: paddingRight, Top: paddingTop}}
          svgHeight={svgHeight}
        ></AxisLeft>
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
          ></CircleComponent>
        ))}
      </svg>
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
      stroke={isHovered ? 'green' : 'black'} 
      stroke-width={isHovered ? '3' : '1'} 
      fill={dopping ? 'orange' : 'blue'}
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
}


interface AxisLeftProperties extends AxisProperties {
  yScale: d3.ScaleTime<number, number, number>;

}


function AxisLeft({yScale, padding, svgHeight}: AxisLeftProperties) {

  function DateFormatMMSS(date:Date) : string {
    let seconds = date.getSeconds().toString();
    let minutes = date.getMinutes().toString();
    if (seconds === '0') {
      seconds = '00';
    }
    return minutes + ":" + seconds;
  }

  return (
      <g id='y-axis'>
        <path
          // d="M x1 y1 L x2 y2"
          d={`M ${padding.Left} ${svgHeight - padding.Bottom} L ${padding.Left} ${padding.Top}`}
          stroke="currentColor"
        />
        <text transform="rotate(-90)" x="-360" y="50" className='fill-black'>Time in Minutes</text>

      {yScale && yScale.ticks().map((value,index) => (
            <g
              className='tick'
              key={index}
              transform={`translate(${padding.Left}, ${svgHeight - yScale(value)})`}
            >
              <line
                x2="4"
                x1="-3"
                stroke="currentColor"
              />
              <text
                key={index}
                className='fill-black'
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