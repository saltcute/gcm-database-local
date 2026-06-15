import type { Chart as BaseChart } from "gcm-database/chunithm";
import type { Presences } from "./presence";

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
    };
}
