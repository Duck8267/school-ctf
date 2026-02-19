'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinPage() {
  const [teamName, setTeamName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [event, setEvent] = useState<any>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [loginName, setLoginName] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch('/api/events/current')
      if (res.status === 401) {
        router.push('/event')
        return
      }
      if (res.ok) {
        const eventData = await res.json()
        setEvent(eventData)
      }
    } catch (error) {
      console.error('Failed to load event:', error)
    } finally {
      setLoadingEvent(false)
    }
  }, [router])

  useEffect(() => {
    loadEvent()
  }, [loadEvent])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/teams/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to register')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)

    try {
      const response = await fetch('/api/teams/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, pin: loginPin }),
      })

      const data = await response.json()

      if (!response.ok) {
        setLoginError(data.error || 'Failed to log in')
        setLoginLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setLoginError('Something went wrong. Please try again.')
      setLoginLoading(false)
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (!event) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎯 {event.name}
        </h1>
        <p className="text-center text-gray-600 mb-2">
          {event.date} • {event.location}
        </p>
        <p className="text-center text-gray-600 mb-8">
          Enter your team name and set a 4-digit PIN to get started!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="teamName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              placeholder="Enter your team name"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              4-digit PIN (to log back in later)
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
              placeholder="••••"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Joining...' : 'Join Challenge! 🚀'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          {!showLogin ? (
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="w-full text-sm text-gray-600 hover:text-blue-600"
            >
              Log in to existing team
            </button>
          ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              <p className="text-sm font-medium text-gray-700">
                Log in to existing team
              </p>
              <label htmlFor="loginName" className="sr-only">
                Team name
              </label>
              <input
                id="loginName"
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Team name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                disabled={loginLoading}
              />
              <label htmlFor="loginPin" className="sr-only">
                4-digit PIN
              </label>
              <input
                id="loginPin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={loginPin}
                onChange={(e) =>
                  setLoginPin(e.target.value.replace(/\D/g, ''))
                }
                placeholder="4-digit PIN"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                disabled={loginLoading}
              />
              {loginError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {loginError}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex-1 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loginLoading ? 'Logging in...' : 'Log in'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false)
                    setLoginError('')
                  }}
                  className="py-2 px-3 text-gray-600 text-sm hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

