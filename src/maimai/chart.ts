import type { Chart as BaseChart } from "gcm-database/maimai";
import type { ByRegion, Presences, Version } from "./presence";

export interface Chart extends BaseChart {
    optionalData: {
        bpm: number[];
        notes: {
            tap: number;
            hold: number;
            slide: number;
            touch: number;
            break: number;
        };
        designer: {
            id: number;
            name: string;
        };
        presences: Presences[];
        version: {
            displayVersion: ByRegion<Version>;
            /**
             * Exist when a Re:Master chart is added later than the other difficulies.
             */
            actualReleaseVersion?: ByRegion<Version>;
        };
        /**
         * yyyy-mm-dd date of when this chart became available.
         */
        addDate?: ByRegion<string>;
    };
}
