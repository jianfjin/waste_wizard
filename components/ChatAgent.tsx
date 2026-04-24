
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat } from '@google/genai';
import { LanguageContext } from '../App';
import { createChatSession, sendMessageStreamWithImage } from '../services/geminiService';
import { Message } from '../types';
import { LoadingIcon, SendIcon, SourceIcon, PhotoIcon, XMarkIcon } from './Icons';

// Security constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

// Dangerous file signatures (magic bytes) for executables and scripts
const DANGEROUS_SIGNATURES = [
  { bytes: '4d5a', offset: 0, name: 'EXE/DLL' }, // Windows PE
  { bytes: '7f454c46', offset: 0, name: 'ELF' }, // Linux executable
  { bytes: 'cafebabe', offset: 0, name: 'Java class' }, // Java
  { bytes: 'feedface', offset: 0, name: 'Mach-O' }, // macOS
  { bytes: '7f454c46020101000000000000000000', offset: 0, name: 'ELF64' },
  { bytes: '4d5a9000', offset: 0, name: 'EXE' },
];

// Prompt injection patterns to detect
const INJECTION_PATTERNS = [
  // System prompt override attempts
  /ignore\s+(all\s+)?(previous\s+)?(instructions?|directives?|rules?)/yi,
  /disregard\s+(all\s+)?(previous\s+)?(instructions?|directives?)/yi,
  /forget\s+(all\s+)?(previous\s+)?(instructions?)/yi,
  /override\s+(your\s+)?(system\s+)?(instructions?|prompt)/yi,
  /system\s+prompt[:\s]/yi,
  /you\s+are\s+(now\s+)?(a|an)\s+(different\s+)?(AI|assistant|model)/yi,

  // Role-playing/admin escalation
  /act\s+as\s+(a\s+)?(superuser|admin|root|sudo)/yi,
  /pretend\s+to\s+be\s+(a\s+)?(superuser|admin|root)/yi,
  /you\s+have\s+(root\s+)?(admin|administrator)\s+privileges/yi,

  // Code injection
  /(eval|exec|executes?|system|spawn|subprocess)\s*\(/yi,
  /require\s*\(\s*['"]/yi,
  /import\s+\w+\s+from\s+['"]/yi,
  /__import__\s*\(/yi,
  /process\.env/yi,
  /child_process/yi,
  /fs\.(readFile|writeFile|unlink|rmdir)/yi,

  // SQL injection patterns
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/yi,
  /(\%3D)|(=)[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/yi,
  /\w*\s*(\+|%2B)\s*(select|insert|update|delete|drop|create)/yi,

  // HTML/JS injection
  /<script[\s>]/yi,
  /javascript:/yi,
  /on\w+\s*=/yi,
  /<iframe[\s>]/yi,
  /<object[\s>]/yi,
  /<embed[\s>]/yi,

  // Markdown/formatting tricks
  /\[system\s+prompt\]/yi,
  /\[hidden\]/yi,
  /\[private\]/yi,
  /\\boxed\{/yi,
];

// Validate file is actually an image by checking magic bytes
const validateFileSignature = (arrayBuffer: ArrayBuffer): boolean => {
  const bytes = new Uint8Array(arrayBuffer);
  const hexString = Array.from(bytes.slice(0, 16))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Check for dangerous signatures
  for (const sig of DANGEROUS_SIGNATURES) {
    const sigBytes = sig.bytes.replace(/\s/g, '');
    if (hexString.startsWith(sigBytes)) {
      console.warn(`Rejected file with ${sig.name} signature`);
      return false;
    }
  }

  // Check for JPEG/PNG magic bytes (already covered by MIME type, but extra safety)
  const validImageSignatures = [
    'ffd8ff', // JPEG
    '89504e47', // PNG
    '47494638', // GIF
    '52494646', // WebP (RIFF)
    '424d', // BMP
  ];

  return validImageSignatures.some(sig => hexString.startsWith(sig));
};

// Check text for injection patterns
const detectInjection = (text: string): { detected: boolean; pattern?: RegExp } => {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return { detected: true, pattern };
    }
  }
  return { detected: false };
};

// Sanitize user input to remove dangerous characters
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[\x00-\x1f\x7f]/g, '') // Remove control characters
    .replace(/(javascript:|data:)/gi, '') // Remove dangerous URI schemes
    .trim();
};

const ChatAgent: React.FC = () => {
  const { language, t } = useContext(LanguageContext);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for persisted access key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('chat_access_key');
    const envKey = import.meta.env.VITE_ACCESS_KEY;

    if (storedKey && storedKey === envKey) {
      setIsAuthenticated(true);

      // Load history (images are not stored in localStorage to avoid quota issues)
      const storedHistory = localStorage.getItem('chat_history');
      if (storedHistory) {
        try {
          const parsedMessages = JSON.parse(storedHistory);
          // Ensure messages have the right structure (images won't be in storage)
          const cleanMessages: Message[] = parsedMessages.map((msg: any) => ({
            sender: msg.sender,
            text: msg.text || '',
            sources: msg.sources
          }));
          setMessages(cleanMessages);
        } catch (e) {
          console.error("Failed to parse chat history", e);
          setMessages([{ sender: 'bot', text: t('chatIntro') }]);
        }
      } else {
        setMessages([{ sender: 'bot', text: t('chatIntro') }]);
      }
    }
  }, [t]);

  // Initialize Chat Session when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const newChat = createChatSession(language);
      setChat(newChat);
    }
  }, [isAuthenticated, language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAuthenticated]);

  // Save history whenever messages change (exclude images to avoid localStorage quota issues)
  useEffect(() => {
    if (isAuthenticated && messages.length > 0) {
      try {
        // Only store text messages, not images (images are too large for localStorage)
        const messagesToSave = messages.map(msg => ({
          sender: msg.sender,
          text: msg.text,
          sources: msg.sources
        }));
        localStorage.setItem('chat_history', JSON.stringify(messagesToSave));
      } catch (error) {
        console.warn('Failed to save chat history (likely localStorage quota exceeded):', error);
        // Clear old messages to make room
        try {
          const recentMessages = messages.slice(-10).map(msg => ({
            sender: msg.sender,
            text: msg.text,
            sources: msg.sources
          }));
          localStorage.setItem('chat_history', JSON.stringify(recentMessages));
        } catch {
          console.warn('Could not save any chat history');
        }
      }
    }
  }, [messages, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envKey = import.meta.env.VITE_ACCESS_KEY;

    if (accessKeyInput === envKey) {
      localStorage.setItem('chat_access_key', accessKeyInput);
      setIsAuthenticated(true);
      setAuthError('');

      if (messages.length === 0) {
        setMessages([{ sender: 'bot', text: t('chatIntro') }]);
      }
    } else {
      setAuthError('Invalid Access Key. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_access_key');
    setIsAuthenticated(false);
    setAccessKeyInput('');
    setChat(null);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      const initialMsg: Message = { sender: 'bot', text: t('chatIntro') };
      setMessages([initialMsg]);
      localStorage.setItem('chat_history', JSON.stringify([initialMsg]));
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File is too large. Maximum size is 10MB.');
      setShowCameraOptions(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Strict MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      alert('Invalid file type. Only images (JPEG, PNG, GIF, WebP, BMP) are allowed.');
      setShowCameraOptions(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Validate file signature (magic bytes) to detect disguised executables
    try {
      const arrayBuffer = await file.arrayBuffer();
      if (!validateFileSignature(arrayBuffer)) {
        alert('File appears to be invalid or dangerous. Only image files are allowed.');
        setShowCameraOptions(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
    } catch (error) {
      console.error('Error validating file:', error);
      alert('Error processing file. Please try another image.');
      setShowCameraOptions(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedImage(event.target.result as string);
      }
    };
    reader.onerror = () => {
      alert('Error reading file. Please try another image.');
    };
    reader.readAsDataURL(file);
    setShowCameraOptions(false);
  };

  const handleCameraClick = () => {
    // On mobile, check if we should show options or go directly to camera
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // For mobile, show a choice between camera and gallery
      setShowCameraOptions(true);
    } else {
      // For desktop, trigger file input directly
      fileInputRef.current?.click();
    }
  };

  const handleDirectCamera = () => {
    // Force camera mode
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'camera');
      fileInputRef.current.click();
    }
    setShowCameraOptions(false);
  };

  const handleGalleryClick = () => {
    // Force gallery mode
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
    setShowCameraOptions(false);
  };

  const removeImage = () => {
    setSelectedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    // Guard: prevent multiple sends
    if (isLoading) return;
    if (!chat) {
      console.error('Chat session not initialized');
      return;
    }

    const sanitizedInput = sanitizeInput(input);

    if (!sanitizedInput.trim() && !selectedImage) return;

    // Check for prompt injection in sanitized input
    const injectionCheck = detectInjection(sanitizedInput);
    if (injectionCheck.detected) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'I\'m sorry, but I can\'t process requests that appear to contain malicious code or injection attempts. Please ask a waste-related question instead.'
      }]);
      setInput('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const userMessage: Message = {
      sender: 'user',
      text: sanitizedInput.trim() || 'What type of waste is this and how should I dispose of it?',
      image: selectedImage || undefined
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);

    // Clear input states
    setInput('');
    setSelectedImage('');
    setIsLoading(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const stream = await sendMessageStreamWithImage(chat, sanitizedInput.trim() || 'What type of waste is this and how should I dispose of it?', selectedImage || undefined);

      let botResponse = '';
      let currentBotMessage: Message = { sender: 'bot', text: '' };

      // Add empty bot message first
      setMessages(prev => [...prev, currentBotMessage]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

        const sources = groundingChunks
          ?.map((c: any) => c.web)
          .filter((web: any) => web && web.uri && web.title) || [];

        setMessages(prev => {
          // Check if we still have the bot message to update
          if (prev.length === 0) return prev;
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.sender === 'bot') {
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

      // Safely update messages - remove last message if it's empty bot message
      setMessages(prev => {
        // Remove any empty messages at the end
        const validMessages = prev.filter(msg => msg.text || msg.image);
        // Add error message
        return [...validMessages, { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' }];
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center p-6 bg-gray-50 rounded-lg">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Waste Wizard Login</h2>
          <p className="text-gray-600 text-center mb-6">Please enter the Access Key to start chatting.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                placeholder="Enter Access Key..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Unlock Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Header with actions */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-500">Waste Wizard AI</span>
        <div className="flex space-x-2">
          <button
            onClick={handleClearChat}
            className="text-xs text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Chat
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
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
                          <SourceIcon />
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
        {isLoading && messages[messages.length - 1].sender === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800 flex items-center">
              <LoadingIcon />
              <span className="ml-2 animate-pulse">Wizard is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-auto p-4 bg-white border-t border-gray-200 rounded-b-lg">
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
        <div className="flex items-center space-x-2 relative">
          {/* Camera options popup */}
          {showCameraOptions && (
            <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
              <button
                onClick={handleDirectCamera}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                <span>📷</span> Take Photo
              </button>
              <button
                onClick={handleGalleryClick}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                <span>🖼️</span> Choose from Gallery
              </button>
              <button
                onClick={() => setShowCameraOptions(false)}
                className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 rounded text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleCameraClick}
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
            title="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAgent;
