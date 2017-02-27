import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

import { ModelService } from '../shared/model/model.service';

@Component({
    changeDetection: ChangeDetectionStrategy.Default,
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'home',
    styleUrls: ['./home.component.css'],
    templateUrl: './home.component.html'
})
export class HomeComponent {
    filesToUpload: File;
    error: string;
    uploadedJsonFile: any;
    uploadFilename: string;
    markers: Array<any>;
    currentLat: number;
    currentLong: number;
    positionSupported: boolean;
    initzoom: number;
    selectedMarker: any;


    constructor() {
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

    getLocation(){
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
        this.initzoom = 11;
    }

    upload() {
        // Reset error first
        this.error = null;
        if (this.filesToUpload) {
            this.makeFileRequest("http://localhost:3000/api/upload", [], this.filesToUpload).then((result) => {
                try {
                    this.uploadedJsonFile = JSON.parse(result.toString());
                    if(!this.uploadedJsonFile.markers) {
                        this.error = "JSON should have one array object markers";
                        this.uploadedJsonFile = null;
                    } else {
                        this.markers = this.uploadedJsonFile.markers;
                        this.markers.forEach((marker, i) => marker.label = i.toString());
                        this.initzoom = 11;
                        this.currentLat = this.markers[0].latitude;
                        this.currentLong = this.markers[0].longitude;
                        this.selectedMarker = this.markers[0];
                    }
                } catch (e) {
                    console.log(e);
                    this.error = "JSON is not valid";
                }
            }, (error) => {
                this.error = error;
            });
        } else {
            this.error = "You have to select file first";
        }
    }

    fileChangeEvent(fileInput: any) {
        if(fileInput.target.files.length > 0) {
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
        this.markers.push({
            latitutde: $event['coords'].lat,
            longitude: $event['coords'].lng
        });
    }

    clickedMarker(marker, i) {
        this.selectedMarker = marker;
    }


}
