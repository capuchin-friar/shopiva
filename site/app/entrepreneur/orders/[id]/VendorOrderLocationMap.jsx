"use client"

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

const NIGERIA_CENTER = [9.08, 8.67]
const DEFAULT_ZOOM = 5
const PIN_ZOOM = 14

function fixLeafletIcons() {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  })
}

function MapFocus({ lat, lng, hasPin }) {
  const map = useMap()
  useEffect(() => {
    map.invalidateSize()
    if (hasPin && Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], PIN_ZOOM, { duration: 0.85 })
    } else {
      map.setView(NIGERIA_CENTER, DEFAULT_ZOOM, { animate: false })
    }
  }, [lat, lng, hasPin, map])
  return null
}

/**
 * @param {{ lat: number, lng: number, label?: string, hasPin?: boolean }} props
 */
export default function VendorOrderLocationMap({ lat, lng, label, hasPin = true }) {
  useEffect(() => {
    fixLeafletIcons()
  }, [])

  const centerLat = hasPin && Number.isFinite(lat) ? lat : NIGERIA_CENTER[0]
  const centerLng = hasPin && Number.isFinite(lng) ? lng : NIGERIA_CENTER[1]
  const zoom = hasPin && Number.isFinite(lat) && Number.isFinite(lng) ? PIN_ZOOM : DEFAULT_ZOOM

  return (
    <div className="vendor-order-map-root">
      <MapContainer
        key={`${centerLat},${centerLng},${hasPin ? 1 : 0}`}
        center={[centerLat, centerLng]}
        zoom={zoom}
        className="vendor-order-map-leaflet"
        scrollWheelZoom={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus lat={lat} lng={lng} hasPin={hasPin} />
        {hasPin && Number.isFinite(lat) && Number.isFinite(lng) ? (
          <Marker position={[lat, lng]}>
            {label ? (
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                {label}
              </Tooltip>
            ) : null}
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  )
}
