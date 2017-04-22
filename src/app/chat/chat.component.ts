import {Component, EventEmitter, OnInit} from '@angular/core';
import {PubNubAngular} from "pubnub-angular2";
import {EmitterService} from "../services/emitter.service";
import {Http, Response} from "@angular/http";
import {publish} from "rxjs/operator/publish";
import {GeolocationService} from "../services/geolocation.service";

@Component({
  selector: 'chat',
  templateUrl: 'chat.component.html'

})
export class ChatComponent implements OnInit {
  private channel: string;
  private userName: string;
  private messages: Array<any>;
  private newMessage: string = '';
  private addOnMap: EventEmitter<any>;
  private showUserPos: EventEmitter<any>;
  private lat: number;
  private lng: number;
  private show: boolean = false;

  constructor(private pubnubService: PubNubAngular, private emitterService: EmitterService, private geoService: GeolocationService) {

    this.channel = 'my_channel3';
    this.messages = [];
    this.addOnMap = this.emitterService.get('add_on_map');
    this.showUserPos = this.emitterService.get('show_user_pos');
  }

  ngOnInit() {
    this.defineUserPosition();
  }

  private setUserAndConnect() {
    this.pubnubService.init({
      publishKey: 'pub-c-f84ef0e5-cef0-4321-8893-e162d3b24d7c',
      subscribeKey: 'sub-c-e833c5dc-24f2-11e7-a5a9-0619f8945a4f',
      ssl: true,
      uuid: this.userName
    });
    this.subscribe();
    this.getMessage();
    this.showUserPos.emit({lat: this.lat, lng: this.lng});
    this.show = true;
  }

  private defineUserPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        console.log("geolocation is %s : %s", this.lat, this.lng);
      }, () => {
        console.log("Your browser does not support geolocation. IP geolocation will be used instead!");
        this.geoService.getLocationByIp().then((data) => {
          if (data) {
            let latLng = data.loc.split(',');
            this.lat = latLng[0];
            this.lng = latLng[1];
            console.log("geolocation by ip is %s : %s", this.lat, this.lng);
          }
        }, () => console.log("Error on getting location by IP"))
      });
    }
  }


  private publish(): void {
    if (this.newMessage !== '') {
      let message = {
        id: `${this.userName}:${this.lat}:${this.lng}`,
        text: `${this.userName} : ${this.newMessage}`,
        lat: this.lat,
        lng: this.lng
      };
      this.pubnubService.publish({
          channel: this.channel,
          message: message
        }
      );
      this.newMessage = '';
    }
  }

  private subscribe(): void {
    this.pubnubService.subscribe({
      channels: [this.channel],
      withPresence: true,
      triggerEvents: true
    })
  }

  private getMessage(): void {
    this.pubnubService.getMessage(this.channel, (msg) => {
      this.addOnMap.emit(msg.message);
      this.messages.unshift(msg);
    })
  }

  private static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
