---
title: Home
seo:
  description: Example home page built with ITGo Studio.
blocks:
  - type: hero
    heading: Welcome to your new site
    subheading: Built with ITGo Studio — edit it yourself, no code.
    cta_label: Contact us
    cta_href: "#kontakt"
  - type: text
    heading: About us
    body: <p>Tell your story here. Content is edited in ITGo Studio and published in one click.</p>
  - type: faq
    heading: Frequently asked questions
    items:
      - q: How do I edit the page?
        a: Log in to ITGo Studio and click the page you want to change.
      - q: How fast do changes go live?
        a: Usually under a minute after you click Publish.
  - type: contact_form
    heading: Contact us
    submit_label: Send
    form_key: contact
    fields:
      - { name: name, label: Name, type: text, required: true }
      - { name: email, label: Email, type: email, required: true }
      - { name: message, label: Message, type: textarea }
  - type: footer
    company: Your Company Ltd
    address: 1 Example Road, City
    links:
      - { label: Home, href: "/en" }
      - { label: About, href: "/en/om-os" }
      - { label: News, href: "/nyheder" }
      - { label: Dansk, href: "/" }
---
