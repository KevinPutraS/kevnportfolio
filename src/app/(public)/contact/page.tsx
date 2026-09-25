'use client'

import { useState } from 'react'
import { contactFormSchema } from '@/lib/validation/project'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mail, Github, Twitter, Linkedin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { siteConfig } from '@/config/site'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [submitError, setSubmitError] = useState('')

  const validateField = (name: keyof typeof contactFormSchema.shape, value: string) => {
    const fieldSchema = contactFormSchema.shape[name]
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value)
      if (!result.success) {
        setErrors(prev => ({ ...prev, [name]: result.error.errors[0].message }))
      } else {
        setErrors(prev => {
          const next = { ...prev }
          delete next[name]
          return next
        })
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name as keyof typeof contactFormSchema.shape, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')

    const result = contactFormSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message
      })
      setErrors(fieldErrors)
      return
    }

    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to send message')
      }

      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      setStatus('error')
      setSubmitError(error instanceof Error ? error.message : 'Failed to send message. Please try again.')
    }
  }

  return (
    <div className="min-h-screen">
      <section className="section border-b border-[rgb(var(--border-subtle))]">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="heading-1 mb-6">Get in Touch</h1>
            <p className="body-lg text-[rgb(var(--text-secondary))] mb-8">
              Have a project in mind? Questions about my work? Just want to say hello?
              I'd love to hear from you.
            </p>

            <div className="grid gap-6 sm:grid-cols-2 mb-12">
              <a
                href={siteConfig.links.email}
                className="card-hover p-6 flex items-center gap-4 group"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))] group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">Email</h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">hello@example.com</p>
                </div>
              </a>
              <div className="card-hover p-6 flex items-center gap-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--accent))/0.1] text-[rgb(var(--accent))]">
                  <Github className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-semibold text-[rgb(var(--text-primary))]">GitHub</h3>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">github.com/username</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="contact-form-heading">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <h2 id="contact-form-heading" className="heading-2 mb-8 text-center">Send a Message</h2>
            
            {status === 'success' && (
              <div className="rounded-lg bg-green-500/10 border border-green-500/30 p-6 text-center mb-8 animate-fade-in" role="alert">
                <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
                <h3 className="heading-4 mb-2">Message Sent!</h3>
                <p className="text-[rgb(var(--text-secondary))]">Thanks for reaching out. I'll get back to you soon.</p>
                <Button 
                  variant="secondary" 
                  className="mt-4"
                  onClick={() => setStatus('idle')}
                >
                  Send Another
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-center mb-8 animate-fade-in" role="alert">
                <AlertCircle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <Input
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Your name"
                required
                disabled={status === 'submitting'}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="your@email.com"
                required
                disabled={status === 'submitting'}
              />
              <Input
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={errors.subject}
                placeholder="What's this about?"
                required
                disabled={status === 'submitting'}
              />
              <Textarea
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                error={errors.message}
                placeholder="Tell me about your project, question, or just say hi..."
                required
                minLength={10}
                maxLength={5000}
                rows={6}
                disabled={status === 'submitting'}
              />
              <Button type="submit" className="w-full" loading={status === 'submitting'}>
                <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
              </Button>
              <p className="text-center text-xs text-[rgb(var(--text-muted))]">
                No backend email service configured. This form demonstrates the architecture
                but doesn't actually send messages in development.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}