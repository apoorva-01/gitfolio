import NextAuth, { type AuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import { prisma } from '@/lib/db'
import { encrypt } from '@/lib/encryption'

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email repo',
        },
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && account.access_token) {
        const githubUser = profile as { login: string; avatar_url: string; name?: string; bio?: string }
        const encryptedToken = encrypt(account.access_token, process.env.ENCRYPTION_KEY!)
        await prisma.user.upsert({
          where: { email: user.email! },
          create: {
            email: user.email!,
            name: user.name || githubUser.name || githubUser.login,
            image: user.image || githubUser.avatar_url,
            githubLogin: githubUser.login,
            githubAccessToken: encryptedToken,
          },
          update: {
            // name is user-editable (Settings) — do not overwrite it on re-login
            image: user.image || githubUser.avatar_url,
            githubLogin: githubUser.login,
            githubAccessToken: encryptedToken,
          },
        })
      }
      return true
    },
    async jwt({ token, account, profile, trigger }) {
      if (account) {
        token.accessToken = account.access_token
        token.githubLogin = (profile as { login: string })?.login
      }
      // Attach the stable DB id + name to the token so the session needs zero per-request DB reads.
      // Reads the DB only at sign-in (or once for pre-existing tokens missing id), and on an explicit
      // session.update() after a profile edit — never on a normal authenticated request.
      if (!token.id && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, name: true, githubLogin: true },
        })
        if (dbUser) {
          token.id = dbUser.id
          token.name = dbUser.name
          token.githubLogin = token.githubLogin ?? dbUser.githubLogin
        }
      } else if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true },
        })
        if (dbUser) token.name = dbUser.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; githubLogin?: string }).id = token.id as string
        ;(session.user as { id?: string; githubLogin?: string }).githubLogin = token.githubLogin as string
        if (token.name) session.user.name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
