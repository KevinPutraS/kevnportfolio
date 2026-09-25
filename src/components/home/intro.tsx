'use client'

export function Introduction() {
  return (
    <section className="section bg-[rgb(var(--surface))] border-y border-[rgb(var(--border-subtle))]" aria-labelledby="intro-heading">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="intro-heading" className="heading-2 mb-6">
            Hi, I'm Kevin.
          </h2>
          <div className="prose prose-invert max-w-none text-[rgb(var(--text-secondary))]">
            <p className="body-lg mb-6">
              I enjoy building things, exploring technology, and creating digital projects. 
              This portfolio is a collection of experiments, applications, and ideas I've worked on.
            </p>
            <p className="body-lg mb-6">
              I don't claim to be an expert in any single domain — I'm still exploring my direction. 
              What you'll find here are projects spanning web development, software, networking, design, 
              and various experiments. Some are polished, some are rough proofs of concept, all were 
              built out of curiosity.
            </p>
            <p className="body-lg">
              If you're interested in collaborating, have questions about a project, or just want to say hello, 
              <a href="/contact" className="link">get in touch</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}