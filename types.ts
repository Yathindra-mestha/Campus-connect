/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Artifact {
  id: string;
  styleName: string;
  html: string;
  status: 'streaming' | 'complete' | 'error';
}

export interface Session {
  id: string;
  prompt: string;
  timestamp: number;
  artifacts: Artifact[];
}

export interface ComponentVariation { name: string; html: string; }
export interface LayoutOption { name: string; css: string; previewHtml: string; }

export interface User {
  login: string;
  avatar_url: string;
  name?: string;
  email?: string;
  id?: string;
  branch?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
}

export interface Project {
  id?: string | number;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  github_url?: string;
  branch?: string;
  author?: string;
  author_login?: string;
  likes?: number;
  body?: string;
  date?: string;
  slug?: string;
}

export interface LeaderboardEntry {
  login: string;
  name: string;
  branch: string;
  bio: string;
  projectCount: number;
  profileCompleteness: number;
  last_active_at: string;
  avatar_url: string;
  points: number;
  trend: 'up' | 'down' | 'same';
  rank: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  tags: string[];
  image?: string;
}