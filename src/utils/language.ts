const LETTER_COUNT = 32;
const EMOJI_A_CODE = 0x1F1E5;

export function getFlagByCode(languageCode: string) : string {
    return languageCode
    .toLowerCase()
    .split("")
    .map(letter => String.fromCodePoint((letter.charCodeAt(0) % LETTER_COUNT) + EMOJI_A_CODE))
    .join("");
}