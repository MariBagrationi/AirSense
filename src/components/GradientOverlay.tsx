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
  { max: 50, color: "rgba(0,255,0,0.8)", label: "Good" },
  { max: 100, color: "rgba(255,255,0,0.8)", label: "Moderate" },
  { max: 150, color: "rgba(255,165,0,0.8)", label: "Unhealthy for Sensitive Groups" },
  { max: 200, color: "rgba(255,0,0,0.8)", label: "Unhealthy" },
  { max: 300, color: "rgba(139,0,0,0.8)", label: "Very Unhealthy" },
  { max: Infinity, color: "rgba(128,0,128,0.8)", label: "Hazardous" }
] as const;

const calculateAQI = (coords: Coords, timeOffset: number): number => {
  const baseAQI = (Math.sin(coords.lat * 0.1) + Math.cos(coords.lng * 0.1)) * 100 + 100;
  const timeVariation = Math.sin(timeOffset * Math.PI / 24) * 30;
  return Math.max(0, Math.min(500, Math.floor(baseAQI + timeVariation + (timeOffset * 2))));
};

const GradientOverlay: Component<GradientOverlayProps> = (props) => {
  const [timeIndex, setTimeIndex] = createSignal(0);
  const [isDragging, setIsDragging] = createSignal(false);
  let startX = 0;
  let overlayRef: HTMLDivElement | null = null;

  const currentAQI = () => {
    if (!props.coords) return null;
    return calculateAQI(props.coords, TIME_OFFSETS[timeIndex()]);
  };

  const gradientColor = () => {
    const aqi = currentAQI();
    if (aqi === null) return AQI_COLORS[0].color;
    const level = AQI_COLORS.find(range => aqi <= range.max);
    return level?.color || AQI_COLORS[0].color;
  };

  const aqiLabel = () => {
    const aqi = currentAQI();
    if (aqi === null) return "Unknown";
    const level = AQI_COLORS.find(range => aqi <= range.max);
    return level?.label || "Unknown";
  };

  const handlePointerDown = (e: PointerEvent) => {
    startX = e.clientX;
    setIsDragging(true);
    if (overlayRef) {
      overlayRef.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging()) return;
    const dx = e.clientX - startX;
    const threshold = 40;
    if (Math.abs(dx) > threshold) {
      if (dx > 0 && timeIndex() > 0) {
        setTimeIndex(prev => prev - 1);
        startX = e.clientX;
      } else if (dx < 0 && timeIndex() < TIME_OFFSETS.length - 1) {
        setTimeIndex(prev => prev + 1);
        startX = e.clientX;
      }
      props.onTimeChange?.(TIME_OFFSETS[timeIndex()]);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <Show when={props.coords}>
      <div
        ref={el => overlayRef = el}
        class="gradient-overlay"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "30px",
          transform: "translateX(-50%)",
          width: "320px",
          height: "160px",
          margin: "0 auto",
          background: `linear-gradient(to top, ${gradientColor()}, transparent)`,
          "pointer-events": "auto",
          "z-index": 1000,
          "border-radius": "16px",
          "box-shadow": "0 4px 12px rgba(0,0,0,0.3)",
          overflow: "hidden",
          "touch-action": "pan-x",
          cursor: "grab",
          transition: "background-color 0.3s ease",
          "backdrop-filter": "blur(8px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
            "user-select": "none"
          }}
        >
          <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
            <span>AQI: {currentAQI()}</span>
            <span
              style={{
                "font-size": "0.7em",
                opacity: "0.9",
                padding: "4px 8px",
                background: "rgba(0,0,0,0.2)",
                "border-radius": "12px"
              }}
            >
              {aqiLabel()}
            </span>
          </div>
          <div style={{ "font-size": "0.8em", opacity: "0.7", "margin-top": "4px" }}>
            {TIME_OFFSETS[timeIndex()] === 0 ? "Current" : `+${TIME_OFFSETS[timeIndex()]}h`}
          </div>
          <div style={{ "font-size": "0.7em", opacity: "0.6", "margin-top": "4px" }}>
            {`${props.coords!.lat.toFixed(3)}°, ${props.coords!.lng.toFixed(3)}°`}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10px",
            right: "10px",
            transform: "translateY(-50%)",
            display: "flex",
            "justify-content": "space-between",
            opacity: isDragging() ? "0.8" : "0.4",
            "pointer-events": "none",
            transition: "opacity 0.2s ease"
          }}
        >
          {timeIndex() > 0 && <div style={{ "font-size": "24px" }}>←</div>}
          {timeIndex() < TIME_OFFSETS.length - 1 && <div style={{ "font-size": "24px" }}>→</div>}
        </div>
      </div>
    </Show>
  );
};

export default GradientOverlay;
