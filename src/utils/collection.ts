type Card = {
    languageCode: string,
    setCode: string,
    collectorNumber: string,
    isFoil: boolean,
    name: string
};

export default class Collection {
    private static readonly LOCAL_STORAGE_KEY = "collection";

    // Map of card per language, per set code, per collector number, per foiling
    private cards: Map<string, Map<string, Map<string, { nonFoil: number, foil: number, name: string }>>>;

    public constructor() {
        this.cards = new Map();
    }

    public add(card: Card, amount: number = 1): boolean {
        let ofLanguage = this.cards.get(card.languageCode);
        if (ofLanguage === undefined) {
            ofLanguage = new Map();
            this.cards.set(card.languageCode, ofLanguage);
        }

        let ofSet = ofLanguage.get(card.setCode);
        if (ofSet === undefined) {
            ofSet = new Map();
            ofLanguage.set(card.setCode, ofSet);
        }

        let ofCollectorNumber = ofSet.get(card.collectorNumber);
        if (ofCollectorNumber === undefined) {
            ofCollectorNumber = {
                nonFoil: 0,
                foil: 0,
                name: card.name
            };
            ofSet.set(card.collectorNumber, ofCollectorNumber);
        }

        if (card.isFoil) {
            ofCollectorNumber.foil += amount;
        }
        else {
            ofCollectorNumber.nonFoil += amount;
        }

        this.save();
        return true;
    }

    public remove(card: Card, amount: number = 1): boolean {
        const counter = this.cards.get(card.languageCode)?.get(card.setCode)?.get(card.collectorNumber);
        let modified = false;

        if (counter !== undefined) {
            if (card.isFoil) {
                if (counter.foil > 0) {
                    counter.foil = Math.max(counter.foil - amount, 0);
                    modified = true;
                }
            }
            else {
                if (counter.nonFoil > 0) {
                    counter.nonFoil = Math.max(counter.nonFoil - amount, 0);
                    modified = true;
                }
            }

            this.save();
        }

        return modified;
    }

    public async save() {
        localStorage.setItem(Collection.LOCAL_STORAGE_KEY, await this.stringify());
    }

    public async asObject(): Promise<any> {
        const raw: any = {};

        for (const languageCode of this.cards.keys()) {
            if (raw[languageCode] === undefined) {
                raw[languageCode] = {};
            }

            for (const setCode of this.cards.get(languageCode)!.keys()) {
                if (raw[languageCode][setCode] === undefined) {
                    raw[languageCode][setCode] = {};
                }

                for (const collectorNumber of this.cards.get(languageCode)!.get(setCode)!.keys()) {
                    const card = this.cards.get(languageCode)!.get(setCode)!.get(collectorNumber);
                    raw[languageCode][setCode][collectorNumber] = {
                        name: card?.name,
                        nonFoil: card?.nonFoil || 0,
                        foil: card?.foil || 0
                    };
                }
            }
        }

        return raw;
    }

    public async asCSV(): Promise<string[][]> {
        const result = [["Count", "Name", "Edition", "Language", "Foil", "Collector Number"]];
        const collection = await this.asObject();

        for (const languageCode in collection) {
            const byLanguageCodes = collection[languageCode];

            for (const setCode in byLanguageCodes) {
                const bySetCodes = byLanguageCodes[setCode];

                for (const collectorNumber in bySetCodes) {
                    const byConstantNumbers = bySetCodes[collectorNumber];

                    if (byConstantNumbers.nonFoil > 0) {
                        result.push([byConstantNumbers.nonFoil, byConstantNumbers.name, setCode, languageCode, "", collectorNumber]);
                    }

                    if (byConstantNumbers.foil > 0) {
                        result.push([byConstantNumbers.foil, byConstantNumbers.name, setCode, languageCode, "foil", collectorNumber]);
                    }
                }
            }
        }

        return result;
    }

    private async stringify(): Promise<string> {
        return JSON.stringify(await this.asObject());
    }

    public static fromLocalStorage(): Collection {
        const rawJSON = localStorage.getItem(Collection.LOCAL_STORAGE_KEY);
        const collection = new Collection();

        if (rawJSON !== null) {
            const raw = JSON.parse(rawJSON);

            for (const languageCode in raw) {
                for (const setCode in raw[languageCode]) {
                    for (const collectorNumber in raw[languageCode][setCode]) {
                        const card = {
                            languageCode: languageCode,
                            setCode: setCode,
                            collectorNumber: collectorNumber,
                        };

                        const cardDetails = raw[languageCode][setCode][collectorNumber];

                        collection.add({ ...card, isFoil: false, name: cardDetails.name }, cardDetails.nonFoil);
                        collection.add({ ...card, isFoil: true, name: cardDetails.name }, cardDetails.foil);
                    }
                }
            }
        }

        return collection;
    }
}