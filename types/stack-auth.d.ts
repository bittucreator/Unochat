interface StackAuthUser {
  id: string
  email: string
  name?: string
}

interface StackAuth {
  signOut: () => Promise<void>
  onAuthStateChanged: (callback: (user: StackAuthUser | null) => void) => void
}

declare global {
  interface Window {
    StackAuth: StackAuth
  }
}

export {}
