
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat } from '@google/genai';
import { LanguageContext } from '../App';
import { createChatSession } from '../services/geminiService';
import { Message } from '../types';
import { LoadingIcon, SendIcon, SourceIcon } from './Icons';

const ChatAgent: React.FC = () => {
  const { language, t } = useContext(LanguageContext);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    const newChat = createChatSession(language);
    setChat(newChat);
    setMessages([{ sender: 'bot', text: t('chatIntro') }]);
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chat || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await chat.sendMessageStream({ message: input });
      
      let botResponse = '';
      let currentBotMessage: Message = { sender: 'bot', text: '' };
      setMessages(prev => [...prev, currentBotMessage]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const sources = groundingChunks
            ?.map((c: any) => c.web)
            .filter((web: any) => web && web.uri && web.title) || [];

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if(lastMessage.sender === 'bot') {
            lastMessage.text = botResponse;
            if (sources.length > 0) {
              lastMessage.sources = sources;
            }
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <h4 className="text-xs font-bold mb-1">{t('sources')}</h4>
                  <ul className="space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i} className="text-xs">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                         <SourceIcon/>
                          <span>{source.title || new URL(source.uri).hostname}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].sender === 'user' && (
          <div className="flex justify-start">
             <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800 flex items-center">
              <LoadingIcon />
              <span className="ml-2 animate-pulse">Wizard is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chatPlaceholder')}
          className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatAgent;
