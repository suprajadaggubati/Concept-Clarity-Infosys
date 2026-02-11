import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import { ticketService } from '../services/ticketService'
import UserNavbar from '../components/UserNavbar'

export default function UserDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalChats: 0,
    openTickets: 0,
    resolvedTickets: 0
  })
  const [recentChats, setRecentChats] = useState([])
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load chats from API
      const chatsResponse = await chatService.getChats()
      const chats = chatsResponse.data || []
      setRecentChats(chats.slice(0, 3))
      
      // Load tickets from API
      const ticketsResponse = await ticketService.getMyTickets()
      const tickets = ticketsResponse.data.tickets || []
      setRecentTickets(tickets.slice(0, 2))
      
      // Update stats
      setStats({
        totalChats: chats.length,
        openTickets: tickets.filter(t => t.status === 'pending' || t.status === 'active').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved').length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <UserNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Your personal learning dashboard
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Recent Chats Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Total Chats</h3>
                  <span className="text-3xl">💬</span>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">{stats.totalChats}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {stats.totalChats === 0 ? 'No conversations yet' : 'Active conversations'}
                </p>
              </div>

              {/* Learning Progress Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Learning Progress</h3>
                  <span className="text-3xl">📚</span>
                </div>
                <p className="text-3xl font-bold text-green-500 mb-2">
                  {stats.totalChats > 0 ? '85%' : '0%'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {stats.totalChats > 0 ? 'Concepts mastered' : 'Start learning today'}
                </p>
              </div>

              {/* Support Tickets Card */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Support Tickets</h3>
                  <span className="text-3xl">🎫</span>
                </div>
                <p className="text-3xl font-bold text-blue-500 mb-2">{stats.openTickets}</p>
                <p className="text-gray-600 dark:text-gray-400">
                  {stats.openTickets === 0 ? 'No open tickets' : 'Open tickets'}
                </p>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Chats */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>💬</span> Recent Chats
                </h2>
                {recentChats.length > 0 ? (
                  <div className="space-y-3">
                    {recentChats.map((chat, index) => (
                      <div 
                        key={chat._id || index}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => navigate('/chat')}
                      >
                        <h3 className="font-semibold mb-1">
                          {chat.title || `Chat ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(chat.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No chats yet</p>
                    <button
                      onClick={() => navigate('/chat')}
                      className="text-primary hover:underline font-semibold"
                    >
                      Start your first conversation →
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Support */}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🎫</span> Recent Support
                </h2>
                {recentTickets.length > 0 ? (
                  <div className="space-y-3">
                    {recentTickets.map((ticket) => (
                      <div 
                        key={ticket._id}
                        className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => navigate('/user/support')}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === 'pending' || ticket.status === 'active'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          }`}>
                            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No support tickets</p>
                    <button
                      onClick={() => navigate('/user/support')}
                      className="text-primary hover:underline font-semibold"
                    >
                      Need help? Create a ticket →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Learn?</h2>
              <p className="mb-6 text-lg">Start a new conversation and explore any topic you want to master!</p>
              <button
                onClick={() => navigate('/chat')}
                className="bg-white text-primary px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                Go to Chat →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
