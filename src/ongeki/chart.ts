import type { Chart as BaseChart } from "gcm-database/ongeki";
import type { ByRegion, Presences, Version } from "./presence";

export interface Chart extends BaseChart {
    optionalData: {
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
        remaster?: {
            baseDifficultyIdentifier: string;
            actualIdentifier: string;
        };
    };
}
