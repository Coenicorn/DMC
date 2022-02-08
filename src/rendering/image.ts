class ImageLoader {
    assetsLoading: number;
    assets: Array<HTMLImageElement>;
    domain: string;

    constructor(domain: string) {
        this.assets = [];
        this.domain = domain;
    }

    /**
     * Asynchronously load an array of asset names. Names shouldn't include file extension, default extension is .png
     * 
     * @param {Array<string>} assets 
     */

    async loadAssets(assets: Array<string>) {
        this.assetsLoading = assets.length;

        for (let i = 0, len = this.assetsLoading; i < len; i++) {
            let name = assets[i];

            let img = await new Promise((resolve)=>{
                let t = new Image();

                t.src = `${this.domain}/${name}.png`;

                t.onload = () => resolve(t);
                t.onerror = () => { throw new Error("Image does not exist")};
            });

            this.assets[name] = img;
        }

        console.log(this.assets);
    }

    Pic(what: string): HTMLImageElement {
        if (this.assets[what]) return this.assets[what];

        throw new Error("Assets array does not contain requested image");
    }
}

export { ImageLoader }