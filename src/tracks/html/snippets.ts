/**
 * HTML Snippet Library (Stage 06, 6.9).
 * Pre-authored accessible semantic patterns for insertion into the editor.
 */

export interface Snippet {
  id: string
  title: string
  description: string
  code: string
}

export const HTML_SNIPPETS: Snippet[] = [
  {
    id: 'snip-boilerplate',
    title: 'HTML5 Boilerplate',
    description: 'Standard document shell with doctype, meta charset, viewport, and title.',
    code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  
</body>
</html>`,
  },
  {
    id: 'snip-semantic-page',
    title: 'Semantic Page Layout',
    description: 'Header, nav, main with article, and footer landmarks.',
    code: `<header>
  <h1>Site Title</h1>
  <nav aria-label="Main">
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#about">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h2>Article Heading</h2>
    <p>Content goes here...</p>
  </article>
</main>
<footer>
  <p>&copy; 2026 CodeOrbit</p>
</footer>`,
  },
  {
    id: 'snip-form',
    title: 'Accessible Form',
    description: 'Form with explicit label associations, required attributes, and submit button.',
    code: `<form action="/submit" method="post">
  <div>
    <label for="user-email">Email Address</label>
    <input type="email" id="user-email" name="email" required>
  </div>
  <div>
    <label for="user-msg">Message</label>
    <textarea id="user-msg" name="message" rows="4"></textarea>
  </div>
  <button type="submit">Send Message</button>
</form>`,
  },
  {
    id: 'snip-table',
    title: 'Accessible Data Table',
    description: 'Table with caption, thead, th with scope="col", and tbody.',
    code: `<table>
  <caption>Quarterly Performance Overview</caption>
  <thead>
    <tr>
      <th scope="col">Quarter</th>
      <th scope="col">Revenue</th>
      <th scope="col">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Q1</th>
      <td>$12,000</td>
      <td>+14%</td>
    </tr>
  </tbody>
</table>`,
  },
  {
    id: 'snip-figure',
    title: 'Figure with Caption',
    description: 'Image with descriptive alt text and associated figcaption.',
    code: `<figure>
  <img src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='%236366f1'/></svg>" alt="Diagram illustrating CSS box model layers">
  <figcaption>Figure 1: The standard CSS box model geometry.</figcaption>
</figure>`,
  },
]
