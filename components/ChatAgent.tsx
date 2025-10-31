
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat } from '@google/genai';
import { LanguageContext } from '../App';
import { createChatSession, sendMessageStreamWithImage } from '../services/geminiService';
import { Message } from '../types';
import { LoadingIcon, SendIcon, SourceIcon, PhotoIcon, XMarkIcon } from './Icons';

const ChatAgent: React.FC = () => {
  const { language, t } = useContext(LanguageContext);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !chat || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input || 'What type of waste is this and how should I dispose of it?',
      image: selectedImage || undefined
    };
    setMessages(prev => [...prev, userMessage]);
    const messageText = input;
    setInput('');
    setIsLoading(true);
    setSelectedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const stream = await sendMessageStreamWithImage(chat, messageText, userMessage.image);

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
              {msg.image && (
                <div className="mb-2">
                  <img
                    src={msg.image}
                    alt="Uploaded waste"
                    className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}
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
      <form onSubmit={handleSendMessage} className="mt-4">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected waste"
              className="max-h-32 rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Upload image"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
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
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAgent;
