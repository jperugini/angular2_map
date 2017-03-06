import { Component, NgZone, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { MapsAPILoader } from 'angular2-google-maps/core';
import 'rxjs/Rx';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    filesToUpload: File;
    error: string;
    uploadedJsonFile: any;
    uploadFilename: string;
    markers: Array<marker>;
    currentLat: number;
    currentLong: number;
    centerLat: number;
    centerLong: number;
    positionSupported: boolean;
    initzoom: number;
    selectedMarker: any;
    geocoder: any;


    constructor(public mapsApiLoader: MapsAPILoader, private http: Http, private _ngZone: NgZone) {
        this.mapsApiLoader.load().then(() => {
            this.geocoder = new google.maps.Geocoder();
        });
        this.filesToUpload = null;
        this.uploadFilename = null;
        this.error = null;
        this.uploadedJsonFile = null;
        this.markers = [];
        this.positionSupported = false;
        this.currentLat = 0;
        this.currentLong = 0;
        this.initzoom = 1;
        this.selectedMarker = null;
    }

    getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.setPosition.bind(this));
            this.positionSupported = true;
        } else {
            this.error = "Geolocation is not supported by this browser.";
        }
    }

    setPosition(position) {
        this.currentLat = position.coords.latitude;
        this.currentLong = position.coords.longitude;
        this.centerLat = position.coords.latitude;
        this.centerLong = position.coords.longitude;
        this.initzoom = 11;
    }

    upload() {
        // Reset error first
        this.error = null;
        if (this.filesToUpload) {
            this.makeFileRequest("api/upload", [], this.filesToUpload).then((result) => {
                try {
                    this.uploadedJsonFile = JSON.parse(result.toString());
                    this.markers = this.uploadedJsonFile;
                    this.markers.forEach((marker, i) => marker.label = i.toString());
                    this.initzoom = 11;
                    this.centerLat = this.markers[0].latitude;
                    this.centerLong = this.markers[0].longitude;
                    this.selectedMarker = this.markers[0];
                } catch (e) {
                    console.log(e);
                    this.error = "JSON is not valid JSON format for this map";
                }
            }, (error) => {
                this.error = error;
            });
        } else {
            this.error = "You have to select file first";
        }
    }

    downloadmarkers() {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style.display = "none";
        let data = JSON.stringify(this.markers, undefined, 4)
        var blob = new Blob([data], { type: 'application/json' });
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "markers.json";
        a.click();
        window.URL.revokeObjectURL(url);
    }

    fileChangeEvent(fileInput: any) {
        if (fileInput.target.files.length > 0) {
            // Reset error first
            this.error = null;
            // Put the filename in variable to display it
            this.uploadFilename = fileInput.target.files[0].name;
            if (this.uploadFilename.endsWith('.json')) {
                this.filesToUpload = fileInput.target.files[0];
            } else {
                this.error = "Upload must be json";
            }
        }
    }

    makeFileRequest(url: string, params: Array<string>, file: File) {
        return new Promise((resolve, reject) => {
            var formData: any = new FormData();
            var xhr = new XMLHttpRequest();
            formData.append("uploads", file, file.name);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            }
            xhr.open("POST", url, true);
            xhr.send(formData);
        });
    }

    mapClicked($event: MouseEvent) {
        let marker = {
            latitude: Number($event['coords'].lat),
            longitude: Number($event['coords'].lng),
            label: this.markers.length.toString(),
            homeTeam: "New Marker",
            markerImage: ""
        };
        this.decodeCoordinates(marker);
    }

    clickedMarker(marker, i) {
        this.selectedMarker = marker;
    }

    markerDragEnd(marker: any, $event: MouseEvent) {
        marker.latitude = Number($event['coords'].lat);
        marker.longitude = Number($event['coords'].lng);
        this.decodeCoordinates(marker);
    }

    decodeCoordinates(marker) {
        var latlng = { lat: parseFloat(marker.latitude), lng: parseFloat(marker.longitude) };
        this.geocoder.geocode({ 'location': latlng }, (results, status) => {
            if (status === 'OK') {
                if (results[1]) {
                    console.log("Found it");
                    marker.homeTeam = results[1].formatted_address;
                    var id = results[1].place_id;
                    this.decodePlaceId(id).subscribe(
                        result => {
                            try {
                                let info = result.result;
                                if (info.photos) {
                                    if (info.photos.length > 0) {
                                        let photo = info.photos[0];
                                        marker.markerImage = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=" +
                                            + photo.width + "&photoreference="
                                            + photo.photo_reference + "&key="
                                            + "AIzaSyAUwAHbIiy2wWRvKHjz2MAFuPP6C3tVPWw";
                                    }
                                }
                                marker.googleMap = info.url;
                            } catch (e) {
                                console.log(e);
                                console.log("Error getting info");
                            }
                            this._ngZone.run(() => {
                                this.markers.push(marker);
                                this.selectedMarker = marker;
                            })
                        }, error => {
                            console.log(error)
                        }, () => {
                            console.log('Geocoding completed!')
                        }
                    );
                } else {
                    console.log('No results found');
                }
            } else {
                console.log('Geocoder failed due to: ' + status);
            }
        });
    }

    decodePlaceId(id): Observable<any> {
        const requestUrl = "api/places/" + id;
        return this.http.request(requestUrl).map(
            (res: Response) => res.json()
        );

    }


}

interface marker {
    latitude: number;
    longitude: number;
    label?: string;
    homeTeam: string;
    markerImage?: string;
    googleMap?: string;
    draggable?: boolean;
}