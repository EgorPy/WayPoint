import React, { useState } from "react";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { placemarkOptions } from "./mapStyles";

const MapComponent: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [ymapsInstance, setYmapsInstance] = useState<any>(null);

  const handleMapClick = async (e: any) => {
    if (!ymapsInstance) {
      console.error("Yandex Maps API не загружен");
      return;
    }

    const coords = e.get("coords");
    setMarkerPosition(coords);
    console.log(`Координаты: ${coords}`);
    console.log(123);

    try {
      const res = await ymapsInstance.geocode(coords);
      const firstGeoObject = res.geoObjects.get(0);

      if (firstGeoObject) {
        const address = firstGeoObject.getAddressLine();
        console.log("Адрес:", address);
      } else {
        console.warn("Адрес не найден");
      }
    } catch (error) {
      console.error("Ошибка геокодирования:", error);
    }
  };

  return (
    <YMaps query={{ apikey: "8ad65017-d80a-42f4-87b8-90da37b9211a", lang: "ru_RU", load: "package.full" }}>
      <Map
        defaultState={{ center: [55.751574, 37.573856], zoom: 10 }}
        width="100%"
        height="100vh"
        onClick={handleMapClick}
        onLoad={(ymaps) => {
          ymaps.ready(() => {
            console.log("Yandex Maps API загружен");
            setYmapsInstance(ymaps);
          });
        }}
      >
        {markerPosition && <Placemark geometry={markerPosition} options={placemarkOptions} />}
      </Map>
    </YMaps>
  );
};

export default MapComponent;
