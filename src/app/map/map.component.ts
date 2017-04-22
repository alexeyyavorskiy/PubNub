import {Component, OnInit} from '@angular/core';
import {EmitterService} from "../services/emitter.service";
import {Subscription} from "rxjs/Subscription";

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
  private showUserPosSubscription: Subscription;
  private markers = new Map<string, any>();

  constructor(private emitterService: EmitterService) {
    this.shownOnMapSubscription = this.emitterService.get('add_on_map')
      .subscribe((event) => {
        let marker = this.markers.get(event.id);
        marker ?  this.setMarkerAnimation(marker) : this.setMarker(event.id, event.lat, event.lng);
      });
    this.showUserPosSubscription = this.emitterService.get('show_user_pos')
      .subscribe((event) => this.setUserPosition(event.lat, event.lng))
  }

  ngOnInit() {
    this.zoom = 4;
  }

  private setUserPosition(lat: number, lng: number) {
    this.latitude = lat;
    this.longitude = lng;
    this.initialize();
  }

  private initialize() {
    this.map = new google.maps.Map(document.getElementById('map-canvas'));
    let latLng = new google.maps.LatLng(this.latitude, this.longitude);
    this.map.setCenter(latLng);
    this.map.setZoom(this.zoom);
  };

  private setMarker(id: string, lat: number, lng: number) {
    let latlng = new google.maps.LatLng(lat, lng);
    let marker = new google.maps.Marker();
    marker.setPosition(latlng);
    marker.setMap(this.map);
    this.setMarkerAnimation(marker);
    this.markers.set(id, marker);
  }

  private setMarkerAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => {
      marker.setAnimation(null)
    }, 2000);
  }

}
