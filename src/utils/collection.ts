type Card = {
    language: string,
    setCode: string,
    collectorNumber: number,
    isFoil: boolean
};

class Collection {
    // Map of card per language, per set code, per collector number, per foiling
    cards: Map<string, Map<string, Map<number, { nonFoil: number, foil: number}>>>;

    constructor() {
        this.cards = new Map();
    }

    add(card: Card) {
        let ofLanguage = this.cards.get(card.language);
        if(ofLanguage === undefined) {
            ofLanguage = new Map();
            this.cards.set(card.language, ofLanguage);
        }

        let ofSet = ofLanguage.get(card.setCode);
        if(ofSet === undefined) {
            ofSet = new Map();
            ofLanguage.set(card.setCode, ofSet);
        }

        let ofCollectorNumber = ofSet.get(card.collectorNumber);
        if(ofCollectorNumber === undefined) {
            ofCollectorNumber = {
                nonFoil: 0,
                foil: 0
            };
            ofSet.set(card.collectorNumber, ofCollectorNumber);
        }

        if(card.isFoil) {
            ofCollectorNumber.foil++;
        }
        else {
            ofCollectorNumber.nonFoil++;
        }
    }

    remove(card: Card) {
        const counter = this.cards.get(card.language)?.get(card.setCode)?.get(card.collectorNumber);

        if(counter !== undefined) {
            if(card.isFoil) {
                counter.foil--;
            }
            else {
                counter.nonFoil--;
            }
        }
    }
}

export default Collection;