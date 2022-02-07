class ImageLoader {
    assets: Array<HTMLImageElement> | Array<string>;
    assetsLoading: number;

    constructor() {
        this.assets = [];
    }

    /**
     * @param {Array<string>} assets 
     */

    async LoadAssets(assets: Array<string>, domain: string) {
        this.assetsLoading = assets.length;

        for (let i = 0, len = this.assetsLoading; i < len; i++) {
            let name = assets[i];

            let img = await new Promise((resolve, reject)=>{
                let t = new Image();
                t.src = `../img/${name}.png`;
                t.onload = () => resolve(t);
                t.onerror = () => { throw new Error("Image does not exist")};
            });

            this.assets[name] = img;
        }

        return this.assets;
    }
}

export { ImageLoader }