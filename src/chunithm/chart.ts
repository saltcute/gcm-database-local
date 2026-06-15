import type { Chart as BaseChart } from "gcm-database/chunithm";
import type { Presences, Version } from "./presence";

export interface Chart extends BaseChart {
    optionalData: {
        bpm: number[];
        notes: {
            tap: number;
            hold: number;
            slide: number;
            air: number;
            flick?: number;
        };
        designer: string;
        presences: Presences[];
        version: {
            displayVersion: Version;
            /**
             * Exist when a Re:Master chart is added later than the other difficulies.
             */
            actualReleaseVersion?: Version;
        };
        /**
         * yyyy-mm-dd date of when this chart became available.
         */
        addDate?: string;
    };
}
