import React, { useState, useRef, useEffect } from "react";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { placemarkOptions } from "./mapStyles";

const MapComponent: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [transport, setTransport] = useState("plane");
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);  

  const handleMapClick = async (e: any) => {
    if (!ymapsRef.current || !mapRef.current) return;
    const coords = e.get("coords");
    setMarkerPosition(coords);
    mapRef.current.setCenter(coords);

    try {
      const result = await ymapsRef.current.geocode(coords);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const address = firstGeoObject.getAddressLine();
        setFrom(address);
      }
    } catch {}
  }

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
    };
    
    const observer = new MutationObserver(hideCopyright);
    observer.observe(document.body, { childList: true, subtree: true });
    hideCopyright();
    return () => observer.disconnect();
  }, []);

  const setFromAddress = async (address: string) => {
    console.log("Выбранный адрес:", address);
    setFrom(address);
    if (ymapsRef.current) {
      const result = await ymapsRef.current.geocode(address);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        setMarkerPosition(coords);
        mapRef.current.setCenter(coords);
      }
    }
  }

  const setToAddress = async (address: string) => {
    console.log("Выбранный адрес:", address);
    setTo(address);
    if (ymapsRef.current) {
      const result = await ymapsRef.current.geocode(address);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        const coords = firstGeoObject.geometry.getCoordinates();
        setMarkerPosition(coords);
        mapRef.current.setCenter(coords);
      }
    }
  }

  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) return;
    try {
      const res = await fetch(`http://192.168.1.117:5000/api/suggest?text=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }});
      const data = await res.json();
      const suggestionsList = data.results?.map((item: any) => item.title.text) || [];
      setSuggestions(suggestionsList);
      console.log("Подсказки:", suggestionsList);
    } catch (error) {
      console.error("Ошибка получения подсказок:", error);
    }
  };  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: "from" | "to") => {
    const value = e.target.value;
    if (field === "from") setFrom(value);
    else setTo(value);
    setActiveField(field);
    fetchSuggestions(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let cityFrom = "";
    let cityTo = "";
  
    if (ymapsRef.current) {
      if (from) {
        const result = await ymapsRef.current.geocode(from);
        const firstGeoObject = result.geoObjects.get(0);
        cityFrom = firstGeoObject?.getLocalities()?.[0] || "";
      }
      if (to) {
        const result = await ymapsRef.current.geocode(to);
        const firstGeoObject = result.geoObjects.get(0);
        cityTo = firstGeoObject?.getLocalities()?.[0] || "";
      }
    }
  
    console.log({ from, cityFrom, to, cityTo, date, transport });
  
    // отправка данных на бэкенд
  };  

  const enterFrom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      setFromAddress(suggestions[0]);
    }
  };

  const enterTo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      e.preventDefault();
      setToAddress(suggestions[0]);
    }
  };

  return (
    <YMaps query={{ apikey: "8ad65017-d80a-42f4-87b8-90da37b9211a", lang: "ru_RU", load: "geocode" }}>
      <form className="booking-form" onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            placeholder="Откуда"
            value={from}
            onChange={(e) => handleInputChange(e, "from")}
            onFocus={() => setActiveField("from")}
            onKeyDown={enterFrom}
            required
          />
          <ul className="suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={index}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFromAddress(suggestion);
                      setSuggestions([]);
                    }}>
                  {suggestion}
                </li>
              ))}
          </ul>
        </div>
        <div className="input-container">
        <input
          type="text"
          placeholder="Куда"
          value={to}
          onChange={(e) => handleInputChange(e, "to")}
          onFocus={() => setActiveField("to")}
          onKeyDown={enterTo}
          required
        />
        <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li key={index}
                  onClick={(event) => {
                    event.stopPropagation();
                    setToAddress(suggestion);
                    setSuggestions([]);
                  }}>
                {suggestion}
              </li>
            ))}
        </ul>
        </div>
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
        <select value={transport} onChange={(e) => setTransport(e.target.value)} required>
          <option value="bus">Автобус</option>
          <option value="train">Поезд</option>
          <option value="plane">Самолёт</option>
          <option value="mix">Микс</option>
        </select>
        <button type="submit">Найти</button>
      </form>
      <Map
        defaultState={{ center: [55.751574, 37.573856], zoom: 17, controls: [] }}
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
        instanceRef={(ref) => (mapRef.current = ref)}
      >
        {markerPosition && <Placemark geometry={markerPosition} options={placemarkOptions} />}
      </Map>
    </YMaps>
  );
};

export default MapComponent;
