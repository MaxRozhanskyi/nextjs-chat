import { type Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

// import { auth } from '@/auth'
import { getChat } from '@/app/actions'
import { Chat } from '@/components/chat'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
// }: ChatPageProps): Promise<Metadata> {
}: ChatPageProps) {

  // const session = await auth()

  // if (!session?.user) {
  //   return {}
  // }

  // const chat = await getChat(params.id, session.user.id)
  // return {
  //   title: chat?.title.toString().slice(0, 50) ?? 'Chat'
  // }
  return null
}

export default async function ChatPage({ params }: ChatPageProps) {
  // const session = await auth()

  // if (!session?.user) {
  //   redirect(`/sign-in?next=/chat/${params.id}`)
  // }

  // const chat = await getChat(params.id, session.user.id)

  // if (!chat) {
  //   notFound()
  // }

  // if (chat?.userId !== session?.user?.id) {
  //   notFound()
  // }

  // return <Chat id={chat.id} initialMessages={chat.messages} />
  return <Chat />
}
