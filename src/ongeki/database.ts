import fs from "node:fs";
import path from "node:path";
import { getInternalLevelFromPresences } from "@lib/getInternalLevelFromPresences";
import { Cache } from "@saltcute/cache";
import type { Database as BaseDatabase, Difficulty } from "gcm-database/ongeki";
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

    private cache = new Cache("gcm-database-local/ongeki");
    private getLocalFilePath(identifier: string) {
        return path.join(
            this._localDatabasePath,
            "assets",
            "ongeki",
            "jackets",
            `${identifier}.png`,
        );
    }
    public async getJacket(identifier: string, variant?: "DX" | "EX" | "CN") {
        if (identifier !== "dummy") {
            const songId = identifier.slice(-4);
            const variantIdentifier = `${songId.padStart(4, "0")}-${variant}`;
            if (
                variant &&
                fs.existsSync(this.getLocalFilePath(variantIdentifier))
            ) {
                identifier = variantIdentifier;
            } else {
                // Falls back to normal jacket if a variant cannot be found.
                identifier = `${songId.padStart(4, "0")}`;
            }
        }
        const localFilePath = this.getLocalFilePath(identifier);
        const jacket =
            fs.existsSync(localFilePath) && fs.readFileSync(localFilePath);
        if (jacket) {
            return { data: jacket };
        } else {
            return { err: `Cannot find the jacket of ${identifier}.` };
        }
    }
    public async getChart(identifier: string, difficulty: Difficulty) {
        const localFilePath = path.join(
            this._localDatabasePath,
            "assets",
            "ongeki",
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
            "ongeki",
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
                const internalLevel =
                    v.internalLevel ??
                    getInternalLevelFromPresences(v.optionalData.presences);
                if (internalLevel) {
                    return {
                        chart: v,
                        weight: Math.abs(internalLevel - payload.level),
                    };
                }
                return { chart: v };
            })
            .filter((v): v is { chart: Chart; weight: number } => "weight" in v)
            .sort((a, b) => a.weight - b.weight);
        return {
            data: sortedCandidates.slice(0, options?.maxResultCount || 20),
        };
    }
    public async getBossCard(chart: Chart) {
        return this.getCardImage(chart.boss.character.card);
    }
    public async getCharacter(identifier: string) {
        const localFilePath = path.join(
            this._localDatabasePath,
            "assets",
            "ongeki",
            "characters",
            identifier.padStart(6, "0"),
            `${identifier.padStart(6, "0")}.json`,
        );
        if (fs.existsSync(localFilePath)) {
            try {
                return {
                    data: JSON.parse(fs.readFileSync(localFilePath, "utf-8")),
                };
            } catch {
                return {
                    err: `Failed to parse ${identifier}.`,
                };
            }
        }
        return {
            err: `Cannot find a character with identifier ${identifier}.`,
        };
    }
    public async getCard(identifier: string) {
        const localFilePath = path.join(
            this._localDatabasePath,
            "assets",
            "ongeki",
            "cards",
            identifier.padStart(6, "0"),
            `${identifier.padStart(6, "0")}.json`,
        );
        if (fs.existsSync(localFilePath)) {
            try {
                return {
                    data: JSON.parse(fs.readFileSync(localFilePath, "utf-8")),
                };
            } catch {
                return {
                    err: `Failed to parse ${identifier}.`,
                };
            }
        }
        return {
            err: `Cannot find a card with identifier ${identifier}.`,
        };
    }
    public async getCardImage(identifier: string) {
        const localFilePath = path.join(
            this._localDatabasePath,
            "assets",
            "ongeki",
            "cards",
            "images",
            `${identifier.padStart(6, "0")}.png`,
        );
        if (fs.existsSync(localFilePath)) {
            const card = fs.readFileSync(localFilePath);
            return { data: card };
        }
        return { err: "Cannot find the card of this character." };
    }
}
