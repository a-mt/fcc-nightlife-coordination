/*global google*/

var GooglePlaces = {
    map: false,
    infoWindow: false,

    autocomplete: false,
    clickEvent: false,
    markers: {},

    init: function(){
        GooglePlaces.initAutocomplete();
    },
    
    // Map displaying location and places (callback of google maps script)
    initMap: function(){
        GooglePlaces.map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: -34.397, lng: 150.644},
            zoom: 3,
            styles: [{
                featureType: "poi",
                elementType: "labels",
                stylers: [
                      { visibility: "off" }
                ]
            }]
        });
        GooglePlaces.infoWindow = new google.maps.InfoWindow({
            content: document.getElementById('info-content')
        });

        $('#info-content').on('click', '.scrollto', function(){
            var num      = $(this).data('num');
            var scrollto = $('.list-group-item[data-num="' + num + '"]');
            
            $('html,body').animate({scrollTop: scrollto.offset().top}, 'slow');
        });
    },
    
    // Input autocompleting chosen city
    initAutocomplete: function(){
        var input = document.getElementById('location-autocomplete');
        var options = {
            types: ['(cities)']
        };
        GooglePlaces.autocomplete = new google.maps.places.Autocomplete(input, options);
        GooglePlaces.autocomplete.addListener('place_changed', GooglePlaces.onPlaceChanged);
    },
    
    // Choose city
    onPlaceChanged: function() {
        var place = GooglePlaces.autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        // Update map
        GooglePlaces.map.panTo(place.geometry.location);
        GooglePlaces.map.setZoom(15);

        // Search places
        GooglePlaces.search(place.formatted_address);
    },
    
    // Search places in that location
    search: function(name) {
        $.cookie('lastSearch', name, { expires : 1 });

        $.ajax({
            url: '/search',
            data: {
                location: name
            },
            success: function(data) {
                GooglePlaces.populate(data.businesses);
            },
            error: function(xhr) {
                setTimeout(function(){
                    alert('Something went wrong: ' + xhr.responseText);
                }, 100);
            }
        });
    },
    
    // Add places on map + list
    populate: function(results) {
        if(GooglePlaces.clickEvent) {
            google.maps.event.removeListener(GooglePlaces.clickEvent);
        }
        GooglePlaces.markers = {};
        var $results = $('#results').html('');

        // https://developers.google.com/maps/documentation/javascript/examples/places-autocomplete-hotelsearch?hl=fr
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            result.num = (i+1);

            // Create a new marker on the map
            var marker = GooglePlaces.markers[i] = new google.maps.Marker({
                position: {
                    lat: result.location.coordinate.latitude,
                    lng: result.location.coordinate.longitude
                }
            });
            marker.placeResult = result;

            GooglePlaces.clickEvent = google.maps.event.addListener(marker, 'click', GooglePlaces.onMarkerClick);
            setTimeout(GooglePlaces.displayMarker(i), i * 100);

            // Append to list
            var item = GooglePlaces.getResult(result);

            $results.append('<div class="list-group-item row" data-num="' + result.num + '">' + item + '</div>');
        }
    },
    
    // Returns the HTML to display for the given result
    getResult: function(result) {
        var item = '';

        item += '<div class="col-xs-8">'
                + '<div class="pull-left img">'
                    + (result.image_url ? '<img src="' + result.image_url + '">' : '')
                + '</div>'

                + '<label>' + result.num + '. <a href="' + result.url + '">' + result.name + '</a></label><br>'
                + '<span class="rating">'
                    + '<img src="' + result.rating_img_url + '" tilte="' + result.rating + ' star rating">'
                    + '&nbsp;' + result.review_count + ' review' + (result.review_count == '1' ? '': 's')
                + '</span>'
            + '</div>';

        item += '<div class="col-xs-4 address">';
        for(var j=0; j<result.location.display_address.length; j++) {
            item += result.location.display_address[j] + '<br>';
        }
        item += '</div>';
        return item;
    },
        
    // Returns the HTML to display in the map popup
    getResultPreview: function(result) {
        var item = '';

        item += '<label>' + result.num + '. <a class="scrollto" data-num="' + result.num + '" href="#' + result.num + '">' + result.name + '</a></label><br>'
                + '<span class="rating">'
                    + '<img src="' + result.rating_img_url + '" tilte="' + result.rating + ' star rating">'
                    + '&nbsp;' + result.review_count + ' review' + (result.review_count == '1' ? '': 's')
                + '</span>';

        item += '<div class="address">';
        for(var j=0; j<result.location.display_address.length; j++) {
            item += result.location.display_address[j] + '<br>';
        }
        item += '</div>';
        return item;
    },

    // Add a marker to the map
    displayMarker: function(i) {
        return function() {
            GooglePlaces.markers[i].setMap(GooglePlaces.map);
        };
    },

    // Click on a marker
    onMarkerClick: function() {
        var marker = this;
        var result = marker.placeResult;

        // Change HTML
        $('#info-content').html(GooglePlaces.getResultPreview(result));

        // Open popup
        GooglePlaces.infoWindow.open(GooglePlaces.map, marker);
    }
};

$(document).ready(function(){
    GooglePlaces.init();

	$("#backtotop").on('click', function(){
		$('html,body').animate({scrollTop: 0}, 'slow');
	});
});

// Retour haut de page
$(window).scroll(function() {
	if ($(window).scrollTop() < 500) {
		$("#backtotop").hide('slow');
	} else {
		$("#backtotop").show('slow');
	}
});

function repeat(str, n) {
    if(!n) return '';
    else if(n==1) return str;
    else return (new Array(n+1)).join(str);
}