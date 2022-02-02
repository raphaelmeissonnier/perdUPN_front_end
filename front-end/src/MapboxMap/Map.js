
import { width } from '@mui/system';
import mapboxgl from 'mapbox-gl';
import React, { useRef, useEffect, useState } from 'react';
const {config} = require('../config');

mapboxgl.accessToken = config.MY_API_TOKEN;


const Map = () => {

    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);

    
    useEffect(() => {
       
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom,
            width:200
        });
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
            });
        const geolocate = new mapboxgl.GeolocateControl({
                positionOptions: {
                enableHighAccuracy: true
                },
                trackUserLocation: true
                });
                // Add the control to the map.
                map.current.addControl(geolocate);
                // Set an event listener that fires
                // when a geolocate event occurs.
                geolocate.on('geolocate', () => {
                    var userlocation = geolocate._lastKnownPosition;

                    var lat = userlocation.coords.latitude
                    var long = userlocation.coords.longitude
                    console.log('A geolocate event has occurred.',lat, long);
                    //Ajouter un marker plus cercle pour localiser le user sur la map
                });
    });

    return (
        <div>
            <div className="sidebar">
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
          <div style={{height:'400px', width:'800px'}}className="map-container" ref={mapContainer} />
        </div>
    );

}


export default Map