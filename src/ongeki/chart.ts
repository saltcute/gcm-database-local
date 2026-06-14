import type { Chart as BaseChart } from "gcm-database/ongeki";
import type { Presences } from "./presence";

export interface Chart extends BaseChart {
    optionalData: Partial<{
        bpm: number[];
        notes: {
            tap: number;
            hold: number;
            side: number;
            flick: number;
            bell: number;
        };
        designer: string;
        presences: Presences[];
    }>;
}
