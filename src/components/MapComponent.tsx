import React from "react";
import { YMaps, Map, Placemark } from "react-yandex-maps";

const MapComponent: React.FC = () => {
  return (
    <YMaps>
      <Map
        defaultState={{
          center: [55.751574, 37.573856], // Центр карты (Москва)
          zoom: 10,
        }}
        width="100%"
        height="100%"
      >
        <Placemark geometry={[55.751574, 37.573856]} />
      </Map>
    </YMaps>
  );
};

export default MapComponent;
