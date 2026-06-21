export interface MockTestimonial {
  id: string
  name: string
  role: string
  company: string
  rating: number
  quote: string
  avatar?: string
  accent: 'ink' | 'gold' | 'teal'
  type: 'text' | 'video'
}

export const MOCK_TESTIMONIALS: MockTestimonial[] = [
  {
    id: '1',
    name: 'Adaeze Okonkwo',
    role: 'CEO',
    company: 'Stackr',
    rating: 5,
    quote: 'Wytnest doubled our landing page conversions in two weeks. The widgets look like they were custom-built by an agency.',
    accent: 'ink',
    type: 'video',
  },
  {
    id: '2',
    name: 'Kelechi Ibe',
    role: 'Founder',
    company: 'Palms Africa',
    rating: 5,
    quote: 'Our clients trust us more because our site finally looks premium. Setup took ten minutes.',
    accent: 'gold',
    type: 'text',
  },
  {
    id: '3',
    name: 'Tunde Falana',
    role: 'Head of Growth',
    company: 'Remita',
    rating: 5,
    quote: 'The ROI was immediate. We collected 40 video testimonials in the first month without lifting a finger.',
    accent: 'teal',
    type: 'text',
  },
  {
    id: '4',
    name: 'Zainab Bello',
    role: 'Marketing Lead',
    company: 'Flutterwave',
    rating: 5,
    quote: 'Nothing else on the market comes close to this design quality. It made our whole brand look more serious.',
    accent: 'ink',
    type: 'video',
  },
  {
    id: '5',
    name: 'Chidi Nwosu',
    role: 'Product Designer',
    company: 'Paystack',
    rating: 5,
    quote: 'The bento wall layout is gorgeous. It blends into our dark-themed landing page perfectly.',
    accent: 'gold',
    type: 'text',
  },
  {
    id: '6',
    name: 'Amara Eze',
    role: 'Agency Owner',
    company: 'Nova Studio',
    rating: 5,
    quote: 'We white-label Wytnest for every client now. The sub-account system pays for itself ten times over.',
    accent: 'teal',
    type: 'text',
  },
  {
    id: '7',
    name: 'Ibrahim Sani',
    role: 'CTO',
    company: 'Kuda',
    rating: 5,
    quote: 'The embed script is a single line and never breaks our layout. Shadow DOM isolation is the right call.',
    accent: 'ink',
    type: 'text',
  },
  {
    id: '8',
    name: 'Funmi Adeyemi',
    role: 'Brand Manager',
    company: 'Andela',
    rating: 5,
    quote: 'Authentic testimonials, beautifully displayed. Exactly what we needed to lower our acquisition cost.',
    accent: 'gold',
    type: 'video',
  },
]

export const LOGO_WALL = [
  'Flutterwave', 'Paystack', 'Kuda', 'Andela', 'Remita', 'Stackr', 'Palms', 'Nova',
]
