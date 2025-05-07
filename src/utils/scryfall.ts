const SCRYFALL_BASE_URL = "https://api.scryfall.com";

export enum Color {
	White = "W",
	Blue = "U",
	Black = "B",
	Red = "R",
	Green = "G"
}

export enum Rarity {
	Common = "common",
	Uncommon = "uncommon",
	Rare = "rare",
	Mythic = "mythic",
	Special = "special",
	Bonus = "bonus"
}

export enum LanguageCode {
	English = "en",
	Spanish = "es",
	French = "fr",
	German = "de",
	Italian = "it",
	Portuguese = "pt",
	Japanese = "ja",
	Korean = "ko",
	Russian = "ru",
	SimplifiedChinese = "zhs",
	TraditionalChinese = "zht",
	Hebrew = "he",
	Latin = "la",
	AncientGreek = "grc",
	Arabic = "ar",
	Sanskrit = "sa",
	Phyrexian = "ph",
	Quenya = "qya"
}

export enum SetType {
	Core = "core",
	Expansion = "expansion",
	Masters = "masters",
	Alchemy = "alchemy",
	Masterpiece = "masterpiece",
	Arsenal = "arsenal",
	FromTheVault = "from_the_vault",
	Spellbook = "spellbook",
	PremiumDeck = "premium_deck",
	DuelDeck = "duel_deck",
	DraftInnovation = "draft_innovation",
	TreasureChest = "treasure_chest",
	Commander = "commander",
	Planechase = "planechase",
	Archenemy = "archenemy",
	Vanguard = "vanguard",
	Funny = "funny",
	Starter = "starter",
	Box = "box",
	Promo = "promo",
	Token = "token",
	Memorabilia = "memorabilia",
	Minigame = "minigame",
}

export class Set {
	readonly id: string;
	readonly code: string;
	readonly name: string;
	readonly type: SetType;
	readonly realeasedAt?: Date;
	readonly block?: string;
	readonly cardCount: number;
	readonly iconURI: string
	readonly digitalOnly: boolean;

	public constructor(id: string, code: string, name: string, type: SetType, cardCount: number, iconURI: string, digitalOnly: boolean, releasedAt?: Date, block?: string) {
		this.id = id;
		this.code = code;
		this.name = name;
		this.type= type;
		this.realeasedAt = releasedAt;
		this.block = block;
		this.cardCount = cardCount;
		this.iconURI = iconURI;
		this.digitalOnly = digitalOnly;
	}

	public static async byCode(code: string): Promise<Set> {
		const response = await fetch(`${SCRYFALL_BASE_URL}/sets/${code}`);

		if(response.ok) {
			const json = await response.json();
			const set = Set.fromJSON(json);

			if(set !== undefined) {
				return set;
			}
			else {
				throw new Error("Failed to fetch requested set");
			}
		}
		else {
			throw new Error("The requested set doesn't exist");
		}
	}

	public static async all(): Promise<Array<Set>> {
		const sets = new Array();

		const response = await fetch(`${SCRYFALL_BASE_URL}/sets`);
		if(response.ok) {
			const json = await response.json();
			for(const item of json.data) {
				sets.push(Set.fromJSON(item))
			}
		}

		return sets;
	}

	private static fromJSON(json: any): Set | undefined {
		return new Set(json.id, json.code, json.name, json.type, json.card_count, json.icon_svg_uri, json.digital, json.released_at !== undefined ? new Date(json.released_at) : undefined, json.block);
	}
}

export class Card {
	readonly id: string;
	readonly set: string;
	readonly collectorNumber: string;
	readonly name: string;
	readonly language: LanguageCode;
	readonly type: string;
	readonly oracle: string;
	readonly rarity: Rarity;
	readonly colorIdentity: Array<Color>;
	readonly keywords: Array<string>;
	readonly artist: string;
	readonly releasedAt: Date;
	readonly faces: Array<CardFace>;

	public constructor(id: string, set: string, collectorNumber: string, name: string, language: LanguageCode, type: string, oracle: string, rarity: Rarity, colorIdentity: Array<Color>, keywords: Array<string>, artist: string, releasedAt: Date, ...faces: Array<CardFace>) {
		this.id = id;
		this.set = set;
		this.collectorNumber = collectorNumber;
		this.name = name;
		this.language = language;
		this.type = type;
		this.oracle = oracle;
		this.rarity = rarity;
		this.colorIdentity = colorIdentity;
		this.keywords = keywords;
		this.artist = artist;
		this.releasedAt = releasedAt;
		this.faces = faces;
	}

	public get isDoubleFace(): boolean {
		return this.faces.length > 1;
	}

	public static async byNumber(setCode: string, collectorNumber: string, language?: LanguageCode): Promise<Card> {
		let url = `${SCRYFALL_BASE_URL}/cards/${setCode}/${collectorNumber}`;
		if(language !== undefined) {
			url += `/${language}`
		}

		const response = await fetch(url);

		if(response.ok) {
			const json = await response.json();
			const card = Card.fromJSON(json);
		
			if(card !== undefined) {
				return card;
			}
			else {
				throw new Error("Failed to fetch requested card");
			}
		}
		else {
			throw new Error("The resquested card doesn't exist");
		}
	}

	public static async random(): Promise<Card> {
		const response = await fetch(`${SCRYFALL_BASE_URL}/cards/random`);
		const json = await response.json();
		const card = Card.fromJSON(json);

		if(card !== undefined) {
			return card;
		}
		else {
			throw new Error("Failed to fetch random card");
		}
	}

	private static fromJSON(json: any): Card | undefined {
		const faces = new Array();

		if(json.card_faces !== undefined) {
			for(const face of json.card_faces) {
				faces.push(new CardFace(face.cost, face.name, face.image_uris.png, face.colors, face.power, face.toughness, face.loyalty))
			}
		}
		else {
			faces.push(new CardFace(json.cost, json.name, json.image_uris.png, json.colors, json.power, json.toughness, json.loyalty))
		}

		return new Card(json.id, json.set, json.collector_number, json.name, json.lang, json.type_line, json.oracle_text ?? "", json.rarity, json.color_identity, json.keywords, json.artist, new Date(json.released_at), ...faces);
	}
}

export class CardFace {
	readonly cost: string;
	readonly name: string;
	readonly colors?: Array<Color>;
	readonly power?: string;
	readonly toughness?: string;
	readonly loyalty?: string;
	readonly image: string;

	public constructor(cost: string, name: string, image: string, colors?: Array<Color>, power?: string, toughness?: string, loyalty?: string) {
		this.cost = cost;
		this.name = name;
		this.colors = colors;
		this.power = power;
		this.toughness = toughness;
		this.loyalty = loyalty;
		this.image = image;
	}
}