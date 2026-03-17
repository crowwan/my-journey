// 인증 상태 관리 React Query hooks
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const AUTH_QUERY_KEY = ['auth', 'user']

// 현재 로그인 사용자 정보 조회
export function useAuth() {
  const supabase = createClient()

  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 1000 * 60 * 10, // 10분
    retry: false,
  })
}

// 카카오 소셜 로그인
export function useSignInWithKakao() {
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    },
  })
}

// 로그아웃
export function useSignOut() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
