'use client'

import {
  useChat,
  type Message,
  experimental_useAssistant as useAssistant
} from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'

const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
}

export function Chat({ id, initialMessages, className }: ChatProps) {
  const router = useRouter()
  const path = usePathname()
  const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
    'ai-token',
    null
  )
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: '/api/assistant' })




  function convertTextToLink(text) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    return text.replace(regex, '<a href="$2">$1</a>');
  }

  function removeBracketsText(text) {
    const regex = /\【[^】]*\】/g;
    return text.replace(regex, '');
  }

  function removeAsterisks(text) {
    return text.replace(/\*/g, '');
  }
  


  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.map((m: Message) => (
          <div
            key={m.id}
            className="whitespace-pre-wrap"
            // style={{ color: roleToColorMap[m.role] }}
          >
            <strong>{`${m.role}: `}</strong>
            {m.role !== 'data' &&
            <div dangerouslySetInnerHTML={{ __html: convertTextToLink(removeBracketsText(removeAsterisks(m.content))) }} />}
            {m.role === 'data' && (
              <>
                {/* here you would provide a custom display for your app-specific data:*/}
                {(m.data as any).description}
                <br />
                <pre className={'bg-gray-200'}>
                  {JSON.stringify(m.data, null, 2)}
                </pre>
              </>
            )}
            <br />
            <br />
          </div>
        ))}
      </div>
      <form onSubmit={submitMessage}>
        <input
          disabled={status !== 'awaiting_message'}
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="What is the temperature in the living room?"
          onChange={handleInputChange}
        />
      </form>
    </>
  )
}

// 'use client'

// import { useChat, type Message } from 'ai/react'

// import { cn } from '@/lib/utils'
// import { ChatList } from '@/components/chat-list'
// import { ChatPanel } from '@/components/chat-panel'
// import { EmptyScreen } from '@/components/empty-screen'
// import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
// import { useLocalStorage } from '@/lib/hooks/use-local-storage'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle
// } from '@/components/ui/dialog'
// import { useState } from 'react'
// import { Button } from './ui/button'
// import { Input } from './ui/input'
// import { toast } from 'react-hot-toast'
// import { usePathname, useRouter } from 'next/navigation'

// const IS_PREVIEW = process.env.VERCEL_ENV === 'preview'
// export interface ChatProps extends React.ComponentProps<'div'> {
//   initialMessages?: Message[]
//   id?: string
// }

// export function Chat({ id, initialMessages, className }: ChatProps) {
//   const router = useRouter()
//   const path = usePathname()
//   const [previewToken, setPreviewToken] = useLocalStorage<string | null>(
//     'ai-token',
//     null
//   )
//   const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
//   const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
//   const { messages, append, reload, stop, isLoading, input, setInput } =
//     useChat({
//       initialMessages,
//       id,
//       body: {
//         id,
//         previewToken
//       },
//       onResponse(response) {
//         if (response.status === 401) {
//           toast.error(response.statusText)
//         }
//       },
//       onFinish() {
//         if (!path.includes('chat')) {
//           window.history.pushState({}, '', `/chat/${id}`)
//         }
//       }
//     })
//   return (
//     <>
//       <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
//         {messages.length ? (
//           <>
//             <ChatList messages={messages} />
//             <ChatScrollAnchor trackVisibility={isLoading} />
//           </>
//         ) : (
//           <EmptyScreen setInput={setInput} />
//         )}
//       </div>
//       <ChatPanel
//         id={id}
//         isLoading={isLoading}
//         stop={stop}
//         append={append}
//         reload={reload}
//         messages={messages}
//         input={input}
//         setInput={setInput}
//       />

//       <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Enter your OpenAI Key</DialogTitle>
//             <DialogDescription>
//               If you have not obtained your OpenAI API key, you can do so by{' '}
//               <a
//                 href="https://platform.openai.com/signup/"
//                 className="underline"
//               >
//                 signing up
//               </a>{' '}
//               on the OpenAI website. This is only necessary for preview
//               environments so that the open source community can test the app.
//               The token will be saved to your browser&apos;s local storage under
//               the name <code className="font-mono">ai-token</code>.
//             </DialogDescription>
//           </DialogHeader>
//           <Input
//             value={previewTokenInput}
//             placeholder="OpenAI API key"
//             onChange={e => setPreviewTokenInput(e.target.value)}
//           />
//           <DialogFooter className="items-center">
//             <Button
//               onClick={() => {
//                 setPreviewToken(previewTokenInput)
//                 setPreviewTokenDialog(false)
//               }}
//             >
//               Save Token
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </>
//   )
// }
