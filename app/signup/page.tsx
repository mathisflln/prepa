'use client'

import { GalleryVerticalEnd } from "lucide-react"
import { SignupForm } from "@/components/signup-form"
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function SignupHandler() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token_hash = params.get('token_hash')
    const type = params.get('type')

    if (token_hash && type === 'invite') {
      supabase.auth.verifyOtp({ token_hash, type: 'invite' })
    } else {
      router.push('/login')
    }
  }, [])

  return null
}

export default function SignupPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Suspense>
        <SignupHandler />
      </Suspense>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Cours de Prépa
        </a>
        <SignupForm />
      </div>
    </div>
  )
}