import React, { useState, useRef, useEffect } from "react";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { placemarkOptions } from "./mapStyles";

const MapComponent: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const ymapsRef = useRef<any>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const hideCopyright = () => {
      const selectors = [
        ".ymaps-2-1-79-map-copyrights-promo",
        ".ymaps-2-1-79-copyright__link"
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
          (el as HTMLElement).style.display = "none";
        });
      });
      const map = document.querySelector(".ymaps-2-1-79-events-pane");
      if (map) {
        (map as HTMLElement).style.setProperty("cursor", "default", "important");
      }
    };

    const observer = new MutationObserver(hideCopyright);
    observer.observe(document.body, { childList: true, subtree: true });

    hideCopyright();

    return () => observer.disconnect();
  }, []);

  const handleMapClick = async (e: any) => {
    if (!ymapsRef.current || !mapRef.current) return;
    const coords = e.get("coords");
    setMarkerPosition(coords);
    mapRef.current.setCenter(coords);

    const map = document.querySelector(".ymaps-2-1-79-events-pane");
    if (map) {
      (map as HTMLElement).style.setProperty("cursor", "default", "important");
    }

    try {
      const res = await ymapsRef.current.geocode(coords);
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) console.log("Адрес:", firstGeoObject.getAddressLine());
    } catch (error) {
      console.error("Ошибка геокодирования:", error);
    }
  };

  return (
    <YMaps query={{ apikey: "8ad65017-d80a-42f4-87b8-90da37b9211a", lang: "ru_RU", load: "geocode" }}>
      <Map
        defaultState={{ center: [55.751574, 37.573856], zoom: 17, controls: [], type: "yandex#map" }}
        width="100%"
        height="100vh"
        options={{ yandexMapDisablePoiInteractivity: true }}
        onClick={handleMapClick}
        onLoad={(ymaps) => {
          ymapsRef.current = ymaps;
          if (mapRef.current) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
                setMarkerPosition(coords);
                mapRef.current.setCenter(coords);
              },
              (error) => console.error("Ошибка определения местоположения:", error)
            );
          }
        }}
        instanceRef={(ref) => {
          if (ref) {
            mapRef.current = ref;
          }
        }}
      >
        {markerPosition && <Placemark geometry={markerPosition} options={placemarkOptions} />}
      </Map>
    </YMaps>
  );
};

export default MapComponent;
