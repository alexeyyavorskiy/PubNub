import {Component, OnInit} from '@angular/core';
import {PubNubAngular} from "pubnub-angular2";
import {EmitterService} from "../services/emitter.service";
import {Subscription} from "rxjs/Subscription";
import {isNumeric} from "rxjs/util/isNumeric";


@Component({
  selector: 'map',
  templateUrl: 'map.component.html'

})
export class MapComponent implements OnInit {

  public latitude: number;
  public longitude: number;
  public zoom: number;
  private map: any;
  private shownOnMapSubscription: Subscription;
  private selectOnMapSubscription: Subscription;
  private showUserPosSubscription: Subscription;
  private markers = [];

  constructor(private emitterService: EmitterService) {
    this.shownOnMapSubscription = this.emitterService.get('add_on_map')
      .subscribe((event) => {
        this.setMarker(event.message.lat, event.message.lng);
      });
    this.showUserPosSubscription = this.emitterService.get('show_user_pos')
      .subscribe((event) => {
        this.setUserPosition(event.lat, event.lng);
      });
    this.selectOnMapSubscription = this.emitterService.get('select_on_map')
      .subscribe((event) => {
        let marker = this.getMarker(event.message.lat, event.message.lng);
        if (marker) this.setMarkerAnimation(marker);
      });
  }

  ngOnInit() {
    this.zoom = 2;
  }

  private setUserPosition(lat: number, lng: number) {
    this.latitude = lat;
    this.longitude = lng;
    this.initialize();
  }

  private initialize() {
    this.map = new google.maps.Map(document.getElementById('map-canvas'));
    let latlng = new google.maps.LatLng(this.latitude, this.longitude);
    this.map.setCenter(latlng);
    this.map.setZoom(this.zoom);
  };

  private setMarker(lat: number, lng: number) {
    let latlng = new google.maps.LatLng(lat, lng);
    let marker = new google.maps.Marker();
    marker.setPosition(latlng);
    marker.setMap(this.map);
    this.setMarkerAnimation(marker);
    this.markers.push(marker);
  }

  private getMarker(lat, lng) {
    for (let i = 0; i < this.markers.length; i++) {
      if (this.roundNumber(this.markers[i].position.lat()) === this.roundNumber(lat) && this.roundNumber(this.markers[i].position.lng()) === this.roundNumber(lng)) {
        return this.markers[i];
      }
    }
    return null;
  }

  private roundNumber(value) {
    return Math.ceil((value) * 100) / 100;
  }

  private setMarkerAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => {
      marker.setAnimation(null)
    }, 2000);
  }

}
