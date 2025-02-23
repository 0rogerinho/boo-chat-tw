// Libs
import { cn } from '../../shared/lib'
// Components
import { Header } from './components/Header'
import { useModel } from './hooks/useModel'

export const Chat = () => {
  const { chat, messagesEndRef, showWindow, processMessageHTML } = useModel()

  return (
    <main
      className={cn(
        'relative w-screen h-screen flex flex-col overflow-y-auto overflow-hidden rounded-md overflow-x-clip gap-3 bg-gray-800',
        !showWindow && 'bg-transparent'
      )}
    >
      <Header eyeClick={() => {}} />
      <div
        className={cn(
          'mt-7 overflow-y-auto overflow-x-hidden flex-1 scroll mr-1 mb-1',
          !showWindow && 'scroll-none'
        )}
      >
        {chat.map((data, index) => (
          <div className={cn('w-screen flex gap-1 pl-2')} key={index}>
            <h1>
              <span
                className="text-lg font-bold inline pr-1"
                style={{ color: data.color ?? 'blue' }}
              >
                {data.name}:
              </span>
              <div
                className="text-white text-xl inline break-words"
                dangerouslySetInnerHTML={{
                  __html: processMessageHTML(data.message)
                }}
              />
            </h1>
          </div>
        ))}
        {/* Ref to keep scroll at the end */}
        <div ref={messagesEndRef} />
      </div>
    </main>
  )
}
