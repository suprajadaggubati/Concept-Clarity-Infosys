import { useState } from 'react'
import { useChat } from '../context/ChatContext'
import { chatService } from '../services/chatService'

export default function Sidebar() {
  const { chatHistory, currentChat, setCurrentChat, createChat, deleteChat } = useChat()
  const [loading, setLoading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleNewChat = async () => {
    setLoading(true)
    try {
      const response = await chatService.createChat('New Chat')
      const newChatData = response.data
      createChat(newChatData._id, newChatData.title)
    } catch (error) {
      console.error('Error creating chat:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChat = (chatId) => {
    setCurrentChat(chatId, [])
  }

  const handleDeleteClick = (e, chatId) => {
    e.stopPropagation()
    setDeleteConfirm(chatId)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    
    try {
      await chatService.deleteChat(deleteConfirm)
      deleteChat(deleteConfirm)
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  return (
    <>
      <aside className="w-64 bg-white dark:bg-gray-900 shadow-lg h-screen overflow-auto p-4 flex flex-col">
        <button
          onClick={handleNewChat}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition mb-6 disabled:opacity-50"
        >
          + New Chat
        </button>

        <div className="flex-1 overflow-auto">
          <h3 className="font-bold text-sm text-gray-600 dark:text-gray-400 mb-3">History</h3>
          <div className="space-y-2">
            {chatHistory && chatHistory.length > 0 ? (
              chatHistory.map((chat) => (
                <div
                  key={chat._id}
                  className={`group relative flex items-center gap-2 p-3 rounded-lg transition text-sm ${
                    currentChat === chat._id
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <button
                    onClick={() => handleSelectChat(chat._id)}
                    className="flex-1 text-left truncate"
                  >
                    {chat.title || 'New Chat'}
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, chat._id)}
                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500 hover:text-white ${
                      currentChat === chat._id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No chats yet</p>
            )}
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-scaleIn">
            <h3 className="text-xl font-bold mb-4">Delete Chat?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this chat? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
