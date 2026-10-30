import type { Lesson, LessonSection } from './types'
import { getTracks } from '../core/content/registry.ts'

export function slugifyHeading(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getSectionId(section: LessonSection, index: number): string {
  return section.id || slugifyHeading(section.heading) || `sec-${index}`
}

/** Seeded app content: one lesson per topic. */
export const lessons: Lesson[] = [
  {
    topicId: 'html-structure',
    objective: 'Write the minimum skeleton a browser expects, and say what each part is for.',
    takeaways: [
      'Every web document requires a <!DOCTYPE html> declaration to trigger standards mode.',
      'The <html> element acts as the root of the document object model (DOM) tree.',
      '<head> contains metadata (character encoding, title, viewport) invisible on the rendered page.',
      '<body> encapsulates all user-visible structure, text, and multimedia.',
    ],
    terms: {
      doctype: {
        term: 'Doctype',
        definition: 'A document type preamble that informs browsers to render using modern HTML standards mode rather than quirks mode.',
      },
      metadata: {
        term: 'Metadata',
        definition: 'Information describing the document itself (such as charset, title, and viewport) placed inside the head element.',
      },
      dom: {
        term: 'DOM Tree',
        definition: 'The Document Object Model hierarchical tree structure constructed by the browser parser from nested HTML elements.',
      },
    },
    a11yNotes: [
      'Always specify the lang attribute on <html> so screen readers pronounce text with correct phonetics.',
      'Provide a descriptive <title> so tab switchers and assistive technologies announce the page topic immediately.',
    ],
    demos: [
      {
        id: 'demo-structure',
        title: 'Document Skeleton in Action',
        files: [
          {
            name: 'index.html',
            content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Live Skeleton Demo</title>
  </head>
  <body>
    <h1>Welcome to CodeOrbit</h1>
    <p>This entire page is rendered safely inside a sandboxed frame.</p>
  </body>
</html>`,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'the-skeleton',
        heading: 'The skeleton',
        body: [
          'Every HTML page is a {{term:dom}}. The {{term:doctype}} tells the browser to use modern standards mode, <html> is the root, <head> holds {{term:metadata}} about the page, and <body> holds everything people see.',
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
        id: 'what-goes-in-the-head',
        heading: 'What goes in the head',
        body: [
          'The title appears in the browser tab and in search results. The charset declaration makes sure characters such as é or — display correctly. None of the head content is drawn on the page itself.',
        ],
        callout: { kind: 'why', text: 'The lang attribute on <html> lets screen readers choose the right pronunciation and lets browsers offer translation.' },
      },
      {
        id: 'common-mistake',
        heading: 'Common mistake',
        body: ['Browsers repair broken structure silently, so a missing <title> or doctype often "works" while quietly causing quirks.'],
        callout: { kind: 'mistake', text: 'Putting visible content in <head>, or forgetting the doctype, makes behaviour differ between browsers.' },
      },
      {
        id: 'local-dev-serving',
        heading: 'Local development and HTTP serving',
        body: [
          'When previewing HTML locally, opening files directly via file:// URLs imposes security restrictions on CORS, web workers, fonts, and ES modules. Web developers run a local HTTP server (such as Vite, Live Server, or Python http.server) to deliver files over http://localhost with accurate MIME types and HTTP headers.',
        ],
        callout: { kind: 'why', text: 'Local HTTP serving replicates real production conditions, avoiding silent browser security blocks.' },
      },
    ],
  },
  {
    topicId: 'elements-attributes',
    objective: 'Read and write elements with attributes, and tell content from configuration.',
    takeaways: [
      'Elements consist of tags, content, and optional configuration attributes.',
      'Void elements do not have closing tags or inner children (e.g. <img>, <br>, <input>).',
      'Attributes are name="value" pairs located exclusively inside the opening tag.',
      'id values must be globally unique within the document; use class for reusable styling and grouping.',
    ],
    terms: {
      element: {
        term: 'Element',
        definition: 'A complete structural unit of an HTML document composed of an opening tag, attributes, text content, and a closing tag.',
      },
      voidElement: {
        term: 'Void Element',
        definition: 'An element that cannot contain child nodes or closing tags, such as img, input, or meta.',
      },
      attribute: {
        term: 'Attribute',
        definition: 'A key-value pair written inside an opening tag that configures behavior, accessibility, or identification.',
      },
    },
    a11yNotes: [
      'Duplicate IDs confuse screen readers and assistive technology focus tracking.',
      'Boolean attributes like required or disabled must not be applied if false; their presence alone activates them.',
    ],
    sections: [
      {
        id: 'anatomy-of-an-element',
        heading: 'Anatomy of an element',
        body: [
          'An {{term:element}} is an opening tag, optional content, and a closing tag. Some elements, like <img> and <br>, are {{term:voidElement}}: they have no content and no closing tag.',
          '{{term:attribute}}s live inside the opening tag as name="value" pairs. They configure the element: where a link goes, which class it belongs to, whether a button is disabled.',
        ],
        code: {
          label: 'Elements and attributes',
          code: `<a href="https://example.com" title="Visit the example site">Example</a>
<p class="note" id="tip-1">Save your work often.</p>
<button disabled>Not yet</button>`,
        },
      },
      {
        id: 'global-attributes',
        heading: 'Global attributes',
        body: ['Some attributes work on any element: id (unique on the page), class (reusable grouping), title, lang and hidden. Boolean attributes such as disabled or required are on when present, whatever their value.'],
        callout: { kind: 'mistake', text: 'Reusing the same id on two elements breaks in-page links and scripts. Use class for groups.' },
      },
    ],
  },
  {
    topicId: 'headings-paragraphs',
    objective: 'Outline a page with headings and group text into paragraphs.',
    takeaways: [
      'Headings form an inverted tree outline (h1 to h6) reflecting semantic hierarchy, not visual size.',
      'A page should typically feature exactly one h1 describing its primary topic.',
      'Never skip heading levels (e.g. jumping from h1 directly to h3) to avoid confusing screen readers.',
      'Paragraphs (<p>) represent distinct semantic units of text; extra white spaces are collapsed by default.',
    ],
    terms: {
      headingOutline: {
        term: 'Heading Outline',
        definition: 'The logical hierarchical document structure generated by heading elements from h1 through h6.',
      },
      semanticHierarchy: {
        term: 'Semantic Hierarchy',
        definition: 'The structural organization of content based on meaning, importance, and relationships rather than visual styling.',
      },
    },
    a11yNotes: [
      'Screen readers allow users to skim a page by pressing H to jump between headings in outline order.',
      'Do not use bold text or CSS font-size in place of real heading tags.',
    ],
    sections: [
      {
        id: 'headings-form-an-outline',
        heading: 'Headings form an outline',
        body: [
          'h1 to h6 describe importance and nesting, not size. A page normally has one h1 naming the page, with h2 for major sections and h3 for subsections inside them.',
          'Do not skip levels (h1 straight to h3). Screen-reader users navigate by headings, and a skipped level looks like missing content in the {{term:headingOutline}}.',
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
        id: 'paragraphs',
        heading: 'Paragraphs',
        body: ['A <p> element is one paragraph following the {{term:semanticHierarchy}}. Browsers collapse extra spaces and line breaks in your source, so use separate <p> elements rather than blank lines.'],
        callout: { kind: 'why', text: 'Choose heading levels for meaning, then use CSS (later) to change size.' },
      },
    ],
  },
  {
    topicId: 'text-semantics',
    objective: 'Mark text by what it means: emphasis, importance, keyboard input and quotations.',
    takeaways: [
      'Choose tags based on intended meaning and rhetorical importance rather than default browser styling.',
      '<strong> conveys seriousness or urgency, while <em> denotes spoken stress emphasis.',
      '<kbd> marks user keyboard input, and <code> denotes computer instructions or identifiers.',
      '<blockquote> is reserved for quotations, not general visual indentations.',
    ],
    terms: {
      emphasis: {
        term: 'Stress Emphasis',
        definition: 'Linguistic stress conveyed by <em> that alters the spoken meaning or tone of a sentence.',
      },
      importance: {
        term: 'Semantic Importance',
        definition: 'Substantive seriousness or urgency indicated by <strong>, announced distinctly by assistive software.',
      },
      citation: {
        term: 'Citation',
        definition: 'A reference to a source creative work, publication, or author marked with the <cite> element.',
      },
    },
    a11yNotes: [
      'Screen readers can alter pitch, volume, or inflection when reading <em> and <strong>.',
      'Avoid using purely decorative tags like <b> or <i> when conveying actual semantic importance or stress.',
    ],
    demos: [
      {
        id: 'demo-text-semantics',
        title: 'Semantic Text Formatting',
        files: [
          {
            name: 'index.html',
            content: `<p>To copy files, press <kbd>Ctrl</kbd> + <kbd>C</kbd>.</p>
<p>It is <strong>critical</strong> to save before exiting.</p>
<blockquote>
  <p>First make it work, then make it right.</p>
  <footer>— <cite>Kent Beck</cite></footer>
</blockquote>`,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'meaning-over-appearance',
        heading: 'Meaning over appearance',
        body: [
          '<strong> marks {{term:importance}} and <em> marks stress {{term:emphasis}}. <kbd> marks keyboard input and <code> marks code. They often look bold, italic or monospaced, but the reason to choose them is their meaning.',
        ],
        code: {
          label: 'Semantic inline text',
          code: `<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save.
This step is <strong>important</strong>.</p>`,
        },
      },
      {
        id: 'quotations-and-citations',
        heading: 'Quotations and citations',
        body: ['Use <q> for a short inline quotation and <blockquote> for a longer block. <cite> names the work or person being referenced in a {{term:citation}}.'],
        code: {
          label: 'A block quotation',
          code: `<blockquote>
  <p>Learning never exhausts the mind.</p>
  <footer>— <cite>Leonardo da Vinci</cite></footer>
</blockquote>`,
        },
        callout: { kind: 'mistake', text: 'Using <blockquote> just to indent text. Indentation is a styling job, not a meaning.' },
      },
      {
        id: 'specialized-text-formatting',
        heading: 'Specialized text formatting',
        body: [
          '<mark> highlights text for relevance or reference (like a highlighter pen). <sup> renders superscript for mathematical powers (e.g. 10<sup>2</sup>) or footnotes. <sub> renders subscript for chemical formulas (e.g. H<sub>2</sub>O). <u> represents an unarticulated annotation, such as flagging spelling mistakes.',
        ],
        code: {
          label: 'Highlight, superscripts and subscripts',
          code: `<p>Search result with <mark>highlighted</mark> match.</p>
<p>Water is H<sub>2</sub>O, and 2<sup>3</sup> = 8.</p>
<p>A misspelled <u class="spelling">wrd</u> annotated with u.</p>`,
        },
      },
    ],
  },
  {
    topicId: 'lists',
    objective: 'Choose between unordered and ordered lists and nest list items correctly.',
    takeaways: [
      'Use <ul> for collections where order is immaterial, and <ol> for sequential processes or rankings.',
      '<li> elements must be direct children of <ul> or <ol>; they cannot float standalone.',
      'Nested lists must be placed inside a parent <li>, never directly inside the root <ul> or <ol>.',
      'Assistive tools announce total item counts up front, orienting the listener.',
    ],
    terms: {
      unorderedList: {
        term: 'Unordered List',
        definition: 'A bulleted collection of items (<ul>) where changing item positions does not alter the underlying meaning.',
      },
      orderedList: {
        term: 'Ordered List',
        definition: 'A numbered sequence of items (<ol>) where sequence denotes chronology, priority, or ranking.',
      },
      nestedList: {
        term: 'Nested List',
        definition: 'A sub-list structurally placed inside an li element of a parent list to model hierarchical relationships.',
      },
    },
    a11yNotes: [
      'Screen readers announce "List with X items", enabling efficient scanning and navigation via hotkeys (L / I).',
      'Never use raw dashes, asterisks, or numbers in <p> tags to fake a list, as structure is lost.',
    ],
    sections: [
      {
        id: 'two-kinds-of-list',
        heading: 'Two kinds of list',
        body: [
          'Use {{term:unorderedList}} (<ul>) when order does not matter, and {{term:orderedList}} (<ol>) when it does, such as steps. Each item is an <li>, and <li> must sit directly inside a <ul> or <ol>.',
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
        id: 'nesting',
        heading: 'Nesting',
        body: ['To create a {{term:nestedList}}, place the inner <ul> or <ol> inside an <li>, not as a sibling of the <li> elements.'],
        code: {
          label: 'A nested outline list',
          code: `<ul>
  <li>Fruits
    <ul>
      <li>Apples</li>
      <li>Bananas</li>
    </ul>
  </li>
  <li>Vegetables</li>
</ul>`,
        },
        callout: { kind: 'why', text: 'Screen readers announce "list, 3 items", which helps people understand the shape of the content.' },
      },
    ],
  },
  {
    topicId: 'links',
    objective: 'Create links that go to the right place, open safely, and describe themselves.',
    takeaways: [
      'An <a> tag requires an href attribute to become an actionable, focusable hyperlink.',
      'Href values support absolute URLs, relative file paths, and fragment identifiers (#id).',
      'When using target="_blank", include rel="noopener noreferrer" for security and performance isolation.',
      'Link text must clearly identify destination or action out of context without relying on "click here".',
    ],
    terms: {
      hyperlink: {
        term: 'Hyperlink',
        definition: 'An interactive anchor element (<a>) that connects one web resource or section to another.',
      },
      fragmentIdentifier: {
        term: 'Fragment Identifier',
        definition: 'A URL hash (#id) targeting a specific element with a matching ID attribute on the same page.',
      },
      reverseTabnabbing: {
        term: 'Tabnabbing Protection',
        definition: 'Securing target="_blank" links with rel="noopener noreferrer" so the target tab cannot hijack the window.opener reference.',
      },
    },
    a11yNotes: [
      'Avoid vague phrases like "learn more" or "click here"; describe the target destination clearly.',
      'Screen-reader users frequently list all links on a page in alphabetical order to navigate quickly.',
    ],
    sections: [
      {
        id: 'the-anchor-element',
        heading: 'The anchor element',
        body: [
          'An <a> without href is not a {{term:hyperlink}}. The href can be absolute (https://example.com), relative (about.html) or a {{term:fragmentIdentifier}} (#footer) pointing at an element with a matching id on the same page.',
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
        id: 'opening-in-a-new-tab-safely',
        heading: 'Opening in a new tab, safely',
        body: ['target="_blank" opens a new tab. Pair it with rel="noopener noreferrer" to prevent {{term:reverseTabnabbing}} so the new page cannot access the page that opened it.'],
        callout: { kind: 'mistake', text: 'Link text such as "click here" tells a screen-reader user nothing when links are listed out of context. Describe the destination.' },
      },
    ],
  },
  {
    topicId: 'images',
    objective: 'Embed images with useful alt text, explicit dimensions and, where helpful, a caption.',
    takeaways: [
      'Images require a descriptive alt attribute explaining the informational content.',
      'Decorative images must use an explicit empty alt="" attribute so screen readers skip them.',
      'Always declare width and height to prevent cumulative layout shifts (CLS) while downloading.',
      'Wrap images with <figure> and <figcaption> when providing editorial captions.',
    ],
    terms: {
      altText: {
        term: 'Alternative Text',
        definition: 'A textual description of an image provided via the alt attribute, read by assistive tech and shown if graphics fail.',
      },
      layoutShift: {
        term: 'Layout Shift',
        definition: 'Unintended page content repositioning that occurs when images load without declared width and height dimensions.',
      },
      figure: {
        term: 'Figure and Caption',
        definition: 'A self-contained media element (<figure>) associated with an explanatory description (<figcaption>).',
      },
    },
    a11yNotes: [
      'Do not include "picture of" or "image of" in alt text; assistive software already announces the graphic role.',
      'Complex diagrams should link to or include full textual transcripts.',
    ],
    sections: [
      {
        id: 'the-img-element',
        heading: 'The img element',
        body: [
          '<img> is void and needs src (where the image is) and alt (a text alternative). {{term:altText}} should convey what the image is for, not "image of". If an image is purely decorative, use alt="" so assistive technology skips it.',
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
        id: 'width-and-height',
        heading: 'Width and height',
        body: ['Setting width and height attributes lets the browser reserve space before the image loads, preventing jarring {{term:layoutShift}}.'],
        callout: { kind: 'why', text: 'Alt text also appears when an image fails to load, and search engines read it.' },
      },
    ],
  },
  {
    topicId: 'media-elements',
    objective: 'Embed native audio and video with fallback sources, controls and accessible subtitles.',
    takeaways: [
      '<audio> and <video> provide built-in media playback without third-party plugins.',
      'Always include the controls attribute so users can play, pause, and adjust volume.',
      'Provide multiple <source> elements so browsers pick the best supported format.',
      'Always include fallback text inside the media element for older user agents.',
      '<track kind="subtitles"> provides essential captions and subtitles for accessibility.',
    ],
    terms: {
      mediaControls: {
        term: 'Media Controls',
        definition: 'Native browser interface buttons (play, pause, volume, scrubbing) enabled via the controls boolean attribute.',
      },
      mediaFallback: {
        term: 'Media Fallback',
        definition: 'Text content placed inside audio or video tags that only renders if the browser does not support the element.',
      },
      textTrack: {
        term: 'Text Track',
        definition: 'Timed subtitle, caption, or description files linked via the <track> tag in WebVTT format.',
      },
    },
    a11yNotes: [
      'Never autoplay media with audio enabled; unexpected sound disorients screen reader users.',
      'Always provide closed captions or subtitles via <track> for pre-recorded video containing speech.',
    ],
    demos: [
      {
        id: 'demo-media',
        title: 'Embedded Audio and Video',
        files: [
          {
            name: 'index.html',
            content: `<figure>
  <audio controls>
    <source src="podcast.mp3" type="audio/mpeg">
    Your browser does not support native audio.
  </audio>
  <figcaption>Episode 1: Semantic HTML</figcaption>
</figure>`,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'audio-and-video-elements',
        heading: 'Audio and video elements',
        body: [
          'HTML5 {{term:mediaControls}} let users play audio and video natively. Use <audio> for sound clips and <video> for movies or animations. Adding the boolean controls attribute displays play/pause, volume, and seeking controls.',
        ],
        code: {
          label: 'Audio with controls and fallback',
          code: `<audio controls>
  <source src="audio.mp3" type="audio/mpeg">
  <source src="audio.ogg" type="audio/ogg">
  Your browser does not support the audio element.
</audio>`,
        },
      },
      {
        id: 'video-sources-and-tracks',
        heading: 'Video sources and captions',
        body: [
          '<video> supports multiple <source> tags with type attributes (e.g. video/mp4, video/webm). For accessibility, link WebVTT subtitles or captions using a <track> element with kind="subtitles" or kind="captions", srclang, and label.',
        ],
        code: {
          label: 'Video with captions and poster',
          code: `<video controls width="640" height="360" poster="thumb.jpg">
  <source src="movie.mp4" type="video/mp4">
  <source src="movie.webm" type="video/webm">
  <track kind="subtitles" src="subtitles_en.vtt" srclang="en" label="English">
  Your browser does not support HTML5 video.
</video>`,
        },
        callout: { kind: 'why', text: 'Captions are required for deaf or hard-of-hearing users, and help anyone watching in noisy environments.' },
      },
    ],
  },
  {
    topicId: 'tables',
    objective: 'Mark up tabular data with captions, header cells and body rows.',
    takeaways: [
      'Tables present 2-dimensional tabular data; they must never be utilized for layout structure.',
      '<caption> provides a mandatory descriptive title identifying the dataset.',
      'Use <th> for column/row headers with an explicit scope="col" or scope="row" attribute.',
      'Group logical sections with <thead>, <tbody>, and optionally <tfoot>.',
    ],
    terms: {
      tabularData: {
        term: 'Tabular Data',
        definition: 'Information naturally organized into corresponding rows and columns where relationships cross along both axes.',
      },
      tableScope: {
        term: 'Header Scope',
        definition: 'The scope attribute on <th> designating whether the header applies to an entire column or row.',
      },
      tableCaption: {
        term: 'Table Caption',
        definition: 'An accessible heading (<caption>) placed directly after the opening <table> tag summarizing the table content.',
      },
    },
    a11yNotes: [
      'Screen readers use <th> and scope to announce header names before reading data cell contents as users navigate cells.',
      'Never leave header cells blank or rely on visual bolding inside standard <td> tags.',
    ],
    sections: [
      {
        id: 'table-structure',
        heading: 'Table structure',
        body: [
          'A table has rows (<tr>) made of header cells (<th>) and data cells (<td>). A {{term:tableCaption}} names the table; <thead> and <tbody> group the rows. The {{term:tableScope}} attribute on <th> says whether a header labels a column or a row.',
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
        id: 'when-to-use-a-table',
        heading: 'When to use a table',
        body: ['Use tables for {{term:tabularData}} that has rows and columns, not to position things on the page.'],
        callout: { kind: 'mistake', text: 'Building page layouts out of tables. That is what CSS layout is for.' },
      },
      {
        id: 'spanning-rows-and-columns',
        heading: 'Spanning rows and columns',
        body: [
          'Table cells can span across multiple columns with colspan="n" or across multiple rows with rowspan="n". When cells span, the subsequent rows or columns omit the spanned positions to preserve a rectangular grid.',
        ],
        code: {
          label: 'Table with cell spans',
          code: `<table>
  <caption>Team Schedule</caption>
  <thead>
    <tr>
      <th scope="col">Member</th>
      <th scope="col" colspan="2">Availability</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row" rowspan="2">Alice</th>
      <td>Mon: 9am - 1pm</td>
      <td>Wed: 1pm - 5pm</td>
    </tr>
    <tr>
      <td colspan="2">Fri: On-call full day</td>
    </tr>
  </tbody>
</table>`,
        },
      },
    ],
  },
  {
    topicId: 'forms',
    objective: 'Build a form whose controls are labelled, typed and validated by the browser.',
    takeaways: [
      'Every interactive input requires an associated <label> explicitly linked with for and id.',
      'Native input types (email, number, tel, date) provide optimized mobile keypads and built-in validation.',
      'The required attribute prevents submission if the field is omitted.',
      'Placeholders disappear on typing and cannot substitute for accessible labels.',
    ],
    terms: {
      formControl: {
        term: 'Form Control',
        definition: 'An interactive user-input element like input, select, textarea, or button that accepts user data.',
      },
      inputValidation: {
        term: 'Browser Validation',
        definition: 'Built-in client-side constraints (required, type, min, pattern) evaluated by the browser prior to submit.',
      },
      formLabel: {
        term: 'Form Label',
        definition: 'A label element associated with a control that announces its purpose and expands the click/touch target.',
      },
    },
    a11yNotes: [
      'Unlabelled form fields are invisible or ambiguous to screen reader users.',
      'Clicking a label moves focus directly to the associated input, aiding users with fine motor tremors.',
    ],
    demos: [
      {
        id: 'demo-forms',
        title: 'Accessible Form with Native Validation',
        files: [
          {
            name: 'index.html',
            content: `<form action="#" method="post">
  <p>
    <label for="user-email">Email Address:</label><br>
    <input id="user-email" name="email" type="email" required placeholder="you@domain.com">
  </p>
  <button type="submit">Submit Feedback</button>
</form>`,
          },
        ],
      },
    ],
    sections: [
      {
        id: 'controls-and-labels',
        heading: 'Controls and labels',
        body: [
          '<form> wraps {{term:formControl}}s. Each control needs a {{term:formLabel}}: either with for matching the control id, or wrapping the control. The label is the name a screen reader reads and also enlarges the click target.',
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
        id: 'input-types-and-validation',
        heading: 'Input types and validation',
        body: ['type="email", number, date and others give the right keyboard on phones and built-in {{term:inputValidation}}. required blocks submission when empty. A placeholder is a hint, not a replacement for a label.'],
        callout: { kind: 'mistake', text: 'Relying on placeholder text as the only label: it disappears while typing and is not reliably announced.' },
      },
      {
        id: 'advanced-controls-and-constraints',
        heading: 'Choice controls and pattern constraints',
        body: [
          'Beyond text and email, forms support radio buttons (type="radio") sharing a name for single choices, checkboxes (type="checkbox") for multi-selection, dropdown menus (<select> with <option>), telephone numbers (type="tel"), and file pickers (type="file"). Native validation attributes like pattern (a regex), minlength, and maxlength enforce format and length constraints in the browser.',
        ],
        code: {
          label: 'Rich controls with validation',
          code: `<form action="#" method="post">
  <fieldset>
    <legend>Subscription</legend>
    <label><input type="radio" name="plan" value="monthly" checked> Monthly</label>
    <label><input type="radio" name="plan" value="annual"> Annual</label>
  </fieldset>
  <label for="country">Country</label>
  <select id="country" name="country">
    <option value="us">United States</option>
    <option value="uk">United Kingdom</option>
  </select>
  <label for="phone">Phone Number</label>
  <input id="phone" name="phone" type="tel" pattern="[0-9]{10}">
  <label for="code">Promo Code</label>
  <input id="code" name="code" type="text" minlength="4" maxlength="12">
</form>`,
        },
      },
    ],
  },
  {
    topicId: 'semantic-layout',
    objective: 'Split a page into meaningful regions using landmark elements instead of anonymous divs.',
    takeaways: [
      'Landmark elements partition documents into discernible, traversable structural regions.',
      '<header> contains introductory banners, while <footer> encapsulates attribution and colophons.',
      '<nav> identifies primary site links; <main> contains central content unique to this document.',
      '<article> denotes self-contained syndicated content; <section> groups thematic subsections.',
    ],
    terms: {
      landmark: {
        term: 'Landmark Element',
        definition: 'A structural HTML tag (header, nav, main, aside, footer) that exposes an accessible navigation region.',
      },
      mainLandmark: {
        term: 'Main Landmark',
        definition: 'The primary central content element (<main>), strictly limited to one visible instance per web document.',
      },
      genericContainer: {
        term: 'Generic Container',
        definition: 'A non-semantic wrapper tag (<div> or <span>) that conveys no intrinsic meaning and serves solely for styling.',
      },
    },
    a11yNotes: [
      'Screen-reader users can press landmark navigation hotkeys (D) to jump past headers straight to <main>.',
      'Never wrap navigation menus in generic divs when <nav> accurately conveys the role.',
    ],
    sections: [
      {
        id: 'landmarks',
        heading: 'Landmarks',
        body: [
          '<header> introduces a page or section, <nav> holds major navigation links, <main> holds the page’s primary content (once per page), <section> and <article> group related content, and <footer> closes a page or section. These constitute primary {{term:landmark}}s.',
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
        id: 'why-not-just-div',
        heading: 'Why not just div?',
        body: ['A <div> is merely a {{term:genericContainer}} carrying no meaning. Landmarks let keyboard and screen-reader users jump directly to navigation or the {{term:mainLandmark}}.'],
        callout: { kind: 'why', text: 'Use div only when no element describes the content, usually as a styling hook.' },
      },
    ],
  },
  {
    topicId: 'accessibility',
    objective: 'Apply the four HTML habits that remove most accessibility barriers.',
    takeaways: [
      'Habit 1: Always specify lang on <html> so text-to-speech tools invoke correct voice engines.',
      'Habit 2: Always provide descriptive alt text for informative graphics and alt="" for decorative art.',
      'Habit 3: Explicitly associate form controls with descriptive <label> tags.',
      'Habit 4: Maintain heading order (h1 -> h2 -> h3) without skipping hierarchy levels.',
    ],
    terms: {
      accessibility: {
        term: 'Accessibility (a11y)',
        definition: 'The practice of making digital products usable by everyone, including people with visual, motor, auditory, or cognitive disabilities.',
      },
      screenReader: {
        term: 'Screen Reader',
        definition: 'Assistive software that converts on-screen text and structural markup into synthesized speech or braille output.',
      },
      keyboardNavigation: {
        term: 'Keyboard Navigation',
        definition: 'The ability to operate all links, buttons, and forms using Tab, Shift+Tab, Enter, Space, and Arrow keys.',
      },
    },
    a11yNotes: [
      'Native semantic HTML gives you free keyboard accessibility and proper ARIA roles out of the box.',
      'Never remove CSS outline: none unless an alternate high-contrast focus indicator is provided.',
    ],
    sections: [
      {
        id: 'four-habits',
        heading: 'Four habits',
        body: [
          'Declare the page language with lang. Give every informative image alt text. Label every form control. Keep heading levels in order. These four habits remove the majority of {{term:accessibility}} barriers for {{term:screenReader}} users.',
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
        id: 'descriptive-links',
        heading: 'Descriptive links',
        body: ['Link text should make sense on its own during {{term:keyboardNavigation}}. "Read the installation guide" beats "click here".'],
        callout: { kind: 'why', text: 'Native HTML elements already include keyboard support and roles. Prefer them to custom replacements.' },
      },
    ],
  },
  {
    topicId: 'putting-together',
    objective: 'Combine what you know into one coherent, semantic page.',
    takeaways: [
      'A production web page integrates skeleton, landmarks, hierarchy, semantics, and accessible links.',
      'Review document structure without styling to evaluate semantic clarity and information flow.',
      'Validate that every visual element communicates its equivalent purpose to non-visual users.',
      'Organize code cleanly with proper indentation to aid ongoing team maintenance.',
    ],
    terms: {
      documentAudit: {
        term: 'Document Audit',
        definition: 'Evaluating a web document outline using accessibility trees and browser developer tools to verify compliance.',
      },
      semanticMarkup: {
        term: 'Semantic Markup',
        definition: 'HTML code where elements are selected solely for their linguistic and categorical meaning rather than visual presentation.',
      },
    },
    a11yNotes: [
      'Test your pages with keyboard only (Tab / Shift+Tab) to verify all interactive elements are reachable.',
      'Turn off stylesheets momentarily; if the document reads like a clear, coherent report, semantics are solid.',
    ],
    sections: [
      {
        id: 'a-small-page-end-to-end',
        heading: 'A small page, end to end',
        body: [
          'Start from the skeleton, add a header with navigation, put the content inside main with a single h1, add a list and an image with alt text, and close with a footer. Combine your knowledge into cohesive {{term:semanticMarkup}}.',
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
        id: 'check-your-work',
        heading: 'Check your work',
        body: ['Perform a comprehensive {{term:documentAudit}}: could someone understand the page using only headings, landmarks, link text and alt text?'],
        callout: { kind: 'why', text: 'If the outline makes sense without the visuals, your markup is doing its job.' },
      },
    ],
  },
]

export const getLesson = (topicId: string): Lesson | undefined => {
  const l = lessons.find((x) => x.topicId === topicId)
  if (l) return l
  for (const track of getTracks()) {
    const found = track.lessons[topicId]
    if (found) return found
  }
  return undefined
}
