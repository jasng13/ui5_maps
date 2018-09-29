sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function(Controller) {
	"use strict";

	return Controller.extend("com.oge.pocPOC_OGE.controller.Maps", {

		onInit: function() {
			this.getView().byId("map_canvas").addStyleClass("myMap");
		},

		onAfterRendering: function() {
			if (!this.initialized) {
				this.initialized = true;
				this.geocoder = new google.maps.Geocoder();
				window.mapOptions = {
					center: new google.maps.LatLng(-34.397, 150.644),
					zoom: 8,
					mapTypeId: google.maps.MapTypeId.ROADMAP
				};
				//This is basically for setting the initial position of the map, ie. Setting the coordinates, for the place by default

				var map = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), mapOptions);
				var infowindow = new google.maps.InfoWindow;
				var geocoder = new google.maps.Geocoder();
				var marker = new google.maps.Marker({
					map: map,
				});

				google.maps.event.addListener(map, "click", function(e) {
					var lolatitude = e.latLng.lat(); //calculates latitude of the point of click
					var lolongitude = e.latLng.lng() //calculates longitude of the point of click
					jQuery.sap.require("sap.m.MessageToast");
					sap.m.MessageToast.show("Lat" + lolatitude + "\n Lng" + lolongitude);
					var latlng = new google.maps.LatLng("latlng", lolatitude, lolongitude);
					var text1 = new sap.m.Text({
						text: lolatitude
					});
					var text2 = new sap.m.Text({
						text: lolongitude
					});
					window.point1 = lolatitude;
					window.point2 = lolongitude;
					geocodeLatLng(geocoder, map, infowindow, text1, text2);

				});
				//This function is for what should happen if a user left clicks on the map
				function geocodeLatLng(geocoder, map, infowindow, text1, text2) {
					var markers = [];
					var input1 = text1.mProperties.text;
					var input2 = text2.mProperties.text;
					var latlng = {
						lat: parseFloat(input1),
						lng: parseFloat(input2)
					};

					geocoder.geocode({
						'location': latlng
					}, function(results, status) {
						if (status === google.maps.GeocoderStatus.OK) {
							if (results[1]) {
								//Here result will consist of many result, but we have to take fist result //itself, since that would be the appropriate one
								map.setZoom(11);

								function addMarker(location) {
									var marker = new google.maps.Marker({
										position: location,
										map: newmap1
									});
									markers.push(marker); // A marker is added to the point where it was clicked
								}
								var address1 = results[1].formatted_address;

								infowindow.setContent(results[1].formatted_address);
								infowindow.open(map, marker);
							} else {
								window.alert('No results found');
							}
						} else {
							window.alert('Geocoder failed due to: ' + status);
						}

					});
				}

				////////////////////Distance//////////////////////

			} else if (this.initialized === true) {
				this.actSearch()
			}

		},

		actSearch: function() {
			var newmap = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), mapOptions);
			var address = this.getView().byId("bntSearch").getValue();
			this.geocoder.geocode({
				'address': address
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					newmap.setCenter(results[0].geometry.location);
					newmap.setZoom(12);
					var marker = new google.maps.Marker({
						map: newmap,
						position: results[0].geometry.location
					});
					//This function is for search. Here when a place is searched a marker is //applied and the map is zoomed to the particular position.

				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
			return;
		},
		onDistancePress: function() {
			var loFrom = this.getView().byId("FromDis");
			var loTo = this.getView().byId("ToDis");
			var loOk = this.getView().byId("Okay");
			loOk.setVisible(true);
			loFrom.setVisible(true);
			loTo.setVisible(true);
		},
		//This function is triggered on click of distance button.

		onOkayPress: function() {
			//This function calculates approx. distance between the two places, since I //haven’t used Google Maps Distance API, therefore this ain’t the proper way //to calculate distance among the places
			var newmap1 = new google.maps.Map(this.getView().byId("map_canvas").getDomRef(), mapOptions);
			var address1 = this.getView().byId("FromDis").getValue();
			var address2 = this.getView().byId("ToDis").getValue();
			this.geocoder.geocode({
				'address': address1
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					window.lolatitude1 = results[0].geometry.location.lat();
					window.lolongitude1 = results[0].geometry.location.lng();
					window.add1 = results[0].formatted_address.split(",", 1)[0]
					newmap1.setCenter(results[0].geometry.location);
					newmap1.setZoom(12);
					var marker = new google.maps.Marker({
						map: newmap1,
						position: results[0].geometry.location
					});
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
			this.geocoder.geocode({
				'address': address2
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					window.lolatitude2 = results[0].geometry.location.lat();
					window.lolongitude2 = results[0].geometry.location.lng();
					window.add2 = results[0].formatted_address.split(",", 1)[0]
					newmap1.setCenter(results[0].geometry.location);
					newmap1.setZoom(10);
					var marker = new google.maps.Marker({
						map: newmap1,
						position: results[0].geometry.location
					});
					sap.m.MessageToast.show("Approx. Distance Between" + " " + window.add1 + " " + "and" + " " + window.add2 + " " + "is" + " " +
						getDistanceFromLatLonInKm(window.lolatitude1, window.lolongitude1, window.lolatitude2, window.lolongitude2) + "KM", {
							width: "30em",
							duration: 10000
						});

				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});

			function getDistanceFromLatLonInKm(lolatitude1, lolongitude1, lolatitude2, lolongitude2) {
				var R = 6371; // Radius of the earth in km
				var dLat = deg2rad(window.lolatitude2 - window.lolatitude1); // deg2rad below
				var dLon = deg2rad(window.lolongitude2 - window.lolongitude1);
				var a =
					Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.cos(deg2rad(window.lolatitude1)) * Math.cos(deg2rad(window.lolatitude2)) *
					Math.sin(dLon / 2) * Math.sin(dLon / 2);
				var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
				var d = R * c; // Distance in km
				return d.toLocaleString();
			}

			function deg2rad(deg) {
				return deg * (Math.PI / 180)
			}
			var flightPlanCoordinates = [{
					lat: window.lolatitude1,
					lng: window.lolongitude1
				}, {
					lat: window.lolatitude2,
					lng: window.lolongitude2
				}

			];
			var flightPath = new google.maps.Polyline({
				path: flightPlanCoordinates,
				geodesic: true,
				strokeColor: '#FF0000',
				strokeOpacity: 1.0,
				strokeWeight: 2
			});

			flightPath.setMap(newmap1);

		}
	});
});