export enum BloodType {
    A = "A",
    B = "B",
    O = "O",
    AB = "AB",
}
export enum Attribute {
    FIRE = "fire",
    AQUA = "aqua",
    LEAF = "leaf",
}
export interface Card {
    identifier: string;
    name: string;
    rarity: string;
    characterIdentifier: number;
    attribute: Attribute;
}
export interface Character {
    id: number;
    name: string;
    voiceLines: string[];
    bloodType: BloodType;
    personality?: string;
    height: number;
}
