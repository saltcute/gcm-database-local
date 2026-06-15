import type { Chart as BaseChart } from "gcm-database/maimai";
import type { Presences } from "./presence";

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
    };
}
