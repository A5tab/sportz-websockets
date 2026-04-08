import React, { useContext, useEffect } from "react"
import { WebSocketContext } from "../context/WebSocketContext"
import { useMatches } from "./useMatches"
import { useCommentary } from "./useCommentary"

export const useSocket = () => {
	const socketContext = useContext(WebSocketContext)

	if (!socketContext) {
		throw new Error("useSocket must be used within WebSocketContext provider")
	}

	return socketContext
}

export const useSocketEvents = (wsRef: React.RefObject<WebSocket | null>) => {
	const { subscribedMatchIds, addMatch } = useMatches();
	const { addCommentary } = useCommentary();

	useEffect(() => {
		if (!wsRef.current) return;

		wsRef.current.onmessage = (event) => {
			const message = JSON.parse(event.data);

			switch (message.type) {

				case "match.created":
					addMatch(message.data);
					break;

				case "match.commentary":
					addCommentary(message.data);
					break;
			}
		};
	}, [wsRef, subscribedMatchIds]);
};