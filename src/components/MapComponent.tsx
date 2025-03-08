import React, { useState, useRef, useEffect } from "react";
import { YMaps, Map, Placemark } from "react-yandex-maps";
import { useNavigate } from "react-router-dom";
import { placemarkOptions } from "./mapStyles";
import citiesData from "../cities.json";
import config from "../config.json"


const MapComponent: React.FC = () => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [transport, setTransport] = useState("Самолёт");
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);
  const mapRef = useRef<any>(null);
  const ymapsRef = useRef<any>(null);
  const navigate = useNavigate();
  const cities = citiesData.city.map((c: any) => c.name);

  const handleMapClick = async (e: any) => {
    if (!ymapsRef.current || !mapRef.current) return;
    const coords = e.get("coords");
    setMarkerPosition(coords);
    mapRef.current.setCenter(coords);

    try {
      const result = await ymapsRef.current.geocode(coords);
      const firstGeoObject = result.geoObjects.get(0);
      if (firstGeoObject) {
        // const address = firstGeoObject.getAddressLine();
        const cityFrom = firstGeoObject.getLocalities()[0]
        console.log(cityFrom);
        setFrom(cityFrom);
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

  const fetchSuggestions = (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const filtered = cities.filter((city) =>
      city.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
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
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      alert("Поля 'Откуда' и 'Куда' не могут быть одинаковыми");
      return;
    }
  
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
  
    console.log({ cityFrom, to, date, transport });
  
    const email = localStorage.getItem("token");
  
    if (email == null) {
      navigate("/login");
      window.location.reload();
    } else {
      const formData = new URLSearchParams();
      formData.append("city_from", cityFrom);
      formData.append("city_to", to);
      formData.append("date", date);
      formData.append("transport", transport);
      formData.append("email", email);
  
      try {
        const response = await fetch("/api/create_route", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString()
        });
  
        const data = await response.json();
        console.log("Ответ сервера:", data);
        navigate(`/route/${data.routeId}`, { state: { booking: data.routeId } });
      } catch (error) {
        console.error("Ошибка отправки данных:", error);
      }
    }
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
    <YMaps query={{ apikey: config.YMAPS_KEY, lang: "ru_RU", load: "geocode" }}>
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
              <li
                key={index}
                onClick={(event) => {
                  event.stopPropagation();
                  setFromAddress(suggestion);
                  setSuggestions([]);
                }}
              >
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
          <option value="Автобус">Автобус</option>
          <option value="Поезд">Поезд</option>
          <option value="Самолёт">Самолёт</option>
          <option value="Микс">Микс</option>
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
