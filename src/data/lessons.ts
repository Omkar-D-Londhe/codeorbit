import type { Lesson } from './types'

/** Seeded app content: one lesson per topic. */
export const lessons: Lesson[] = [
  {
    topicId: 'html-structure',
    objective: 'Write the minimum skeleton a browser expects, and say what each part is for.',
    sections: [
      {
        heading: 'The skeleton',
        body: [
          'Every HTML page is a tree. The doctype tells the browser to use modern standards mode, <html> is the root, <head> holds information about the page, and <body> holds everything people see.',
        ],
        code: {
          label: 'A minimal valid page',
          code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, CodeOrbit</h1>
  </body>
</html>`,
        },
      },
      {
        heading: 'What goes in the head',
        body: [
          'The title appears in the browser tab and in search results. The charset declaration makes sure characters such as é or — display correctly. None of the head content is drawn on the page itself.',
        ],
        callout: { kind: 'why', text: 'The lang attribute on <html> lets screen readers choose the right pronunciation and lets browsers offer translation.' },
      },
      {
        heading: 'Common mistake',
        body: ['Browsers repair broken structure silently, so a missing <title> or doctype often "works" while quietly causing quirks.'],
        callout: { kind: 'mistake', text: 'Putting visible content in <head>, or forgetting the doctype, makes behaviour differ between browsers.' },
      },
    ],
  },
  {
    topicId: 'elements-attributes',
    objective: 'Read and write elements with attributes, and tell content from configuration.',
    sections: [
      {
        heading: 'Anatomy of an element',
        body: [
          'An element is an opening tag, optional content, and a closing tag. Some elements, like <img> and <br>, are void: they have no content and no closing tag.',
          'Attributes live inside the opening tag as name="value" pairs. They configure the element: where a link goes, which class it belongs to, whether a button is disabled.',
        ],
        code: {
          label: 'Elements and attributes',
          code: `<a href="https://example.com" title="Visit the example site">Example</a>
<p class="note" id="tip-1">Save your work often.</p>
<button disabled>Not yet</button>`,
        },
      },
      {
        heading: 'Global attributes',
        body: ['Some attributes work on any element: id (unique on the page), class (reusable grouping), title, lang and hidden. Boolean attributes such as disabled or required are on when present, whatever their value.'],
        callout: { kind: 'mistake', text: 'Reusing the same id on two elements breaks in-page links and scripts. Use class for groups.' },
      },
    ],
  },
  {
    topicId: 'headings-paragraphs',
    objective: 'Outline a page with headings and group text into paragraphs.',
    sections: [
      {
        heading: 'Headings form an outline',
        body: [
          'h1 to h6 describe importance and nesting, not size. A page normally has one h1 naming the page, with h2 for major sections and h3 for subsections inside them.',
          'Do not skip levels (h1 straight to h3). Screen-reader users navigate by headings, and a skipped level looks like missing content.',
        ],
        code: {
          label: 'A clean outline',
          code: `<h1>Trail Guide</h1>
<h2>Gear</h2>
<p>Bring water and sturdy shoes.</p>
<h2>Routes</h2>
<h3>Easy loop</h3>
<p>About an hour on flat ground.</p>`,
        },
      },
      {
        heading: 'Paragraphs',
        body: ['A <p> element is one paragraph. Browsers collapse extra spaces and line breaks in your source, so use separate <p> elements rather than blank lines.'],
        callout: { kind: 'why', text: 'Choose heading levels for meaning, then use CSS (later) to change size.' },
      },
    ],
  },
  {
    topicId: 'text-semantics',
    objective: 'Mark text by what it means: emphasis, importance, keyboard input and quotations.',
    sections: [
      {
        heading: 'Meaning over appearance',
        body: [
          '<strong> marks importance and <em> marks stress emphasis. <kbd> marks keyboard input and <code> marks code. They often look bold, italic or monospaced, but the reason to choose them is their meaning.',
        ],
        code: {
          label: 'Semantic inline text',
          code: `<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.
This step is <strong>important</strong>.</p>`,
        },
      },
      {
        heading: 'Quotations and citations',
        body: ['Use <q> for a short inline quotation and <blockquote> for a longer block. <cite> names the work or person being referenced.'],
        code: {
          label: 'A block quotation',
          code: `<blockquote>
  <p>Learning never exhausts the mind.</p>
  <footer>— <cite>Leonardo da Vinci</cite></footer>
</blockquote>`,
        },
        callout: { kind: 'mistake', text: 'Using <blockquote> just to indent text. Indentation is a styling job, not a meaning.' },
      },
    ],
  },
  {
    topicId: 'lists',
    objective: 'Choose between unordered and ordered lists and nest list items correctly.',
    sections: [
      {
        heading: 'Two kinds of list',
        body: [
          'Use <ul> when order does not matter, and <ol> when it does, such as steps. Each item is an <li>, and <li> must sit directly inside a <ul> or <ol>.',
        ],
        code: {
          label: 'Unordered and ordered',
          code: `<ul>
  <li>Milk</li>
  <li>Eggs</li>
  <li>Bread</li>
</ul>
<ol>
  <li>Wash</li>
  <li>Chop</li>
  <li>Cook</li>
</ol>`,
        },
      },
      {
        heading: 'Nesting',
        body: ['To nest a list, place the inner <ul> or <ol> inside an <li>, not as a sibling of the <li> elements.'],
        callout: { kind: 'why', text: 'Screen readers announce "list, 3 items", which helps people understand the shape of the content.' },
      },
    ],
  },
  {
    topicId: 'links',
    objective: 'Create links that go to the right place, open safely, and describe themselves.',
    sections: [
      {
        heading: 'The anchor element',
        body: [
          'An <a> without href is not a link. The href can be absolute (https://example.com), relative (about.html) or a fragment (#footer) pointing at an element with a matching id on the same page.',
        ],
        code: {
          label: 'Three kinds of href',
          code: `<a href="https://developer.mozilla.org/">MDN</a>
<a href="about.html">About us</a>
<a href="#page-footer">Jump to footer</a>
<footer id="page-footer">…</footer>`,
        },
      },
      {
        heading: 'Opening in a new tab, safely',
        body: ['target="_blank" opens a new tab. Pair it with rel="noopener noreferrer" so the new page cannot access the page that opened it.'],
        callout: { kind: 'mistake', text: 'Link text such as "click here" tells a screen-reader user nothing when links are listed out of context. Describe the destination.' },
      },
    ],
  },
  {
    topicId: 'images',
    objective: 'Embed images with useful alt text, explicit dimensions and, where helpful, a caption.',
    sections: [
      {
        heading: 'The img element',
        body: [
          '<img> is void and needs src (where the image is) and alt (a text alternative). Alt text should convey what the image is for, not "image of". If an image is purely decorative, use alt="" so assistive technology skips it.',
        ],
        code: {
          label: 'Image with caption',
          code: `<figure>
  <img src="trail.jpg" alt="A hiker crossing a wooden bridge" width="320" height="200">
  <figcaption>Crossing the old bridge at dawn.</figcaption>
</figure>`,
        },
      },
      {
        heading: 'Width and height',
        body: ['Setting width and height attributes lets the browser reserve space before the image loads, so the page does not jump around.'],
        callout: { kind: 'why', text: 'Alt text also appears when an image fails to load, and search engines read it.' },
      },
    ],
  },
  {
    topicId: 'tables',
    objective: 'Mark up tabular data with captions, header cells and body rows.',
    sections: [
      {
        heading: 'Table structure',
        body: [
          'A table has rows (<tr>) made of header cells (<th>) and data cells (<td>). A <caption> names the table; <thead> and <tbody> group the rows. The scope attribute on <th> says whether a header labels a column or a row.',
        ],
        code: {
          label: 'A small data table',
          code: `<table>
  <caption>Weekly practice</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">Topic</th><th scope="col">Minutes</th></tr>
  </thead>
  <tbody>
    <tr><td>Mon</td><td>Lists</td><td>20</td></tr>
    <tr><td>Tue</td><td>Links</td><td>25</td></tr>
  </tbody>
</table>`,
        },
      },
      {
        heading: 'When to use a table',
        body: ['Use tables for data that has rows and columns, not to position things on the page.'],
        callout: { kind: 'mistake', text: 'Building page layouts out of tables. That is what CSS layout is for.' },
      },
    ],
  },
  {
    topicId: 'forms',
    objective: 'Build a form whose controls are labelled, typed and validated by the browser.',
    sections: [
      {
        heading: 'Controls and labels',
        body: [
          '<form> wraps controls. Each control needs a <label>: either with for matching the control id, or wrapping the control. The label is the name a screen reader reads and also enlarges the click target.',
        ],
        code: {
          label: 'A labelled form',
          code: `<form action="#" method="post">
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Send</button>
</form>`,
        },
      },
      {
        heading: 'Input types and validation',
        body: ['type="email", number, date and others give the right keyboard on phones and built-in checks. required blocks submission when empty. A placeholder is a hint, not a replacement for a label.'],
        callout: { kind: 'mistake', text: 'Relying on placeholder text as the only label: it disappears while typing and is not reliably announced.' },
      },
    ],
  },
  {
    topicId: 'semantic-layout',
    objective: 'Split a page into meaningful regions using landmark elements instead of anonymous divs.',
    sections: [
      {
        heading: 'Landmarks',
        body: [
          '<header> introduces a page or section, <nav> holds major navigation links, <main> holds the page’s primary content (once per page), <section> and <article> group related content, and <footer> closes a page or section.',
        ],
        code: {
          label: 'A semantic page',
          code: `<header><h1>Trail Guide</h1></header>
<nav>
  <a href="#routes">Routes</a>
  <a href="#gear">Gear</a>
</nav>
<main>
  <section id="routes"><h2>Routes</h2></section>
</main>
<footer>© Trail Guide</footer>`,
        },
      },
      {
        heading: 'Why not just div?',
        body: ['A <div> carries no meaning. Landmarks let keyboard and screen-reader users jump directly to navigation or main content.'],
        callout: { kind: 'why', text: 'Use div only when no element describes the content, usually as a styling hook.' },
      },
    ],
  },
  {
    topicId: 'accessibility',
    objective: 'Apply the four HTML habits that remove most accessibility barriers.',
    sections: [
      {
        heading: 'Four habits',
        body: [
          'Declare the page language with lang. Give every informative image alt text. Label every form control. Keep heading levels in order. These cost almost nothing and fix the most common problems.',
        ],
        code: {
          label: 'Fixing an inaccessible snippet',
          code: `<html lang="en">
<body>
  <h1>Sign up</h1>
  <label for="n">Name</label>
  <input id="n" name="n" type="text">
  <img src="logo.png" alt="CodeOrbit logo">
</body>
</html>`,
        },
      },
      {
        heading: 'Descriptive links',
        body: ['Link text should make sense on its own. "Read the installation guide" beats "click here".'],
        callout: { kind: 'why', text: 'Native HTML elements already include keyboard support and roles. Prefer them to custom replacements.' },
      },
    ],
  },
  {
    topicId: 'putting-together',
    objective: 'Combine what you know into one coherent, semantic page.',
    sections: [
      {
        heading: 'A small page, end to end',
        body: [
          'Start from the skeleton, add a header with navigation, put the content inside main with a single h1, add a list and an image with alt text, and close with a footer. Each earlier topic contributes a piece.',
        ],
        code: {
          label: 'Page plan',
          code: `<body>
  <header> … <nav> … </nav> </header>
  <main>
    <h1> … </h1>
    <img alt="…"> <ul> … </ul>
  </main>
  <footer> … </footer>
</body>`,
        },
      },
      {
        heading: 'Check your work',
        body: ['Read the page as an outline: could someone understand it using only headings, landmarks, link text and alt text?'],
        callout: { kind: 'why', text: 'If the outline makes sense without the visuals, your markup is doing its job.' },
      },
    ],
  },
]

export const getLesson = (topicId: string): Lesson | undefined => lessons.find((l) => l.topicId === topicId)
