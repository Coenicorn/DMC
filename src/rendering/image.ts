import fs from "fs";

class ImageLoader {
    assets: Array<HTMLImageElement>;
    domain: string;

    constructor(domain) {
        this.domain = domain;
    }

    async LoadAssets() {
        this.assets = [];
        
    }
}