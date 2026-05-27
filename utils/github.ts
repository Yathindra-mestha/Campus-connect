import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

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
            const querySnapshot = await getDocs(collection(db, 'projects'));
            let projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectData[];

            // Clean up stock projects from Firestore if any exist
            const stockIds = [
                'Yathindra-mestha-aerospace.md',
                'Yathindra-mestha-codecraft.md',
                'Yathindra-mestha-ecotrack.md',
                'Yathindra-mestha-nexus-ai.md'
            ];
            for (const docId of stockIds) {
                if (projects.some(p => p.id === docId)) {
                    try {
                        await deleteDoc(doc(db, 'projects', docId));
                    } catch (e) {
                        console.error('Failed to clean up stock project:', docId, e);
                    }
                }
            }

            // Filter out stock projects from the returned list
            projects = projects.filter(p => p.id && !stockIds.includes(String(p.id)));

            // Sort projects so user custom-made ones or newer ones appear first (date descending)
            return projects.sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error fetching all projects from Firestore:', error);
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
            // 1. Fetch projects from Firestore
            const projectsSnapshot = await getDocs(collection(db, 'projects'));
            const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProjectData[];

            // 2. Fetch users from Firestore
            let usersMap = new Map<string, any>();
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                usersSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.login) {
                        usersMap.set(data.login.toLowerCase(), { id: doc.id, ...data });
                    }
                });
            } catch (e) {
                console.error('Failed to fetch users from Firestore:', e);
            }

            // Filter out pre-seeded stock projects (such as Yathindra showcase drafts)
            const stockIds = [
                'Yathindra-mestha-aerospace.md',
                'Yathindra-mestha-codecraft.md',
                'Yathindra-mestha-ecotrack.md',
                'Yathindra-mestha-nexus-ai.md'
            ];

            // 3. Filter and group projects by author_login
            const userProjectsMap = new Map<string, ProjectData[]>();
            projects.forEach(p => {
                if (p.id && stockIds.includes(String(p.id))) return;
                const authorLogin = (p.author_login || 'guest').toLowerCase();
                if (!userProjectsMap.has(authorLogin)) {
                    userProjectsMap.set(authorLogin, []);
                }
                userProjectsMap.get(authorLogin)!.push(p);
            });

            // 4. Build leaderboard entries
            const entries: any[] = [];
            userProjectsMap.forEach((userProjs, authorLogin) => {
                const latestProj = userProjs.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                })[0];

                const userProfile = usersMap.get(authorLogin) || {};
                
                const name = userProfile.name || latestProj.author || authorLogin;
                const branch = userProfile.branch || latestProj.branch || 'General';
                const bio = userProfile.bio || '';
                const location = userProfile.location || '';
                const avatar_url = userProfile.avatar_url || `https://github.com/${authorLogin}.png`;
                const last_active_at = userProfile.last_active_at || latestProj.date || new Date().toISOString();

                // Calculate profile completeness (up to 4 fields)
                let profileCompleteness = 0;
                if (userProfile.name) profileCompleteness++;
                if (userProfile.branch) profileCompleteness++;
                if (userProfile.bio) profileCompleteness++;
                if (userProfile.location) profileCompleteness++;

                const projectCount = userProjs.length;
                const points = (projectCount * 500) + (profileCompleteness * 250) + 1000;

                entries.push({
                    login: authorLogin,
                    name,
                    branch,
                    bio,
                    location,
                    projectCount,
                    profileCompleteness,
                    last_active_at,
                    avatar_url,
                    points,
                    trend: 'same'
                });
            });

            // 5. Sort by points descending and calculate ranks
            return entries
                .sort((a, b) => b.points - a.points)
                .map((entry, index) => ({
                    ...entry,
                    rank: index + 1
                }));
        } catch (error) {
            console.error('Error getting leaderboard from Firestore:', error);
            return [];
        }
    }
};
