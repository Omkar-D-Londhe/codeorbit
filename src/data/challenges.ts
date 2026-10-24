import type { Challenge } from './types'

const SVG_DOT = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='100'%3E%3Crect width='160' height='100' fill='%239A8BFF'/%3E%3C/svg%3E`

/** Seeded app content: one practice challenge per topic. Checks are deterministic and rule-based. */
export const challenges: Challenge[] = [
  {
    id: 'ch-html-structure', topicId: 'html-structure', title: 'Build a valid page skeleton', difficulty: 'beginner',
    objective: 'Write the doctype, html, head and body so the page is complete.',
    prompt: 'The starter is only a heading. Wrap it in a complete HTML document with a language, a character set and a title.',
    starterCode: `<h1>Hello, CodeOrbit</h1>`,
    requirements: [
      { id: 'doctype', description: 'Starts with <!DOCTYPE html>', explanation: 'The doctype keeps the browser in modern standards mode.', rule: { kind: 'doctype' } },
      { id: 'lang', description: 'The <html> element has a non-empty lang attribute', explanation: 'Language helps screen readers pronounce text and enables translation.', rule: { kind: 'everyHasAttr', selector: 'html', attr: 'lang', nonEmpty: true, min: 1 } },
      { id: 'charset', description: 'The <head> contains <meta charset>', explanation: 'A declared character set prevents garbled characters.', rule: { kind: 'selector', selector: 'head meta[charset]', min: 1 } },
      { id: 'title', description: 'The <head> contains a non-empty <title>', explanation: 'The title names the page in tabs, history and search results.', rule: { kind: 'textLength', selector: 'head title', min: 1 } },
      { id: 'h1', description: 'The <body> contains an <h1>', explanation: 'The h1 is the visible name of the page.', rule: { kind: 'selector', selector: 'body h1', min: 1 } },
    ],
    hints: [
      'Think about what the browser needs to know before it draws anything: the document type, the language, and a name for the page.',
      'You need an <html> element with two children: a <head> for information about the page and a <body> for what people see.',
      'Inside <head> add <meta charset="UTF-8"> and <title>…</title>. Put the doctype on the very first line and lang="en" on <html>.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, CodeOrbit</h1>
  </body>
</html>`,
    solutionExplanation: [
      'The doctype comes first so the browser uses standards mode.',
      'lang="en" on <html> declares the page language.',
      'The charset meta and title live in <head>; only the h1 is visible content in <body>.',
    ],
  },
  {
    id: 'ch-elements-attributes', topicId: 'elements-attributes', title: 'Configure elements with attributes', difficulty: 'beginner',
    objective: 'Use href, title, class and disabled attributes on the right elements.',
    prompt: 'Complete the starter: make the anchor a real https link with a title, give the paragraph the class "note", and make the button disabled.',
    starterCode: `<a>Visit the docs</a>
<p>Remember to save your work.</p>
<button>Submit</button>`,
    requirements: [
      { id: 'href', description: 'A link has an href starting with https://', explanation: 'Without href an anchor is not a link.', rule: { kind: 'anyHasAttr', selector: 'a', attr: 'href', startsWith: 'https://' } },
      { id: 'title', description: 'The link has a non-empty title attribute', explanation: 'title adds supplementary information about the link.', rule: { kind: 'anyHasAttr', selector: 'a', attr: 'title', nonEmpty: true } },
      { id: 'class', description: 'A <p> has the class "note"', explanation: 'Classes group elements so they can share styling later.', rule: { kind: 'selector', selector: 'p.note', min: 1 } },
      { id: 'disabled', description: 'The <button> has the disabled attribute', explanation: 'A boolean attribute is on when present.', rule: { kind: 'selector', selector: 'button[disabled]', min: 1 } },
    ],
    hints: [
      'Attributes configure an element. Ask what each element needs to be told: where to go, what group it is in, whether it can be used.',
      'Attributes are written inside the opening tag as name="value". Boolean attributes such as disabled need no value.',
      'Try <a href="https://…" title="…">, <p class="note"> and <button disabled>.',
    ],
    solutionCode: `<a href="https://developer.mozilla.org/en-US/docs/Web/HTML" title="MDN HTML documentation">Visit the docs</a>
<p class="note">Remember to save your work.</p>
<button disabled>Submit</button>`,
    solutionExplanation: [
      'href turns the anchor into a navigable link.',
      'class="note" lets many paragraphs share a name.',
      'disabled is a boolean attribute: present means on.',
    ],
  },
  {
    id: 'ch-headings-paragraphs', topicId: 'headings-paragraphs', title: 'Outline a page with headings', difficulty: 'beginner',
    objective: 'Create a clean heading outline with paragraphs beneath each heading.',
    prompt: 'The starter begins at h3. Restructure it into a page with one h1, at least two h2 sections, and a paragraph for each.',
    starterCode: `<h3>My Hobbies</h3>
<p>I like climbing.</p>`,
    requirements: [
      { id: 'one-h1', description: 'Exactly one <h1>', explanation: 'One h1 names the page.', rule: { kind: 'selector', selector: 'h1', exactly: 1 } },
      { id: 'two-h2', description: 'At least two <h2> sections', explanation: 'h2 elements divide the page into major sections.', rule: { kind: 'selector', selector: 'h2', min: 2 } },
      { id: 'two-p', description: 'At least two <p> paragraphs', explanation: 'Text belongs in paragraphs.', rule: { kind: 'selector', selector: 'p', min: 2 } },
      { id: 'order', description: 'Heading levels never skip (start at h1)', explanation: 'Skipped levels make the outline look broken to heading navigation.', rule: { kind: 'headingOrder' } },
    ],
    hints: [
      'An outline has a title, then sections. Which heading level is the title?',
      'Use <h1> once, then <h2> for each section, with a <p> after each heading.',
      'Pattern: <h1>Title</h1> <h2>Section</h2> <p>Text</p> <h2>Section</h2> <p>Text</p>',
    ],
    solutionCode: `<h1>My Hobbies</h1>
<h2>Climbing</h2>
<p>I like climbing on weekends.</p>
<h2>Photography</h2>
<p>I photograph city streets.</p>`,
    solutionExplanation: [
      'One h1 names the page, then h2 sections follow without skipping a level.',
      'Each section has its own paragraph.',
    ],
  },
  {
    id: 'ch-text-semantics', topicId: 'text-semantics', title: 'Mark text by meaning', difficulty: 'beginner',
    objective: 'Use kbd, strong, blockquote and cite appropriately.',
    prompt: 'Rewrite the plain text so keyboard keys, important text, the quotation and its source use the elements that describe them.',
    starterCode: `Press Ctrl + S to save. This step is important.
"Learning never exhausts the mind." — Leonardo da Vinci`,
    requirements: [
      { id: 'kbd', description: 'Keyboard keys use <kbd>', explanation: '<kbd> marks keyboard input.', rule: { kind: 'selector', selector: 'kbd', min: 1 } },
      { id: 'strong', description: 'Important text uses <strong> or <em>', explanation: 'These carry meaning of importance or emphasis.', rule: { kind: 'selector', selector: 'strong, em', min: 1 } },
      { id: 'quote', description: 'The quotation uses <blockquote> or <q>', explanation: 'A quotation element says the text comes from elsewhere.', rule: { kind: 'selector', selector: 'blockquote, q', min: 1 } },
      { id: 'cite', description: 'The source is marked with <cite>', explanation: '<cite> names the person or work being referenced.', rule: { kind: 'selector', selector: 'cite', min: 1 } },
    ],
    hints: [
      'For each piece of text ask what it is: input, importance, quotation, source.',
      'There is an element for each: kbd, strong, blockquote (or q), and cite.',
      'Try <kbd>Ctrl</kbd>, <strong>important</strong>, <blockquote><p>…</p></blockquote> and <cite>Leonardo da Vinci</cite>.',
    ],
    solutionCode: `<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save. This step is <strong>important</strong>.</p>
<blockquote>
  <p>Learning never exhausts the mind.</p>
  <footer>— <cite>Leonardo da Vinci</cite></footer>
</blockquote>`,
    solutionExplanation: [
      'Each key gets its own <kbd>.',
      '<strong> conveys importance.',
      'The quote sits in a <blockquote>, with the source marked by <cite>.',
    ],
  },
  {
    id: 'ch-lists', topicId: 'lists', title: 'Turn text into lists', difficulty: 'beginner',
    objective: 'Choose ul or ol and place li directly inside.',
    prompt: 'Convert the shopping items into an unordered list and the cooking steps into an ordered list, with each item as an <li>.',
    starterCode: `Shopping: milk, eggs, bread
Steps: 1 wash 2 chop 3 cook`,
    requirements: [
      { id: 'ul', description: 'An unordered list with at least 3 items', explanation: 'Order does not matter for a shopping list.', rule: { kind: 'selector', selector: 'ul > li', min: 3 } },
      { id: 'ol', description: 'An ordered list with at least 3 items', explanation: 'Steps happen in sequence.', rule: { kind: 'selector', selector: 'ol > li', min: 3 } },
      { id: 'li-parent', description: 'Every <li> sits directly inside a <ul> or <ol>', explanation: 'Loose list items are invalid and confuse assistive technology.', rule: { kind: 'noMatch', selector: ':not(ul):not(ol) > li' } },
    ],
    hints: [
      'One of these lists has a meaningful order and the other does not.',
      'Use <ul> for shopping and <ol> for steps. Every item is an <li>.',
      'Pattern: <ul><li>Milk</li><li>Eggs</li><li>Bread</li></ul>',
    ],
    solutionCode: `<h2>Shopping</h2>
<ul>
  <li>Milk</li>
  <li>Eggs</li>
  <li>Bread</li>
</ul>
<h2>Steps</h2>
<ol>
  <li>Wash</li>
  <li>Chop</li>
  <li>Cook</li>
</ol>`,
    solutionExplanation: ['ul for unordered items, ol for steps.', 'All li elements are direct children of a list.'],
  },
  {
    id: 'ch-links', topicId: 'links', title: 'Create safe, descriptive links', difficulty: 'intermediate',
    objective: 'Write absolute and fragment links and open a new tab safely.',
    prompt: 'Make the first anchor open the MDN HTML guide in a new tab safely. Make the second anchor jump to the footer. Use descriptive link text.',
    starterCode: `<p>Read the <a>MDN guide</a>.</p>
<p>Jump to the <a>footer</a>.</p>
<footer>Page footer</footer>`,
    requirements: [
      { id: 'external', description: 'An external link with href starting https://', explanation: 'Absolute URLs point to other sites.', rule: { kind: 'anyHasAttr', selector: 'a', attr: 'href', startsWith: 'https://' } },
      { id: 'noopener', description: 'Every target="_blank" link has rel with noopener (and at least one exists)', explanation: 'Without noopener the new page can reach back to your page.', rule: { kind: 'everyAttrContains', selector: 'a[target="_blank"]', attr: 'rel', token: 'noopener' } },
      { id: 'fragment', description: 'An in-page link (#id) points to an element that exists', explanation: 'A fragment link needs an element with a matching id.', rule: { kind: 'fragmentLinksResolve' } },
      { id: 'text', description: 'No link says "click here"', explanation: 'Link text must describe the destination.', rule: { kind: 'noLinkText', patterns: ['click here', 'here', 'link'] } },
    ],
    hints: [
      'A link needs a destination. The first goes off-site; the second stays on this page.',
      'Use href on both anchors. The second href starts with # and must match an id elsewhere on the page.',
      'Add target="_blank" rel="noopener noreferrer" to the first link and id="page-footer" to the footer with href="#page-footer" on the second link.',
    ],
    solutionCode: `<p>Read the <a href="https://developer.mozilla.org/en-US/docs/Web/HTML" target="_blank" rel="noopener noreferrer">MDN HTML guide</a>.</p>
<p>Jump to the <a href="#page-footer">footer</a>.</p>
<footer id="page-footer">Page footer</footer>`,
    solutionExplanation: [
      'target="_blank" is paired with rel="noopener noreferrer".',
      'The fragment link matches the footer’s id.',
    ],
  },
  {
    id: 'ch-images', topicId: 'images', title: 'Add an accessible image', difficulty: 'beginner',
    objective: 'Give an image alt text, dimensions and a caption.',
    prompt: 'The image below has no alt text or size. Add alt text, width and height, and wrap it in a figure with a figcaption.',
    starterCode: `<img src="${SVG_DOT}">`,
    requirements: [
      { id: 'img', description: 'At least one <img> exists', explanation: 'The challenge is about an image element.', rule: { kind: 'selector', selector: 'img', min: 1 } },
      { id: 'alt', description: 'Every <img> has a non-empty alt', explanation: 'Alt text is the image’s text equivalent.', rule: { kind: 'everyHasAttr', selector: 'img', attr: 'alt', nonEmpty: true, min: 1 } },
      { id: 'size', description: 'Every <img> has width and height attributes', explanation: 'Known dimensions prevent layout shift.', rule: { kind: 'selector', selector: 'img[width][height]', min: 1 } },
      { id: 'figure', description: 'The image is inside <figure> with a <figcaption>', explanation: 'A figure groups media with its caption.', rule: { kind: 'selector', selector: 'figure > img, figure img', min: 1 } },
      { id: 'caption', description: 'A <figcaption> with text exists', explanation: 'The caption explains the image to everyone.', rule: { kind: 'textLength', selector: 'figcaption', min: 1 } },
    ],
    hints: [
      'Imagine someone who cannot see the image. What would you tell them?',
      'Add alt="…" to the img, width and height numbers, and wrap in <figure> with <figcaption>.',
      'Pattern: <figure><img src="…" alt="…" width="160" height="100"><figcaption>…</figcaption></figure>',
    ],
    solutionCode: `<figure>
  <img src="${SVG_DOT}" alt="A solid violet rectangle used as a sample image" width="160" height="100">
  <figcaption>A sample image in CodeOrbit violet.</figcaption>
</figure>`,
    solutionExplanation: ['alt describes the image’s content.', 'width and height reserve space.', 'figure and figcaption pair the image with its caption.'],
  },
  {
    id: 'ch-tables', topicId: 'tables', title: 'Structure a data table', difficulty: 'intermediate',
    objective: 'Use caption, th with scope, and body rows.',
    prompt: 'Turn the loose text into a table with a caption, three column headers (with scope) and two data rows.',
    starterCode: `Day Topic Minutes
Mon Lists 20
Tue Links 25`,
    requirements: [
      { id: 'table', description: 'A <table> exists', explanation: 'This content is genuinely tabular.', rule: { kind: 'selector', selector: 'table', min: 1 } },
      { id: 'caption', description: 'The table has a non-empty <caption>', explanation: 'A caption names the table for everyone.', rule: { kind: 'textLength', selector: 'table > caption', min: 1 } },
      { id: 'th', description: 'At least 3 header cells (<th>)', explanation: 'Header cells label the columns.', rule: { kind: 'selector', selector: 'th', min: 3 } },
      { id: 'scope', description: 'Every <th> has a scope attribute', explanation: 'scope tells assistive technology what each header labels.', rule: { kind: 'everyHasAttr', selector: 'th', attr: 'scope', nonEmpty: true, min: 1 } },
      { id: 'rows', description: 'At least 2 data rows in <tbody>', explanation: 'Rows hold the data.', rule: { kind: 'selector', selector: 'tbody > tr', min: 2 } },
    ],
    hints: [
      'A table is rows of cells. Which cells label the data and which hold it?',
      'Use <table>, <caption>, <thead> with <th>, and <tbody> with <tr> and <td>.',
      'Header cells: <th scope="col">Day</th>. Data cells: <td>Mon</td>.',
    ],
    solutionCode: `<table>
  <caption>Weekly practice</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">Topic</th><th scope="col">Minutes</th></tr>
  </thead>
  <tbody>
    <tr><td>Mon</td><td>Lists</td><td>20</td></tr>
    <tr><td>Tue</td><td>Links</td><td>25</td></tr>
  </tbody>
</table>`,
    solutionExplanation: ['caption names the table.', 'th scope="col" labels columns.', 'Data lives in tbody rows.'],
  },
  {
    id: 'ch-forms', topicId: 'forms', title: 'Build a labelled sign-up form', difficulty: 'intermediate',
    objective: 'Wrap controls in a form, label them, use proper types and required fields.',
    prompt: 'Wrap these controls in a form. Give each control a label, make the email control use the email type, require both fields and keep a submit button.',
    starterCode: `<input type="text" name="name">
<input type="email" name="email">
<button>Send</button>`,
    requirements: [
      { id: 'form', description: 'Controls are inside a <form>', explanation: 'A form groups controls so they submit together.', rule: { kind: 'selector', selector: 'form input, form button', min: 3 } },
      { id: 'labels', description: 'Every control has a label (for/id, wrapping label, or aria-label)', explanation: 'Labels give controls their accessible names.', rule: { kind: 'controlsLabelled' } },
      { id: 'email', description: 'There is an input with type="email"', explanation: 'The email type enables validation and the right keyboard.', rule: { kind: 'selector', selector: 'input[type="email"]', min: 1 } },
      { id: 'required', description: 'At least one field is required', explanation: 'required blocks empty submission.', rule: { kind: 'selector', selector: '[required]', min: 1 } },
      { id: 'submit', description: 'A submit button exists', explanation: 'A submit control sends the form.', rule: { kind: 'selector', selector: 'form button[type="submit"], form input[type="submit"]', min: 1 } },
    ],
    hints: [
      'A form is a group of controls, each of which needs a visible name.',
      'Wrap everything in <form>. Pair each <label for="x"> with a control that has id="x".',
      'Add required to the inputs and type="submit" to the button.',
    ],
    solutionCode: `<form action="#" method="post">
  <label for="name">Name</label>
  <input id="name" name="name" type="text" required>
  <label for="email">Email</label>
  <input id="email" name="email" type="email" required>
  <button type="submit">Send</button>
</form>`,
    solutionExplanation: ['Each label’s for matches an input id.', 'type="email" and required add built-in validation.', 'The button explicitly submits the form.'],
  },
  {
    id: 'ch-semantic-layout', topicId: 'semantic-layout', title: 'Replace divs with landmarks', difficulty: 'intermediate',
    objective: 'Structure a page with header, nav, main and footer.',
    prompt: 'The layout uses generic divs. Rebuild it using header, nav (with at least two links), a single main, and footer.',
    starterCode: `<div class="header"><h1>Trail Guide</h1></div>
<div class="nav"><a href="#routes">Routes</a> <a href="#gear">Gear</a></div>
<div class="content"><h2 id="routes">Routes</h2><p>Three loops.</p></div>
<div class="footer">© Trail Guide</div>`,
    requirements: [
      { id: 'header', description: 'Has a <header>', explanation: 'header introduces the page.', rule: { kind: 'selector', selector: 'header', min: 1 } },
      { id: 'nav', description: 'Has a <nav> containing at least 2 links', explanation: 'nav marks the main navigation.', rule: { kind: 'selector', selector: 'nav a[href]', min: 2 } },
      { id: 'main', description: 'Has exactly one <main>', explanation: 'main identifies the primary content once per page.', rule: { kind: 'selector', selector: 'main', exactly: 1 } },
      { id: 'footer', description: 'Has a <footer>', explanation: 'footer closes the page.', rule: { kind: 'selector', selector: 'footer', min: 1 } },
    ],
    hints: [
      'Each div has a job already named by its class. Which HTML element means that?',
      'header, nav, main and footer replace the four divs. main wraps the content.',
      'Keep the links in <nav> and the content inside <main>.',
    ],
    solutionCode: `<header><h1>Trail Guide</h1></header>
<nav><a href="#routes">Routes</a> <a href="#gear">Gear</a></nav>
<main>
  <h2 id="routes">Routes</h2>
  <p>Three loops.</p>
</main>
<footer>© Trail Guide</footer>`,
    solutionExplanation: ['Each element carries the meaning the div classes only suggested.', 'Landmarks let assistive tech jump between regions.'],
  },
  {
    id: 'ch-accessibility', topicId: 'accessibility', title: 'Fix the accessibility problems', difficulty: 'intermediate',
    objective: 'Repair language, alt text, labels, heading order and link text.',
    prompt: 'The page below has five accessibility problems. Fix all of them without removing content.',
    starterCode: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Sign up</title></head>
<body>
  <h1>Sign up</h1>
  <h4>Your details</h4>
  <input type="text" name="n">
  <img src="${SVG_DOT}">
  <a href="#help">click here</a>
  <p id="help">Help text</p>
</body>
</html>`,
    requirements: [
      { id: 'lang', description: '<html> has a non-empty lang', explanation: 'Language drives pronunciation and translation.', rule: { kind: 'everyHasAttr', selector: 'html', attr: 'lang', nonEmpty: true, min: 1 } },
      { id: 'alt', description: 'Every <img> has non-empty alt', explanation: 'Images need text equivalents.', rule: { kind: 'everyHasAttr', selector: 'img', attr: 'alt', nonEmpty: true, min: 1 } },
      { id: 'labels', description: 'Every form control is labelled', explanation: 'Unlabelled controls have no accessible name.', rule: { kind: 'controlsLabelled' } },
      { id: 'headings', description: 'Heading levels do not skip', explanation: 'Skipped levels break heading navigation.', rule: { kind: 'headingOrder' } },
      { id: 'links', description: 'No link says "click here"', explanation: 'Link text should describe its destination.', rule: { kind: 'noLinkText', patterns: ['click here', 'here', 'link'] } },
    ],
    hints: [
      'Walk through the page as someone using a screen reader. What would be announced, and what would be silent?',
      'Check each: page language, image alternative, control label, heading levels, link wording.',
      'Add lang="en" to <html>, alt to the img, a <label for> with matching id on the input, change h4 to h2, and rewrite the link text.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Sign up</title></head>
<body>
  <h1>Sign up</h1>
  <h2>Your details</h2>
  <label for="n">Name</label>
  <input id="n" type="text" name="n">
  <img src="${SVG_DOT}" alt="CodeOrbit sample image">
  <a href="#help">Read the sign-up help</a>
  <p id="help">Help text</p>
</body>
</html>`,
    solutionExplanation: ['Each fix addresses one barrier.', 'Descriptive link text works out of context.'],
  },
  {
    id: 'ch-putting-together', topicId: 'putting-together', title: 'Build a small semantic page', difficulty: 'advanced',
    objective: 'Combine structure, navigation, media, lists and landmarks.',
    prompt: 'Build a complete page for a local trail club: valid skeleton, header with navigation, one main with a single h1, an image with alt text, a list of at least three items and a footer.',
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <title></title>
</head>
<body>

</body>
</html>`,
    requirements: [
      { id: 'lang', description: '<html> has lang', explanation: 'Declares the language.', rule: { kind: 'everyHasAttr', selector: 'html', attr: 'lang', nonEmpty: true, min: 1 } },
      { id: 'title', description: 'A non-empty <title>', explanation: 'Names the page.', rule: { kind: 'textLength', selector: 'head title', min: 1 } },
      { id: 'nav', description: 'A <header> contains a <nav> with at least 2 links', explanation: 'Gives users a way around.', rule: { kind: 'selector', selector: 'header nav a[href]', min: 2 } },
      { id: 'main-h1', description: 'Exactly one <h1>, placed inside <main>', explanation: 'One page heading belongs with the primary content.', rule: { kind: 'selector', selector: 'main h1', exactly: 1 } },
      { id: 'main', description: 'Exactly one <main>', explanation: 'main appears once per page.', rule: { kind: 'selector', selector: 'main', exactly: 1 } },
      { id: 'img', description: 'An <img> with non-empty alt', explanation: 'Informative images need alt text.', rule: { kind: 'everyHasAttr', selector: 'img', attr: 'alt', nonEmpty: true, min: 1 } },
      { id: 'list', description: 'A list with at least 3 items inside <main>', explanation: 'Lists group related items.', rule: { kind: 'selector', selector: 'main li', min: 3 } },
      { id: 'footer', description: 'A <footer>', explanation: 'Closes the page.', rule: { kind: 'selector', selector: 'footer', min: 1 } },
    ],
    hints: [
      'Sketch the regions of the page first: where do navigation, primary content and closing information go?',
      'header (with nav), main (h1, img, list), footer. Remember the skeleton: lang, charset, title.',
      'Inside main: <h1>, an <img alt="…">, and <ul> with three <li>. Put two links inside <nav> inside <header>.',
    ],
    solutionCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hillside Trail Club</title>
</head>
<body>
  <header>
    <nav>
      <a href="#routes">Routes</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>
  <main>
    <h1>Hillside Trail Club</h1>
    <img src="${SVG_DOT}" alt="Club badge in violet" width="160" height="100">
    <h2 id="routes">Weekend routes</h2>
    <ul>
      <li>Ridge loop</li>
      <li>River path</li>
      <li>Forest circuit</li>
    </ul>
  </main>
  <footer id="contact">Write to hello@example.com</footer>
</body>
</html>`,
    solutionExplanation: ['The skeleton declares language, charset and title.', 'header/nav, main and footer provide landmarks.', 'A single h1, an image with alt and a list complete the content.'],
  },
]

export const getChallenge = (id: string): Challenge | undefined => challenges.find((c) => c.id === id)
export const challengesForTopic = (topicId: string): Challenge[] => challenges.filter((c) => c.topicId === topicId)
