import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
import React, { useRef, useEffect, useState } from 'react';
import './Map.css'
import { styled } from '@material-ui/core/styles';
import {Box, Card, FormControlLabel, FormLabel, Paper, Radio, RadioGroup, Slider} from '@material-ui/core';
import Stack from '@mui/material/Stack';
import SuggestionObjetPerdu from '../Objet/SuggestionObjetPerdu';
import i18n from "../../Translation/i18n";


const {config} = require('../../config');


mapboxgl.accessToken = config.MY_API_TOKEN;


const Map = (props) => {

    const mapContainer = useRef(null);
    let [map,setMap] = useState(null);
    const [lng, setLng] = useState(props.longitude.toFixed(4));
    const [lat, setLat] = useState(props.latitude.toFixed(4));
    const [longUser] = useState(props.longitude);
    const [latUser] = useState(props.latitude);
    const [zoom, setZoom] = useState(10);
    const [rayon, setRayon] = useState(100);
    const [items, setItems] = useState([]);
    const [changed, setChanged] = useState(1);
    const [clickedTrajet, setClickedTrajet] = useState(false);
    const marks = [
        {
            value: 5,
            label: '5Km',
        },
        {
            value: 10,
            label: '10Km',
        },
        {
            value: 15,
            label: '15Km',
        },
        {
            value: 20,
            label: '20Km',
        },
    ];

    useEffect(() => {
        // initialize map only once
        if(longUser && latUser){
            //Création de la map
            map = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [longUser,latUser],
                zoom: zoom,
                width: 300
            });

            //Handle map mouvment
            map.on('move', () => {
                setLng(map.getCenter().lng.toFixed(4));
                setLat(map.getCenter().lat.toFixed(4));
                setZoom(map.getZoom().toFixed(2));
            });

            // Add the control to the map.
            const geolocate = new mapboxgl.GeolocateControl({
                positionOptions: {
                enableHighAccuracy: true
                },
                trackUserLocation: true
            });
            map.addControl(geolocate);

            // Set an event listener that fires when a geolocate event occurs.
            geolocate.on('geolocate', () => {
                var userlocation = geolocate._lastKnownPosition;
                var lati = userlocation.coords.latitude
                var long = userlocation.coords.longitude
                console.log('A geolocate event has occurred.',lati, long);
            });

            //Ajout des markers au rechargement de la map
            map.on("load", () => {
                console.log("Map.js - map: on load");
                setMap(map); // We declare the map as a State to make it available for every functions.
                ajoutMarkers(map, items);
            });

            map.on('click', 'marker', ()=>{
                map.getCanvas().style.cursor = 'pointer'
            })
        }
    }, [changed, rayon]);

    //Ajout des points sur la map
    async function ajoutMarkers(laMap,tabObjets){
        for(let tabValue of tabObjets){

            //Récupération de l'occurrence
            const tab = tabValue[0];

            //Contenu de la pop-up
            const innerHtmlContent = `<h3><b>Intitulé : ${tabValue[0].intitule}</b></h3>
                            <p>Description : ${tabValue[0].description}</p>
                            <p>Le <b>${tabValue[0].date}</b></p>`;
            const divElement = document.createElement('div');
            const assignBtn = document.createElement('div');
            assignBtn.innerHTML = `<center><button class="btn btn-success btn-simple text-white"> Y Aller !</button></center>`;
            divElement.innerHTML = innerHtmlContent;
            divElement.appendChild(assignBtn);
            assignBtn.addEventListener('click', (e) => {
                console.log('Button clicked: ', tab);
                getTrajet(tab, laMap);
            });

            //Création du marker
            const el = document.createElement("div");
            el.className = "marker";
            console.log("Longitude Marker ",tabValue[0].localisation.position.longitude)
            console.log("Latitude Marker ",tabValue[0].localisation.position.latitude)
            new mapboxgl.Marker(el)
                .setLngLat([tabValue[0].localisation.position.longitude, tabValue[0].localisation.position.latitude])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setDOMContent(divElement)
                )
                .addTo(laMap);
        }
    }

    //Au chargement de la page, on récupère les objets perdus et trouvés depuis le back
    useEffect(async () => {
        if(longUser && latUser && rayon){
            console.log("longUser: ", longUser);
            console.log("latUser: ", latUser);
            console.log("rayon: ", rayon);
            //On récupère les objets perdus
            let response_perdu = await fetch("/objetsperdus/"+longUser+"/"+latUser+"/"+rayon);
            let data_perdu = await response_perdu.json();

            //On récupère les objets trouvés
            let response_trouve = await fetch("/objetstrouves/"+longUser+"/"+latUser+"/"+rayon);
            let data_trouve = await response_trouve.json();

            console.log("MyMap.js - data_perdu",data_perdu)
            console.log("MyMap.js - data_trouve",data_trouve);

            //Concaténation des tableaux d'objets trouvés et perdus
            var objets_concat = data_perdu.concat(data_trouve);
            console.log("MyMap.js - Objets_concat: ", objets_concat);
            setItems(objets_concat);
            console.log("MyMap.js - items: ", items);
            setChanged(changed+1);
            console.log("Map.js - changed: ", changed);
        }
    }, [rayon]);


    //Calcul de l'itinéraire vers un point de la map
    async function getTrajet(objet,laMap){
        setClickedTrajet(true);
        console.log("getTrajet");
        const rep = await fetch('https://api.mapbox.com/directions/v5/mapbox/driving/'+longUser+','+latUser+';'+objet.localisation.position.longitude+','+objet.localisation.position.latitude+'?steps=true&geometries=geojson&access_token='+config.MY_API_TOKEN);
        const json = await rep.json();
        const data = json.routes[0];
        const steps = data.legs[0].steps;
        const route = data.geometry.coordinates;
        const geojson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route
            }
        }
        console.log("getRoutes objet", objet)
        console.log("getRoutes data", data)
        if (laMap.getSource('route')) {
            laMap.getSource('route').setData(geojson);
        }
        else {
            laMap.addLayer({
                id: 'route',
                type: 'line',
                source: {
                type: 'geojson',
                data: geojson
                },
                layout: {
                'line-join': 'round',
                'line-cap': 'round'
                },
                paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
                }
            });
        }
        const instructions = document.getElementById('instructions');
        
        let tripInstructions = '';
        for (const step of steps) {
            tripInstructions += `<li>${step.maneuver.instruction}</li>`;
        }
        instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
            data.duration / 60
            )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;

        console.log("Markers crées",tripInstructions)
    }
        

    const _handleRayonChange = (event, newValue) =>
    {
        setRayon(newValue);
        console.log("Rayon:", rayon);
    }
    const Item = styled(Paper)(({ theme }) => ({}));

    return (
        <div>
            <Stack direction="row" spacing={2} style={{width:'95%', marginLeft:'10px', marginRight:'10px', marginBottom:'10px', marginTop:'10px', textAlign:'center'}}>
            <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.53.0/mapbox-gl.css' rel='stylesheet' />
                <div style={{flexDirection:"column", alignItems:'center', justifyItems:'center', display:'flex', width:'100%', marginTop:"10px", marginLeft:"10px"}} className="card">
                    <FormLabel style={{color:'black', fontFamily:'Arvo', fontSize:20}}>{i18n.t('map.results')} <b>{items.length}</b> {i18n.t('map.foundNearYou')}</FormLabel>
                    <Card style={{height:'500px', width:'90%', marginTop:'10px'}} ref={mapContainer}>
                        <div className="sidebar">
                            {i18n.t('map.longitude')} {lng} | {i18n.t('map.latitude')} {lat} | {i18n.t('map.zoom')} {zoom}
                        </div>
                    </Card>
                    <Card id="instructions"/>
                    <div style={{flexDirection:"row", display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <FormLabel style={{color:'black', fontFamily:'Arvo', fontSize:20, marginRight:"10px"}}>{i18n.t('map.withinRadius')}</FormLabel>
                        <Box sx={{ width: 500 , marginTop:"15px"}}>
                            <Slider
                                aria-label="Restricted values"
                                defaultValue={10}
                                step={null}
                                valueLabelDisplay="auto"
                                marks={marks}
                                color="secondary"
                                min={5}
                                max={20}
                                onChange={_handleRayonChange}
                            />
                        </Box>
                        {/*<RadioGroup onChange={_handleRayonChange} value={rayon} row>
                            <FormControlLabel value="5" style={{fontFamily:'Arvo', fontSize:20, color:'black'}} control={<Radio size="small" color="primary"/>} label="5km" />
                            <FormControlLabel value="10" style={{fontFamily:'Arvo', fontSize:20, color:'black'}} control={<Radio size="small" color="primary"/>} label="10km" />
                            <FormControlLabel value="15" style={{fontFamily:'Arvo', fontSize:20, color:'black'}} control={<Radio size="small" color="primary"/>} label="15km" />
                            <FormControlLabel value="20" style={{fontFamily:'Arvo', fontSize:20, color:'black'}} control={<Radio size="small" color="primary"/>} label="20km" />
                        </RadioGroup>*/}

                        {/*{clickedTrajet ?
                        <div>
                            <Item style={{height:'500px', width:'90%', marginTop:'10px'}} ref={mapContainer}>
                                <div className="sidebar">
                                    {i18n.t('map.longitude')} {lng} | {i18n.t('map.latitude')} {lat} | {i18n.t('map.zoom')} {zoom}
                                </div>
                            </Item>
                            <div>
                            <Card id="instructions"/>
                            </div>
                        </div>
                        :
                        <div style={{height:'500px', width:'90%', marginTop:'10px'}} ref={mapContainer}>
                        <div className="sidebar">
                            {i18n.t('map.longitude')} {lng} | {i18n.t('map.latitude')} {lat} | {i18n.t('map.zoom')} {zoom}
                        </div>
                    </div>}*/}
                </div>
            </div>
                {longUser > 0 && latUser > 0 ? <SuggestionObjetPerdu longitude={longUser} latitude={latUser} /> : null }
            </Stack>
        </div>
    );
}


export default Map