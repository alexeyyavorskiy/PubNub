import {Component, EventEmitter, OnInit} from '@angular/core';
import {PubNubAngular} from "pubnub-angular2";
import {EmitterService} from "../services/emitter.service";

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
  private selectOnMap: EventEmitter<any>;
  private lat: number;
  private lng: number;
  private show: boolean = false;

  constructor(private pubnubService: PubNubAngular, private emitterService: EmitterService) {

    this.channel = 'my_channel';
    this.messages = [];
    this.addOnMap = this.emitterService.get('add_on_map');
    this.selectOnMap = this.emitterService.get('select_on_map');
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

  private onChange() {
    // console.log("");
  }

  private defineUserPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        console.log("geolocation is %s : %s", this.lat, this.lng);
        if (!this.lat) this.lat = ChatComponent.getRandomInt(0, 45);
        if (!this.lng) this.lng = ChatComponent.getRandomInt(0, 45);
      });
    }
  }

  private publish(): void {
    if (this.newMessage !== '') {
      this.pubnubService.publish({
          channel: this.channel,
          message: {
            text: this.userName + ' : ' + this.newMessage,
            lat: this.lat,
            lng: this.lng
          }
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
      if (!ChatComponent.contains(this.messages, msg.message.lat, msg.message.lng)) {
        this.addOnMap.emit(msg);
      } else {
        this.selectOnMap.emit(msg);
      }
      this.messages.unshift(msg);
    })
  }

  private static contains(array, lat, lng) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].message.lat === lat && array[i].message.lng === lng) {
        return true;
      }
    }
    return false;
  }

  private static getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}
