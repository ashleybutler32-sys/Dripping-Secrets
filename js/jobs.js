/**
 * Dripping Secrets — Jobs Data
 * Central source of truth for all open positions.
 * Status: 'draft' | 'open' | 'closed'
 * Admin toggles status via Candidate Concierge → Jobs Board.
 * Only 'open' positions appear on careers.html.
 */

const DS_JOBS = [
  {
    id: 'admin-customer-support',
    title: 'Administrative & Customer Support Assistant',
    tagline: 'Be the Heart Behind the Experience.',
    category: 'Administrative',
    type: 'Full-Time / Part-Time',
    icon: '🖥️',
    status: 'draft',
    summary: 'At Dripping Secrets, every interaction matters. We are looking for an Administrative & Customer Support Assistant who enjoys staying organized, communicating with people, and helping a growing business deliver a premium customer experience.',
    responsibilities: [
      'Welcome and support customers through email, messaging, and other communication channels.',
      'Coordinate appointments, schedules, and administrative tasks.',
      'Keep records organized and up to date.',
      'Assist with order administration and internal documentation.',
      'Help ensure every customer interaction reflects the Dripping Secrets brand.'
    ],
    qualifications: [
      '1–2 years of admin or customer service experience.',
      'Strong written & verbal communication skills.',
      'Highly organized with attention to detail.',
      'Proficiency in Microsoft Office & Google Workspace.',
      'Ability to multitask & meet deadlines with ease.',
      'Discretion, professionalism & a positive attitude.',
      'Passion for great service and brand excellence.'
    ],
    whyUs: 'We\'re building more than a company—we\'re building memorable experiences. You\'ll grow alongside an expanding brand, contribute ideas, and help shape the future of Dripping Secrets.'
  },
  {
    id: 'admin-operations-coordinator',
    title: 'Administrative & Operations Coordinator',
    tagline: 'Organize. Coordinate. Elevate. You Keep Everything Moving.',
    category: 'Administrative',
    type: 'Full-Time',
    icon: '📋',
    status: 'draft',
    summary: 'Great brands are built on strong systems. At Dripping Secrets, the Administrative & Operations Coordinator helps create the structure, organization, and coordination needed for a growing luxury lifestyle company to operate successfully.',
    responsibilities: [
      'Support daily administrative and operational activities.',
      'Organize schedules, calendars, documents, and business information.',
      'Assist with internal communication and team coordination.',
      'Maintain records, reports, and operational tracking systems.',
      'Support employee onboarding and administrative workflows.',
      'Help track priorities, deadlines, and important projects.',
      'Assist leadership with special projects and business initiatives.'
    ],
    qualifications: [
      'Highly organized with strong attention to detail.',
      'Professional communicator who enjoys supporting others.',
      'Able to manage multiple priorities and deadlines.',
      'Comfortable creating structure and improving workflows.',
      'Trustworthy and able to handle confidential information.',
      'Interested in growing with an expanding company.'
    ],
    whyUs: 'This is an opportunity to play an important role in building the backbone of a luxury lifestyle brand. We invest in team members who invest in excellence.'
  },
  {
    id: 'content-creator',
    title: 'Content Creator & Social Media Coordinator',
    tagline: 'Help Tell the Dripping Secrets Story.',
    category: 'Marketing & Creative',
    type: 'Full-Time / Freelance',
    icon: '📱',
    status: 'draft',
    summary: 'Every post, photo, video, and campaign tells part of our story. At Dripping Secrets, we\'re looking for a creative professional who can transform ideas into engaging digital experiences while maintaining the polished luxury image that defines our brand.',
    responsibilities: [
      'Create engaging photo, video, graphic, and written content.',
      'Maintain and execute the social media content calendar.',
      'Capture content during events, campaigns, and product launches.',
      'Monitor audience engagement and support community management.',
      'Track content performance and recommend improvements.',
      'Ensure every piece of content reflects the Dripping Secrets luxury brand.'
    ],
    qualifications: [
      'Creative storyteller with strong visual instincts.',
      'Experience with social media platforms and content creation tools.',
      'Excellent writing and communication skills.',
      'Strong organizational and time-management abilities.',
      'Passion for branding, marketing, and digital engagement.'
    ],
    whyUs: 'You\'ll have the opportunity to build an impactful portfolio while helping shape the digital voice of a growing luxury lifestyle brand. We value creativity, collaboration, and innovative thinking.'
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience Specialist',
    tagline: 'The Heartbeat of Our Brand.',
    category: 'Customer Experience',
    type: 'Full-Time / Part-Time',
    icon: '💜',
    status: 'draft',
    summary: 'At Dripping Secrets, customer relationships are built through every conversation, interaction, and moment of support. We\'re looking for a Customer Experience Specialist who believes great service is about making people feel valued, heard, and cared for.',
    responsibilities: [
      'Provide friendly and professional customer support.',
      'Assist customers with product questions, orders, and account needs.',
      'Help resolve concerns with patience and care.',
      'Document customer feedback and important interactions.',
      'Support customer loyalty and relationship-building initiatives.',
      'Work with internal teams to create smooth customer experiences.',
      'Maintain the privacy and confidentiality of customer information.'
    ],
    qualifications: [
      'Excellent communication and active listening skills.',
      'A genuine desire to help others.',
      'Strong problem-solving abilities.',
      'Professional judgment and emotional intelligence.',
      'Ability to stay organized while managing multiple customer needs.',
      'Passion for creating positive brand experiences.'
    ],
    whyUs: 'You\'ll be part of a growing luxury lifestyle brand where service, relationships, and trust are at the center of the customer experience. Every interaction is an opportunity to build loyalty.'
  },
  {
    id: 'lifestyle-concierge',
    title: 'Lifestyle Concierge',
    tagline: 'Create Memorable Experiences.',
    category: 'Concierge & Hospitality',
    type: 'Full-Time / Part-Time',
    icon: '✨',
    status: 'draft',
    summary: 'At Dripping Secrets, our clients expect thoughtful service, professionalism, and genuine hospitality. As a Lifestyle Concierge, you\'ll help coordinate personalized experiences while representing a luxury brand known for discretion, respect, and exceptional customer care.',
    responsibilities: [
      'Coordinate appointments and client communications.',
      'Provide concierge-level hospitality before, during, and after approved experiences.',
      'Maintain organized schedules and records.',
      'Collaborate with internal team members to ensure seamless service.',
      'Safeguard confidential client information.'
    ],
    qualifications: [
      'Warm personality with excellent communication skills.',
      'Dependable and professional with integrity.',
      'Naturally provides exceptional customer service.',
      'Comfortable working flexible hours including evenings and weekends.',
      'High level of discretion and confidentiality.'
    ],
    whyUs: 'Be part of a growing luxury lifestyle brand. Work in a professional, respectful environment. Receive ongoing training and development with opportunities for advancement as the company grows.'
  },
  {
    id: 'order-fulfillment',
    title: 'Order Fulfillment & Inventory Associate',
    tagline: 'Deliver Excellence Behind Every Order.',
    category: 'Operations',
    type: 'Full-Time / Part-Time',
    icon: '📦',
    status: 'draft',
    summary: 'Every package tells our story. Join the Operations & Fulfillment team and help create a luxury unboxing experience through accuracy, organization, and exceptional attention to detail.',
    responsibilities: [
      'Receive and organize incoming inventory.',
      'Maintain accurate stock records.',
      'Pick, pack, and prepare customer orders.',
      'Follow luxury packaging standards.',
      'Prepare shipments and shipping documentation.',
      'Support inventory counts and warehouse organization.',
      'Help maintain a safe, clean, and efficient workspace.'
    ],
    qualifications: [
      'Highly organized and dependable.',
      'Strong attention to detail.',
      'Positive team player with a strong work ethic.',
      'Comfortable learning inventory and shipping systems.',
      'Committed to providing an exceptional customer experience.'
    ],
    whyUs: 'At Dripping Secrets, every role contributes to a premium customer journey. We invest in training, teamwork, and professional growth.'
  },
  {
    id: 'professional-social-companion',
    title: 'Professional Social Companion',
    tagline: 'Create Meaningful Connections.',
    category: 'Concierge & Hospitality',
    type: 'Flexible / Event-Based',
    icon: '🤝',
    status: 'draft',
    summary: 'At Dripping Secrets, we believe exceptional client experiences begin with genuine human connection. Our Professional Social Companions provide respectful, engaging companionship through conversation, shared leisure activities, and polished hospitality while representing our luxury brand with discretion and professionalism.',
    responsibilities: [
      'Coordinate approved appointments and itineraries.',
      'Provide engaging conversation and enjoyable social interaction.',
      'Represent Dripping Secrets with professionalism and confidence.',
      'Maintain accurate documentation and timely communication.',
      'Protect client privacy while delivering premium hospitality.'
    ],
    qualifications: [
      'Polished, dependable professional with outstanding interpersonal skills.',
      'Emotional intelligence and excellent judgment.',
      'Genuine passion for hospitality and client service.',
      'Comfortable in upscale, professional social settings.',
      '21+ years of age.'
    ],
    whyUs: 'Join a growing luxury lifestyle brand. Receive professional onboarding and continued development. Work in a respectful, supportive team environment with opportunities for career advancement.',
    disclaimer: 'All services are professional and platonic. This is not an escort service. No sexual services are offered, implied, or included. All companionship is strictly professional.'
  },
  {
    id: 'vip-event-host',
    title: 'VIP Event Host & Brand Ambassador',
    tagline: 'Become the Face of Luxury Experiences.',
    category: 'Events & Brand',
    type: 'Event-Based / Part-Time',
    icon: '👑',
    status: 'draft',
    summary: 'At Dripping Secrets, every event is an opportunity to create memorable guest experiences. We\'re looking for enthusiastic, polished professionals who enjoy connecting with people and representing a premium lifestyle brand with confidence, hospitality, and professionalism.',
    responsibilities: [
      'Create welcoming first impressions for guests.',
      'Represent the Dripping Secrets brand at approved events.',
      'Share information about approved products, services, and experiences.',
      'Assist with event setup, operations, and breakdown.',
      'Support guest engagement and promotional activities.',
      'Work closely with the event team to deliver seamless experiences.'
    ],
    qualifications: [
      'Friendly, outgoing personality with excellent communication skills.',
      'Professional appearance and dependable work ethic.',
      'Passion for hospitality and customer service.',
      'Comfort working evenings, weekends, and special events.',
      'Ability to thrive in fast-paced environments.'
    ],
    whyUs: 'You\'ll join a growing luxury lifestyle brand that values teamwork, professionalism, inclusion, and continuous learning. Opportunities to grow while representing a distinctive brand.'
  }
];

if (typeof module !== 'undefined') module.exports = { DS_JOBS };
