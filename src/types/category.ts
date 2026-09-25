export const categoryLabels: Record<string, string> = {
  web: 'Web',
  app: 'App',
  design: 'Design',
  networking: 'Networking',
  experiment: 'Experiment',
  school: 'School',
  other: 'Other',
}

export const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  web: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  app: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  design: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
  networking: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  experiment: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  school: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  other: { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30' },
}