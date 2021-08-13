let pymChild
mapboxgl.accessToken = 'pk.eyJ1Ijoic3VoYWlsLWJoYXQiLCJhIjoiY2tpbWxzbnZ1MGRqejJ4bncwNHl4anUzaiJ9.NsWEhUt8IvcwkFyDOh9h7g';
var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-85.75941, 38.25424], 
    zoom: 8,// starting zoom
    minZoom: 5.3,
    trackResize: true,
    dragRotate: false,
    touchZoomRotate: true
});
const zoomThreshold = 4
// const bbox = [ -85.94466936150155,38.1,-85.40492183942492,38.3]
const bbox = [ -85.8,38.1,-85.6,38.3]

map.fitBounds(bbox)

Promise.all([
	fetch('forced_entry.geojson'),
	fetch('sw_forced_entry.geojson')
]).then(function (responses) {
	return Promise.all(responses.map(function (response) {
		return response.json();
	}));
}).then(function ([fedata, swdata]) {
            // --------
    map.on('load', function() {
        var allMarkers=[];      

      function drawMarker(datapoints){     
  
            for (let i = 0; i < datapoints.features.length; i++) {

                if (datapoints.features[i].properties.year == 2019){
                    const lat= datapoints.features[i].properties.Latitude
                    const long = datapoints.features[i].properties.Longitude

                    const marker =new mapboxgl.Marker({color:'#4daf4a', opacity: 0.7})                
                    .setLngLat([long, lat])
                    .addTo(map)
                    allMarkers.push(marker);
                }
    
                if (datapoints.features[i].properties.year == 2020){
                    const lat= datapoints.features[i].properties.Latitude
                    const long = datapoints.features[i].properties.Longitude

                    const marker = new mapboxgl.Marker({color:'#377eb8', opacity: 0.7})
                    .setLngLat([long, lat])
                    .addTo(map);
                    allMarkers.push(marker);

                }
    
                if (datapoints.features[i].properties.year == 2021){
                    const lat= datapoints.features[i].properties.Latitude
                    const long = datapoints.features[i].properties.Longitude

                    const marker =new mapboxgl.Marker({color: '#a63603', opacity: 0.7})
                    .setLngLat([long, lat])
                    .addTo(map)
                    allMarkers.push(marker);

                }
            }
            // allMarkers.forEach((marker) => marker.remove())
        }


        function drawLayer (layerName, datapoint, layerId, sourceName, visibility,){
            map.addSource(layerName, {
                type: 'geojson',
                data:  datapoint
                });
            map.addLayer({
                id: layerId,
                type: 'circle',
                source: sourceName,
                layout: { visibility: 'visible' },
                paint: {
                // increase the radius of the circle as the zoom level and dbh value increases
                'circle-radius': {
                        'base': 1.75,
                        'stops': [
                        [12, 8],
                        [22, 180]
                        ]
                    },
                    'circle-color': {
                        property: 'year',
                        stops: [
                            [2019, '#4daf4a'],
                            [2020, '#377eb8'],
                            [2021, '#a63603']
                        ]
                    },
                    'circle-opacity':0.7,
                    
                }
            }, 'waterway-label');

            // pop up starts here
            const popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: false
                })  
            
            map.on('mousemove', layerId, (e) => {
                // Copy coordinates array.
                map.getCanvas().style.cursor = 'pointer'
            
                const layerProperties = map.queryRenderedFeatures(e.point, {
                    id: [layerId]
                    })
                
                const description = layerProperties[0].properties
                const coordinates = e.features[0].geometry.coordinates.slice();
                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                }
            
                let content = '<b>'+description.full_address+ ", "+ description.Zip+'</b> <hr>'
                +"Reason for forced entry: "+ description.reason+'<br>'
                +"Method of entry: "+ description.method+'<br>'
                +"Knock & Announce: "+ description.knock_and_announce+'<br>'
            
                popup
                    .setLngLat(e.lngLat)
                    .setHTML(content)
                    .addTo(map)
            });
            
            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'fe-circle', () => {
                map.getCanvas().style.cursor = ''
                popup.remove()
            });
        }
        drawLayer('forced_entry', fedata, 'fe-circle', 'forced_entry', 'visible')
        drawLayer('sw_forced_entry', swdata,'sw-circle', 'sw_forced_entry', 'none')

        drawMarker(fedata)

        document.getElementById("sw-button").onclick = function(d){        
            map.setLayoutProperty('fe-circle', 'visibility', 'none')
            map.setLayoutProperty('sw-circle', 'visibility', 'visible')
            if (allMarkers!==null) {
                for (var i = allMarkers.length - 1; i >= 0; i--) {
                    allMarkers[i].remove();
                }
            }
            drawMarker(swdata)
            

        }
        document.getElementById("all-button").onclick = function(d){
            map.setLayoutProperty('fe-circle', 'visibility', 'visible')
            map.setLayoutProperty('sw-circle', 'visibility', 'none')
            drawMarker(fedata)

        }   
    })
    const pymChild = new pym.Child({ polling: 100 });

});

