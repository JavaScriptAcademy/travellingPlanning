import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Meteor } from 'meteor/meteor';

import { Tasks } from '../api/tasks.js';
import { MapItems } from '../api/tasks.js';
import './task.js';

import './body.html';


var username='';
//var runObserveFlag=false;
function showOnMap(results,map) {

  for (var i = 0; i < results.length; i++) {
    var item=results[i];
    var latLng = new google.maps.LatLng(item.lat,item.lng);
    var marker = new MarkerWithLabel({
      position: latLng,
      map: map.instance,
      labelContent: item.username,
      labelAnchor: new google.maps.Point(15, 65),
      labelClass: "markerLabel", // the CSS class for the label
      labelInBackground: false
    });
  }
}




Template.body.onCreated(function bodyOnCreated() {
  this.state = new ReactiveDict();
  Meteor.subscribe('mapItems');


   //$.getScript("/package/markerwithlabel.js");

   GoogleMaps.ready('exampleMap', function(map) {

    $.getScript("http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerwithlabel/src/markerwithlabel.js",function( data, textStatus, jqxhr ) {
      showOnMap(results,map);
    });

    var results = MapItems.find({}).fetch();

    google.maps.event.addListener(map.instance, "click", function(event) {
      if (! Meteor.userId()) {
        console.log('show------------');
        bootbox.prompt("What is your name?", function(result) {
          if (result !== null) {
            username=result;
            instertMarker(username,event.latLng.lat(),event.latLng.lng());
          }
        });

      }else{
        username=Meteor.user().username;
        instertMarker(username,event.latLng.lat(),event.latLng.lng());
      }
    });
  });
});


function instertMarker(username,lat,lng){
  if(username!==''&&username!==null){
   // runObserveFlag=true;
    Meteor.call('mapitems.insert',lat,lng,username);
  }
}

Template.body.helpers({


  exampleMapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(-37.8136, 144.9631),
        zoom: 2
      };
    }
  },


});


function createMarker(dragValue,pinImage,username){
   var marker = new MarkerWithLabel({
      draggable: dragValue,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(document.lat, document.lng),
      map: GoogleMaps.maps.exampleMap.instance,
      icon: pinImage,
      labelContent: username,
      labelAnchor: new google.maps.Point(15, 65),
      labelClass: "markerLabel", // the CSS class for the label
      labelInBackground: false,
      // We store the document _id on the marker in order
      // to update the document within the 'dragend' event below.
      id: document._id
    });

   return marker;
}

 var markers={};
MapItems.find().observe({
added: function(document) {
    // Create a marker for this document
     // if(!runObserveFlag) return;
     // runObserveFlag=false;
    var userImage = new google.maps.MarkerImage("/images/newer-marker.png",
        null,
        null,
        null,
        new google.maps.Size(40, 40)

      );

    var otherUserImage = new google.maps.MarkerImage("/images/othersNewMarker.png",
        null,
        null,
        null,
        new google.maps.Size(25, 40)

      );
    console.log('-----------1.1');
    var tempMarker=MapItems.findOne({_id:document._id});

    var marker = new MarkerWithLabel({
      draggable: true,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(document.lat, document.lng),
      map: GoogleMaps.maps.exampleMap.instance,
      icon: userImage,
      labelContent: tempMarker.username,
      labelAnchor: new google.maps.Point(15, 65),
      labelClass: "markerLabel", // the CSS class for the label
      labelInBackground: false,
      // We store the document _id on the marker in order
      // to update the document within the 'dragend' event below.
      id: document._id
    });

    // console.log('---------1--------');
     if(tempMarker.username!==username){

    //   console.log('---------3--------');
       marker.setDraggable(false);
       marker.setIcon(otherUserImage);
     }


    // This listener lets us drag markers on the map and update their corresponding document.
    google.maps.event.addListener(marker, 'dragend', function(event) {
       Meteor.call('mapitems.update',marker.id,event.latLng.lat(),event.latLng.lng());
    });

    // Store this marker instance within the markers object.
    markers[document._id] = marker;
  },
  changed: function(newDocument, oldDocument) {
    markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
  },
  removed: function(oldDocument) {
    // Remove the marker from the map
    markers[oldDocument._id].setMap(null);

    // Clear the event listener
    google.maps.event.clearInstanceListeners(
      markers[oldDocument._id]);

    // Remove the reference to this marker instance
    delete markers[oldDocument._id];
  }
});


Template.body.events({
  'submit .new-task'(event) {
    // Prevent default browser form submit
    event.preventDefault();

    // Get value from form element
    const target = event.target;
    const text = target.text.value;


    // Clear form
    target.text.value = '';
  },

  'change .hide-completed input'(event, instance) {
    instance.state.set('hideCompleted', event.target.checked);
  },

});