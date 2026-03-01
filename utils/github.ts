export interface ProfileUpdate {
    name?: string;
    bio?: string;
    location?: string;
    branch?: string;
    cover_url?: string;
    avatar_url?: string;
}

export interface ProjectData {
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

export const githubService = {
    async getAllProjects(): Promise<ProjectData[]> {
        try {
            const res = await fetch('/data/projects.json');
            if (!res.ok) throw new Error('Failed to fetch projects data');
            return await res.json();
        } catch (error) {
            console.error('Error fetching all projects:', error);
            return [];
        }
    },

    async getEvents(): Promise<any[]> {
        try {
            const res = await fetch('/data/events.json');
            if (!res.ok) throw new Error('Failed to fetch events data');
            return await res.json();
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    async getSystemStats() {
        try {
            const res = await fetch('/data/stats.json');
            if (!res.ok) throw new Error('Failed to fetch stats data');
            return await res.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                students: 2500,
                projects: 450,
                events: 120,
                contributors: 850
            };
        }
    },

    async updatePresence(login: string) {
        const token = localStorage.getItem('github_token');
        if (!token) return;

        try {
            const baseUrl = `https://api.github.com/repos/Yathindra-mestha/Campus_connect/contents/src/content/students/${login}/index.md`;
            const headers = { Authorization: `token ${token}` };

            const res = await fetch(baseUrl, { headers });
            if (!res.ok) return;
            const data = await res.json();
            const content = decodeURIComponent(escape(atob(data.content)));

            const timestamp = new Date().toISOString();
            let newContent = content;

            if (content.includes('last_active_at:')) {
                newContent = content.replace(/last_active_at:\s*"(.*?)"/, `last_active_at: "${timestamp}"`);
            } else {
                newContent = content.replace(/---([\s\S]*?)---/, (match, p1) => {
                    return `---${p1}last_active_at: "${timestamp}"\n---`;
                });
            }

            await fetch(baseUrl, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'update: presence status',
                    content: btoa(unescape(encodeURIComponent(newContent))),
                    sha: data.sha
                })
            });
        } catch (error) {
            console.error('Failed to update presence', error);
        }
    },

    async getLeaderboard() {
        try {
            const res = await fetch('/data/leaderboard.json');
            if (!res.ok) throw new Error('Failed to fetch leaderboard data');
            return await res.json();
        } catch (error) {
            console.error('Error getting leaderboard:', error);
            return [];
        }
    }
};
