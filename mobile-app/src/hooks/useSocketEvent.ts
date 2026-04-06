import { useEffect } from "react";
import { useScore } from "./useScore"
import { useCommentary } from "./useCommentary"

export const useSocketEvents = (wsRef: React.RefObject<WebSocket | null>) => {
    const { handleScoreUpdate } = useScore();
    const { handleCommentary } = useCommentary();

    useEffect(() => {
        if (!wsRef.current) return;

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case "score.updated":
                    handleScoreUpdate(message.data);
                    break;

                case "commentary.added":
                    handleCommentary(message.data);
                    break;
            }
        };
    }, [wsRef]);
};