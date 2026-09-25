-- Seed data for demo projects
-- These are clearly placeholder/demo projects - replace with real projects

INSERT INTO public.projects (title, slug, short_description, description, category, technologies, thumbnail_url, gallery, project_url, repository_url, featured, published, project_date) VALUES
(
  'TaskFlow - Personal Task Manager',
  'taskflow-task-manager',
  'A clean, minimalist task management application built with Next.js and Supabase. Features projects, tags, due dates, and keyboard shortcuts.',
  'TaskFlow is a personal task manager I built to learn full-stack development with Next.js App Router and Supabase. It includes user authentication, project organization, tagging system, due dates with reminders, and a fully keyboard-navigable interface.

Key features:
- User authentication with Supabase Auth
- Project and task CRUD operations
- Tagging and filtering system
- Due dates with local notifications
- Keyboard shortcuts for power users
- Responsive design for mobile and desktop
- Dark/light theme support

Tech stack: Next.js 14, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Realtime), Zustand for state management.',
  'web',
  ARRAY['Next.js', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Zustand'],
  'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80'
  ],
  'https://taskflow-demo.vercel.app',
  'https://github.com/username/taskflow',
  true,
  true,
  '2024-03-15'
),
(
  'SocketChat - Real-time Chat Experiment',
  'socketchat-realtime-experiment',
  'An experiment with WebSockets and real-time communication. Built a chat application with rooms, direct messages, typing indicators, and message reactions.',
  'SocketChat was a learning project to understand WebSocket communication patterns. I built it using Socket.io with a Node.js backend and a React frontend.

Features explored:
- Real-time message delivery
- Chat rooms and direct messages
- Typing indicators
- Message reactions and replies
- Online/offline presence
- Message persistence with PostgreSQL
- File sharing with Supabase Storage

This project helped me understand the complexities of real-time systems: connection management, reconnection logic, message ordering, and scaling considerations.',
  'experiment',
  ARRAY['Node.js', 'Socket.io', 'React', 'TypeScript', 'PostgreSQL', 'Supabase'],
  'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=800&q=80'
  ],
  'https://socketchat-demo.vercel.app',
  'https://github.com/username/socketchat',
  true,
  true,
  '2024-02-20'
),
(
  'Network Topology Visualizer',
  'network-topology-visualizer',
  'A tool for visualizing network topologies using D3.js. Parse network configuration files and generate interactive force-directed graphs.',
  'This project came from my interest in networking and data visualization. I built a tool that can parse common network configuration formats (Cisco, Juniper, generic) and visualize the topology as an interactive force-directed graph using D3.js.

Features:
- Parse Cisco IOS, Juniper JunOS, and generic config formats
- Interactive force-directed graph with D3.js
- Node types: routers, switches, firewalls, servers
- Link types: physical, logical, VPN, VLAN
- Filter by device type, site, or connection type
- Export as SVG/PNG
- Search and highlight paths between nodes

This was a great way to combine networking knowledge with frontend visualization skills.',
  'networking',
  ARRAY['D3.js', 'TypeScript', 'React', 'Node.js', 'Networking'],
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'
  ],
  null,
  'https://github.com/username/network-visualizer',
  true,
  true,
  '2024-01-10'
),
(
  'Generative Art Gallery',
  'generative-art-gallery',
  'A collection of generative art pieces created with p5.js and canvas. Exploring algorithms, noise functions, and computational creativity.',
  'This is an ongoing experimental project where I explore generative art through code. Each piece is a small algorithmic system that creates unique visual outputs.

Pieces include:
- Flow fields with Perlin noise
- Particle systems with physics
- Recursive geometric patterns
- Cellular automata variations
- Reaction-diffusion simulations
- Audio-reactive visualizations

Built as a Next.js app with a gallery view, each piece runs in a Web Worker for performance. The gallery supports saving high-resolution exports.',
  'experiment',
  ARRAY['p5.js', 'TypeScript', 'Next.js', 'Canvas API', 'Web Workers'],
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
  ARRAY[
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    'https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?w=800&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e8f3?w=800&q=80'
  ],
  'https://genart-demo.vercel.app',
  'https://github.com/username/generative-art',
  false,
  true,
  '2024-04-01'
),
(
  'REST API Design Workshop',
  'rest-api-design-workshop',
  'A comprehensive guide and reference implementation for REST API design principles. Includes OpenAPI specs, error handling patterns, and versioning strategies.',
  'This project started as coursework for a distributed systems class and evolved into a reference resource. It covers REST API design best practices with practical implementations.

Contents:
- Resource modeling and naming conventions
- HTTP status codes and error response formats
- Pagination, filtering, and sorting patterns
- API versioning strategies (URL, header, content negotiation)
- Authentication and authorization patterns
- Rate limiting and throttling
- OpenAPI 3.0 documentation
- Example implementations in Express.js and Fastify

The project includes a runnable reference API with comprehensive tests.',
  'school',
  ARRAY['Node.js', 'Express', 'Fastify', 'OpenAPI', 'TypeScript', 'PostgreSQL'],
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
  ARRAY[],
  null,
  'https://github.com/username/api-design-workshop',
  false,
  true,
  '2023-11-15'
),
(
  'Portfolio Website v1',
  'portfolio-v1',
  'My first portfolio website built with vanilla HTML, CSS, and JavaScript. A learning project that taught me the fundamentals of web development.',
  'This was my very first portfolio website, built when I was just starting to learn web development. It''s a simple static site with vanilla HTML, CSS, and JavaScript - no frameworks, no build tools.

What I learned:
- Semantic HTML and accessibility basics
- CSS layout with Flexbox and Grid
- Responsive design principles
- Vanilla JavaScript DOM manipulation
- CSS animations and transitions
- Git and GitHub Pages deployment

It''s not pretty by modern standards, but it represents where I started. I keep it here as a reminder of progress.',
  'web',
  ARRAY['HTML', 'CSS', 'JavaScript'],
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80',
  ARRAY[],
  'https://username.github.io/portfolio-v1',
  'https://github.com/username/portfolio-v1',
  false,
  true,
  '2023-06-01'
)
ON CONFLICT (slug) DO NOTHING;