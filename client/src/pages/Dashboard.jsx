import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminNavbar from '../components/AdminNavbar'
import api from '../services/api'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    supportChats: 0,
    systemStatus: 'online'
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    } else if (user && user.role !== 'admin') {
      navigate('/chat')
    } else if (user) {
      fetchDashboardData()
    }
  }, [user, loading, navigate])

  const fetchDashboardData = async () => {
    try {
      const usersResponse = await api.get('/users')
      const chatsResponse = await api.get('/chat')
      
      setStats({
        totalUsers: usersResponse.data.length,
        activeChats: chatsResponse.data.length,
        supportChats: 0,
        systemStatus: 'online'
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminNavbar />
      
      <div className="pt-20 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Manage your platform, monitor users, and keep everything running smoothly
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <span className="text-3xl">👥</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">+12% vs last week</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">TOTAL USERS</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Active learners</p>
            </div>

            {/* Active Chats */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <span className="text-3xl">💬</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">+8% vs last week</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">ACTIVE CHATS</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Ongoing conversations</p>
            </div>

            {/* Support Chats */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <span className="text-3xl">🎧</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">+5% vs last week</span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">SUPPORT CHATS</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.supportChats}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">All conversations</p>
            </div>

            {/* System Status */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <span className="text-3xl">⚡</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">SYSTEM STATUS</h3>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">99.9%</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Uptime SLA</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                <button className="text-primary hover:text-secondary transition-colors text-sm font-semibold">
                  View All →
                </button>
              </div>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Activity will appear here as users interact with the platform</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span>{activity.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions & System Status */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <span className="text-xl">👥</span>
                    <span>Manage Users</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/admin/support')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <span className="text-xl">🎧</span>
                    <span>Support Center</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/chat')}
                    className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-semibold"
                  >
                    <span className="text-xl">💬</span>
                    <span>Start Chat</span>
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">System Status</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Server Status</span>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Database</span>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Connected
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Service</span>
                    <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
