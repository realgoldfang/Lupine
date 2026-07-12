import { XMLParser } from 'fast-xml-parser';

const PC20_NS = 'https://podcastindex.org/namespace/1.0';
const ITUNES_NS = 'http://www.itunes.com/dtds/podcast-1.0.dtd';

export interface PodcastPerson {
  name: string;
  role?: string;
  group?: string;
  img?: string;
  href?: string;
}

export interface PodcastLocation {
  text: string;
  rel?: string;
  geo?: string;
  osm?: string;
  country?: string;
}

export interface PodcastTranscript {
  url: string;
  type: string;
  language?: string;
  rel?: string;
}

export interface PodcastChapters {
  url: string;
  type: string;
}

export interface PodcastSoundbite {
  startTime: number;
  duration: number;
  title?: string;
}

export interface PodcastValueRecipient {
  name?: string;
  type?: string;
  address: string;
  split: number;
  fee?: boolean;
}

export interface PodcastValue {
  type: string;
  method: string;
  suggested?: string;
  recipients: PodcastValueRecipient[];
}

export interface PodcastAlternateEnclosure {
  type: string;
  length?: number;
  bitrate?: number;
  height?: number;
  lang?: string;
  title?: string;
  rel?: string;
  codecs?: string;
  default?: boolean;
  sources: { uri: string; contentType?: string }[];
  integrity?: { type: string; value: string };
}

export interface PodcastSocialInteract {
  uri: string;
  protocol: string;
  accountId?: string;
  accountUrl?: string;
  priority?: number;
}

export interface PodcastEpisode {
  title: string;
  description?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  author?: string;
  duration?: number;
  enclosure?: { url: string; length: number; type: string };
  image?: string;
  season?: { number: number; name?: string };
  episode?: number;
  explicit?: boolean;
  // PC20 tags
  transcripts: PodcastTranscript[];
  chapters?: PodcastChapters;
  soundbites: PodcastSoundbite[];
  persons: PodcastPerson[];
  locations: PodcastLocation[];
  value?: PodcastValue;
  alternateEnclosures: PodcastAlternateEnclosure[];
  socialInteracts: PodcastSocialInteract[];
  trailer?: { pubDate: string; url: string; length: number; type: string; text?: string };
  liveItem?: {
    status: string;
    start?: string;
    end?: string;
    title?: string;
    description?: string;
    link?: string;
    guid?: string;
  };
  contentLinks?: { href: string; text?: string }[];
  txt?: { purpose?: string; content: string }[];
}

export interface PodcastFeed {
  title: string;
  description?: string;
  link?: string;
  language?: string;
  copyright?: string;
  author?: string;
  image?: string;
  lastBuildDate?: string;
  // PC20 tags
  guid?: string;
  locked?: { owner: string; locked: boolean };
  funding?: { url: string; text: string }[];
  location?: PodcastLocation;
  medium?: string;
  persons: PodcastPerson[];
  value?: PodcastValue;
  trailer?: PodcastEpisode['trailer'];
  block?: { platform?: string; blocked: boolean }[];
  podroll?: { feedGuid: string; feedUrl: string; title?: string }[];
  updateFrequency?: string;
  podping?: boolean;
  chat?: { server: string; protocol: string; accountId?: string; space?: string }[];
  publisher?: { feedGuid: string; feedUrl: string }[];
  images?: { href: string; purpose?: string }[];
  // Episodes
  episodes: PodcastEpisode[];
}

function getNS(obj: any, ns: string, tag: string): any {
  const key = `${ns}||${tag}`;
  return obj?.[key] ?? obj?.[tag];
}

function parsePersons(item: any): PodcastPerson[] {
  const raw = item?.[`${PC20_NS}||person`] ?? item?.person;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((p: Record<string, any>) => ({
    name: typeof p === 'string' ? p : p['#text'] || p['@_text'] || '',
    role: p?.['@_role'] || p?.role,
    group: p?.['@_group'] || p?.group,
    img: p?.['@_img'] || p?.img,
    href: p?.['@_href'] || p?.href,
  }));
}

function parseLocations(item: any): PodcastLocation[] {
  const raw = item?.[`${PC20_NS}||location`] ?? item?.location;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((l: any) => ({
    text: typeof l === 'string' ? l : l['#text'] || l['@_text'] || '',
    rel: l?.['@_rel'] || l?.rel,
    geo: l?.['@_geo'] || l?.geo,
    osm: l?.['@_osm'] || l?.osm,
    country: l?.['@_country'] || l?.country,
  }));
}

function parseTranscripts(item: any): PodcastTranscript[] {
  const raw = item?.[`${PC20_NS}||transcript`] ?? item?.transcript;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((t: any) => ({
    url: t?.['@_url'] || t?.url || '',
    type: t?.['@_type'] || t?.type || '',
    language: t?.['@_language'] || t?.language,
    rel: t?.['@_rel'] || t?.rel,
  }));
}

function parseSoundbites(item: any): PodcastSoundbite[] {
  const raw = item?.[`${PC20_NS}||soundbite`] ?? item?.soundbite;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((s: any) => ({
    startTime: parseFloat(s?.['@_startTime'] || s?.startTime || '0'),
    duration: parseFloat(s?.['@_duration'] || s?.duration || '0'),
    title: typeof s === 'string' ? s : s['#text'] || s['@_text'] || undefined,
  }));
}

function parseValue(item: any): PodcastValue | undefined {
  const raw = item?.[`${PC20_NS}||value`] ?? item?.value;
  if (!raw) return undefined;
  const val = Array.isArray(raw) ? raw[0] : raw;
  const recipientRaw = val?.[`${PC20_NS}||valueRecipient`] ?? val?.valueRecipient;
  const recipients = recipientRaw
    ? (Array.isArray(recipientRaw) ? recipientRaw : [recipientRaw]).map((r: any) => ({
        name: r?.['@_name'] || r?.name,
        type: r?.['@_type'] || r?.type,
        address: r?.['@_address'] || r?.address || '',
        split: parseInt(r?.['@_split'] || r?.split || '0', 10),
        fee: r?.['@_fee'] === 'true' || r?.fee === true,
      }))
    : [];
  return {
    type: val?.['@_type'] || val?.type || '',
    method: val?.['@_method'] || val?.method || '',
    suggested: val?.['@_suggested'] || val?.suggested,
    recipients,
  };
}

function parseAlternateEnclosures(item: any): PodcastAlternateEnclosure[] {
  const raw = item?.[`${PC20_NS}||alternateEnclosure`] ?? item?.alternateEnclosure;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((a: any) => {
    const sourceRaw = a?.[`${PC20_NS}||source`] ?? a?.source;
    const sources = sourceRaw
      ? (Array.isArray(sourceRaw) ? sourceRaw : [sourceRaw]).map((s: any) => ({
          uri: s?.['@_uri'] || s?.uri || '',
          contentType: s?.['@_contentType'] || s?.contentType,
        }))
      : [];
    const integrityRaw = a?.[`${PC20_NS}||integrity`] ?? a?.integrity;
    const integrity = integrityRaw
      ? { type: integrityRaw['@_type'] || '', value: integrityRaw['@_value'] || '' }
      : undefined;
    return {
      type: a?.['@_type'] || a?.type || '',
      length: parseInt(a?.['@_length'] || a?.length || '0', 10) || undefined,
      bitrate: parseFloat(a?.['@_bitrate'] || a?.bitrate || '0') || undefined,
      height: parseInt(a?.['@_height'] || a?.height || '0', 10) || undefined,
      lang: a?.['@_lang'] || a?.lang,
      title: a?.['@_title'] || a?.title,
      rel: a?.['@_rel'] || a?.rel,
      codecs: a?.['@_codecs'] || a?.codecs,
      default: a?.['@_default'] === 'true' || a?.default === true,
      sources,
      integrity,
    };
  });
}

function parseSocialInteracts(item: any): PodcastSocialInteract[] {
  const raw = item?.[`${PC20_NS}||socialInteract`] ?? item?.socialInteract;
  if (!raw) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  return arr.map((s: any) => ({
    uri: s?.['@_uri'] || s?.uri || '',
    protocol: s?.['@_protocol'] || s?.protocol || '',
    accountId: s?.['@_accountId'] || s?.accountId,
    accountUrl: s?.['@_accountUrl'] || s?.accountUrl,
    priority: parseInt(s?.['@_priority'] || s?.priority || '0', 10) || undefined,
  }));
}

function parseEpisode(item: any): PodcastEpisode {
  const enclosureRaw = item?.enclosure;
  const enclosure = enclosureRaw
    ? {
        url: enclosureRaw['@_url'] || enclosureRaw.url || '',
        length: parseInt(enclosureRaw['@_length'] || enclosureRaw.length || '0', 10),
        type: enclosureRaw['@_type'] || enclosureRaw.type || '',
      }
    : undefined;

  const imageRaw = item?.[`${ITUNES_NS}||image`]?.['@_href']
    || item?.image?.url
    || item?.image;

  const trailerRaw = item?.[`${PC20_NS}||trailer`] ?? item?.trailer;
  const trailer = trailerRaw
    ? {
        pubDate: trailerRaw['@_pubdate'] || trailerRaw.pubDate || '',
        url: trailerRaw['@_url'] || trailerRaw.url || '',
        length: parseInt(trailerRaw['@_length'] || trailerRaw.length || '0', 10),
        type: trailerRaw['@_type'] || trailerRaw.type || '',
        text: typeof trailerRaw === 'string' ? trailerRaw : trailerRaw['#text'] || '',
      }
    : undefined;

  const liveItemRaw = item?.[`${PC20_NS}||liveItem`] ?? item?.liveItem;

  const seasonRaw = item?.[`${PC20_NS}||season`] ?? item?.season;
  const season = seasonRaw
    ? {
        number: parseInt(typeof seasonRaw === 'string' ? seasonRaw : seasonRaw['#text'] || '0', 10),
        name: seasonRaw?.['@_name'] || seasonRaw?.name,
      }
    : undefined;

  const episodeNum = item?.[`${PC20_NS}||episode`] ?? item?.episode;

  const contentLinksRaw = item?.[`${PC20_NS}||contentLink`] ?? item?.contentLink;
  const contentLinks = contentLinksRaw
    ? (Array.isArray(contentLinksRaw) ? contentLinksRaw : [contentLinksRaw]).map((c: any) => ({
        href: c?.['@_href'] || c?.href || '',
        text: typeof c === 'string' ? c : c['#text'] || '',
      }))
    : [];

  const txtRaw = item?.[`${PC20_NS}||txt`] ?? item?.txt;
  const txt = txtRaw
    ? (Array.isArray(txtRaw) ? txtRaw : [txtRaw]).map((t: any) => ({
        purpose: t?.['@_purpose'] || t?.purpose,
        content: typeof t === 'string' ? t : t['#text'] || '',
      }))
    : [];

  return {
    title: item?.title || '',
    description: item?.description || item?.['itunes:summary'] || undefined,
    link: item?.link || undefined,
    guid: item?.guid?.['#text'] || item?.guid || undefined,
    pubDate: item?.pubDate || undefined,
    author: item?.author || item?.['itunes:author'] || undefined,
    duration: item?.['itunes:duration'] ? parseDuration(item['itunes:duration']) : undefined,
    enclosure,
    image: imageRaw,
    season,
    episode: episodeNum ? parseInt(typeof episodeNum === 'string' ? episodeNum : episodeNum['#text'] || '0', 10) : undefined,
    explicit: item?.['itunes:explicit'] === 'true',
    transcripts: parseTranscripts(item),
    chapters: (() => {
      const raw = item?.[`${PC20_NS}||chapters`] ?? item?.chapters;
      return raw ? { url: raw['@_url'] || '', type: raw['@_type'] || '' } : undefined;
    })(),
    soundbites: parseSoundbites(item),
    persons: parsePersons(item),
    locations: parseLocations(item),
    value: parseValue(item),
    alternateEnclosures: parseAlternateEnclosures(item),
    socialInteracts: parseSocialInteracts(item),
    trailer,
    liveItem: liveItemRaw
      ? {
          status: liveItemRaw['@_status'] || '',
          start: liveItemRaw['@_start'],
          end: liveItemRaw['@_end'],
          title: liveItemRaw.title,
          description: liveItemRaw.description,
          link: liveItemRaw.link,
          guid: liveItemRaw.guid?.['#text'] || liveItemRaw.guid,
        }
      : undefined,
    contentLinks,
    txt,
  };
}

function parseDuration(dur: string | number): number {
  if (typeof dur === 'number') return dur;
  // Handle HH:MM:SS or MM:SS
  const parts = dur.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(dur, 10) || 0;
}

export function parsePodcastFeed(xml: string): PodcastFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    isArray: (name) => {
      return [
        'item', 'podcast:person', 'podcast:location', 'podcast:transcript',
        'podcast:soundbite', 'podcast:valueRecipient', 'podcast:alternateEnclosure',
        'podcast:source', 'podcast:socialInteract', 'podcast:funding',
        'podcast:podroll', 'podcast:block', 'podcast:chat', 'podcast:publisher',
        'podcast:image', 'podcast:txt', 'podcast:contentLink',
      ].includes(name);
    },
  });

  const result = parser.parse(xml);
  const channel = result?.rss?.channel;
  if (!channel) throw new Error('Invalid podcast feed: no channel found');

  const imageRaw = channel?.[`${ITUNES_NS}||image`]?.['@_href']
    || channel?.image?.url
    || channel?.image;

  const persons = parsePersons(channel);

  const fundingRaw = channel?.[`${PC20_NS}||funding`] ?? channel?.funding;
  const funding = fundingRaw
    ? (Array.isArray(fundingRaw) ? fundingRaw : [fundingRaw]).map((f: any) => ({
        url: f?.['@_url'] || f?.url || '',
        text: typeof f === 'string' ? f : f['#text'] || '',
      }))
    : [];

  const lockedRaw = channel?.[`${PC20_NS}||locked`] ?? channel?.locked;
  const locked = lockedRaw
    ? {
        owner: lockedRaw['@_owner'] || lockedRaw.owner || '',
        locked: (typeof lockedRaw === 'string' ? lockedRaw : lockedRaw['#text'] || '') === 'yes',
      }
    : undefined;

  const blockRaw = channel?.[`${PC20_NS}||block`] ?? channel?.block;
  const block = blockRaw
    ? (Array.isArray(blockRaw) ? blockRaw : [blockRaw]).map((b: any) => ({
        platform: b?.['@_id'] || b?.id,
        blocked: (typeof b === 'string' ? b : b['#text'] || '') === 'yes',
      }))
    : undefined;

  const podrollRaw = channel?.[`${PC20_NS}||podroll`] ?? channel?.podroll;
  const podroll = podrollRaw
    ? (() => {
        const items = podrollRaw?.[`${PC20_NS}||remoteItem`] ?? podrollRaw?.remoteItem;
        if (!items) return [];
        return (Array.isArray(items) ? items : [items]).map((r: any) => ({
          feedGuid: r?.['@_feedGuid'] || r?.feedGuid || '',
          feedUrl: r?.['@_feedUrl'] || r?.feedUrl || '',
          title: r?.title,
        }));
      })()
    : [];

  const chatRaw = channel?.[`${PC20_NS}||chat`] ?? channel?.chat;
  const chat = chatRaw
    ? (Array.isArray(chatRaw) ? chatRaw : [chatRaw]).map((c: any) => ({
        server: c?.['@_server'] || c?.server || '',
        protocol: c?.['@_protocol'] || c?.protocol || '',
        accountId: c?.['@_accountId'] || c?.accountId,
        space: c?.['@_space'] || c?.space,
      }))
    : [];

  const publisherRaw = channel?.[`${PC20_NS}||publisher`] ?? channel?.publisher;
  let publisher: { feedGuid: string; feedUrl: string }[] | undefined;
  if (publisherRaw) {
    const items = publisherRaw?.[`${PC20_NS}||remoteItem`] ?? publisherRaw?.remoteItem;
    if (items) {
      publisher = (Array.isArray(items) ? items : [items]).map((r: any) => ({
        feedGuid: r?.['@_feedGuid'] || r?.feedGuid || '',
        feedUrl: r?.['@_feedUrl'] || r?.feedUrl || '',
      }));
    }
  }

  const imagesRaw = channel?.[`${PC20_NS}||image`] ?? channel?.image;
  const images = imagesRaw
    ? (Array.isArray(imagesRaw) ? imagesRaw : [imagesRaw]).map((i: any) => ({
        href: i?.['@_href'] || i?.href || '',
        purpose: i?.['@_purpose'] || i?.purpose,
      }))
    : undefined;

  const episodes: PodcastEpisode[] = Array.isArray(channel.item)
    ? channel.item.map(parseEpisode)
    : channel.item
    ? [parseEpisode(channel.item)]
    : [];

  return {
    title: channel?.title || '',
    description: channel?.description,
    link: channel?.link,
    language: channel?.language,
    copyright: channel?.copyright,
    author: channel?.['itunes:author'] || channel?.managingEditor,
    image: imageRaw,
    lastBuildDate: channel?.lastBuildDate,
    guid: channel?.[`${PC20_NS}||guid`]?.['#text'] || channel?.guid?.['#text'] || undefined,
    locked,
    funding,
    location: parseLocations(channel)[0] || undefined,
    medium: channel?.[`${PC20_NS}||medium`]?.['#text'] || channel?.medium,
    persons,
    value: parseValue(channel),
    trailer: episodes.find((ep) => ep.trailer)?.trailer,
    block,
    podroll,
    updateFrequency: channel?.[`${PC20_NS}||updateFrequency`]?.['#text'] || channel?.updateFrequency,
    podping: channel?.[`${PC20_NS}||podping`]?.['@_usesPodping'] === 'true',
    chat,
    publisher,
    images,
    episodes,
  };
}
