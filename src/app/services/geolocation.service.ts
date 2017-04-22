import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";

@Injectable()
export class GeolocationService {

  constructor(private http: Http) {
  }

  public getLocationByIp() {
    return this.http.get('https://ipinfo.io').map((res: Response) => res.json()).toPromise();
  }

}
