import { useContext } from 'react'
import { CommentaryContext } from '../context/CommentaryContext'

export const useCommentary = () => {
    const commentaryContext = useContext(CommentaryContext)

    if (!commentaryContext) {
        throw new Error('useCommentary must be used within CommentaryProvider')
    }

    return commentaryContext
}
