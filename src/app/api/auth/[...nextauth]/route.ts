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
            name: user.name || githubUser.name || githubUser.login,
            image: user.image || githubUser.avatar_url,
            githubLogin: githubUser.login,
            githubAccessToken: encryptedToken,
          },
        })
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.githubLogin = (profile as { login: string })?.login
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email! },
        })
        if (dbUser) {
          (session.user as { id: string; githubLogin: string }).id = dbUser.id
          ;(session.user as { id: string; githubLogin: string }).githubLogin = dbUser.githubLogin
          if (dbUser.name) session.user.name = dbUser.name
        }
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
