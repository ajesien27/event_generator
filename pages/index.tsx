import Head from 'next/head';
import { useEffect, useState } from 'react';

// Types for Hightouch Events
declare global {
  interface Window {
    htevents: {
      identify: (id: string, traits: Record<string, unknown>) => void;
      track: (event: string, properties: Record<string, unknown>) => void;
      load: (writeKey: string, options: Record<string, unknown>) => void;
    }
  }
}

// Types for our events
type EventType = 'identify' | 'track';
type Event = {
  type: EventType;
  timestamp: string;
  data: any;
};

type Industry = 'ecommerce' | 'media' | 'travel' | 'saas';

const DEFAULT_WRITE_KEY = '418b97fea8de07e7e8b5073fe28fba701430402d89c07760f62b32f95dffe69e';
const DEFAULT_API_HOST = 'us-east-1.hightouch-events.com';
const DEMO_SOURCE_URL = 'https://app.hightouch.com/ecommerce-pristine-demo/events/sources/83c7ebcd-9c0f-42b0-84b2-541e1cd64af4/debugger';

const INDUSTRY_EVENTS = {
  ecommerce: {
    events: [
      'Product Viewed',
      'Product Added to Cart',
      'Cart Viewed',
      'Checkout Started',
      'Order Completed',
      'Product Added to Wishlist',
      'Category Viewed',
      'Product Reviewed',
      'Search Performed',
      'Promotion Viewed'
    ],
    properties: () => ({
      product_id: `prod_${Math.random().toString(36).substr(2, 9)}`,
      product_name: `${['Premium', 'Deluxe', 'Classic', 'Limited Edition'][Math.floor(Math.random() * 4)]} ${['Jacket', 'Shoes', 'Watch', 'Bag'][Math.floor(Math.random() * 4)]}`,
      product_price: Math.floor(Math.random() * 300) + 50,
      currency: 'USD',
      category: ['Apparel', 'Accessories', 'Footwear', 'Jewelry'][Math.floor(Math.random() * 4)],
      brand: ['Nike', 'Adidas', 'Zara', 'H&M'][Math.floor(Math.random() * 4)],
      color: ['Black', 'White', 'Blue', 'Red'][Math.floor(Math.random() * 4)],
      size: ['S', 'M', 'L', 'XL'][Math.floor(Math.random() * 4)],
      in_stock: Math.random() > 0.2,
      discount_applied: Math.random() > 0.7,
      discount_amount: Math.floor(Math.random() * 50),
      rating: Math.floor(Math.random() * 5) + 1,
      source: ['web', 'mobile_app', 'tablet'][Math.floor(Math.random() * 3)],
      session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    })
  },
  media: {
    events: [
      'Content Viewed',
      'Video Played',
      'Article Read',
      'Subscription Started',
      'Playlist Created',
      'Content Shared',
      'Comment Posted',
      'Profile Viewed',
      'Search Performed',
      'Recommendation Clicked'
    ],
    properties: () => ({
      content_id: `cont_${Math.random().toString(36).substr(2, 9)}`,
      content_type: ['article', 'video', 'podcast', 'gallery'][Math.floor(Math.random() * 4)],
      content_category: ['News', 'Entertainment', 'Sports', 'Technology'][Math.floor(Math.random() * 4)],
      author: ['John Smith', 'Emma Wilson', 'Michael Brown', 'Sarah Davis'][Math.floor(Math.random() * 4)],
      publication_date: new Date(Date.now() - Math.floor(Math.random() * 7776000000)).toISOString(),
      duration: Math.floor(Math.random() * 3600),
      subscription_tier: ['free', 'basic', 'premium', 'enterprise'][Math.floor(Math.random() * 4)],
      device_type: ['desktop', 'mobile', 'tablet', 'smart_tv'][Math.floor(Math.random() * 4)],
      engagement_score: Math.floor(Math.random() * 100),
      completion_rate: Math.random(),
      has_comments: Math.random() > 0.5,
      share_count: Math.floor(Math.random() * 1000),
      like_count: Math.floor(Math.random() * 5000),
      session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    })
  },
  travel: {
    events: [
      'Flight Searched',
      'Hotel Viewed',
      'Booking Completed',
      'Itinerary Viewed',
      'Room Selected',
      'Package Customized',
      'Review Submitted',
      'Destination Explored',
      'Travel Insurance Added',
      'Loyalty Points Redeemed'
    ],
    properties: () => ({
      booking_id: `book_${Math.random().toString(36).substr(2, 9)}`,
      destination: ['Paris', 'New York', 'Tokyo', 'London'][Math.floor(Math.random() * 4)],
      travel_type: ['business', 'leisure', 'family', 'solo'][Math.floor(Math.random() * 4)],
      accommodation_type: ['hotel', 'resort', 'apartment', 'villa'][Math.floor(Math.random() * 4)],
      check_in_date: new Date(Date.now() + Math.floor(Math.random() * 7776000000)).toISOString(),
      duration_days: Math.floor(Math.random() * 14) + 1,
      room_type: ['standard', 'deluxe', 'suite', 'penthouse'][Math.floor(Math.random() * 4)],
      number_of_guests: Math.floor(Math.random() * 4) + 1,
      total_price: Math.floor(Math.random() * 5000) + 200,
      currency: 'USD',
      payment_method: ['credit_card', 'paypal', 'bank_transfer'][Math.floor(Math.random() * 3)],
      loyalty_level: ['none', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
      has_travel_insurance: Math.random() > 0.6,
      booking_platform: ['web', 'mobile_app', 'agent'][Math.floor(Math.random() * 3)],
      session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    })
  },
  saas: {
    events: [
      'User Signed Up',
      'Feature Used',
      'Subscription Updated',
      'Integration Connected',
      'Report Generated',
      'Team Member Invited',
      'Workflow Created',
      'API Call Made',
      'Dashboard Viewed',
      'Support Ticket Created'
    ],
    properties: () => ({
      user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
      account_id: `acc_${Math.random().toString(36).substr(2, 9)}`,
      subscription_plan: ['starter', 'professional', 'enterprise', 'custom'][Math.floor(Math.random() * 4)],
      feature_name: ['analytics', 'automation', 'integration', 'reporting'][Math.floor(Math.random() * 4)],
      team_size: Math.floor(Math.random() * 100) + 1,
      monthly_value: Math.floor(Math.random() * 10000) + 500,
      integration_type: ['crm', 'marketing', 'billing', 'communication'][Math.floor(Math.random() * 4)],
      user_role: ['admin', 'manager', 'member', 'viewer'][Math.floor(Math.random() * 4)],
      usage_frequency: Math.floor(Math.random() * 100),
      last_login: new Date(Date.now() - Math.floor(Math.random() * 604800000)).toISOString(),
      feature_enabled: Math.random() > 0.3,
      customer_health_score: Math.floor(Math.random() * 100),
      days_since_signup: Math.floor(Math.random() * 365),
      number_of_seats: Math.floor(Math.random() * 50) + 1,
      session_id: `sess_${Math.random().toString(36).substr(2, 9)}`,
    })
  }
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [writeKey, setWriteKey] = useState(DEFAULT_WRITE_KEY);
  const [apiHost, setApiHost] = useState(DEFAULT_API_HOST);
  const [eventsPerMinute, setEventsPerMinute] = useState(60);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>('ecommerce');
  const [totalEvents, setTotalEvents] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Function to initialize Hightouch Events SDK
  const initializeHightouch = (key: string, host: string) => {
    const script = document.createElement('script');
    script.innerHTML = `!function(){var e=window.htevents=window.htevents||[];if(!e.initialize)if(e.invoked)window.console&&console.error&&console.error("Hightouch snippet included twice.");else{e.invoked=!0,e.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"],e.factory=function(t){return function(){var n=Array.prototype.slice.call(arguments);return n.unshift(t),e.push(n),e}};for(var t=0;t<e.methods.length;t++){var n=e.methods[t];e[n]=e.factory(n)}e.load=function(t,n){var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src="https://cdn.hightouch-events.com/browser/release/v1-latest/events.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(o,r),e._loadOptions=n,e._writeKey=t},e.SNIPPET_VERSION="0.0.1", e.load('${key}',{apiHost:'${host}'}), e.page()}}();`;
    document.head.appendChild(script);
  };

  useEffect(() => {
    initializeHightouch(writeKey, apiHost);
  }, [writeKey, apiHost]);

  // Function to handle write key changes
  const handleWriteKeyChange = (newKey: string) => {
    // Stop event generation
    if (isGenerating) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsGenerating(false);
    }

    // Remove existing script and clear window.htevents
    const existingScript = document.querySelector('script[src*="hightouch-events.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    // @ts-ignore - We know this is safe as we're reinitializing the SDK
    window.htevents = undefined;

    // Update state
    setWriteKey(newKey);
    
    // Reinitialize with new key
    initializeHightouch(newKey, apiHost);

    // If we were generating events before, restart with the new key
    if (isGenerating) {
      // Small delay to ensure SDK is initialized
      setTimeout(() => {
        startEventGeneration(eventsPerMinute);
      }, 100);
    }
  };

  // Function to handle API host changes
  const handleApiHostChange = (newHost: string) => {
    if (isGenerating) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsGenerating(false);
    }
    setApiHost(newHost);
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="hightouch-events.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Reinitialize with new host
    initializeHightouch(writeKey, newHost);
  };

  // Function to handle events per minute changes
  const handleFrequencyChange = (value: string) => {
    const newFrequency = parseInt(value, 10);
    if (!isNaN(newFrequency) && newFrequency > 0) {
      setEventsPerMinute(newFrequency);
      if (isGenerating && intervalId) {
        // Restart generation with new frequency
        clearInterval(intervalId);
        startEventGeneration(newFrequency);
      }
    }
  };

  // Function to generate random user data based on industry
  const generateUserData = (industry: Industry) => {
    const baseData = {
      id: `user_${Math.random().toString(36).substr(2, 9)}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      name: `${['John', 'Emma', 'Michael', 'Sarah'][Math.floor(Math.random() * 4)]} ${['Smith', 'Johnson', 'Williams', 'Brown'][Math.floor(Math.random() * 4)]}`,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString(),
    };

    const industrySpecificData = {
      ecommerce: {
        total_orders: Math.floor(Math.random() * 50),
        total_spent: Math.floor(Math.random() * 5000),
        favorite_category: ['Apparel', 'Accessories', 'Footwear', 'Jewelry'][Math.floor(Math.random() * 4)],
        loyalty_tier: ['bronze', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
      },
      media: {
        subscription_status: ['active', 'trial', 'expired'][Math.floor(Math.random() * 3)],
        preferred_content: ['news', 'entertainment', 'sports'][Math.floor(Math.random() * 3)],
        watch_time_minutes: Math.floor(Math.random() * 5000),
        device_preference: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
      },
      travel: {
        frequent_flyer_status: ['none', 'silver', 'gold', 'platinum'][Math.floor(Math.random() * 4)],
        preferred_destination: ['domestic', 'international', 'both'][Math.floor(Math.random() * 3)],
        total_trips: Math.floor(Math.random() * 20),
        travel_preferences: ['luxury', 'budget', 'business'][Math.floor(Math.random() * 3)],
      },
      saas: {
        company_size: ['1-10', '11-50', '51-200', '201+'][Math.floor(Math.random() * 4)],
        industry: ['technology', 'finance', 'healthcare', 'retail'][Math.floor(Math.random() * 4)],
        subscription_tier: ['starter', 'professional', 'enterprise'][Math.floor(Math.random() * 3)],
        integration_count: Math.floor(Math.random() * 10),
      },
    };

    return { ...baseData, ...industrySpecificData[industry] };
  };

  // Function to generate random event data based on industry
  const generateEventData = (industry: Industry) => {
    const eventConfig = INDUSTRY_EVENTS[industry];
    const eventName = eventConfig.events[Math.floor(Math.random() * eventConfig.events.length)];
    const data = {
      event_name: eventName,
      ...eventConfig.properties()
    };
    return data;
  };

  // Function to clear all events
  const clearEvents = () => {
    setEvents([]);
  };

  // Function to handle row click
  const handleRowClick = (event: Event) => {
    setSelectedEvent(event);
  };

  // Function to close modal
  const closeModal = () => {
    setSelectedEvent(null);
  };

  // Function to start event generation with given frequency
  const startEventGeneration = (frequency: number) => {
    const interval = (60 * 1000) / frequency;
    const id = setInterval(() => {
      const eventType: EventType = Math.random() > 0.2 ? 'track' : 'identify';
      const timestamp = new Date().toISOString();
      const data = eventType === 'identify'
        ? generateUserData(selectedIndustry)
        : generateEventData(selectedIndustry);

      if (eventType === 'identify' && 'id' in data) {
        window.htevents?.identify(data.id, data);
      } else if (eventType === 'track' && 'event_name' in data) {
        window.htevents?.track(data.event_name, data);
      }

      const newEvent: Event = { type: eventType, timestamp, data };
      setEvents(prevEvents => [newEvent, ...prevEvents].slice(0, 1000)); // Limit to 1000 events
      setTotalEvents(prev => prev + 1);
    }, interval);

    setIntervalId(id);
  };

  // Function to handle start/stop generation
  const toggleEventGeneration = () => {
    if (isGenerating && intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    startEventGeneration(eventsPerMinute);
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const inputClassName = "block w-full rounded-md border-0 py-2.5 px-3 bg-white ring-1 ring-inset ring-gray-200 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#00A971] sm:text-sm sm:leading-6 transition-all";
  const labelClassName = "block text-sm font-medium leading-6 text-gray-700 mb-1.5";

  return (
    <div className="flex h-screen bg-[#f8fafc] font-['Roobert']">
      <Head>
        <title>Hightouch Events Simulator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Sidebar */}
      <div className="w-64 flex flex-col fixed h-full bg-gradient-to-b from-[#0F2A2A] to-[#0A1F1F]">
        <div className="p-4 border-b border-[#1d3737]">
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-end gap-3">
              <img 
                src="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/222633/Hightouch-logo-5133329c-3a70-41f9-b954-e2da806097ba.png"
                alt="Hightouch"
                width={96}
                height={24}
                className="-translate-y-[4px]"
              />
              <span className="text-xl font-semibold text-[#1C2B33]">Event Generator</span>
            </div>
          </div>
        </nav>

        {/* Help Text */}
        <div className="max-w-7xl mx-auto px-6 py-4 border-b border-gray-100">
          <p className="text-[#475569] text-sm leading-relaxed">
            Welcome to the Hightouch Event Generator! This tool automatically generates behavioral events and pushes them to a specific source in Hightouch, based on the "write key" of any source in a Hightouch workspace. Please reach out to{' '}
            <a 
              href="https://carryinternal.slack.com/team/U02PQ9PD85A"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00A971] hover:text-[#008F5D] transition-colors"
            >
              Andrew Jesien
            </a>
            {' '}if you have any ideas on improving this!
          </p>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto py-8 px-6">
          <div className="flex gap-6">
            {/* Configuration Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1">
              <div className="px-6 py-5">
                <div className="space-y-6 max-w-md">
                  {/* Write Key Input */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label htmlFor="writeKey" className="block text-sm font-medium text-[#1C2B33]">
                        Write Key
                      </label>
                      <div className="group relative">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-500 transition-colors"
                          aria-label="Write Key Information"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div 
                          className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 px-3 py-2 bg-gray-900 text-xs leading-5 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible hover:opacity-100 hover:visible transition-all duration-200 z-10"
                          role="tooltip"
                        >
                          Default write key points to the ecommerce pristine demo source.{' '}
                          <a 
                            href={DEMO_SOURCE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 hover:text-blue-200 underline"
                          >
                            View source →
                          </a>
                        </div>
                      </div>
                    </div>
                    <input
                      id="writeKey"
                      type="text"
                      value={writeKey}
                      onChange={(e) => handleWriteKeyChange(e.target.value)}
                      className={inputClassName}
                      placeholder="Enter Write Key"
                    />
                  </div>

                  {/* API Host Input */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <label htmlFor="apiHost" className="block text-sm font-medium text-[#1C2B33]">
                        API Host
                      </label>
                      <div className="group relative">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-500 transition-colors"
                          aria-label="API Host Information"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div 
                          className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-72 px-3 py-2 bg-gray-900 text-xs leading-5 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible hover:opacity-100 hover:visible transition-all duration-200 z-10"
                          role="tooltip"
                        >
                          The API host determines which region your events are sent to. Default is us-east-1.
                        </div>
                      </div>
                    </div>
                    <input
                      id="apiHost"
                      type="text"
                      value={apiHost}
                      onChange={(e) => handleApiHostChange(e.target.value)}
                      className={inputClassName}
                      placeholder="Enter API Host"
                    />
                  </div>

                  {/* Events per minute Input */}
                  <div>
                    <label htmlFor="frequency" className="block text-sm font-medium text-[#1C2B33] mb-1.5">
                      Events per minute
                    </label>
                    <input
                      id="frequency"
                      type="number"
                      min="1"
                      value={eventsPerMinute}
                      onChange={(e) => handleFrequencyChange(e.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  {/* Industry Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-[#1C2B33]">
                      Industry
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'ecommerce', label: 'eCommerce / Retail' },
                        { id: 'media', label: 'Media' },
                        { id: 'travel', label: 'Travel and Hospitality' },
                        { id: 'saas', label: 'B2B SaaS' },
                      ].map((industry) => (
                        <div key={industry.id} className="flex items-center">
                          <input
                            id={industry.id}
                            name="industry"
                            type="radio"
                            checked={selectedIndustry === industry.id}
                            onChange={() => {
                              if (isGenerating) {
                                if (intervalId) {
                                  clearInterval(intervalId);
                                  setIntervalId(null);
                                }
                                setIsGenerating(false);
                              }
                              setSelectedIndustry(industry.id as Industry);
                            }}
                            className="h-4 w-4 border-gray-300 text-[#00A971] focus:ring-[#00A971]"
                          />
                          <label htmlFor={industry.id} className="ml-3 block text-sm text-[#1C2B33]">
                            {industry.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Event Stream Toggle */}
                  <div className="pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isGenerating}
                        onChange={toggleEventGeneration}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-500/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00A971]"></div>
                      <span className="ml-3 text-sm font-medium text-[#1C2B33]">Enable Event Stream</span>
                    </label>
                  </div>

                  {/* Total Events Counter */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1C2B33]">Total Events Generated</span>
                      <span className="text-lg font-semibold text-[#00A971]">{totalEvents}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1">
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-[#475569] uppercase tracking-wider">Recent Events</h3>
                    <button
                      onClick={clearEvents}
                      className="text-xs font-medium text-[#475569] hover:text-[#1C2B33] transition-colors"
                    >
                      Clear Events
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-gray-200">
                    <div className="max-h-[600px] overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Event Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-[#475569] uppercase tracking-wider">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {events.map((event, index) => (
                            <tr 
                              key={index} 
                              className="hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => handleRowClick(event)}
                            >
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  event.type === 'identify' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {event.type}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#475569]">
                                {event.type === 'identify' ? '-' : event.data.event_name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-[#475569]">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                          {events.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#475569]">
                                No events generated yet. Enable Event Stream to begin.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Event Data Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#1C2B33]">
                  Event Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-[#475569]">Type</h4>
                  <p className="mt-1 text-sm text-[#1C2B33]">{selectedEvent.type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#475569]">Timestamp</h4>
                  <p className="mt-1 text-sm text-[#1C2B33]">{new Date(selectedEvent.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#475569]">Data</h4>
                  <pre className="mt-1 p-4 bg-gray-50 rounded-md overflow-x-auto text-sm font-mono">
                    {JSON.stringify(selectedEvent.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
