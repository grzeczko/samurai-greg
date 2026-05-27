import { resumeLinks } from './data/resumeData.js';

const SITE_URL = 'https://rzeczko.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/samurai-greg-og.png`;
const DEFAULT_TITLE = 'Samurai Greg and the Quest for the Golden Resume | Interactive Software Engineer Portfolio';
const DEFAULT_DESCRIPTION = 'Interactive samurai-themed resume game by Gregory Rzeczko, a full-stack software engineer. Explore a React, Phaser, and Laravel portfolio with boss battles, resume power-ups, and a Hall of Fame leaderboard.';

const routeMeta = {
  '/': {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    type: 'website',
    keywords: [
      'interactive resume',
      'playable portfolio',
      'software engineer portfolio',
      'React Phaser portfolio',
      'gamified resume',
      'Phaser game portfolio',
      'interactive developer portfolio',
      'creative software engineer portfolio',
      'React Laravel portfolio',
      'Samurai Greg',
      'samurai resume game'
    ]
  },
  '/home': {
    title: 'Gregory Rzeczko | Software Engineer Portfolio Gateway',
    description: 'Entry point to Samurai Greg, an interactive software engineer portfolio experience built with React, Phaser, and Laravel.',
    path: '/home',
    type: 'website'
  },
  '/resume': {
    title: 'Gregory Rzeczko Resume | Senior Software Engineer and Architect',
    description: 'Resume of Gregory Rzeczko, a senior software engineer and architect with React, Laravel, cloud, AI, and full-stack delivery experience.',
    path: '/resume',
    type: 'profile'
  },
  '/contact': {
    title: 'Contact Gregory Rzeczko | Interactive Portfolio',
    description: 'Contact Gregory Rzeczko about software engineering, architecture leadership, product builds, and full-stack collaborations.',
    path: '/contact',
    type: 'website'
  }
};

function absoluteUrl(path = '/') {
  if (!path || path === '/') {
    return SITE_URL;
  }

  return `${SITE_URL}${path}`;
}

function setMeta(name, content, attribute = 'name') {
  let tag = document.head.querySelector(`meta[${attribute}="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);

  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute('href', href);
}

function buildStructuredData(meta) {
  const pageUrl = absoluteUrl(meta.path);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${SITE_URL}#person`,
        name: 'Gregory Rzeczko',
        alternateName: 'Samurai Greg',
        jobTitle: 'Software Engineer',
        description: DEFAULT_DESCRIPTION,
        url: SITE_URL,
        image: DEFAULT_OG_IMAGE,
        sameAs: [resumeLinks.github, resumeLinks.linkedIn, resumeLinks.stackOverflow],
        homeLocation: {
          '@type': 'Place',
          name: 'Nashville, TN'
        },
        knowsAbout: [
          'Full-stack engineering',
          'React',
          'Phaser',
          'Laravel',
          'JavaScript',
          'Cloud architecture',
          'Game-inspired portfolio design'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'Rzeczko.com',
        description: DEFAULT_DESCRIPTION,
        publisher: {
          '@id': `${SITE_URL}#person`
        }
      },
      {
        '@type': 'CreativeWork',
        '@id': `${pageUrl}#creativework`,
        url: pageUrl,
        name: meta.title,
        description: meta.description,
        creator: {
          '@id': `${SITE_URL}#person`
        },
        genre: ['Interactive resume', 'Playable portfolio', 'Software engineer portfolio'],
        keywords: meta.keywords ?? routeMeta['/'].keywords,
        image: DEFAULT_OG_IMAGE,
        isPartOf: {
          '@id': `${SITE_URL}#website`
        }
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}#app`,
        name: 'Samurai Greg and the Quest for the Golden Resume',
        applicationCategory: 'PortfolioApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        image: DEFAULT_OG_IMAGE,
        description: 'A cinematic interactive portfolio game built with React, Phaser, and Laravel featuring resume power-ups, boss battles, and a Hall of Fame leaderboard.',
        author: {
          '@id': `${SITE_URL}#person`
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        softwareRequirements: 'JavaScript enabled browser',
        creator: {
          '@id': `${SITE_URL}#person`
        }
      }
    ]
  };
}

export function applySeoForRoute(pathname) {
  const meta = routeMeta[pathname] ?? routeMeta['/'];
  const url = absoluteUrl(meta.path);

  document.title = meta.title;

  setMeta('description', meta.description);
  setMeta('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
  setMeta('keywords', (meta.keywords ?? routeMeta['/'].keywords).join(', '));
  setMeta('og:title', meta.title, 'property');
  setMeta('og:description', meta.description, 'property');
  setMeta('og:image', DEFAULT_OG_IMAGE, 'property');
  setMeta('og:image:alt', 'Samurai Greg interactive resume game preview', 'property');
  setMeta('og:type', meta.type, 'property');
  setMeta('og:url', url, 'property');
  setMeta('og:site_name', 'Rzeczko.com', 'property');
  setMeta('twitter:card', 'summary_large_image');
  setMeta('twitter:title', meta.title);
  setMeta('twitter:description', meta.description);
  setMeta('twitter:image', DEFAULT_OG_IMAGE);
  setMeta('twitter:image:alt', 'Samurai Greg interactive resume game preview');
  setLink('canonical', url);

  let structuredDataScript = document.head.querySelector('script[data-seo="structured-data"]');

  if (!structuredDataScript) {
    structuredDataScript = document.createElement('script');
    structuredDataScript.type = 'application/ld+json';
    structuredDataScript.dataset.seo = 'structured-data';
    document.head.appendChild(structuredDataScript);
  }

  structuredDataScript.textContent = JSON.stringify(buildStructuredData(meta));
}