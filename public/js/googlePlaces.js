/*global google*/

var GooglePlaces = {
    initFrom: false,
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
        var coords = {lat: -34.397, lng: 150.644};
        var zoom   = 3;

        var init = $.cookie('lastSearch');
        if(init) {
            GooglePlaces.initFrom = JSON.parse(init);
            coords = GooglePlaces.initFrom.coords;
            zoom   = 15;
        }

        GooglePlaces.map = new google.maps.Map(document.getElementById('map'), {
            center: coords,
            zoom: zoom,
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
        if(GooglePlaces.initFrom) {
            input.value = GooglePlaces.initFrom.name;
            setTimeout(function(){
                GooglePlaces.search(input.value);
            }, 100);
        }
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
        $.cookie('lastSearch', JSON.stringify({
            name:   place.formatted_address,
            coords: place.geometry.location
        }), { expires : 1 });

        GooglePlaces.search(place.formatted_address);
    },
    
    // Search places in that location
    search: function(name) {

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
            result.num = i;

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

                + '<label>' + (result.num+1) + '. <a href="' + result.url + '">' + result.name + '</a></label><br>'
                + '<span class="rating">'
                    + '<img src="' + result.rating_img_url + '" tilte="' + result.rating + ' star rating">'
                    + '&nbsp;' + result.review_count + ' review' + (result.review_count == '1' ? '': 's')
                + '</span>'
            + '</div>';

        item += '<div class="col-xs-4 address">';
        for(var j=0; j<result.location.display_address.length; j++) {
            item += result.location.display_address[j] + '<br>';
        }
        item += '<br><button type="button" class="btn js-going' + (result.going.user ? ' btn-primary' : '') + '" data-id="' + result.id + '" data-num="' + result.num + '">'
                        + result.going.total + ' Going'
                    + '</button>';
        item += '</div>';
        return item;
    },
        
    // Returns the HTML to display in the map popup
    getResultPreview: function(result) {
        var item = '';

        item += '<label>' + (result.num+1) + '. <a class="scrollto" data-num="' + result.num + '" href="#' + (result.num+1) + '">' + result.name + '</a></label>';
        item += '<div class="address">';
        for(var j=0; j<result.location.display_address.length; j++) {
            item += result.location.display_address[j] + '<br>';
        }
        item += '</div>';

        item += '<br><span class="rating">'
                    + '<img src="' + result.rating_img_url + '" tilte="' + result.rating + ' star rating">'
                    + '&nbsp;' + result.review_count + ' review' + (result.review_count == '1' ? '': 's')
                + '</span><br>'
                + '<span>' + result.going.total + ' Going</span>';
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

	$('#results').on('click', '.js-going', function(){
        if(!isLoggedIn) {
            window.location.href= '/login';
            return;
        }

	   var $btn = $(this);
	   var num  = $btn.data('num');
	   var id   = $btn.data('id');

	   $.ajax({
	       url: '/plan',
	       method: 'POST',
	       data: {
	           id: id
	       },
	       success: function(data) {
	           $btn.toggleClass('btn-primary', data.user);
	           $btn.html(data.total + ' Going');

	           GooglePlaces.markers[num].placeResult.going = data;
	       }
	   });
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