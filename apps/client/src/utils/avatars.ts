// src/utils/avatars.ts

export interface AvatarOption {
  id: string;
  url: string; // The URL or relative path to the image asset
  alt: string;
}

/**
 * A selection of fun, professional, and diverse placeholder avatars.
 * These should be vector graphics (.svg) for quick loading and scaling.
 * NOTE: Ensure these SVG files exist in your public assets folder at the specified path.
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: '1', url: '/assets/avatars/avatar-01-blue.svg', alt: 'Abstract Blue Face' },
  { id: '2', url: '/assets/avatars/avatar-02-green.svg', alt: 'Abstract Green Shapes' },
  { id: '3', url: '/assets/avatars/avatar-03-pink.svg', alt: 'Geometric Pink Cube' },
  { id: '4', url: '/assets/avatars/avatar-04-yellow.svg', alt: 'Minimalist Yellow Dot' },
  { id: '5', url: '/assets/avatars/avatar-05-purple.svg', alt: 'Abstract Purple Rings' },
  { id: '6', url: '/assets/avatars/avatar-06-red.svg', alt: 'Modern Red Lines' },
  { id: '7', url: '/assets/avatars/avatar-07-orange.svg', alt: 'Warm Sunset Abstract' },
  { id: '8', url: '/assets/avatars/avatar-08-teal.svg', alt: 'Teal Geometric Pattern' },
];

/**
 * The URL used to represent the user explicitly selecting "no avatar" (i.e., revert to initials).
 */
export const BLANK_AVATAR_URL = 'BLANK_AVATAR';