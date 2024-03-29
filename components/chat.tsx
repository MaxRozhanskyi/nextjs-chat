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
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import Image from "next/image";

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
  const [previewServer, setPreviewServer] = useState('')
  const [previewTokenDialog, setPreviewTokenDialog] = useState(IS_PREVIEW)
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? '')
  const { status, messages, input, submitMessage, handleInputChange } =
    useAssistant({ api: `/api/assistant?value=${previewServer}` })

  useEffect(() => {
    const mainElement = document.getElementById('mainContent');
    if (mainElement) {
      if (status !== 'awaiting_message') {
        mainElement.classList.add('hide-logo');
      } 
    }
  }, [status]);


  function convertTextToLink(text: string) {
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g
    return text.replace(regex, '<a href="$2">$1</a>')
  }

  function removeBracketsText(text: string) {
    const regex = /\【[^】]*\】/g
    return text.replace(regex, '')
  }

  function removeAsterisks(text: string) {
    return text.replace(/\*/g, '')
  }

  const [linkClicked, setLinkClicked] = useState(false);
  const wrapperRef = useRef(null);
  const [bottomPadding, setBottomPadding] = useState('250px');





  
  // const handleInput = (data) => {
  //   handleInputChange({ target: { value: data } });
  // };
  // const handleSubmitFromEvent = (data) => {
  //   handleInput(data);
  //
  //   submitMessage(); 
  // };
  // const [isDisabled, setIsDisabled] = useState(false);

  // const handleSubmit = (data) => {
  //   handleInputChange({ target: { value: data } });
  //   setIsDisabled(true); 
  //   submitMessage(new Event('submit')).then(() => {
  //     setIsDisabled(false); 
  //   });
  // };
  
  
  
  
  


  useEffect(() => {
    const updatePadding = () => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const height = wrapper.offsetHeight; 
        setBottomPadding(`${height}px`); 
      }
    };

    updatePadding();
    window.addEventListener('resize', updatePadding)

    let assistant_url = 'https://dev.worldjewishtravel.org/wp-json/mycustom/v1/assistants_id/'
    let url = (window.location != window.parent.location) ? document.referrer : document.location.href;

    if(url === 'https://dev.worldjewishtravel.org/'){
      setPreviewServer('dev');
    }else if (url === 'https://lab.worldjewishtravel.org/'){
      setPreviewServer('lab');
    } else if (url === 'https://test.worldjewishtravel.org/'){
      setPreviewServer('test');
    }else {
      setPreviewServer('dev');
    }

    
    return () => {
      window.removeEventListener('resize', updatePadding);
    };
  }, []);

  
  
  // useEffect(() => {
  //   window.addEventListener('message', receiveMessage);
  //
  //   function receiveMessage(event) {
  //
  //     if (event.origin !== "https://dev.worldjewishtravel.org" && event.origin !== "https://world33.loc")
  //       return;
  //
  //     if (event.data.type === 'formSubmit') {
  //       console.log('Полученные данные:', event.data.data);
  //       handleSubmitFromEvent(event.data.data);
  //     }
  //   }
  //
  //   return () => window.removeEventListener('message', receiveMessage);
  // }, []);

  useEffect(() => {
    window.addEventListener('message', receiveMessage);

    return () => {
      window.removeEventListener('message', receiveMessage);
    };
  }, []); 

  function receiveMessage(event) {
    if (event.origin !== "https://dev.worldjewishtravel.org" && event.origin !== "https://world33.loc")
      return;

    if (event.data.type === 'formSubmit') {
      handleInputChange({ target: { value: event.data.data } });
      setLinkClicked(true);
    }
  }


  useEffect(() => {
    if (linkClicked) {
      const timer = setTimeout(() => {
        submitMessage(new Event('submit'));
        setLinkClicked(false);
      }, 100); 

      return () => clearTimeout(timer);
    }
  }, [linkClicked, submitMessage]);


  

  
  
  useEffect(() => {
    const links = document.querySelectorAll('.wrapper-question .question');

    const handleLinkClick = (event) => {
      event.preventDefault();
      const text = event.target.textContent;
      handleInputChange({ target: { value: text } });
      setLinkClicked(true); 
    };

    links.forEach(link => {
      link.addEventListener('click', handleLinkClick);
    });

    return () => {
      links.forEach(link => {
        link.removeEventListener('click', handleLinkClick);
      });
    };
  }, [handleInputChange]);

  useEffect(() => {
    if (linkClicked) {
      submitMessage(new Event('submit'));
      setLinkClicked(false); 
    }
  }, [linkClicked, submitMessage]);
  
  const getLinkClassName = (baseClass) => {
    return `${baseClass} ${status !== 'awaiting_message' ? 'disabled' : ''}`;
  };

  return (
    <>
      <div className={cn(' pt-4 md:pt-10', className)} style={{ paddingBottom: bottomPadding }}>
        {messages.map((m: Message) => (
          <div
            key={m.id}
            className="whitespace-pre-wrap message"
            // style={{ color: roleToColorMap[m.role] }}
          >
            <img
                className="icon-chat mr-4"
                src={m.role === 'user' ? "/user-chat.PNG" : "/assistant-chat.PNG"}
                alt={m.role}
            />
            <div className="flex-grow">
              <strong className="text-black-600">{m.role === 'user' ? "User" : "Gil"}</strong>
              {m.role !== 'data' && (
                <div className="text-gray-800"
                  dangerouslySetInnerHTML={{
                    __html: convertTextToLink(
                      removeBracketsText(removeAsterisks(m.content))
                    )
                  }}
                />
              )}
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
          </div>
          </div>
        ))}
      </div>
      <form onSubmit={submitMessage}>
        <div className="fixed bottom-0 wrapper-form mb-8" ref={wrapperRef}>
          <div className="wrapper-question">
            <a className={getLinkClassName("question")} href="#">What sites can I see in two hours?</a>
            <a className={getLinkClassName("question")} href="#">What hotels can you recommend?</a>
            <a className={getLinkClassName("question")} href="#">Can you suggest where to eat?</a>
            <a className={getLinkClassName("question")} href="#">What city tours are available?</a>
            <a className={getLinkClassName("question")} href="#">What cultural events can I attend?</a>
            <a className={getLinkClassName("question")} href="#">Tell me about any cultural days</a>
          </div>
          <input
            disabled={status !== 'awaiting_message'}
            className=" p-6   border border-gray-300 rounded"
            value={input}
            placeholder="Ask me your travel question…"
            onChange={handleInputChange}
          />
          <button type="submit"></button>
        </div>
      </form>
    </>
  )
}

