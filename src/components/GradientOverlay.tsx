// GradientOverlay.tsx
import { createSignal, type Component, Show } from "solid-js";

interface Coords {
  lat: number;
  lng: number;
}

interface GradientOverlayProps {
  coords: Coords | null;
  onTimeChange?: (timeOffset: number) => void;
}

// Prediction times (in hours from now)
const TIME_OFFSETS = [0, 3, 6, 12, 24];

const AQI_COLORS = [
  { max: 50, color: "rgba(0,255,0,0.5)" },
  { max: 100, color: "rgba(255,255,0,0.5)" },
  { max: 150, color: "rgba(255,165,0,0.5)" },
  { max: 200, color: "rgba(255,0,0,0.5)" },
  { max: 300, color: "rgba(139,0,0,0.5)" },
  { max: Infinity, color: "rgba(128,0,128,0.5)" },
] as const;

// Calculate mock AQI based on coordinates and time offset
const calculateAQI = (coords: Coords, timeOffset: number): number => {
  const base = (Math.abs(coords.lat * 10) + Math.abs(coords.lng * 10)) % 300;
  // Add some variation based on time offset
  return Math.floor(base + (timeOffset * 5 * Math.random()));
};

const GradientOverlay: Component<GradientOverlayProps> = (props) => {
  const [timeIndex, setTimeIndex] = createSignal(0);
  let startX = 0;
  let overlayRef: HTMLDivElement | null = null;

  const currentAQI = () => {
    if (!props.coords) return null;
    return calculateAQI(props.coords, TIME_OFFSETS[timeIndex()]);
  };

  const gradientColor = () => {
    const aqi = currentAQI();
    if (aqi === null) return AQI_COLORS[0].color;
    return AQI_COLORS.find(range => aqi <= range.max)?.color || AQI_COLORS[0].color;
  };

  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    if (overlayRef) {
      overlayRef.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    const dx = e.clientX - startX;
    const threshold = 40; // minimum swipe distance

    if (Math.abs(dx) > threshold) {
      if (dx > 0 && timeIndex() > 0) {
        // Swipe right - go back in time
        setTimeIndex(prev => prev - 1);
      } else if (dx < 0 && timeIndex() < TIME_OFFSETS.length - 1) {
        // Swipe left - go forward in time
        setTimeIndex(prev => prev + 1);
      }
      props.onTimeChange?.(TIME_OFFSETS[timeIndex()]);
    }
  };

  return (
    <Show when={props.coords}>
      <div
        ref={el => overlayRef = el}
        style={{
          position: "fixed",
          left: "20px",
          bottom: "20px",
          width: "280px",
          height: "150px",
          background: `linear-gradient(to top, ${gradientColor()}, transparent)`,
          "pointer-events": "auto",
          "z-index": 1000,
          "border-radius": "16px",
          "box-shadow": "0 4px 12px rgba(0,0,0,0.3)",
          overflow: "hidden",
          "touch-action": "pan-x",
          cursor: "grab",
          transition: "transform 0.2s ease",
          "backdrop-filter": "blur(8px)"
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "20px",
            color: "white",
            "font-weight": "bold",
            "font-size": "1.4em",
            "text-shadow": "0 2px 4px rgba(0,0,0,0.5)",
            "user-select": "none",
          }}
        >
          <div>AQI: {currentAQI()}</div>
          <div style={{ "font-size": "0.8em", opacity: 0.7 }}>
            {TIME_OFFSETS[timeIndex()] === 0 ? "Now" : `+${TIME_OFFSETS[timeIndex()]}h`}
          </div>
          <div style={{ "font-size": "0.7em", opacity: 0.6 }}>
            {`${props.coords?.lat.toFixed(3)}, ${props.coords?.lng.toFixed(3)}`}
          </div>
        </div>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          right: "10px",
          transform: "translateY(-50%)",
          display: "flex",
          "justify-content": "space-between",
          opacity: "0.6",
          "pointer-events": "none"
        }}>
          {timeIndex() > 0 && (
            <div style={{ "font-size": "24px" }}>←</div>
          )}
          {timeIndex() < TIME_OFFSETS.length - 1 && (
            <div style={{ "font-size": "24px" }}>→</div>
          )}
        </div>
      </div>
    </Show>
  );
};

export default GradientOverlay;


//import { Component, createSignal, onMount } from "solid-js";

//const AQI_API_URL = "https://api.waqi.info/feed/tbilisi/?token=YOUR_API_KEY";

// const AQI_COLORS = [
//   { max: 50, color: "rgba(0,255,0,0.5)" },
//   { max: 100, color: "rgba(255,255,0,0.5)" },
//   { max: 150, color: "rgba(255,165,0,0.5)" },
//   { max: 200, color: "rgba(255,0,0,0.5)" },
//   { max: 300, color: "rgba(139,0,0,0.5)" },
//   { max: Infinity, color: "rgba(128,0,128,0.5)" },
// ];


// export const GradientOverlay: Component = () => {
//   const [aqi, setAqi] = createSignal<number | null>(null);
//   const [gradientColor, setGradientColor] = createSignal<string>("rgba(0,255,0,0.5)");

//   const fetchAqi = async () => {
//     try {
//       const response = await fetch(AQI_API_URL);
//       const data = await response.json();
//       const aqiValue = data.data.aqi;
//       setAqi(aqiValue);
//       const color = AQI_COLORS.find((range) => aqiValue <= range.max)?.color || "rgba(0,255,0,0.5)";
//       setGradientColor(color);
//     } catch (error) {
//       console.error("Error fetching AQI data:", error);
//     }
//   };

//   onMount(() => {
//     fetchAqi();
//     const interval = setInterval(fetchAqi, 1800000); // update every 30 min
//     return () => clearInterval(interval);
//   });

//   return (
//     <div
//       style={{
//         position: "absolute",
//         bottom: "0",
//         left: "0",
//         right: "0",
//         height: "200px",
//         background: `linear-gradient(to top, ${gradientColor()}, transparent)`,
//         pointerEvents: "none" as const,
//         zIndex: 10,
//       }}
//     > 
//       <div style={{ position: "absolute", bottom: "10px", left: "10px", color: "white" }}>
//         <strong>AQI: {aqi() !== null ? aqi() : "Loading..."}</strong>
//       </div>
//     </div>
//   );
// };
