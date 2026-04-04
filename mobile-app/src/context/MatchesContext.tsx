import { createContext, useState } from "react";

type Match = {
    matchId: string
}

type MatchesContextType = {
    matches: Match;
}

export const MatchesContext = createContext<MatchesContextType | null>(null);
export const MatchesProvider = () => {
    const [matches] = useState<Match>({
        matchId: ''
    })
    return <MatchesContext.Provider value={{matches}} />
}