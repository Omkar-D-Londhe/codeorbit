import type { Quiz, QuizQuestion } from './types'
import { getTracks } from '../core/content/registry.ts'

/** Deterministic hash so option order is varied but identical on every load. */
const hash = (s: string): number => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

const q = (id: string, prompt: string, options: string[], correctIndex: number, explanation: string): QuizQuestion => {
  // Rotate options by a stable amount so the correct answer is not always in the same slot.
  const shift = hash(id) % options.length
  const rotated = options.map((_, i) => options[(i + shift) % options.length])
  const newCorrect = (correctIndex - shift + options.length) % options.length
  return { kind: 'choice', id, prompt, options: rotated, correctIndex: newCorrect, explanation }
}

/** Seeded app content: multiple-choice and new typed questions per topic. */
export const quizzes: Quiz[] = [
  {
    topicId: 'html-structure',
    questions: [
      q('html-structure-1', 'Which element contains everything visible on the page?', ['<head>', '<body>', '<html>', '<title>'], 1,
        '<body> holds the visible content. <head> holds metadata, and <html> is the root that contains both.'),
      q('html-structure-2', 'What does the doctype declaration do?', ['Sets the page title', 'Loads a stylesheet', 'Tells the browser to use modern standards mode', 'Defines the page language'], 2,
        '<!DOCTYPE html> switches the browser out of quirks mode so the page is interpreted by modern rules.'),
      q('html-structure-3', 'Where should the <title> element go?', ['Inside <body>', 'Inside <head>', 'Before the doctype', 'Inside <footer>'], 1,
        '<title> is metadata about the page, so it belongs in <head>. It shows in the tab and in search results.'),
    ],
  },
  {
    topicId: 'elements-attributes',
    questions: [
      q('elements-attributes-1', 'Which of these is a void element (no closing tag)?', ['<p>', '<img>', '<a>', '<li>'], 1,
        '<img> has no content, so it has no closing tag. <p>, <a> and <li> wrap content.'),
      q('elements-attributes-2', 'Where do attributes go?', ['In the closing tag', 'Between tags as text', 'In the opening tag', 'Inside <head> only'], 2,
        'Attributes are name="value" pairs written inside the opening tag.'),
      q('elements-attributes-3', 'What is true of the id attribute?', ['It should be unique on the page', 'It must be used on every element', 'It can only appear on <div>', 'It sets the colour'], 0,
        'An id identifies exactly one element. Reusing it breaks fragment links and scripts. Use class to group elements.'),
      {
        kind: 'blank',
        id: 'elements-attributes-blank-1',
        prompt: 'To give an element a unique identifier for fragment navigation and scripts, use the attribute ___="site-nav".',
        answers: ['id'],
        caseInsensitive: true,
        explanation: 'The id attribute defines an identifier that must be globally unique within the document.',
      },
    ],
  },
  {
    topicId: 'headings-paragraphs',
    questions: [
      q('headings-paragraphs-1', 'What do heading levels (h1–h6) primarily express?', ['Font size', 'Importance and outline structure', 'Colour', 'Alignment'], 1,
        'Headings describe structure. Size is a presentation detail handled by CSS.'),
      q('headings-paragraphs-2', 'Which outline avoids a skipped level?', ['h1, h3, h2', 'h1, h2, h3', 'h2, h4, h1', 'h3, h1, h2'], 1,
        'h1 → h2 → h3 steps down one level at a time with no gaps.'),
      q('headings-paragraphs-3', 'How do you start a new paragraph?', ['Press Enter twice in the source', 'Use <br><br>', 'Use a new <p> element', 'Use &nbsp;'], 2,
        'Browsers collapse extra whitespace in the source, so each paragraph needs its own <p>.'),
      {
        kind: 'bug',
        id: 'headings-paragraphs-bug-1',
        prompt: 'Spot the heading level skip in this outline snippet.',
        lines: [
          '<h1>Trail Guide</h1>',
          '<h2>Equipment Needed</h2>',
          '<h4>Footwear</h4>',
          '<p>Sturdy waterproof hiking shoes.</p>',
        ],
        answer: 2,
        explanation: 'Line 3 skips directly from <h2> to <h4>, skipping level <h3>. Heading hierarchy should step down sequentially.',
      },
    ],
  },
  {
    topicId: 'text-semantics',
    questions: [
      q('text-semantics-1', 'Which element marks text the reader should type on a keyboard?', ['<code>', '<kbd>', '<em>', '<cite>'], 1,
        '<kbd> represents user keyboard input such as Ctrl + S.'),
      q('text-semantics-2', 'When is <blockquote> appropriate?', ['To indent any paragraph', 'For a longer quotation from another source', 'To make text italic', 'For headings'], 1,
        '<blockquote> means a quotation. Indentation alone is a styling goal, not a reason to use it.'),
      q('text-semantics-3', 'What is the best reason to prefer <strong> over <b>?', ['It is shorter', 'It conveys importance, not just appearance', 'It works in more browsers', 'It is required by HTML'], 1,
        '<strong> says the text is important. <b> only draws attention without implying importance.'),
      {
        kind: 'output',
        id: 'text-semantics-output-1',
        prompt: 'Which visual rendering reflects this semantic snippet: <p>Press <kbd>Enter</kbd> to continue.</p>?',
        code: '<p>Press <kbd>Enter</kbd> to continue.</p>',
        options: [
          {
            id: 'kbd-badge',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><text x="16" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14">Press </text><rect x="62" y="18" width="54" height="24" rx="4" fill="#2d2a42" stroke="#5a547a" stroke-width="1"/><text x="73" y="35" fill="#a79aff" font-family="monospace" font-size="13" font-weight="bold">Enter</text><text x="124" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14"> to continue.</text></svg>',
          },
          {
            id: 'plain-bold',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><text x="16" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14">Press <tspan font-weight="bold">Enter</tspan> to continue.</text></svg>',
          },
          {
            id: 'plain-italic',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><text x="16" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14">Press <tspan font-style="italic">Enter</tspan> to continue.</text></svg>',
          },
        ],
        answer: 'kbd-badge',
        explanation: '<kbd> represents keyboard input, typically rendered with keycap borders or a monospaced badge font.',
      },
      {
        kind: 'blank',
        id: 'text-semantics-blank-1',
        prompt: 'To designate user keyboard key input in HTML, wrap the keys in the tag: <___>Ctrl + S</___>.',
        answers: ['kbd'],
        caseInsensitive: true,
        explanation: 'The <kbd> inline semantic tag denotes keyboard keystrokes or voice commands.',
      },
      q('text-semantics-4', 'Which tag is designed to highlight text for relevance or reference?', ['<mark>', '<highlight>', '<yellow>', '<b>'], 0,
        '<mark> represents text highlighted or marked for reference or relevance purposes.'),
    ],
  },
  {
    topicId: 'lists',
    questions: [
      q('lists-1', 'Which element is best for a sequence of steps?', ['<ul>', '<ol>', '<dl>', '<table>'], 1,
        'An ordered list (<ol>) shows that order matters.'),
      q('lists-2', 'Where must an <li> be placed?', ['Directly in <body>', 'Directly inside <ul> or <ol>', 'Inside <p>', 'Inside <a>'], 1,
        'List items belong directly inside an unordered or ordered list.'),
      q('lists-3', 'How do you nest a list inside another?', ['Place the inner list inside an <li>', 'Place it between <li> elements', 'Use <nest>', 'Put it after </ul>'], 0,
        'The inner list sits inside the <li> of the item it belongs to.'),
    ],
  },
  {
    topicId: 'links',
    questions: [
      q('links-1', 'Which attribute makes an <a> element a link?', ['src', 'href', 'link', 'rel'], 1,
        'href holds the destination. Without it the anchor is not a navigable link.'),
      q('links-2', 'What should accompany target="_blank"?', ['rel="noopener noreferrer"', 'alt="new tab"', 'type="external"', 'lang="en"'], 0,
        'noopener prevents the new page from controlling the opener, and noreferrer withholds the referrer.'),
      q('links-3', 'What does <a href="#contact"> link to?', ['A file named contact', 'An element with id="contact" on the same page', 'An email address', 'A page called #contact'], 1,
        'A fragment link jumps to the element whose id matches.'),
    ],
  },
  {
    topicId: 'images',
    questions: [
      q('images-1', 'What is the alt attribute for?', ['Image tooltip colour', 'A text alternative for the image', 'Setting the file name', 'Changing size'], 1,
        'alt provides a text equivalent for people who cannot see the image and for when it fails to load.'),
      q('images-2', 'What alt value suits a purely decorative image?', ['alt="image"', 'No alt at all', 'alt="" (empty)', 'alt="decoration.png"'], 2,
        'An empty alt tells assistive technology to skip it. Omitting alt entirely is an error.'),
      q('images-3', 'Why add width and height attributes?', ['They make the image sharper', 'The browser can reserve space and avoid layout shift', 'They are required for alt text', 'They compress the file'], 1,
        'Known dimensions let the browser lay out the page before the image arrives.'),
      {
        kind: 'output',
        id: 'images-output-1',
        prompt: 'Which visual display occurs when an informative image with alt="Sunset trail" fails to load?',
        code: '<img src="missing.jpg" alt="Sunset trail">',
        options: [
          {
            id: 'alt-text-shown',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><rect x="16" y="20" width="20" height="20" fill="none" stroke="#8a879e" stroke-width="1.5" rx="2"/><path d="M20 28l4 4 6-6" stroke="#f2b85b" stroke-width="1.5" fill="none"/><text x="44" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14">Sunset trail</text></svg>',
          },
          {
            id: 'empty-box',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/></svg>',
          },
          {
            id: 'raw-url',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><rect x="16" y="20" width="20" height="20" fill="none" stroke="#8a879e" stroke-width="1.5" rx="2"/><text x="44" y="35" fill="#8a879e" font-family="monospace" font-size="13">missing.jpg</text></svg>',
          },
        ],
        answer: 'alt-text-shown',
        explanation: 'Browsers display the fallback text from the alt attribute when image assets fail to download.',
      },
    ],
  },
  {
    topicId: 'media-elements',
    questions: [
      q('media-1', 'Which attribute enables user play, pause, and volume controls on <audio> or <video>?', ['controls', 'autoplay', 'ui', 'play'], 0,
        'The controls boolean attribute displays native browser playback interface controls.'),
      q('media-2', 'Why should you include multiple <source> elements inside <video>?', ['To play multiple videos at once', 'To provide fallback video formats for different browser support', 'To increase download speed', 'To repeat playback'], 1,
        'Browsers evaluate <source> tags in order and play the first format they support.'),
      q('media-3', 'Which element provides subtitles and captions for audio or video?', ['<caption rel="sub">', '<track kind="subtitles">', '<subtitle>', '<alt>'], 1,
        '<track> specifies timed text tracks (such as subtitles and captions) in WebVTT format.'),
    ],
  },
  {
    topicId: 'tables',
    questions: [
      q('tables-1', 'Which element holds a header cell?', ['<td>', '<th>', '<tr>', '<caption>'], 1,
        '<th> is a header cell. <td> is a data cell and <tr> is a row.'),
      q('tables-2', 'What does <caption> do?', ['Adds a border', 'Gives the table a visible title', 'Merges cells', 'Sorts rows'], 1,
        '<caption> names the table and is associated with it for assistive technology.'),
      q('tables-3', 'When should you use a table?', ['To position page columns', 'For data with rows and columns', 'Whenever you need spacing', 'For every list'], 1,
        'Tables are for tabular data. Page layout is done with CSS.'),
      {
        kind: 'bug',
        id: 'tables-bug-1',
        prompt: 'Spot the semantic mistake in this table header row.',
        lines: [
          '<table>',
          '  <caption>Course Timetable</caption>',
          '  <tr><td scope="col">Time</td><td scope="col">Subject</td></tr>',
          '  <tr><td>09:00</td><td>HTML Semantics</td></tr>',
          '</table>',
        ],
        answer: 2,
        explanation: 'Line 3 uses <td> cells with scope="col". Table header cells must be <th> elements.',
      },
      q('tables-4', 'Which attribute allows a table header or cell to span across multiple columns?', ['rowspan', 'colspan', 'span', 'colwidth'], 1,
        'colspan indicates the number of columns that a cell spans across in a table grid.'),
    ],
  },
  {
    topicId: 'forms',
    questions: [
      q('forms-1', 'How do you associate a <label> with an input?', ['Place them far apart', 'Match label for to the input id', 'Use the same class', 'Use the title attribute'], 1,
        'for="x" on the label pairs it with the control that has id="x".'),
      q('forms-2', 'Which input type gives built-in email validation?', ['type="text"', 'type="email"', 'type="mail"', 'type="string"'], 1,
        'type="email" lets the browser check the format and show a suitable keyboard.'),
      q('forms-3', 'What does the required attribute do?', ['Hides the field', 'Prevents submission while the field is empty', 'Makes the field bold', 'Auto-fills the field'], 1,
        'required makes the browser block submission until the control has a value.'),
      {
        kind: 'blank',
        id: 'forms-blank-1',
        prompt: 'To block form submission while an input field is empty, apply the boolean attribute: <input type="text" ___>.',
        answers: ['required'],
        caseInsensitive: true,
        explanation: 'The required attribute is a boolean constraint that prevents form submission when the field has no value.',
      },
      q('forms-4', 'How do you group radio buttons so that only one can be selected at a time?', ['Give them the same id', 'Give them the same name attribute', 'Wrap each in a <div>', 'Give them the same value'], 1,
        'Radio buttons sharing the same name attribute form a radio button group where selecting one unchecks the others.'),
    ],
  },
  {
    topicId: 'semantic-layout',
    questions: [
      q('semantic-layout-1', 'Which element should hold the primary content and appear once per page?', ['<section>', '<main>', '<article>', '<aside>'], 1,
        '<main> identifies the dominant content of the page and should appear once.'),
      q('semantic-layout-2', 'What does <nav> represent?', ['Any list of items', 'A major block of navigation links', 'The page footer', 'A form'], 1,
        '<nav> is for primary navigation blocks, not every group of links.'),
      q('semantic-layout-3', 'Why prefer landmarks to anonymous divs?', ['They load faster', 'Assistive tech can jump between regions by meaning', 'Divs are deprecated', 'They add spacing'], 1,
        'Landmarks expose the page structure so users can navigate by region.'),
      {
        kind: 'bug',
        id: 'semantic-layout-bug-1',
        prompt: 'Spot the landmark violation in this page structure.',
        lines: [
          '<header><h1>Daily Chronicle</h1></header>',
          '<main><h2>Top Story</h2><p>News text...</p></main>',
          '<main><h2>Second Story</h2><p>More news...</p></main>',
          '<footer>© 2026 Daily Chronicle</footer>',
        ],
        answer: 2,
        explanation: 'Line 3 declares a second <main> element. An HTML document should have exactly one visible <main> landmark.',
      },
    ],
  },
  {
    topicId: 'accessibility',
    questions: [
      q('accessibility-1', 'What does lang on <html> help with?', ['Page speed', 'Screen reader pronunciation and translation', 'Link colour', 'Image loading'], 1,
        'The language lets assistive technology choose the right voice and lets browsers offer translation.'),
      q('accessibility-2', 'Which link text is most accessible?', ['Click here', 'Read more', 'Download the installation guide', 'Link'], 2,
        'Descriptive text makes sense when links are read out of context.'),
      q('accessibility-3', 'What is a problem with an h1 followed directly by an h4?', ['None', 'It skips levels and confuses the outline', 'It breaks the browser', 'It is invalid HTML syntax'], 1,
        'Skipped levels make the outline look incomplete to people who navigate by headings.'),
      {
        kind: 'output',
        id: 'accessibility-output-1',
        prompt: 'Which output reflects what a browser renders when an image cannot load: <img src="broken.jpg" alt="A red bicycle">?',
        code: '<img src="broken.jpg" alt="A red bicycle">',
        options: [
          {
            id: 'alt-displayed',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><rect x="16" y="20" width="20" height="20" fill="none" stroke="#8a879e" stroke-width="1.5" rx="2"/><path d="M20 28l4 4 6-6" stroke="#f2b85b" stroke-width="1.5" fill="none"/><text x="44" y="35" fill="#f0eff7" font-family="system-ui, sans-serif" font-size="14">A red bicycle</text></svg>',
          },
          {
            id: 'blank-box',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/></svg>',
          },
          {
            id: 'filename-fallback',
            svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60"><rect width="240" height="60" fill="#1e1b2e" rx="4"/><rect x="16" y="20" width="20" height="20" fill="none" stroke="#8a879e" stroke-width="1.5" rx="2"/><text x="44" y="35" fill="#8a879e" font-family="monospace" font-size="13">broken.jpg</text></svg>',
          },
        ],
        answer: 'alt-displayed',
        explanation: 'When an image fails to load, browsers display the fallback text provided by the alt attribute alongside a broken-image symbol.',
      },
    ],
  },
  {
    topicId: 'putting-together',
    questions: [
      q('putting-together-1', 'Where should the single h1 of a typical page appear?', ['In <footer>', 'Inside <main>', 'In <head>', 'Inside <nav>'], 1,
        'The page’s main heading belongs with the main content.'),
      q('putting-together-2', 'Which structure is the best semantic skeleton?', ['div, div, div', 'header, nav, main, footer', 'table, tr, td', 'body only'], 1,
        'header, nav, main and footer describe the page regions.'),
      q('putting-together-3', 'What should you check before calling a page finished?', ['It looks good in one browser', 'The outline makes sense from headings, landmarks and alt text', 'It has many divs', 'It uses only one tag'], 1,
        'Reading the structure without visuals shows whether the markup conveys meaning.'),
      {
        kind: 'sort',
        id: 'putting-together-sort-1',
        prompt: 'Arrange the core HTML skeleton elements in their proper order from top to bottom.',
        items: [
          { id: 'sk-body', text: '<body> ... </body>' },
          { id: 'sk-doctype', text: '<!DOCTYPE html>' },
          { id: 'sk-head', text: '<head> ... </head>' },
          { id: 'sk-html', text: '<html lang="en">' },
        ],
        order: ['sk-doctype', 'sk-html', 'sk-head', 'sk-body'],
        explanation: 'The <!DOCTYPE html> preamble appears first, followed by the opening <html> root tag, then the <head> metadata block, and finally the <body> content block.',
      },
    ],
  },
]

export const getQuiz = (topicId: string): Quiz | undefined => {
  const q = quizzes.find((x) => x.topicId === topicId)
  if (q) return q
  for (const track of getTracks()) {
    const found = track.quizzes[topicId]
    if (found) return found
  }
  return undefined
}
