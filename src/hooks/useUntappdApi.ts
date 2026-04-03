import { useState } from "react"
import type { UserProfile, Checkin, Beer, Recommendation } from "@/domain/models"

export function useUntappdApi() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const loadUserProfile = async (username: string, includeCheckins = true) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (includeCheckins) params.set("checkins", "true")
      if (accessToken) params.set("access_token", accessToken)

      const response = await fetch(`/api/untappd/user/${username}?${params.toString()}`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to load user profile")
      }

      return await response.json() as { profile: UserProfile; checkins: Checkin[] }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendations = async (username: string, selectedBeer: Beer, topN = 10) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/untappd/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, selectedBeer, topN, accessToken }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to get recommendations")
      }

      const data = await response.json()
      return data.recommendations as Recommendation[]
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startOAuth = () => {
    window.location.href = "/auth/untappd"
  }

  const handleOAuthCallback = async (token: string) => {
    setAccessToken(token)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/untappd/authenticated-user?access_token=${token}&checkins=true`)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to load authenticated user")
      }

      return await response.json() as { profile: UserProfile; checkins: Checkin[]; accessToken: string }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    error,
    accessToken,
    setAccessToken,
    loadUserProfile,
    getRecommendations,
    startOAuth,
    handleOAuthCallback,
  }
}
