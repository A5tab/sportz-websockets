import { useContext } from 'react'
import { CommentaryContext } from '../context/CommentaryContext'

export const useCommentary = () => {
    const commentaryContext = useContext(CommentaryContext)

    const handleCommentary = () => {
        
    }
    if (!commentaryContext) {
        throw new Error('Component must be wrapped inside CommentaryContext provider')
    }

    return commentaryContext
}
