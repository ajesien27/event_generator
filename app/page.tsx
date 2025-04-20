'use client';

import { useEffect, useState } from 'react'

declare global {
  interface Window {
    htevents: {
      load: (writeKey: string) => void;
      track: (event: string, properties?: Record<string, any>) => void;
    };
  }
}

const DEFAULT_WRITE_KEY = 'dGVzdC1zb3VyY2UtaWQta2V5'
const DEMO_SOURCE_URL = 'https://app.hightouch.com/ecommerce-pristine/sources/events/debugger'
const EVENTS_PER_MINUTE = 60

export default function Home() {
  const [events, setEvents] = useState<Array<{ name: string; timestamp: number }>>([])
  const [writeKey, setWriteKey] = useState(DEFAULT_WRITE_KEY)
  const [eventsPerMinute, setEventsPerMinute] = useState(EVENTS_PER_MINUTE)
  const [isGenerating, setIsGenerating] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const initializeHightouch = (key: string) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.hightouch.io/htevents.js'
    script.async = true
    script.onload = () => {
      window.htevents?.load(key)
    }
    document.head.appendChild(script)
  }

  useEffect(() => {
    initializeHightouch(writeKey)
  }, [writeKey])

  const generateEvent = () => {
    const eventTypes = [
      'Product Viewed',
      'Product Added',
      'Cart Viewed',
      'Checkout Started',
      'Order Completed'
    ]
    const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const properties = {
      product_id: Math.floor(Math.random() * 1000).toString(),
      price: Math.floor(Math.random() * 10000) / 100,
      currency: 'USD',
      timestamp: new Date().toISOString()
    }

    window.htevents?.track(randomEvent, properties)
    setEvents(prev => [...prev, { name: randomEvent, timestamp: Date.now() }].slice(-100))
  }

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(generateEvent, (60 / eventsPerMinute) * 1000)
      setIntervalId(interval)
      return () => clearInterval(interval)
    } else if (intervalId) {
      clearInterval(intervalId)
      setIntervalId(null)
    }
  }, [isGenerating, eventsPerMinute])

  return (
    <main className="min-h-screen p-8">
      <div className="fixed left-0 top-0 w-64 h-full border-r border-gray-200 p-6 bg-white">
        <h1 className="text-2xl font-semibold mb-8">Event Simulator</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Write Key
            </label>
            <input
              type="text"
              value={writeKey}
              onChange={(e) => setWriteKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Events per minute
            </label>
            <input
              type="number"
              value={eventsPerMinute}
              onChange={(e) => setEventsPerMinute(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isGenerating}
                  onChange={() => setIsGenerating(!isGenerating)}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${
                  isGenerating ? 'bg-blue-600' : 'bg-gray-300'
                }`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${
                  isGenerating ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Enable Event Stream
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="ml-64 p-6">
        <div className="rounded-lg border border-gray-200 p-6">
          {!isGenerating ? (
            <p className="text-gray-500">Enable event stream to begin generating events</p>
          ) : (
            <p className="text-green-600">Generating events...</p>
          )}
        </div>
      </div>
    </main>
  )
}
