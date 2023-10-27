import { useRef, useEffect, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_KEY;
import "./Map.css";
import rawData from "../../data/income.json";
import updatePercentiles from "../../utils";

function Map() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const tooltipRef = useRef(
    new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    })
  );
  const [year, setYear] = useState(1995);

  const data = useMemo(() => {
    return updatePercentiles(rawData, (f) => f.properties.income[year]);
  }, [year]);
  const categories = [
    { label: "Oth Percentile", color: "#3288bd" },
    { label: "Up to 12.5th Percentile", color: "#66c2a5" },
    { label: "Up to 25th Percentile", color: "#abdda4" },
    { label: "Up to 37.5th Percentile", color: "#e6f598" },
    { label: "Up to 50th Percentile", color: "#ffffbf" },
    { label: "Up to 67.5th Percentile", color: "#fee08b" },
    { label: "Up to 75th Percentile", color: "#fdae61" },
    { label: "Up to 87.5th Percentile", color: "#f46d43" },
    { label: "up to 100th Percentile", color: "#d53e4f" },
  ];
  function generateLegendItems(categories) {
    return categories.map((category, index) => (
      <div className="legend-item" key={index}>
        <div
          className="legend-color"
          style={{ backgroundColor: category.color }}
        ></div>
        <div className="legend-label">{category.label}</div>
      </div>
    ));
  }

  const handleSliderChange = (event) => {
    const newYear = parseInt(event.target.value, 10); // Parse slider value as integer
    setYear(newYear);
  };


  useEffect(() => {
    if (map.current) return;
    console.log("year changed")

    //makes new map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/dennisa91/clly607gf01i601ph8hwucpoq",
      center: [-95.432396, 36.631234],
      zoom: 3.7,
    });

    map.current.on("load", () => {
      map.current.addSource("mapSource", {
        type: "geojson",
        data: data,
      });

      map.current.addLayer({
        id: "mapFill",
        type: "fill",
        source: "mapSource",
        paint: {
          "fill-color": {
            property: "percentile",
            stops: [
              [0, "#3288bd"],
              [1, "#66c2a5"],
              [2, "#abdda4"],
              [3, "#e6f598"],
              [4, "#ffffbf"],
              [5, "#fee08b"],
              [6, "#fdae61"],
              [7, "#f46d43"],
              [8, "#d53e4f"],
            ],
          },
          "fill-opacity": 0.8,
        },
        metadata: { name: "Rate Incarcerated Population per Capita" },
      });

      map.current.addLayer({
        id: "mapFillOutline",
        type: "line",
        source: "mapSource",
        paint: {
          "line-color": "gray",
          "line-width": 0.25,
        },
      });

      map.current.on("mousemove", "mapFill", (e) => onFillHover(e));

      function onFillHover(e) {
        map.current.getCanvas().style.cursor = "pointer";
        if (e.features.length > 0) {
          const properties = e.features[0].properties;
          console.log(properties);
          const incomeData = JSON.parse(properties.income);

          tooltipRef.current.setLngLat(e.lngLat).setHTML(`
                <div className='mapboxgl-popup-content'>
                <h3>State: ${properties.name}</h3>
                <h3>Median household income: ${incomeData[year]} </h3>
                <h3>Percentile: ${(properties["percentile"] / 8) * 100} </h3>
                </div>
                `);
          tooltipRef.current.addTo(map.current);
        }
      }
      map.current.on("mouseleave", "mapFill", (e) => offPointHover(e));

      function offPointHover(e) {
        map.current.getCanvas().style.cursor = "";
        tooltipRef.current.remove();
      }
    });
  }, [year]);

  return (
    <>
      <div id="console">
        <h1>Median State Income</h1>
        <p>Data is from the US Census Bureau</p>
        <h2>Legend</h2>
        {generateLegendItems(categories)}
        <div className="session" id="sliderbar">
          <h2>
            Year: <label id="active-hour">{year}</label>
          </h2>
          <input
            id="slider"
            className="row"
            type="range"
            min="1995"
            max="2015"
            step="1"
            value={year}
            onChange={handleSliderChange}
          />
        </div>
        The year state is:{year}
      </div>
      <div ref={mapContainer} id="mapDiv"></div>
    </>
  );
}

export default Map;
