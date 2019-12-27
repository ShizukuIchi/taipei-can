import L from 'leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet-geosearch/assets/css/leaflet.css';
import trash from './assets/trash.svg';
import loc from './assets/location.svg';
import { trashCanAPIs, parse, Trash, RawTrash } from './api/index';

const token = `pk.eyJ1Ijoic2gxenVrdSIsImEiOiJjazRpOXZlODkwang2M25tdzk3eHJldzM1In0.mNc3LEkqZZePbeaDxEnXCA`;
const ZOOM = 18;
const STATION_POSITION = L.latLng(25.0462, 121.5174);
const TAIPEI_BOUNDS = L.latLngBounds([24.9611, 121.4625], [25.1651, 121.6296]);
const map = L.map('map', {
  center: STATION_POSITION,
  zoom: ZOOM,
  maxBounds: TAIPEI_BOUNDS,
  minZoom: 14,
});
const trashIcon = L.icon({
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -7],
  iconUrl: trash,
});

L.tileLayer(
  'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    accessToken: token,
  },
).addTo(map);

function onLocationFound(e: L.LocationEvent): void {
  if (TAIPEI_BOUNDS.contains(e.latlng)) {
    map.setView(e.latlng, ZOOM);
  } else {
    alert('好像不在台北市欸...');
  }
}
function onLocationError(): void {
  alert('找不到你啦');
}
function onMapClick(e: L.LeafletMouseEvent): void {
  if (e.originalEvent.target === map.getContainer()) {
    map.setView(e.latlng, map.getZoom());
  }
}

const markers = new L.FeatureGroup();
function setMarkers(): void {
  trashCanAPIs.forEach(async api => {
    const res = await fetch(api);
    const json = await res.json();
    const results = json.result?.results ?? [];
    results.forEach((r: RawTrash) => {
      let trash: Trash;
      try {
        trash = parse(r);
      } catch {
        return;
      }
      const marker = L.marker([trash.lat, trash.lng], {
        icon: trashIcon,
      });

      marker.bindPopup(`${trash.district}${trash.road}${trash.detail}`);
      marker.off('click');
      marker.on('mouseover', () => {
        marker.openPopup();
      });
      marker.on('mouseout', (e: L.LeafletMouseEvent) => {
        const target = e.originalEvent.relatedTarget as Element;
        if (target?.closest?.('.leaflet-popup')) {
          const popupElement = marker.getPopup()?.getElement();
          const onMouseOut = (e: MouseEvent): void => {
            const target = e.relatedTarget as Element;
            if (target?.closest?.('.leaflet-popup')) return;
            marker.closePopup();
            popupElement?.removeEventListener('mouseout', onMouseOut);
          };
          popupElement?.addEventListener('mouseout', onMouseOut);
          return;
        }
        marker.closePopup();
      });
      markers.addLayer(marker);
    });
  });
}
map.addLayer(markers);
setMarkers();

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.on('click', onMapClick);

// add search
const provider = new OpenStreetMapProvider();
const wrapped = {
  async search({ query }: { query: string }) {
    const results = await provider.search({ query });
    return results.filter(({ x, y }) =>
      TAIPEI_BOUNDS.contains([Number(y), Number(x)]),
    );
  },
};
const searchControl = new GeoSearchControl({
  provider: wrapped,
});
map.addControl(searchControl);

const findMe = L.Control.extend({
  onAdd() {
    const container = document.createElement('div');
    const button = document.createElement('a');
    const content = document.createElement('div');
    const icon = document.createElement('img');
    icon.src = loc;
    container.className =
      'leaflet-bar leaflet-control leaflet-control-geosearch';
    button.className = 'leaflet-bar-part leaflet-bar-part-single';
    content.className = 'location';
    icon.className = 'location__icon';
    content.appendChild(icon);
    button.appendChild(content);
    container.appendChild(button);
    button.onclick = () => map.locate({ timeout: 3000 });
    return container;
  },
});
new findMe({ position: 'topleft' }).addTo(map);
