interface StackAuthUser {
  id: string
  email: string
  name?: string
  picture?: string
}

interface StackAuth {
  currentUser: StackAuthUser | null
  onAuthStateChanged: (callback: (user: StackAuthUser | null) => void) => () => void
  signOut: () => Promise<void>
}

interface Window {
  StackAuth?: StackAuth
}
