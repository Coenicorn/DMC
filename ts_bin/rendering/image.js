class ImageLoader {
    assetsLoading;
    assets;
    constructor() {
        this.assets = [];
    }
    /**
     * Asynchronously load an array of asset names. Names shouldn't include file extension, default extension is .png
     *
     * @param {Array<string>} assets
     */
    async loadAssets(domain, assets) {
        this.assetsLoading = assets.length;
        for (let i = 0, len = this.assetsLoading; i < len; i++) {
            let name = assets[i];
            // promise bc you need to wait for it to load, hence also the asynchronous nature of this function
            let img = await new Promise((resolve) => {
                let t = new Image();
                t.src = `${domain}/${name}.png`;
                t.onload = () => resolve(t);
                t.onerror = () => { throw new Error(`Image ${name}.png does not exist`); };
            });
            this.assets[name] = img;
        }
    }
    Pic(what) {
        if (this.assets[what])
            return this.assets[what];
        throw new Error(`Assets array does not contain ${what}.png`);
    }
}
export { ImageLoader };
