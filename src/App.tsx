import "leaflet/dist/leaflet.css";
import React, { FormEvent, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import Leaflet from "leaflet";
import { fetchLocalMapBox } from "./apiMapBox";
import AsyncSelect from "react-select/async";
import uuid from 'react-uuid'

import mapPackage from "./assets/simbolo-de-reciclagem.png";
import mapPin from "./assets/pin.svg";

import "./App.css";

const initialPosition = { lat: -3.088103, lng: -59.976616 };

const mapPackageIcon = Leaflet.icon({
  iconUrl: mapPackage,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

const mapPinIcon = Leaflet.icon({
  iconUrl: mapPin,
  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [170, 2],
});

interface Delivery {
  id: string;
  name: string;
  address: string;
  obs: string;
  date: string;
  latitude: number;
  longitude: number;
}

type Position = {
  longitude: number;
  latitude: number;
};


function App() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [position, setPosition] = useState<Position | null>(null);
  const [name, setName] = useState("");
  const [obs, setObs] = useState("Área abrange do Coroado ao Japiim");
  const [date, setDate] = useState("");

  const [address, setAddress] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const [location, setLocation] = useState(initialPosition);

  const loadOptions = async (inputValue: string, callback: any) => {
    if (inputValue.length < 5) return;
    let places: any = [];
    const response = await fetchLocalMapBox(inputValue);
    response.features.map((item: any) => {
      return places.push({
        label: item.place_name,
        value: item.place_name,
        coords: item.center,
        place: item.place_name,
      });
    });
    callback(places);
    return places
  };
  const handleChangeSelect = (event: any) => {
    console.log("changed", event);
    setPosition({
      longitude: event.coords[0],
      latitude: event.coords[1],
    });
    setAddress({ label: event.place, value: event.place });
    setLocation({
      lng: event.coords[0],
      lat: event.coords[1],
    });
  };
  async function handleSubmit(event: FormEvent) {
  event.preventDefault();
  if (!address || !name) return;
  setDeliveries([
    ...deliveries,
    {
      id: uuid(),
      name,
      address: address?.value || "",
      obs,
      date,
      latitude: location.lat,
      longitude: location.lng,
    },
  ]);

    setName("");
    setAddress(null);
    setObs("Área abrange do Coroado ao Japiim");
    setDate("");
    setPosition(null);
  }

  return (
    <div id="page-map">
      <main>
          <form onSubmit={handleSubmit} className="landing-page-form">
            <fieldset>
              <legend>Coleta Point</legend>
  
              <div className="input-block">
                <label htmlFor="name">Nome da Área</label>
                <input
                  id="name"
                  placeholder="Digite o nome da área de coleta"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
  
              <div className="input-block">
                <label htmlFor="address">Endereço</label>
                <AsyncSelect
                  placeholder="Digite seu endereço..."
                  classNamePrefix="filter"
                  cacheOptions
                  loadOptions={loadOptions}
                  onChange={handleChangeSelect}
                  value={address}
                />
              </div>
  
              <div className="input-block">
                <label htmlFor="date">Data de Coleta</label>
                <input type="date" id="date" value={date} onChange={(event) => setDate(event.target.value)} />
              </div>

              <div className="input-block">
                <label htmlFor="obs">Observação</label>
                <textarea onChange={(event) => setObs(event.target.value)} value={obs} name="obs" id="obs"></textarea>
              </div>

            </fieldset>
  
            <button className="confirm-button" type="submit">
              Confirmar
            </button>
          </form>
        </main>
      <MapContainer
        center={location}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        {/* <TileLayer url="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_ACCESS_TOKEN_MAP_BOX}`}
        />

        {position && (
          <Marker
            icon={mapPinIcon}
            position={[position.latitude, position.longitude]}
          ></Marker>
        )}

        {deliveries.map((delivery) => (
          <Marker
            key={delivery.id}
            icon={mapPackageIcon}
            position={[delivery.latitude, delivery.longitude]}
          >
            <Popup
              closeButton={false}
              minWidth={240}
              maxWidth={240}
              className="map-popup"
            >
              <div>
                <h3>{delivery.name}</h3>
                <p>
                  {delivery.address}
                </p>
                <p>{delivery.date.split('-').reverse().join('/')}</p>
                <p>{delivery.obs}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
  </div>

  );
}

export default App;

