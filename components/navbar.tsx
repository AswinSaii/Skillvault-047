"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { GraduationCap, Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Fix hydration mismatch by only rendering Sheet after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SkillVault</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#roles" className="text-sm font-medium hover:text-primary transition-colors">
            Roles
          </Link>
          <Link href="#institutions" className="text-sm font-medium hover:text-primary transition-colors">
            Institutions
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <Button asChild variant="default">
              <Link href={`/dashboard/${user.role}`}>Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:flex">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="default">
                <Link href="/signup">Get Started</Link>
              </Button>
            </>
          )}

          {/* Mobile Nav - Only render after mount to fix hydration */}
          {mounted && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-4 mt-8">
                  <Link href="/login" className="text-lg font-medium">
                    Login
                  </Link>
                  <Link href="/signup" className="text-lg font-medium">
                    Signup
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
