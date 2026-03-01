import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STUDENTS_DIR = path.join(__dirname, '../src/content/students');
const EVENTS_DIR = path.join(__dirname, '../src/content/events');
const PUBLIC_DATA_DIR = path.join(__dirname, '../public/data');

// Simple frontmatter parser
function parseFrontmatter(content) {
    const match = content.match(/^---([\s\S]*?)---/);
    if (!match) return null;

    const fm = match[1];
    const result = {};

    const fields = ['title', 'description', 'tags', 'image', 'github_url', 'branch', 'date', 'time', 'location', 'category', 'participants', 'maxParticipants', 'winners', 'name', 'bio', 'cover_url', 'avatar_url', 'last_active_at'];

    fields.forEach(field => {
        // Regex to match: field: "value" or field: ["value1", "value2"]
        const regex = new RegExp(`${field}:\\s*(.*)`);
        const fieldMatch = fm.match(regex);
        if (fieldMatch) {
            try {
                result[field] = JSON.parse(fieldMatch[1].trim());
            } catch (e) {
                // Fallback if not valid JSON
                result[field] = fieldMatch[1].trim().replace(/^"|"$/g, '');
            }
        }
    });

    return {
        data: result,
        body: content.replace(/^---[\s\S]*?---/, '').trim()
    };
}

async function generateData() {
    console.log('Generating build-time data...');

    try {
        // Ensure public/data directory exists
        await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });

        const students = await fs.readdir(STUDENTS_DIR, { withFileTypes: true });

        const allProjects = [];
        const leaderData = [];
        let totalProjects = 0;

        for (const studentDir of students) {
            if (!studentDir.isDirectory()) continue;

            const login = studentDir.name;
            const studentPath = path.join(STUDENTS_DIR, login);

            let name = login;
            let branch = 'General';
            let bio = '';
            let last_active_at = '';
            let projectCount = 0;
            let profileCompleteness = 0;

            // Extract Student Profile Data
            try {
                const indexPath = path.join(studentPath, 'index.md');
                const indexContent = await fs.readFile(indexPath, 'utf-8');
                const parsedProfile = parseFrontmatter(indexContent);

                if (parsedProfile && parsedProfile.data) {
                    if (parsedProfile.data.name) { name = parsedProfile.data.name; profileCompleteness++; }
                    if (parsedProfile.data.branch) { branch = parsedProfile.data.branch; profileCompleteness++; }
                    if (parsedProfile.data.bio) { bio = parsedProfile.data.bio; profileCompleteness++; }
                    if (parsedProfile.data.last_active_at) { last_active_at = parsedProfile.data.last_active_at; }
                }
            } catch (e) {
                console.warn(`No index.md found for ${login}`);
            }

            // Extract Student Projects
            try {
                const projectsPath = path.join(studentPath, 'projects');
                const projectsDir = await fs.readdir(projectsPath);

                for (const projectFile of projectsDir) {
                    if (!projectFile.endsWith('.md')) continue;

                    const filePath = path.join(projectsPath, projectFile);
                    const projectContent = await fs.readFile(filePath, 'utf-8');
                    const parsedProject = parseFrontmatter(projectContent);

                    if (parsedProject && parsedProject.data) {
                        projectCount++;

                        allProjects.push({
                            id: `${login}-${projectFile}`, // Pseudo-ID
                            slug: projectFile.replace('.md', ''),
                            author_login: login,
                            author: name,
                            ...parsedProject.data,
                            body: parsedProject.body
                        });
                    }
                }
            } catch (e) {
                // Projects directory might not exist
            }

            totalProjects += projectCount;

            leaderData.push({
                login,
                name,
                branch,
                bio,
                projectCount,
                profileCompleteness,
                last_active_at,
                avatar_url: `https://github.com/${login}.png`
            });
        }

        // Sort and calculate leaderboard points
        const finalLeaderboard = leaderData.map(user => {
            const points = (user.projectCount * 500) + (user.profileCompleteness * 250) + 1000;
            return {
                ...user,
                points,
                trend: 'same'
            };
        }).sort((a, b) => b.points - a.points).map((u, i) => ({ ...u, rank: i + 1 }));

        // Calculate System Stats
        const stats = {
            students: 2500 + leaderData.length,
            projects: 450 + totalProjects,
            events: 120, // Now dynamic below? Let's leave as standard or let's update it in a separate PR
            contributors: 850 + leaderData.length
        };

        // Parse Events Data
        const allEvents = [];
        try {
            const eventsDirFiles = await fs.readdir(EVENTS_DIR);
            for (const eventFile of eventsDirFiles) {
                if (!eventFile.endsWith('.md')) continue;

                const filePath = path.join(EVENTS_DIR, eventFile);
                const eventContent = await fs.readFile(filePath, 'utf-8');
                const parsedEvent = parseFrontmatter(eventContent);

                if (parsedEvent && parsedEvent.data) {
                    allEvents.push({
                        id: eventFile.replace('.md', ''),
                        ...parsedEvent.data,
                        body: parsedEvent.body
                    });
                }
            }
        } catch (e) {
            console.warn('No events directory found or error reading events', e);
        }

        stats.events = allEvents.length;

        // Write Files
        await fs.writeFile(
            path.join(PUBLIC_DATA_DIR, 'projects.json'),
            JSON.stringify(allProjects, null, 2)
        );

        await fs.writeFile(
            path.join(PUBLIC_DATA_DIR, 'leaderboard.json'),
            JSON.stringify(finalLeaderboard, null, 2)
        );

        await fs.writeFile(
            path.join(PUBLIC_DATA_DIR, 'stats.json'),
            JSON.stringify(stats, null, 2)
        );

        await fs.writeFile(
            path.join(PUBLIC_DATA_DIR, 'events.json'),
            JSON.stringify(allEvents, null, 2)
        );

        console.log(`✅ Successfully generated data for ${allProjects.length} projects, ${allEvents.length} events, and ${leaderData.length} students.`);

    } catch (err) {
        console.error('Failed to generate build data:', err);
        process.exit(1);
    }
}

generateData();
