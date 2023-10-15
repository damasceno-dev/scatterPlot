"use client"
import { useEffect, useState } from "react"
import * as d3 from 'd3';

export default function Home() {

  const [selectedElement, setSelectedElement] = useState<number>(9999);
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0');
  const result = useData("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")

  const svgWidth = 920;
  const svgHeight = 630;
  const paddingRight = 20;
  const paddingLeft = 60;
  const paddingTop = 100;
  const paddingBottom = 30;

  let yScale: d3.ScaleTime<number, number, number | undefined> = d3.scaleTime();
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
    yScale = d3.scaleTime([minMinutes, maxMinutes], [0 + paddingBottom, svgHeight + paddingTop]);
  }
  if (minYear !== undefined && maxYear !== undefined) {
    xScale = d3.scaleLinear([minYear, maxYear], [0 + paddingLeft, svgWidth + paddingRight]);
  }
  
  function selectCircle(selectedIndex: number) {
    setSelectedElement(selectedIndex);
    setToolTipAttrs('opacity-80')
  }

  function unselectCircle() {
    setSelectedElement(9999);
    setToolTipAttrs('opacity-0')
  }

  console.log(selectedElement)

  return (
    <main className="bg-gray-800 h-[100vh] w-full flex flex-col items-center justify-center">
      <div className={`bg-slate-400 h-32 w-32 absolute rounded ${tooltipAttrs}`}></div>
      <svg width={svgWidth} height={svgHeight} className="bg-amber-100">
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
            onMouseEnter={selectCircle}
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
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

function CircleComponent({elementIndex, radius, cx, cy, dataXvalue, dataYvalue, dopping, onMouseEnter, onMouseLeave}:CircleComponentProps) {

  const hasDopping = dopping ? 'orange' : 'blue';

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter(elementIndex)
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave()
  };


  return (
    <circle 
      r={radius}
      cx={cx}
      data-xvalue={dataXvalue}
      cy={cy}
      data-yvalue={dataYvalue}
      stroke={isHovered ? 'green' : 'black'} stroke-width={isHovered ? '2' : '1'} fill={hasDopping}
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