import type {
    Existence as ChunithmExistence,
    Presences as ChunithmPresences,
} from "@chunithm/presence";
import type {
    Existence as MaimaiExistence,
    Presences as MaimaiPresences,
} from "@maimai/presence";
import type {
    Existence as OngekiExistence,
    Presences as OngekiPresences,
} from "@ongeki/presence";

type AllExistence = MaimaiExistence | ChunithmExistence | OngekiExistence;

export function getInternalLevelFromPresences(
    presences: (MaimaiPresences | ChunithmPresences | OngekiPresences)[],
) {
    let latestPresence: AllExistence | undefined;
    for (const presence of presences) {
        if (
            !latestPresence ||
            (presence.type === "existence" &&
                presence.version.gameVersion.major >=
                    latestPresence.version.gameVersion.major &&
                presence.version.gameVersion.minor >=
                    latestPresence.version.gameVersion.minor)
        ) {
            latestPresence = presence as AllExistence;
        }
    }
    if (latestPresence) {
        return latestPresence.data.level;
    }
    return null;
}
