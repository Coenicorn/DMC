class ImageLoader {
    assets;
    assetsLoading;
    constructor() {
        this.assets = [];
    }
    /**
     * Asynchronously load an array of asset names. Names shouldn't include file extension, default extension is .png
     *
     * @param {Array<string>} assets
     */
    async loadAssets(assets, domain) {
        this.assetsLoading = assets.length;
        for (let i = 0, len = this.assetsLoading; i < len; i++) {
            let name = assets[i];
            let img = await new Promise((resolve, reject) => {
                let t = new Image();
                t.src = `${domain}/${name}.png`;
                t.onload = () => resolve(t);
                t.onerror = () => { throw new Error("Image does not exist"); };
            });
            this.assets[name] = img;
        }
        return this.assets;
    }
}
export { ImageLoader };
//# sourceMappingURL=image.js.map