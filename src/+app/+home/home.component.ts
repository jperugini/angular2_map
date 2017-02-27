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
    error = null;
    uploadedJsonFile = null;


    constructor() {
        this.filesToUpload = null;
    }

    upload() {
        // Reset error first
        this.error = null;
        if (this.filesToUpload) {
            this.makeFileRequest("http://localhost:3000/api/upload", [], this.filesToUpload).then((result) => {
                try {
                    this.uploadedJsonFile = JSON.parse(result.toString());
                } catch (e) {
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
        if (fileInput.target.files[0].name.endsWith('.json')) {
            this.filesToUpload = fileInput.target.files[0];
        } else {
            this.error = "Upload must be json";
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


}
