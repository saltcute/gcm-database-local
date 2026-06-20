import fs from "node:fs";
import path from "node:path";
import { getInternalLevelFromPresences } from "@lib/getInternalLevelFromPresences";
import { Cache } from "@saltcute/cache";
import type {
    Database as BaseDatabase,
    Difficulty,
} from "gcm-database/chunithm";
import type { Chart } from "./chart";

export class Database implements BaseDatabase<Chart> {
    constructor(private _localDatabasePath: string) {}

    public setLocalDatabasePath(path: string) {
        if (fs.existsSync(path)) {
            this._localDatabasePath = path;
            return true;
        } else {
            return false;
        }
    }

    public hasLocalDatabase() {
        return fs.existsSync(this._localDatabasePath);
    }

    private cache = new Cache("gcm-database-local/chunithm");
    public async getJacket(identifier: string, variant?: "DX" | "EX" | "CN") {
        const cacheKey = `jacket-${identifier}${variant ? `-${variant}` : ""}`;
        const cached = await this.cache.get(cacheKey);
        if (cached instanceof Buffer) {
            return { data: cached };
        } else {
            const songId = identifier.slice(-4);
            if (variant) {
                const localFilePath = path.join(
                    this._localDatabasePath,
                    "assets",
                    "chunithm",
                    "jackets",
                    `${songId.padStart(6, "0")}-${variant}.png`,
                );
                if (fs.existsSync(localFilePath)) {
                    return { data: fs.readFileSync(localFilePath) };
                }
            }
            // Falls back to normal jacket if a variant cannot be found.
            const localFilePath = path.join(
                this._localDatabasePath,
                "assets",
                "chunithm",
                "jackets",
                `${songId.padStart(4, "0")}.png`,
            );
            const jacket =
                fs.existsSync(localFilePath) && fs.readFileSync(localFilePath);
            if (jacket) {
                this.cache.put(cacheKey, jacket, 5 * 1000); // 5 seconds.
                return { data: jacket };
            } else {
                return { err: `Cannot find the jacket of ${identifier}.` };
            }
        }
    }
    public async getChart(identifier: string, difficulty: Difficulty) {
        const localFilePath = path.join(
            this._localDatabasePath,
            "assets",
            "chunithm",
            "charts",
            identifier.padStart(4, "0"),
            `${difficulty}.json`,
        );
        if (fs.existsSync(localFilePath)) {
            try {
                return {
                    data: JSON.parse(
                        fs.readFileSync(localFilePath, "utf-8"),
                    ) as Chart,
                };
            } catch {
                return {
                    err: `Failed to parse ${identifier} ${difficulty}.`,
                };
            }
        }
        return {
            err: `Cannot find a chart with identifier ${identifier}.`,
        };
    }
    private async getAllCharts() {
        const cached = await this.cache.get("all-charts");
        if (cached) return cached as Chart[];
        const localFolderPath = path.join(
            this._localDatabasePath,
            "assets",
            "chunithm",
            "charts",
        );
        const chartFolders = fs.readdirSync(localFolderPath);
        const songs: Chart[] = [];
        for (const folder of chartFolders) {
            const charts = fs.readdirSync(path.join(localFolderPath, folder));
            for (const chart of charts) {
                try {
                    songs.push(
                        require(path.join(localFolderPath, folder, chart)),
                    );
                } catch {}
            }
        }
        await this.cache.put("all-charts", songs, 15 * 60 * 1000); // 15 minutes.
        return songs;
    }
    public async searchChart(
        payload: {
            title: string;
            level: number;
            difficulty: Difficulty;
        },
        options?: Partial<{
            maxResultCount: number;
        }>,
    ) {
        const allSongs = await this.getAllCharts();
        const sortedCandidates = allSongs
            .filter(
                (v) =>
                    v.title === payload.title &&
                    v.difficulty === payload.difficulty,
            )
            .map((v) => {
                if (v.optionalData.presences) {
                    const internalLevel = getInternalLevelFromPresences(
                        v.optionalData.presences,
                    );
                    if (internalLevel) {
                        return {
                            chart: v,
                            weight: Math.abs(internalLevel - payload.level),
                        };
                    }
                }
                return { chart: v };
            })
            .filter((v): v is { chart: Chart; weight: number } => !!v.weight)
            .sort((a, b) => a.weight - b.weight);
        return {
            data: sortedCandidates.slice(0, options?.maxResultCount || 20),
        };
    }
}
