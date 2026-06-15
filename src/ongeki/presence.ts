interface BasePresence {
    type: string;
    data?: unknown;
    version: Version;
}
export interface Existence extends BasePresence {
    type: "existence";
    data: {
        level: number;
    };
}
export interface Absence extends BasePresence {
    type: "absence";
}
export interface Removal extends BasePresence {
    type: "removal";
}

export type Presences = Existence | Absence | Removal;

export interface Version {
    /**
     * Full name of the version.
     * @example "オンゲキ Re:Fresh"
     */
    name: string;
    /**
     * Version number as it is used internally.
     * Formatted as `{major}.{minor}.{patch}`.
     */
    gameVersion: {
        major: number;
        minor: number;
        release?: number;
    };
    region: Regions;
}

export type Regions = "JPN";
export type ByRegion<T> = Record<Regions, T>;
