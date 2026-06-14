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
export interface UsaLock extends BasePresence {
    type: "usa_lock";
}

export type Presences = Existence | Absence | Removal | UsaLock;

export interface Version {
    /**
     * Full name of the version.
     * @example "maimai でらっくす PRiSM PLUS"
     */
    name: string;
    /**
     * Version number as it is used internally.
     * Formatted as `{major}.{minor}.{patch}`.
     *
     * @example "1.40" for "1.40"
     * @example "1.99" for "1.99"
     * @example "2.41.7" for "DX1.41-G"
     * @example "2.55.0" for "DX1.55"
     */
    gameVersion: {
        /**
         * maimai FiNALE and earlier: `1`
         *
         * maimai DX and later: `2`
         */
        major: number;
        minor: number;
        release?: number;
    };
    /**
     * Events before maimai DX is always `DX`
     */
    region: "DX" | "EX" | "CN";
}
